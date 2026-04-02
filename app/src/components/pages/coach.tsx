"use client";

import { useEffect, useRef, useState } from "react";
import { useCoach } from "@/lib/hooks/use-coach";
import { useApp } from "@/lib/app-context";
import { useTierState } from "@/lib/hooks/use-tier-state";
import { PageWrapper } from "../page-wrapper";

interface DisplayMessage {
  id: string;
  from: "coach" | "user";
  meta: string;
  text: string;
}

function formatMeta(role: "user" | "coach", date: string) {
  const created = new Date(date);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

  if (diffMinutes < 1) return role === "coach" ? "Boss · just now" : "You · just now";
  if (diffMinutes < 60) return role === "coach" ? `Boss · ${diffMinutes}m ago` : `You · ${diffMinutes}m ago`;

  return `${role === "coach" ? "Boss" : "You"} · ${created.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function CoachPage() {
  const { profile } = useApp();
  const tier = useTierState();
  const { messages: dbMessages, isCoachTyping, sendMessage: sendToCoach } = useCoach();
  const [inputValue, setInputValue] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  const displayMessages: DisplayMessage[] = dbMessages.map((message) => ({
    id: message.id,
    from: message.role === "coach" ? "coach" : "user",
    meta: formatMeta(message.role, message.created_at),
    text: message.content,
  }));

  useEffect(() => {
    setTimeout(() => {
      threadRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 80);
  }, [displayMessages.length, isCoachTyping]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    sendToCoach.mutate(text);
  };

  return (
    <PageWrapper page="coach">
      <div className="mb-8">
        <div
          className="text-[10px] uppercase tracking-[0.1em] mb-2"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
        >
          Coach
        </div>
        <h1 className="text-[1.9rem] font-bold leading-[1.12] mb-2">
          One thread. One memory. One Boss.
        </h1>
        <p className="text-[15px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
          This is not a separate AI widget. The coach is working from your pulse trail, your score movement, your sprint rhythm,
          and the moments where human support may need to step in.
        </p>
      </div>

      <div
        className="p-5 mb-5"
        style={{ background: "var(--accent-surface)", border: "1px solid var(--accent)", borderRadius: "4px" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Operator", value: profile?.display_name || "Operator" },
            { label: "Tier", value: tier.activeTier.toUpperCase() },
            { label: "Current score", value: String(tier.score) },
          ].map((item) => (
            <div key={item.label}>
              <div
                className="text-[10px] uppercase tracking-[0.08em] mb-1"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
              >
                {item.label}
              </div>
              <div className="text-[14px] font-medium">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.08em] mb-3"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          Private thread
        </div>

        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 mb-5" ref={threadRef}>
          {displayMessages.length > 0 ? displayMessages.map((message) => (
            <div
              key={message.id}
              className={message.from === "user" ? "ml-auto max-w-[88%]" : "mr-auto max-w-[88%]"}
              style={{ animation: "fadeUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
            >
              <div
                className="text-[10px] uppercase tracking-[0.06em] mb-1"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
              >
                {message.meta}
              </div>
              <div
                className="py-3.5 px-4 text-[14px] leading-[1.7]"
                style={{
                  background: message.from === "user" ? "var(--accent-surface)" : "var(--bg-page)",
                  border: `1px solid ${message.from === "user" ? "var(--accent)" : "var(--border-subtle)"}`,
                  borderRadius: "4px",
                  color: message.from === "user" ? "var(--text)" : "var(--text-secondary)",
                }}
              >
                {message.text}
              </div>
            </div>
          )) : (
            <div className="text-[14px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
              Ask the Boss for help with the thing you keep avoiding, the line that is breaking, or the truth you want surfaced without excuses.
            </div>
          )}

          {isCoachTyping && (
            <div className="mr-auto max-w-[88%]">
              <div
                className="text-[10px] uppercase tracking-[0.06em] mb-1"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
              >
                Boss · thinking
              </div>
              <div
                className="py-3.5 px-4 text-[14px] inline-flex gap-1"
                style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px", color: "var(--text-muted)" }}
              >
                <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 py-3 px-4 text-[14px] outline-none transition-colors duration-150"
            style={{
              background: "var(--bg-page)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text)",
              borderRadius: "4px",
              fontFamily: "inherit",
            }}
            placeholder="Message the Boss..."
            onFocus={(event) => (event.target.style.borderColor = "var(--accent)")}
            onBlur={(event) => (event.target.style.borderColor = "var(--border-subtle)")}
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
      </div>
    </PageWrapper>
  );
}
