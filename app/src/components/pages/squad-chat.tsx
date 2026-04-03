"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { useAuth } from "@/lib/auth-context";
import { useApp } from "@/lib/app-context";
import { useSquadChat, type SquadMessage } from "@/lib/hooks/use-squad-chat";
import { PageWrapper } from "../page-wrapper";

interface DisplayMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isMe: boolean;
  type?: string;
}

const MOCK_MESSAGES: DisplayMessage[] = [
  { id: "1", sender: "Marcus H.", avatar: "MH", text: "Anyone dealt with Stripe recurring subscription webhooks? I\u2019m stuck on the event handling.", time: "2:14 PM", isMe: false },
  { id: "2", sender: "Sara R.", avatar: "SR", text: "Hey Marcus \u2014 I integrated Stripe last sprint. The trick is to handle invoice.payment_succeeded for recurring. Want to jump on a call at 3?", time: "2:22 PM", isMe: false },
  { id: "3", sender: "Marcus H.", avatar: "MH", text: "That\u2019s exactly what I was missing. 3 PM works \u2014 sending you a link now. \ud83d\ude4f", time: "2:25 PM", isMe: false },
  { id: "4", sender: "Fatima N.", avatar: "FN", text: "Love seeing this. This is what squads are for.", time: "2:31 PM", isMe: false },
  { id: "5", sender: "Amir M.", avatar: "AM", text: "Good stuff. Marcus, if you\u2019re also handling proration events, Sara\u2019s approach with customer.subscription.updated is the cleanest.", time: "2:45 PM", isMe: true },
];

export function SquadChatPage() {
  const { navigateTo } = useNavigation();
  const { user } = useAuth();
  const { profile, squad, squadMembers } = useApp();
  const { messages: realtimeMessages, sendMessage: sendRealtimeMessage } = useSquadChat();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const squadName = squad?.name || "Alpha Vanguard";
  const memberCount = squad?.member_count ?? 7;
  const hasSquad = Boolean(squad);

  // Convert realtime messages to display format, or use mocks
  const displayMessages: DisplayMessage[] = user
    ? realtimeMessages.map((m: SquadMessage) => ({
        id: m.id,
        sender: m.profile?.display_name || "Unknown",
        avatar: m.profile?.initials || "??",
        text: m.content,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        isMe: m.sender_id === user.id,
        type: m.message_type,
      }))
    : MOCK_MESSAGES;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");

    if (user) {
      sendRealtimeMessage.mutate(text);
    }
  };

  // Online members for header
  const onlineAvatars = squadMembers.length > 0
    ? squadMembers.filter(m => m.user_id !== profile?.id).slice(0, 4).map(m => m.profile.initials)
    : ["SR", "MH", "FN", "OT"];

  if (user && !hasSquad) {
    return (
      <PageWrapper page="squad-chat">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigateTo("squad")}
            className="text-sm cursor-pointer bg-transparent border-none py-1 px-2 transition-colors duration-150"
            style={{ color: "var(--text-muted)", fontFamily: "inherit" }}
          >
            &larr; Back
          </button>
        </div>

        <div
          className="py-5 px-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
        >
          <div className="text-lg font-semibold mb-1">Squad chat unlocks with QUALIFIED.</div>
          <div className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Complete RECRUIT first. When you earn your squad, this is where the live operator conversation starts.
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper page="squad-chat">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigateTo("squad")}
          className="text-sm cursor-pointer bg-transparent border-none py-1 px-2 transition-colors duration-150"
          style={{ color: "var(--text-muted)", fontFamily: "inherit" }}
        >
          &larr; Back
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{squadName} Chat</h1>
          <div
            className="text-[11px] tracking-[0.04em]"
            style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
          >
            {memberCount} operators
          </div>
        </div>
        <div className="flex -space-x-1.5">
          {onlineAvatars.map((m) => (
            <div
              key={m}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-semibold"
              style={{
                background: "var(--surface-hover)",
                color: "var(--text-secondary)",
                border: "2px solid var(--bg-page)",
              }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-5 mb-6">
        {displayMessages.length > 0 ? (
          <>
            {displayMessages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[88%] ${msg.isMe ? "ml-auto" : "mr-auto"}`}
                style={{ animation: "fadeUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {!msg.isMe && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-semibold"
                      style={{ background: "var(--surface-hover)", color: "var(--text-secondary)" }}
                    >
                      {msg.avatar}
                    </div>
                  )}
                  <span
                    className="text-[10px] uppercase tracking-[0.06em]"
                    style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
                  >
                    {msg.isMe ? "You" : msg.sender} &middot; {msg.time}
                  </span>
                  {msg.type === "facilitator" && (
                    <span
                      className="text-[8px] uppercase tracking-[0.06em] py-[1px] px-1.5"
                      style={{
                        fontFamily: "var(--font-dm-mono), monospace",
                        background: "var(--accent-surface)",
                        color: "var(--accent)",
                        borderRadius: "2px",
                      }}
                    >
                      Facilitator
                    </span>
                  )}
                </div>
                <div
                  className="py-3 px-4 text-sm leading-relaxed"
                  style={{
                    background: msg.isMe ? "var(--accent-surface)" : msg.type === "facilitator" ? "var(--accent-surface)" : "var(--surface)",
                    border: `1px solid ${msg.isMe ? "var(--accent)" : msg.type === "facilitator" ? "var(--accent)" : "var(--border-subtle)"}`,
                    color: msg.isMe ? "var(--text)" : "var(--text-secondary)",
                    borderRadius: "4px",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div
            className="py-5 px-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div className="text-[15px] font-medium mb-1">No messages yet.</div>
            <div className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              The first message usually starts the rhythm. Ask for help, share progress, or set the tone for the week.
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="flex gap-2 pt-4"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
          className="flex-1 py-3 px-4 text-sm outline-none transition-colors duration-150"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text)",
            borderRadius: "4px",
            fontFamily: "inherit",
          }}
          placeholder="Message your squad..."
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
          aria-label="Chat message"
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="py-3 px-5 text-sm font-medium border-none cursor-pointer transition-colors duration-150"
          style={{
            background: "var(--accent)",
            color: "var(--accent-text)",
            borderRadius: "2px",
            fontFamily: "inherit",
            opacity: !inputValue.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </div>
    </PageWrapper>
  );
}
