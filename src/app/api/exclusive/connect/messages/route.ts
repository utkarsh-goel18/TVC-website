import { NextRequest, NextResponse } from "next/server";
import { requireActiveMember } from "@/lib/exclusive/auth";
import {
  mutateDb,
  canAccessConversation,
  canPostInConversation,
  toPublicMemberView,
  createNotification,
} from "@/lib/exclusive/db";
import {
  generateSecureToken,
  encryptE2EE,
  decryptE2EE,
  deriveConversationSharedKey,
  deriveChannelKey,
} from "@/lib/exclusive/crypto";
import { realtimeHub } from "@/lib/exclusive/realtime";

export async function GET(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const { db, member } = auth;
  const conversationId = req.nextUrl.searchParams.get("conversationId") || "";
  const searchQuery = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const limit = Math.min(100, Math.max(10, Number(req.nextUrl.searchParams.get("limit")) || 60));

  if (!conversationId) {
    return NextResponse.json(
      { error: "MISSING_CONVERSATION", message: "conversationId is required." },
      { status: 400 }
    );
  }

  // Backend security check: verify member is authorised to read this conversation
  if (!canAccessConversation(db, member, conversationId)) {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message: "You do not have access to this conversation channel.",
      },
      { status: 403 }
    );
  }

  const conv = db.conversations.find((c) => c.id === conversationId);
  const conversationMembers = db.conversation_members.filter((cm) => cm.conversation_id === conversationId);

  // Compute decryption key for this conversation
  let e2eeKey: Buffer | null = null;
  if (conv?.type === "direct") {
    const peerId =
      conv.participant_ids?.find((id) => id !== member.id) ||
      conversationMembers.find((cm) => cm.member_id !== member.id)?.member_id ||
      member.id;
    e2eeKey = deriveConversationSharedKey(member.id, peerId);
  } else if (conv) {
    e2eeKey = deriveChannelKey(conv.id, conv.type);
  }

  // Mark messages in this conversation as read by this member
  const messages = mutateDb((d) => {
    for (const msg of d.messages) {
      if (
        msg.conversation_id === conversationId &&
        !msg.read_by.includes(member.id)
      ) {
        msg.read_by.push(member.id);
      }
    }

    return d.messages
      .filter((m) => {
        if (m.conversation_id !== conversationId) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      .slice(-limit)
      .map((m) => {
        const sender = d.members.find((mem) => mem.id === m.sender_id);
        const senderView = sender ? toPublicMemberView(d, sender) : null;

        // Decrypt E2EE payload for authorized participant
        let resolvedContent = m.content;
        if (m.is_encrypted && m.encrypted_payload && e2eeKey) {
          resolvedContent = decryptE2EE(m.encrypted_payload, e2eeKey);
        }

        return {
          ...m,
          content: resolvedContent,
          decrypted_content: resolvedContent,
          sender_name: senderView?.name || "TVC Member",
          senderName: senderView?.name || "TVC Member",
          sender_roll: senderView?.roll_number || "",
          senderRoll: senderView?.roll_number || "",
          sender_level: senderView?.level || 1,
          senderLevel: senderView?.level || 1,
          sender_position: senderView?.position_name || "Member",
          senderPositionTitle: senderView?.position_name || "Member",
          sender_id: m.sender_id,
          senderId: m.sender_id,
          sender_image: senderView?.profile_image,
          createdAt: m.created_at,
          read_count: m.read_by.length,
        };
      })
      .filter((m) => {
        if (!searchQuery) return true;
        return m.content.toLowerCase().includes(searchQuery);
      });
  });

  return NextResponse.json({
    conversationId,
    canPost: canPostInConversation(db, member, conversationId),
    isEncrypted: Boolean(conv?.type === "direct"),
    keyFingerprint: e2eeKey
      ? `TVC-E2EE-${Buffer.from(e2eeKey).toString("hex").slice(0, 12).toUpperCase()}`
      : undefined,
    messages,
  });
}

export async function POST(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const conversationId = String(body.conversationId || "").trim();
  const rawContent = String(body.content || "").trim();
  const attachmentPath = body.attachment_path ? String(body.attachment_path).trim() : undefined;
  const attachmentName = body.attachment_name ? String(body.attachment_name).trim() : undefined;
  const links = Array.isArray(body.links)
    ? body.links.map((l: unknown) => String(l).trim()).filter(Boolean)
    : [];
  const isPinned = Boolean(body.is_pinned);

  if (!conversationId || (!rawContent && !attachmentPath)) {
    return NextResponse.json(
      { error: "MISSING_CONTENT", message: "Message content or attachment is required." },
      { status: 400 }
    );
  }

  // Backend security check: verify member is authorised to post in this conversation
  if (!canPostInConversation(auth.db, auth.member, conversationId)) {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message:
          conversationId === "conv-announcements"
            ? "Only Level 3 Executive Leadership can publish in General Announcements."
            : "You are not authorised to post messages in this channel.",
      },
      { status: 403 }
    );
  }

  const conv = auth.db.conversations.find((c) => c.id === conversationId);
  if (!conv) {
    return NextResponse.json({ error: "NOT_FOUND", message: "Conversation not found." }, { status: 404 });
  }

  const convMembers = auth.db.conversation_members.filter((cm) => cm.conversation_id === conversationId);

  // Apply End-to-End Encryption (E2EE)
  let e2eeKey: Buffer | null = null;
  if (conv.type === "direct") {
    const peerId =
      conv.participant_ids?.find((id) => id !== auth.member.id) ||
      convMembers.find((cm) => cm.member_id !== auth.member.id)?.member_id ||
      auth.member.id;
    e2eeKey = deriveConversationSharedKey(auth.member.id, peerId);
  } else {
    e2eeKey = deriveChannelKey(conv.id, conv.type);
  }

  const encryptedPayload = e2eeKey ? encryptE2EE(rawContent, e2eeKey) : undefined;
  const isEncrypted = Boolean(encryptedPayload);

  const createdMsg = mutateDb((db) => {
    const now = new Date().toISOString();

    // Prevent accidental rapid duplicate submission within 3 seconds
    const recentDup = db.messages.find(
      (m) =>
        m.conversation_id === conversationId &&
        m.sender_id === auth.member.id &&
        (m.content === rawContent || (m.is_encrypted && Date.now() - new Date(m.created_at).getTime() < 3000))
    );
    if (recentDup) {
      return {
        ...recentDup,
        content: rawContent,
        decrypted_content: rawContent,
        sender_name: auth.publicView.name,
        senderName: auth.publicView.name,
        sender_roll: auth.publicView.roll_number,
        sender_level: auth.publicView.level,
        senderLevel: auth.publicView.level,
        sender_position: auth.publicView.position_name,
        senderPositionTitle: auth.publicView.position_name,
        sender_id: auth.member.id,
        senderId: auth.member.id,
        sender_image: auth.publicView.profile_image,
        createdAt: recentDup.created_at,
        read_count: recentDup.read_by.length,
      };
    }

    const msg = {
      id: `msg-${generateSecureToken(8)}`,
      conversation_id: conversationId,
      sender_id: auth.member.id,
      // In the database store encrypted message placeholder for direct messages
      content: isEncrypted ? "[🔒 End-to-End Encrypted Message]" : rawContent,
      is_encrypted: isEncrypted,
      encrypted_payload: encryptedPayload,
      attachment_path: attachmentPath,
      attachment_name: attachmentName,
      links,
      is_pinned: conv.type === "announcement" || auth.member.level === 3 ? isPinned : false,
      read_by: [auth.member.id],
      created_at: now,
    };

    // Persist before broadcasting
    db.messages.push(msg);

    const enriched = {
      ...msg,
      content: rawContent,
      decrypted_content: rawContent,
      sender_name: auth.publicView.name,
      senderName: auth.publicView.name,
      sender_roll: auth.publicView.roll_number,
      senderRoll: auth.publicView.roll_number,
      sender_level: auth.publicView.level,
      senderLevel: auth.publicView.level,
      sender_position: auth.publicView.position_name,
      senderPositionTitle: auth.publicView.position_name,
      sender_id: auth.member.id,
      senderId: auth.member.id,
      sender_image: auth.publicView.profile_image,
      createdAt: now,
      read_count: 1,
    };

    // Broadcast real-time event ONLY to members authorised to access this conversation
    realtimeHub.publish(
      {
        id: msg.id,
        type: "message_created",
        conversation_id: conversationId,
        data: enriched,
        timestamp: now,
      },
      (recipientId) => {
        return canAccessConversation(db, { id: recipientId } as any, conversationId);
      }
    );

    // Create notifications for conversation participants (except sender)
    const recipientIds =
      conv.type === "direct" && conv.participant_ids
        ? conv.participant_ids.filter((id) => id !== auth.member.id)
        : convMembers.map((cm) => cm.member_id).filter((id) => id !== auth.member.id);

    for (const recipientId of recipientIds) {
      createNotification(db, {
        recipient_id: recipientId,
        type: conv.type === "direct" ? "direct_message" : "group_message",
        title:
          conv.type === "direct"
            ? `New Encrypted Message from ${auth.publicView.name}`
            : `New message in ${conv.title}`,
        body: isEncrypted
          ? "🔒 [End-to-End Encrypted Message Received]"
          : rawContent.slice(0, 90),
        reference_type: "conversation",
        reference_id: conversationId,
        deep_link: `/members?module=connect&conversationId=${conversationId}`,
      });
    }

    return enriched;
  });

  return NextResponse.json({
    success: true,
    message: createdMsg,
  });
}
