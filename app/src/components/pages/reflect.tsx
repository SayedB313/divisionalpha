"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { useReflections } from "@/lib/hooks/use-reflections";
import { PageWrapper } from "../page-wrapper";

const MOCK_PEERS = ["Sara R.", "Fatima N.", "Marcus H.", "Omar T.", "James L.", "Priya K."];

export function ReflectPage() {
  const { profile, sprint, squadMembers } = useApp();
  const { submit } = useReflections();
  const [selectedPeers, setSelectedPeers] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [wins, setWins] = useState("");
  const [misses, setMisses] = useState("");
  const [learnings, setLearnings] = useState("");
  const [carryForward, setCarryForward] = useState("");
  const [appreciationNote, setAppreciationNote] = useState("");

  // Use real squad members or mock
  const peers = squadMembers.length > 0
    ? squadMembers.filter(m => m.user_id !== profile?.id).map(m => ({ id: m.user_id, name: m.profile.display_name }))
    : MOCK_PEERS.map((name, i) => ({ id: `mock-${i}`, name }));

  const currentWeek = sprint?.current_week ?? 4;

  const togglePeer = (name: string) => {
    setSelectedPeers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSubmit = async () => {
    try {
      await submit.mutateAsync({
        wins,
        misses,
        learnings,
        carry_forward: carryForward,
        appreciated_user_ids: Array.from(selectedPeers),
        appreciation_note: appreciationNote || undefined,
        goals_hit: 3, // TODO: calculate from check-in data
        goals_total: 4,
      });
    } catch { /* fallback */ }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text)",
    borderRadius: "4px",
    fontFamily: "inherit",
  };

  return (
    <PageWrapper page="reflect">
      <h1 className="text-[1.75rem] font-bold leading-[1.2] mb-2">Week {currentWeek} Reflection</h1>
      <p className="text-[15px] leading-relaxed mb-9" style={{ color: "var(--text-secondary)" }}>
        Friday. Look back at your week. What landed, what didn&apos;t, and what you&apos;re carrying forward.
      </p>

      {/* Week Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8 max-md:grid-cols-1">
        {[
          { val: "3/4", label: "Goals hit", color: "var(--green)" },
          { val: "100%", label: "Check-ins", color: "var(--text)" },
          { val: "+12%", label: "vs. average", color: "var(--accent)" },
        ].map((s) => (
          <div
            key={s.label}
            className="text-center py-4 px-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div
              className="text-xl font-medium leading-none mb-1"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: s.color }}
            >
              {s.val}
            </div>
            <div
              className="text-[10px] uppercase tracking-[0.06em]"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Reflection sections */}
      {[
        { label: "Wins", prompt: "What did you accomplish this week? Don\u2019t minimize it.", placeholder: "Shipped the pricing page ahead of schedule. Got my first real feedback from a paying user..." },
        { label: "Misses", prompt: "What didn\u2019t land? No shame. Just data.", placeholder: "Only did 1 customer interview instead of 3. Kept putting off the calls..." },
        { label: "Learning", prompt: "What did this week teach you?", placeholder: "I avoid phone calls when I'm anxious about the product. Need to separate the two..." },
      ].map((sec) => (
        <div key={sec.label} className="mb-7">
          <div
            className="text-[11px] uppercase tracking-[0.1em] mb-3"
            style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
          >
            {sec.label}
          </div>
          <div className="text-[15px] leading-relaxed mb-2.5" style={{ color: "var(--text-secondary)" }}>
            {sec.prompt}
          </div>
          <textarea
            className="w-full min-h-[80px] py-3.5 px-4 text-[15px] leading-relaxed resize-y outline-none transition-colors duration-150"
            style={inputStyle}
            placeholder={sec.placeholder}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
            aria-label={sec.label}
          />
        </div>
      ))}

      {/* Carry forward */}
      <div className="mb-7">
        <div
          className="text-[11px] uppercase tracking-[0.1em] mb-3"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          Carrying forward
        </div>
        <div className="text-[15px] leading-relaxed mb-2.5" style={{ color: "var(--text-secondary)" }}>
          One thing you&apos;re taking into next week.
        </div>
        <input
          type="text"
          className="w-full py-3.5 px-4 text-[15px] outline-none transition-colors duration-150"
          style={inputStyle}
          placeholder="Schedule the interviews first thing Monday before I can overthink it"
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
          aria-label="Carry forward"
        />
      </div>

      {/* Peer shoutout */}
      <div
        className="py-4 px-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.08em] mb-2"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          Peer appreciation
        </div>
        <div className="flex gap-1.5 flex-wrap mb-2">
          {peers.map((peer) => (
            <button
              key={peer.id}
              onClick={() => togglePeer(peer.id)}
              className="py-1.5 px-3 text-xs cursor-pointer transition-all duration-150"
              style={{
                background: selectedPeers.has(peer.id) ? "var(--accent-surface)" : "none",
                border: `1px solid ${selectedPeers.has(peer.id) ? "var(--accent)" : "var(--border)"}`,
                color: selectedPeers.has(peer.id) ? "var(--accent)" : "var(--text-secondary)",
                borderRadius: "2px",
                fontFamily: "inherit",
              }}
            >
              {peer.name}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="w-full py-3 px-4 text-[13px] outline-none transition-colors duration-150"
          style={inputStyle}
          placeholder="What did they do that helped you?"
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
          aria-label="Peer appreciation note"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3.5 mt-6 text-[15px] font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-px"
        style={{
          background: submitted ? "var(--green)" : "var(--accent)",
          color: "var(--accent-text)",
          borderRadius: "2px",
          fontFamily: "inherit",
          pointerEvents: submitted ? "none" : "auto",
        }}
      >
        {submitted ? "Submitted \u2713" : "Submit reflection"}
      </button>

      <div className="text-center pt-9 mt-9" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <p className="text-[0.95rem] italic leading-relaxed mb-1.5" style={{ color: "var(--text-secondary)" }}>
          &ldquo;Indeed, with hardship comes ease.&rdquo;
        </p>
        <span
          className="text-[10px] uppercase tracking-[0.08em]"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          Quran 94:6 &middot; Patience in the process
        </span>
      </div>
    </PageWrapper>
  );
}
