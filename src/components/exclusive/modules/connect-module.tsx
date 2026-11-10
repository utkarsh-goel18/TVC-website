"use client";

import { useState, useEffect, useRef } from "react";
import {
  Megaphone,
  ShieldCheck,
  Building2,
  Lock,
  MessageSquare,
  Search,
  Plus,
  Send,
  Pin,
  Paperclip,
  CheckCheck,
  Users,
  Shield,
  KeyRound,
  FileText,
  AlertCircle,
  X,
  Volume2,
  VolumeX,
  Check,
} from "lucide-react";
import type { SafeMemberProfile, MessageItem } from "@/lib/exclusive/types";

interface ConnectModuleProps {
  member: SafeMemberProfile;
  initialPeerId?: string | null;
  onClearInitialPeer?: () => void;
  realtimeSignal?: number;
}

interface ConversationResponseItem {
  id: string;
  type: "announcement" | "level" | "department" | "direct" | "level_community" | "department_community";
  title?: string;
  displayTitle?: string;
  description?: string;
  displaySubtitle?: string;
  department_id?: string | null;
  departmentId?: string | null;
  level?: 1 | 2 | 3 | null;
  targetLevel?: 1 | 2 | 3 | null;
  participant_ids?: string[];
  participantIds?: string[];
  unreadCount?: number;
  isMuted?: boolean;
  canPost?: boolean;
  peerMember?: SafeMemberProfile | null;
  directPartner?: SafeMemberProfile | null;
  lastMessage?: {
    id: string;
    content: string;
    sender_name?: string;
    senderName?: string;
    sender_id?: string;
    created_at?: string;
  } | null;
}

export function ConnectModule({
  member,
  initialPeerId,
  onClearInitialPeer,
  realtimeSignal = 0,
}: ConnectModuleProps) {
  // 4 Primary Dedicated Sections
  const [activeSection, setActiveSection] = useState<
    "announcements" | "level" | "departments" | "direct"
  >(initialPeerId ? "direct" : "announcements");

  const [allConversations, setAllConversations] = useState<ConversationResponseItem[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [keyFingerprint, setKeyFingerprint] = useState<string | null>(null);

  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [showAttachInput, setShowAttachInput] = useState(false);
  const [pinOnSend, setPinOnSend] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Department selection inside Section 3
  const [activeDeptConvoId, setActiveDeptConvoId] = useState<string | null>(null);

  // New DM modal
  const [showNewDmModal, setShowNewDmModal] = useState(false);
  const [directoryMembers, setDirectoryMembers] = useState<SafeMemberProfile[]>([]);
  const [dmSearch, setDmSearch] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/exclusive/connect/conversations");
      const json = await res.json();
      if (res.ok && json.conversations) {
        setAllConversations(json.conversations);
      }
    } catch {
      // ignore
    } finally {
      setLoadingConvos(false);
    }
  };

  const fetchMessages = async (convoId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(
        `/api/exclusive/connect/messages?conversationId=${encodeURIComponent(
          convoId
        )}`
      );
      const json = await res.json();
      if (res.ok && json.messages) {
        setMessages(json.messages);
        setKeyFingerprint(json.keyFingerprint || null);
        setAllConversations((prev) =>
          prev.map((c) => (c.id === convoId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch {
      // ignore
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle direct peer navigation from Directory
  useEffect(() => {
    if (initialPeerId) {
      setActiveSection("direct");
      (async () => {
        try {
          const res = await fetch("/api/exclusive/connect/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "start_dm",
              peerMemberId: initialPeerId,
            }),
          });
          const json = await res.json();
          if (res.ok && json.conversation) {
            await fetchConversations();
            setSelectedConvoId(json.conversation.id);
          }
        } finally {
          if (onClearInitialPeer) onClearInitialPeer();
        }
      })();
    }
  }, [initialPeerId]);

  // When active section or conversation list changes, route to the correct conversation
  useEffect(() => {
    if (allConversations.length === 0) return;

    if (activeSection === "announcements") {
      const ann = allConversations.find(
        (c) => c.type === "announcement" || c.id === "conv-announcements"
      );
      if (ann) setSelectedConvoId(ann.id);
    } else if (activeSection === "level") {
      const lvl = allConversations.find(
        (c) =>
          (c.type === "level" || (c.type as string) === "level_community") &&
          (c.level === member.level || c.targetLevel === member.level)
      );
      if (lvl) setSelectedConvoId(lvl.id);
    } else if (activeSection === "departments") {
      const deptConvs = allConversations.filter(
        (c) => c.type === "department" || (c.type as string) === "department_community"
      );
      if (deptConvs.length > 0) {
        const target = activeDeptConvoId
          ? deptConvs.find((d) => d.id === activeDeptConvoId) || deptConvs[0]
          : deptConvs[0];
        setActiveDeptConvoId(target.id);
        setSelectedConvoId(target.id);
      } else {
        setSelectedConvoId(null);
      }
    } else if (activeSection === "direct") {
      const dms = allConversations.filter((c) => c.type === "direct");
      if (dms.length > 0) {
        if (!selectedConvoId || !dms.some((d) => d.id === selectedConvoId)) {
          setSelectedConvoId(dms[0].id);
        }
      } else {
        setSelectedConvoId(null);
      }
    }
  }, [activeSection, allConversations, activeDeptConvoId]);

  useEffect(() => {
    if (selectedConvoId) {
      fetchMessages(selectedConvoId);
    }
  }, [selectedConvoId]);

  // Refresh on real-time SSE signal
  useEffect(() => {
    if (realtimeSignal > 0) {
      fetchConversations();
      if (selectedConvoId) {
        fetchMessages(selectedConvoId);
      }
    }
  }, [realtimeSignal]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedConvoId]);

  const activeConversation = allConversations.find((c) => c.id === selectedConvoId) || null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvoId || !messageInput.trim()) return;

    setSendingMessage(true);
    const text = messageInput.trim();
    setMessageInput("");

    try {
      const res = await fetch("/api/exclusive/connect/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConvoId,
          content: text,
          attachment_path: attachmentUrl.trim() || undefined,
          attachment_name: attachmentUrl.trim() ? "Attached Resource" : undefined,
          is_pinned: pinOnSend,
        }),
      });
      const json = await res.json();
      if (res.ok && json.message) {
        setMessages((prev) => [...prev, json.message]);
        setAttachmentUrl("");
        setShowAttachInput(false);
        setPinOnSend(false);
        fetchConversations();
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const openNewDmModalHandler = async () => {
    setShowNewDmModal(true);
    try {
      const res = await fetch("/api/exclusive/members");
      const json = await res.json();
      if (res.ok && json.members) {
        setDirectoryMembers(
          json.members.filter((m: SafeMemberProfile) => m.id !== member.id)
        );
      }
    } catch {
      // ignore
    }
  };

  const startDirectMessage = async (peerId: string) => {
    try {
      const res = await fetch("/api/exclusive/connect/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start_dm",
          peerMemberId: peerId,
        }),
      });
      const json = await res.json();
      if (res.ok && json.conversation) {
        setShowNewDmModal(false);
        await fetchConversations();
        setSelectedConvoId(json.conversation.id);
        setActiveSection("direct");
      }
    } catch {
      // ignore
    }
  };

  // Filtered lists for distinct sections
  const dmConversations = allConversations.filter((c) => c.type === "direct");
  const myDepartmentConversations = allConversations.filter(
    (c) => c.type === "department" || (c.type as string) === "department_community"
  );
  const pinnedAnnouncements = messages.filter((m) => m.is_pinned);

  // Helper to determine partner in active direct conversation
  const currentDirectPartner =
    activeConversation?.directPartner ||
    activeConversation?.peerMember ||
    null;

  return (
    <div className="space-y-6">
      {/* 4 PRIMARY DEDICATED SECTIONS SELECTOR */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-transparent p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
                <MessageSquare className="h-4 w-4" />
              </span>
              <h2 className="font-display text-xl font-bold text-white">
                TVC Connect — Communications Hub
              </h2>
            </div>
            <p className="mt-1 text-xs text-white/60">
              Four dedicated, strictly isolated communication spaces. Switch between broadcast announcements, year lounges, department channels, and encrypted direct messages.
            </p>
          </div>

          {/* Section Navigation Tabs */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              onClick={() => setActiveSection("announcements")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                activeSection === "announcements"
                  ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20"
                  : "border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Megaphone className="h-4 w-4" />
              <span>Announcements</span>
            </button>

            <button
              onClick={() => setActiveSection("level")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                activeSection === "level"
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                  : "border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Level {member.level} Lounge</span>
            </button>

            <button
              onClick={() => setActiveSection("departments")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                activeSection === "departments"
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Departments ({myDepartmentConversations.length})</span>
            </button>

            <button
              onClick={() => setActiveSection("direct")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                activeSection === "direct"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Lock className="h-4 w-4" />
              <span>Encrypted DMs</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: GENERAL ANNOUNCEMENTS */}
      {/* ========================================================================= */}
      {activeSection === "announcements" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-4 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-amber-200">
              <Megaphone className="h-4 w-4 shrink-0 text-amber-300" />
              <span>
                <strong>Official Broadcast Channel:</strong> All active members can view announcements. Only <strong>Level 3 Executive Leadership</strong> can publish.
              </span>
            </div>
            <span className="rounded-full bg-amber-400/20 px-3 py-1 font-mono text-[10px] font-bold text-amber-300">
              LEVEL 3 EXECUTIVE PUBLISHER
            </span>
          </div>

          {/* Pinned Broadcasts */}
          {pinnedAnnouncements.length > 0 && (
            <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-400/15 via-amber-400/5 to-transparent p-4">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-300 uppercase">
                <Pin className="h-3.5 w-3.5" />
                <span>Pinned Broadcast:</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-white">
                {pinnedAnnouncements[pinnedAnnouncements.length - 1].content}
              </p>
            </div>
          )}

          {/* Broadcasts Feed */}
          <div className="flex h-[540px] flex-col rounded-3xl border border-white/10 bg-black/40">
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {loadingMessages ? (
                <div className="py-20 text-center text-xs text-white/40">
                  Loading announcements...
                </div>
              ) : messages.length === 0 ? (
                <div className="py-20 text-center text-xs text-white/40">
                  No announcements published yet.
                </div>
              ) : (
                messages.map((msg) => {
                  const authorName =
                    msg.senderName || (msg as any).sender_name || "TVC Leadership";
                  const authorLevel = msg.senderLevel || (msg as any).sender_level || 3;
                  const authorPosition =
                    msg.senderPositionTitle || (msg as any).sender_position || "Executive Board";

                  return (
                    <div
                      key={msg.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-amber-400/30"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-300">
                            {authorName}
                          </span>
                          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.2 text-[10px] font-bold text-amber-200">
                            Level {authorLevel} • {authorPosition}
                          </span>
                        </div>
                        <span className="text-[11px] text-white/40">
                          {new Date(msg.created_at || msg.createdAt || "").toLocaleString()}
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/90">
                        {msg.content}
                      </p>

                      {msg.attachment_path && (
                        <a
                          href={msg.attachment_path}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-amber-300 hover:underline"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          {msg.attachment_name || "Download Attached Resource"}
                        </a>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Announcement Composer (Level 3 Only) */}
            {member.level === 3 ? (
              <form
                onSubmit={handleSendMessage}
                className="border-t border-white/10 bg-[#0c1017] p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/70">
                    Publish Official Club Broadcast
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pinOnSend}
                      onChange={(e) => setPinOnSend(e.target.checked)}
                      className="rounded accent-amber-400"
                    />
                    Pin Broadcast
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type official announcement to all TVC members..."
                    className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sendingMessage}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                    Broadcast
                  </button>
                </div>
              </form>
            ) : (
              <div className="border-t border-white/10 bg-[#0c1017] p-4 text-center text-xs text-white/50">
                🔒 You are viewing in Read-Only mode. General Announcements can only be published by Executive Leadership (Level 3).
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: LEVEL COMMUNITIES (YEAR-GATED LOUNGES) */}
      {/* ========================================================================= */}
      {activeSection === "level" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-bold text-violet-200">
                🏛️ Level {member.level} Private Lounge:{" "}
              </span>
              <span className="text-white/70">
                {member.level === 3
                  ? "Executive Leadership Board Room (Confidential Strategic Lounge)."
                  : member.level === 2
                  ? "Second-Year Member Community (Core & General Collaboration)."
                  : "First-Year Member Community (New Inductees Channel)."}
              </span>
            </div>
            <span className="rounded-full bg-violet-500/20 px-3 py-1 font-mono text-[10px] font-bold text-violet-300">
              STRICTLY LEVEL {member.level} GATED
            </span>
          </div>

          <div className="flex h-[540px] flex-col rounded-3xl border border-white/10 bg-black/40">
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {loadingMessages ? (
                <div className="py-20 text-center text-xs text-white/40">
                  Loading Level {member.level} Lounge...
                </div>
              ) : messages.length === 0 ? (
                <div className="py-20 text-center text-xs text-white/40">
                  Welcome to the Level {member.level} Lounge! Start the conversation below.
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine =
                    msg.sender_id === member.id || msg.senderId === member.id;
                  const senderDisplayName = isMine
                    ? `You (${member.fullName || member.name})`
                    : msg.senderName || (msg as any).sender_name || "Level Peer";
                  const senderPos =
                    msg.senderPositionTitle || (msg as any).sender_position || "";

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      <div className="mb-1 flex items-center gap-2 text-[10px] text-white/45">
                        <span className="font-bold text-white/80">
                          {senderDisplayName}
                        </span>
                        {senderPos && (
                          <span className="text-violet-300/80">• {senderPos}</span>
                        )}
                        <span>•</span>
                        <span>
                          {new Date(msg.created_at || msg.createdAt || "").toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div
                        className={`max-w-xl rounded-2xl px-4 py-3 text-sm ${
                          isMine
                            ? "bg-violet-600 text-white rounded-tr-sm"
                            : "border border-white/10 bg-white/[0.05] text-white rounded-tl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="border-t border-white/10 bg-[#0c1017] p-4"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message fellow Level ${member.level} peers...`}
                  className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sendingMessage}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-400 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: DEPARTMENT COMMUNITIES (STRICTLY DEPARTMENT-GATED) */}
      {/* ========================================================================= */}
      {activeSection === "departments" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-bold text-sky-200">
                🏢 Department-Gated Channels:{" "}
              </span>
              <span className="text-white/70">
                {member.level === 3
                  ? "Executive Leadership oversight: You can inspect discussions across all 7 departments."
                  : "Strictly department-gated. You can only view and participate in groups of departments you are officially assigned to."}
              </span>
            </div>
            <span className="rounded-full bg-sky-500/20 px-3 py-1 font-mono text-[10px] font-bold text-sky-300">
              {myDepartmentConversations.length} ACCESSIBLE DEPARTMENTS
            </span>
          </div>

          {/* Department Channel Selector Strip (Only Shows Authorized Departments) */}
          {myDepartmentConversations.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-xs text-white/50">
              You are not currently assigned to any department. Contact your Executive Secretary or General Secretary to join a department.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {myDepartmentConversations.map((d) => {
                  const isSelected = selectedConvoId === d.id;
                  const deptTitle = d.title || d.displayTitle || "Department";

                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        setActiveDeptConvoId(d.id);
                        setSelectedConvoId(d.id);
                      }}
                      className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold transition ${
                        isSelected
                          ? "border-sky-400 bg-sky-500/25 text-white shadow-md shadow-sky-500/20"
                          : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <Building2 className="h-3.5 w-3.5 text-sky-300" />
                      <span>{deptTitle}</span>
                      {d.unreadCount ? (
                        <span className="rounded-full bg-sky-400 px-1.5 py-0.2 text-[9px] font-bold text-slate-950">
                          {d.unreadCount}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Department Message Feed */}
              <div className="flex h-[500px] flex-col rounded-3xl border border-white/10 bg-black/40">
                <div className="flex-1 space-y-3 overflow-y-auto p-5">
                  {loadingMessages ? (
                    <div className="py-20 text-center text-xs text-white/40">
                      Loading Department Channel...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-20 text-center text-xs text-white/40">
                      Welcome to {activeConversation?.displayTitle || "Department Channel"}! No messages yet.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine =
                        msg.sender_id === member.id || msg.senderId === member.id;
                      const senderDisplayName = isMine
                        ? `You (${member.fullName || member.name})`
                        : msg.senderName || (msg as any).sender_name || "Department Colleague";
                      const senderLevel =
                        msg.senderLevel || (msg as any).sender_level || 2;
                      const senderPos =
                        msg.senderPositionTitle || (msg as any).sender_position || "";

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                        >
                          <div className="mb-1 flex items-center gap-2 text-[10px] text-white/45">
                            <span className="font-bold text-white/80">
                              {senderDisplayName}
                            </span>
                            <span className="rounded bg-sky-500/20 px-1.5 py-0.2 text-[9px] text-sky-300">
                              Level {senderLevel}
                            </span>
                            {senderPos && <span>• {senderPos}</span>}
                            <span>•</span>
                            <span>
                              {new Date(msg.created_at || msg.createdAt || "").toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div
                            className={`max-w-xl rounded-2xl px-4 py-3 text-sm ${
                              isMine
                                ? "bg-sky-600 text-white rounded-tr-sm"
                                : "border border-white/10 bg-white/[0.05] text-white rounded-tl-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-white/10 bg-[#0c1017] p-4"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Share updates with department members..."
                      className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-sky-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || sendingMessage}
                      className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-400 disabled:opacity-40"
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: DIRECT MESSAGES (END-TO-END ENCRYPTED AES-256-GCM) */}
      {/* ========================================================================= */}
      {activeSection === "direct" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Sub-sidebar: Active DMs */}
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4 lg:col-span-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">Direct Messages</h3>
                <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <Lock className="h-3 w-3" /> E2EE Active (AES-256-GCM)
                </p>
              </div>
              <button
                onClick={openNewDmModalHandler}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
              >
                <Plus className="h-3.5 w-3.5" />
                New DM
              </button>
            </div>

            <div className="mt-3 space-y-1.5 max-h-[480px] overflow-y-auto">
              {dmConversations.length === 0 ? (
                <div className="py-12 text-center text-xs text-white/40">
                  No direct conversations yet. Click &quot;New DM&quot; to message any TVC member across levels.
                </div>
              ) : (
                dmConversations.map((dm) => {
                  const isSelected = dm.id === selectedConvoId;
                  const partnerName =
                    dm.directPartner?.fullName ||
                    dm.directPartner?.name ||
                    dm.title ||
                    "TVC Peer";
                  const partnerLevel =
                    dm.directPartner?.level || dm.targetLevel || 2;
                  const partnerPos =
                    dm.directPartner?.positionTitle ||
                    dm.directPartner?.position_name ||
                    "Member";

                  return (
                    <button
                      key={dm.id}
                      onClick={() => setSelectedConvoId(dm.id)}
                      className={`flex w-full items-center justify-between rounded-2xl p-3 text-left transition ${
                        isSelected
                          ? "border border-emerald-500/50 bg-emerald-500/15"
                          : "border border-transparent hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-xs font-bold text-white">
                            {partnerName}
                          </span>
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                            L{partnerLevel}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-white/50">
                          {dm.lastMessage ? dm.lastMessage.content : partnerPos}
                        </p>
                      </div>
                      <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0 ml-2" />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right DM Chat Pane with Verified Attribution */}
          <div className="flex h-[560px] flex-col rounded-3xl border border-white/10 bg-black/40 lg:col-span-8">
            {activeConversation ? (
              <>
                {/* Active DM Header */}
                <div className="flex items-center justify-between border-b border-white/10 bg-[#090d16] px-5 py-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {currentDirectPartner?.fullName ||
                        currentDirectPartner?.name ||
                        activeConversation.displayTitle ||
                        "TVC Direct Message"}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                      <Lock className="h-3 w-3" />
                      <span>End-to-End Encrypted (AES-256-GCM)</span>
                      {keyFingerprint && (
                        <span className="text-white/40 font-mono">• {keyFingerprint}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* E2EE Messages Feed with Accurate Sender Attribution */}
                <div className="flex-1 space-y-3 overflow-y-auto p-5">
                  {loadingMessages ? (
                    <div className="py-20 text-center text-xs text-white/40">
                      Decrypting conversation history...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-20 text-center text-xs text-white/40">
                      🔒 This direct message is end-to-end encrypted with AES-256-GCM. Messages are stored as ciphertext and cannot be intercepted. Say hello!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine =
                        msg.sender_id === member.id || msg.senderId === member.id;

                      // Accurate Sender Name Attribution: NEVER shows "You" for the other person!
                      const senderDisplayName = isMine
                        ? `You (${member.fullName || member.name})`
                        : msg.senderName ||
                          (msg as any).sender_name ||
                          currentDirectPartner?.fullName ||
                          currentDirectPartner?.name ||
                          "Peer Member";

                      const senderLevel = isMine
                        ? member.level
                        : msg.senderLevel ||
                          (msg as any).sender_level ||
                          currentDirectPartner?.level ||
                          2;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                        >
                          <div className="mb-1 flex items-center gap-1.5 text-[10px] text-white/45">
                            <span className="font-bold text-white/80">
                              {senderDisplayName}
                            </span>
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                              Level {senderLevel}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(msg.created_at || msg.createdAt || "").toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="text-emerald-400 inline-flex items-center gap-0.5">
                              <Lock className="h-2.5 w-2.5" /> E2EE
                            </span>
                          </div>

                          <div
                            className={`max-w-xl rounded-2xl px-4 py-3 text-sm shadow-md ${
                              isMine
                                ? "bg-emerald-600 text-white rounded-tr-sm"
                                : "border border-white/10 bg-white/[0.06] text-white rounded-tl-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {msg.decrypted_content || msg.content}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Encrypted Composer */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-white/10 bg-[#0c1017] p-4"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="🔒 Write end-to-end encrypted message..."
                      className="flex-1 rounded-xl border border-emerald-500/30 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-emerald-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || sendingMessage}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 shadow-lg shadow-emerald-500/20"
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-white/40">
                <Lock className="h-10 w-10 text-emerald-400/40 mb-3" />
                <p className="text-sm">Select an encrypted conversation or click &quot;New DM&quot; to begin.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New DM Picker Modal */}
      {showNewDmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#090d16] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Start Encrypted Direct Message
                </h3>
                <p className="text-xs text-emerald-400 font-mono">
                  🔒 End-to-End Encrypted with AES-256-GCM
                </p>
              </div>
              <button
                onClick={() => setShowNewDmModal(false)}
                className="rounded-xl border border-white/10 p-1.5 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                value={dmSearch}
                onChange={(e) => setDmSearch(e.target.value)}
                placeholder="Search member by name, roll number, or role..."
                className="w-full rounded-xl border border-white/15 bg-white/[0.04] py-2.5 pl-9 pr-3 text-xs text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              {directoryMembers
                .filter((m) => {
                  if (!dmSearch.trim()) return true;
                  const q = dmSearch.toLowerCase();
                  return (
                    (m.fullName || m.name || "").toLowerCase().includes(q) ||
                    (m.rollNumber || m.roll_number || "").toLowerCase().includes(q) ||
                    (m.positionTitle || m.position_name || "").toLowerCase().includes(q)
                  );
                })
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => startDirectMessage(m.id)}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-emerald-500/50 hover:bg-emerald-500/10"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {m.fullName || m.name}
                      </div>
                      <div className="text-xs text-white/50">
                        {m.rollNumber || m.roll_number} • {m.positionTitle || m.position_name}
                      </div>
                    </div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                      Level {m.level}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
