"use client";

import { useState, useRef } from "react";
import { PageWrapper } from "../page-wrapper";

interface CoachMessage {
  id: string;
  from: "coach" | "user";
  meta: string;
  text: string;
}

const INITIAL_MESSAGES: CoachMessage[] = [
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

export function CoachPage() {
  const [messages, setMessages] = useState<CoachMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg: CoachMessage = {
      id: Date.now().toString(),
      from: "user",
      meta: "You \u00B7 Just now",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Simulate coach response
    setTimeout(() => {
      const coachMsg: CoachMessage = {
        id: (Date.now() + 1).toString(),
        from: "coach",
        meta: "Coach \u00B7 Just now",
        text: "I hear you. Let\u2019s sit with that for a moment. What\u2019s the one thing you could do tomorrow that would make Friday\u2019s reflection feel different from last week\u2019s?",
      };
      setMessages((prev) => [...prev, coachMsg]);
      setTimeout(() => {
        threadRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }, 1500);
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
        </div>
      </div>

      <div className="mt-2 space-y-5" ref={threadRef}>
        {messages.map((msg) => (
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
      </div>

      <div
        className="flex gap-2 mt-6 pt-4"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } }}
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
        />
        <button
          onClick={sendMessage}
          className="py-3 px-5 text-sm font-medium border-none cursor-pointer transition-colors duration-150"
          style={{
            background: "var(--accent)",
            color: "var(--accent-text)",
            borderRadius: "2px",
            fontFamily: "inherit",
          }}
        >
          Send
        </button>
      </div>
    </PageWrapper>
  );
}
