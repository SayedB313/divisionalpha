"use client";

import { useState } from "react";
import { PageWrapper } from "../page-wrapper";

const PEERS = ["Sara R.", "Fatima N.", "Marcus H.", "Omar T.", "James L.", "Priya K."];

const VOTE_OPTIONS = [
  { title: "Continue Together", desc: "Alpha Vanguard stays intact for Sprint 4. Same people, new goals, deeper bonds." },
  { title: "Reshuffle", desc: "Stay in Division Alpha but meet new operators. You\u2019ll be matched into a fresh squad." },
  { title: "Pause", desc: "Life needs you elsewhere. Your spot is held. Come back when you\u2019re ready." },
];

export function CompletionPage() {
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [selectedPeers, setSelectedPeers] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const togglePeer = (name: string) => {
    setSelectedPeers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <PageWrapper page="completion">
      <div className="text-center">
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-[32px]"
          style={{ border: "2px solid var(--accent)", color: "var(--accent)" }}
        >
          &#9733;
        </div>
        <h1
          className="text-[2rem] leading-[1.2] mb-2"
          style={{ fontFamily: "var(--font-instrument-serif), serif" }}
        >
          Sprint 3 Complete
        </h1>
        <p className="text-[15px] leading-relaxed mb-9" style={{ color: "var(--text-secondary)" }}>
          Six weeks. You showed up when it was hard. You were honest when it would have been easier to hide.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { val: "78%", label: "Goals completed", color: "var(--accent)" },
          { val: "95%", label: "Attendance", color: "var(--text)" },
          { val: "14/18", label: "Weekly goals hit", color: "var(--text)" },
          { val: "Top 15%", label: "All squads", color: "var(--accent)" },
        ].map((s) => (
          <div
            key={s.label}
            className="py-4 px-4 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div
              className="text-2xl font-medium leading-none mb-1"
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

      {/* Transformation */}
      <div
        className="text-[11px] uppercase tracking-[0.1em] mb-3"
        style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
      >
        Your transformation
      </div>
      <div className="mb-7">
        <div className="text-[15px] leading-relaxed mb-2.5" style={{ color: "var(--text-secondary)" }}>
          Six weeks ago you were [starting point]. Now you are [where you are]. What changed isn&apos;t just the
          goals &mdash; it&apos;s who you became while pursuing them.
        </div>
        <textarea
          className="w-full min-h-[100px] py-3.5 px-4 text-[15px] leading-relaxed resize-y outline-none transition-colors duration-150"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text)",
            borderRadius: "4px",
            fontFamily: "inherit",
          }}
          placeholder="In your own words, what's different about you now vs. Week 1?"
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
          aria-label="Transformation reflection"
        />
      </div>

      {/* Gratitude */}
      <div
        className="text-[11px] uppercase tracking-[0.1em] mb-3"
        style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
      >
        Gratitude round
      </div>
      <div className="mb-7">
        <div className="text-[15px] leading-relaxed mb-2.5" style={{ color: "var(--text-secondary)" }}>
          Who in this squad helped you most? What did they do?
        </div>
        <div className="flex gap-1.5 flex-wrap mb-2.5">
          {PEERS.map((name) => (
            <button
              key={name}
              onClick={() => togglePeer(name)}
              className="py-1.5 px-3 text-xs cursor-pointer transition-all duration-150"
              style={{
                background: selectedPeers.has(name) ? "var(--accent-surface)" : "none",
                border: `1px solid ${selectedPeers.has(name) ? "var(--accent)" : "var(--border)"}`,
                color: selectedPeers.has(name) ? "var(--accent)" : "var(--text-secondary)",
                borderRadius: "2px",
                fontFamily: "inherit",
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <textarea
          className="w-full min-h-[80px] py-3.5 px-4 text-[15px] leading-relaxed resize-y outline-none transition-colors duration-150"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text)",
            borderRadius: "4px",
            fontFamily: "inherit",
          }}
          placeholder="What they did that mattered..."
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
          aria-label="Gratitude note"
        />
      </div>

      {/* Vote */}
      <div
        className="text-[11px] uppercase tracking-[0.1em] mb-3"
        style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
      >
        What&apos;s next?
      </div>
      <div className="space-y-2.5 mb-6">
        {VOTE_OPTIONS.map((opt, i) => (
          <div
            key={i}
            onClick={() => setSelectedVote(i)}
            className="py-4 px-5 flex items-center gap-3.5 cursor-pointer transition-all duration-150 hover:shadow-sm"
            style={{
              background: selectedVote === i ? "var(--accent-surface)" : "var(--surface)",
              border: `1px solid ${selectedVote === i ? "var(--accent)" : "var(--border-subtle)"}`,
              borderRadius: "4px",
            }}
          >
            <div
              className="w-4.5 h-4.5 rounded-full shrink-0 flex items-center justify-center"
              style={{ width: "18px", height: "18px", border: `2px solid ${selectedVote === i ? "var(--accent)" : "var(--border)"}` }}
            >
              {selectedVote === i && (
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium mb-0.5">{opt.title}</div>
              <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{opt.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => { setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); }}
        className="w-full py-3.5 text-[15px] font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-px"
        style={{
          background: submitted ? "var(--green)" : "var(--accent)",
          color: "var(--accent-text)",
          borderRadius: "2px",
          fontFamily: "inherit",
          pointerEvents: submitted ? "none" : "auto",
        }}
      >
        {submitted ? "Submitted \u2713" : "Submit vote"}
      </button>

      {/* Facilitator */}
      <div
        className="mt-7 py-4 px-5"
        style={{
          background: "var(--accent-surface)",
          borderLeft: "2px solid var(--accent)",
          borderRadius: "0 4px 4px 0",
        }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.1em] mb-1"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
        >
          Facilitator
        </div>
        <div className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Alpha Vanguard. Your combined completion rate of 78% puts you in the top 15% of all Division Alpha squads this cycle.
          That&apos;s not luck. That&apos;s discipline. Whether you&apos;re continuing, reshuffling, or pausing &mdash; you&apos;re an operator. That doesn&apos;t stop.
        </div>
      </div>

      <div className="text-center pt-9 mt-9" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <p className="text-[0.95rem] italic leading-relaxed mb-1.5" style={{ color: "var(--text-secondary)" }}>
          &ldquo;The best of people are those most beneficial to others.&rdquo;
        </p>
        <span
          className="text-[10px] uppercase tracking-[0.08em]"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          Hadith &middot; Service as purpose
        </span>
      </div>
    </PageWrapper>
  );
}
