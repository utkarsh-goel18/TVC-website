import { NextRequest, NextResponse } from "next/server";
import { requireActiveMember } from "@/lib/exclusive/auth";
import {
  mutateDb,
  canAccessConversation,
  canPostInConversation,
  toPublicMemberView,
} from "@/lib/exclusive/db";
import { generateSecureToken } from "@/lib/exclusive/crypto";

export async function GET(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const { db, member } = auth;

  const accessibleConversations = db.conversations
    .filter((c) => canAccessConversation(db, member, c.id))
    .map((c) => {
      const convMessages = db.messages
        .filter((m) => m.conversation_id === c.id)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

      const lastMessage = convMessages[convMessages.length - 1] || null;
      const lastSender = lastMessage
        ? db.members.find((m) => m.id === lastMessage.sender_id)
        : null;

      const unreadCount = convMessages.filter(
        (m) => m.sender_id !== member.id && !m.read_by.includes(member.id)
      ).length;

      let displayTitle = c.title;
      let displaySubtitle = c.subtitle;
      let directPartner = null;

      if (c.type === "direct" && c.participant_ids) {
        const partnerId =
          c.participant_ids.find((id) => id !== member.id) || member.id;
        const partner = db.members.find((m) => m.id === partnerId);
        if (partner) {
          const partnerView = toPublicMemberView(db, partner);
          displayTitle = partnerView.name;
          displaySubtitle = `Level ${partnerView.level} • ${partnerView.position_name} (${partnerView.roll_number})`;
          directPartner = partnerView;
        }
      }

      const isMuted = Boolean(
        member.notification_preferences?.muted_conversations?.includes(c.id)
      );

      return {
        ...c,
        title: displayTitle,
        description: displaySubtitle,
        displayTitle,
        displaySubtitle,
        directPartner,
        peerMember: directPartner,
        departmentId: c.department_id,
        targetLevel: c.level,
        participantIds: c.participant_ids || [],
        canPost: canPostInConversation(db, member, c.id),
        unreadCount,
        isMuted,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              sender_id: lastMessage.sender_id,
              senderId: lastMessage.sender_id,
              sender_name: lastSender?.name || "Member",
              senderName: lastSender?.name || "Member",
              created_at: lastMessage.created_at,
            }
          : null,
      };
    })
    .sort((a, b) => {
      if (a.type === "announcement") return -1;
      if (b.type === "announcement") return 1;
      const timeA = a.lastMessage
        ? new Date(a.lastMessage.created_at).getTime()
        : 0;
      const timeB = b.lastMessage
        ? new Date(b.lastMessage.created_at).getTime()
        : 0;
      return timeB - timeA;
    });

  return NextResponse.json({
    conversations: accessibleConversations,
  });
}

// Start or retrieve a 1-on-1 Direct Message conversation with ANY active TVC member
export async function POST(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const targetMemberId = String(
    body.targetMemberId || body.peerMemberId || body.peerId || ""
  ).trim();

  if (!targetMemberId || targetMemberId === auth.member.id) {
    return NextResponse.json(
      { error: "INVALID_TARGET", message: "Select another active TVC member to message." },
      { status: 400 }
    );
  }

  const outcome = mutateDb((db) => {
    const targetMember = db.members.find((m) => m.id === targetMemberId);
    if (!targetMember || targetMember.membership_status !== "active") {
      return {
        status: 404,
        payload: { error: "NOT_FOUND", message: "Target member is not an active TVC member." },
      };
    }

    // Check if a DM conversation already exists between these two members
    let existing = db.conversations.find(
      (c) =>
        c.type === "direct" &&
        c.participant_ids?.length === 2 &&
        c.participant_ids.includes(auth.member.id) &&
        c.participant_ids.includes(targetMember.id)
    );

    if (!existing) {
      const now = new Date().toISOString();
      const newConvoId = `conv-dm-${generateSecureToken(6)}`;
      existing = {
        id: newConvoId,
        type: "direct",
        title: `${auth.member.name} & ${targetMember.name}`,
        subtitle: "Direct Message",
        participant_ids: [auth.member.id, targetMember.id],
        created_at: now,
      };
      db.conversations.push(existing);

      // Register both participants in conversation_members
      db.conversation_members.push(
        {
          conversation_id: newConvoId,
          member_id: auth.member.id,
          joined_at: now,
          last_read_at: now,
          is_muted: false,
        },
        {
          conversation_id: newConvoId,
          member_id: targetMember.id,
          joined_at: now,
          last_read_at: now,
          is_muted: false,
        }
      );
    }

    return {
      status: 200,
      payload: {
        success: true,
        conversation: existing,
      },
    };
  });

  return NextResponse.json(outcome.payload, { status: outcome.status });
}

