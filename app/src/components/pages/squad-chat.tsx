"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { PageWrapper } from "../page-wrapper";

interface Message {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isMe: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1", sender: "Marcus H.", avatar: "MH",
    text: "Anyone dealt with Stripe recurring subscription webhooks? I\u2019m stuck on the event handling. Could really use a quick 15-min call if someone\u2019s been through it.",
    time: "2:14 PM", isMe: false,
  },
  {
    id: "2", sender: "Sara R.", avatar: "SR",
    text: "Hey Marcus \u2014 I integrated Stripe last sprint. The trick is to handle invoice.payment_succeeded, not checkout.session.completed for recurring. Want to jump on a call at 3?",
    time: "2:22 PM", isMe: false,
  },
  {
    id: "3", sender: "Marcus H.", avatar: "MH",
    text: "That\u2019s exactly what I was missing. 3 PM works \u2014 sending you a link now. \ud83d\ude4f",
    time: "2:25 PM", isMe: false,
  },
  {
    id: "4", sender: "Fatima N.", avatar: "FN",
    text: "Love seeing this. This is what squads are for. Marcus, let us know how it goes in your check-in tomorrow.",
    time: "2:31 PM", isMe: false,
  },
  {
    id: "5", sender: "Amir M.", avatar: "AM",
    text: "Good stuff. Marcus, if you\u2019re also handling proration events, Sara\u2019s approach with customer.subscription.updated is the cleanest pattern I\u2019ve seen.",
    time: "2:45 PM", isMe: true,
  },
  {
    id: "6", sender: "Omar T.", avatar: "OT",
    text: "Quick one \u2014 who\u2019s doing the Friday sync this week? I have a pitch rehearsal at 4 and need to know if I should block my calendar.",
    time: "3:12 PM", isMe: false,
  },
  {
    id: "7", sender: "Priya K.", avatar: "PK",
    text: "I think it\u2019s at 5 PM this week. @Omar you should be fine.",
    time: "3:18 PM", isMe: false,
  },
];

export function SquadChatPage() {
  const { navigateTo } = useNavigation();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "Amir M.",
      avatar: "AM",
      text,
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");

    // Simulate someone responding
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        { sender: "Sara R.", avatar: "SR", text: "Good point, Amir. Totally agree." },
        { sender: "Marcus H.", avatar: "MH", text: "Thanks for the tip! Will try that approach." },
        { sender: "Fatima N.", avatar: "FN", text: "Noted. Let\u2019s discuss more on Friday." },
        { sender: "Omar T.", avatar: "OT", text: "Appreciate the support, team. \ud83d\udcaa" },
      ];
      const resp = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: resp.sender,
          avatar: resp.avatar,
          text: resp.text,
          time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
          isMe: false,
        },
      ]);
    }, 1500 + Math.random() * 1000);
  };

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
          <h1 className="text-lg font-semibold">Alpha Vanguard Chat</h1>
          <div
            className="text-[11px] tracking-[0.04em]"
            style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
          >
            7 operators &middot; 4 online
          </div>
        </div>
        <div className="flex -space-x-1.5">
          {["SR", "MH", "FN", "OT"].map((m) => (
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
        {messages.map((msg) => (
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
            </div>
            <div
              className="py-3 px-4 text-sm leading-relaxed"
              style={{
                background: msg.isMe ? "var(--accent-surface)" : "var(--surface)",
                border: `1px solid ${msg.isMe ? "var(--accent)" : "var(--border-subtle)"}`,
                color: msg.isMe ? "var(--text)" : "var(--text-secondary)",
                borderRadius: "4px",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="max-w-[88%] mr-auto">
            <div
              className="py-3 px-4 text-sm inline-flex gap-1"
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

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="flex gap-2 pt-4"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <input
          ref={inputRef}
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
          placeholder="Message your squad..."
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
          aria-label="Chat message"
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
