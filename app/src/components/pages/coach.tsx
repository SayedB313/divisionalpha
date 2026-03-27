"use client";

import { useState, useRef, useEffect } from "react";
import { useCoach } from "@/lib/hooks/use-coach";
import { useAuth } from "@/lib/auth-context";
import { PageWrapper } from "../page-wrapper";

interface DisplayMessage {
  id: string;
  from: "coach" | "user";
  meta: string;
  text: string;
}

const INITIAL_MESSAGES: DisplayMessage[] = [
  {
    id: "1", from: "coach", meta: "Coach \u00B7 Monday",
    text: "Welcome to Week 4. You're past the midpoint dip \u2014 this is where operators separate from wishful thinkers. Your sprint goals: ship pricing page, run 12 customer interviews, and maintain morning routine. You're on pace for the first, behind on the second. Let's talk about that.",
  },
  {
    id: "2", from: "user", meta: "You \u00B7 Monday",
    text: "I keep putting off the interviews. I think I'm scared the feedback will be bad.",
  },
  {
    id: "3", from: "coach", meta: "Coach \u00B7 Monday",
    text: "That's honest. Here's the pattern I'm seeing across 4 weeks: your build goals land at 90%. Your talk-to-humans goals land at 40%. You're building in a vacuum because building feels safe. The interviews aren't about getting good feedback \u2014 they're about getting accurate feedback. Accurate is more useful than good. Can you schedule 2 interviews before Wednesday's check-in? Not 3. Just 2.",
  },
  {
    id: "4", from: "user", meta: "You \u00B7 Tuesday",
    text: "Done. Booked 2 for tomorrow afternoon. One is a warm lead, one is completely cold. We'll see.",
  },
  {
    id: "5", from: "coach", meta: "Coach \u00B7 Tuesday",
    text: "Good. The cold one will teach you more. After each call, write one sentence: what surprised you. That's it. Don't analyze, don't react \u2014 just notice what surprised you. We'll debrief Friday.",
  },
];

function formatMeta(role: "user" | "coach", date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return role === "coach" ? "Coach \u00B7 Just now" : "You \u00B7 Just now";
  if (diffMins < 60) return role === "coach" ? `Coach \u00B7 ${diffMins}m ago` : `You \u00B7 ${diffMins}m ago`;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return role === "coach" ? `Coach \u00B7 ${days[d.getDay()]}` : `You \u00B7 ${days[d.getDay()]}`;
}

export function CoachPage() {
  const { user } = useAuth();
  const { messages: dbMessages, isCoachTyping, sendMessage: sendToCoach } = useCoach();
  const [inputValue, setInputValue] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  // Use real messages if authenticated, otherwise mock
  const displayMessages: DisplayMessage[] = (user && dbMessages.length > 0)
    ? dbMessages.map(m => ({
        id: m.id,
        from: m.role === "coach" ? "coach" as const : "user" as const,
        meta: formatMeta(m.role, m.created_at),
        text: m.content,
      }))
    : INITIAL_MESSAGES;

  // Auto-scroll on new messages
  useEffect(() => {
    setTimeout(() => {
      threadRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  }, [displayMessages.length, isCoachTyping]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");

    if (user) {
      // Real: send to MiniMax via /api/coach
      sendToCoach.mutate(text);
    } else {
      // Demo mode: simulated response (no API call)
      // Messages won't persist but UI works
    }
  };

  return (
    <PageWrapper page="coach">
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-0.5">Your Coach</h1>
        <div
          className="text-[11px] tracking-[0.04em]"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          Private &middot; Only you can see this
          {user && <span> &middot; Powered by AI</span>}
        </div>
      </div>

      <div className="mt-2 space-y-5" ref={threadRef}>
        {displayMessages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[88%] ${msg.from === "user" ? "ml-auto" : "mr-auto"}`}
            style={{ animation: "fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.06em] mb-1"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              {msg.meta}
            </div>
            <div
              className="py-3.5 px-4 text-sm leading-relaxed"
              style={{
                background: msg.from === "user" ? "var(--accent-surface)" : "var(--surface)",
                border: `1px solid ${msg.from === "user" ? "var(--accent)" : "var(--border-subtle)"}`,
                color: msg.from === "user" ? "var(--text)" : "var(--text-secondary)",
                borderRadius: "4px",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isCoachTyping && (
          <div className="max-w-[88%] mr-auto">
            <div
              className="text-[10px] uppercase tracking-[0.06em] mb-1"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Coach &middot; typing
            </div>
            <div
              className="py-3.5 px-4 text-sm inline-flex gap-1"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px",
                color: "var(--text-muted)",
              }}
            >
              <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
            </div>
          </div>
        )}
      </div>

      <div
        className="flex gap-2 mt-6 pt-4"
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
          placeholder="Message your coach..."
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
          aria-label="Coach message"
          disabled={isCoachTyping}
        />
        <button
          onClick={handleSend}
          disabled={isCoachTyping || !inputValue.trim()}
          className="py-3 px-5 text-sm font-medium border-none cursor-pointer transition-colors duration-150"
          style={{
            background: isCoachTyping ? "var(--border)" : "var(--accent)",
            color: "var(--accent-text)",
            borderRadius: "2px",
            fontFamily: "inherit",
            opacity: isCoachTyping || !inputValue.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </div>
    </PageWrapper>
  );
}
