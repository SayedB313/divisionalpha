"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/lib/app-context";
import { useReflections } from "@/lib/hooks/use-reflections";
import { useCheckins } from "@/lib/hooks/use-checkins";
import { useDeclarations } from "@/lib/hooks/use-declarations";
import { PageWrapper } from "../page-wrapper";

export function ReflectPage() {
  const { profile, sprint, squad, squadMembers } = useApp();
  const { submit } = useReflections();
  const { checkin } = useCheckins();
  const { declaration } = useDeclarations();
  const [selectedPeers, setSelectedPeers] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [wins, setWins] = useState("");
  const [misses, setMisses] = useState("");
  const [learnings, setLearnings] = useState("");
  const [carryForward, setCarryForward] = useState("");
  const [appreciationNote, setAppreciationNote] = useState("");
  const hasSquad = Boolean(squad);

  // Calculate goals hit/total from real check-in and declaration data
  const goalsTotal = useMemo(() => {
    if (declaration?.goals && Array.isArray(declaration.goals)) return declaration.goals.length;
    return 0;
  }, [declaration]);

  const goalsHit = useMemo(() => {
    if (!checkin?.signals || !Array.isArray(checkin.signals)) return 0;
    return (checkin.signals as { signal: string }[]).filter(s => s.signal === 'green').length;
  }, [checkin]);

  // Use real squad members or mock
  const peers = squadMembers.length > 0
    ? squadMembers.filter(m => m.user_id !== profile?.id).map(m => ({ id: m.user_id, name: m.profile.display_name }))
    : [];

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
        goals_hit: goalsHit,
        goals_total: goalsTotal,
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
          { val: goalsTotal > 0 ? `${goalsHit}/${goalsTotal}` : "—", label: "Goals hit", color: "var(--green)" },
          { val: checkin ? "100%" : "—", label: "Check-ins", color: "var(--text)" },
          { val: goalsTotal > 0 ? `${Math.round((goalsHit / goalsTotal) * 100)}%` : "—", label: "Completion", color: "var(--accent)" },
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
        { label: "Wins", prompt: "What did you accomplish this week? Don\u2019t minimize it.", placeholder: "Shipped the pricing page ahead of schedule. Got my first real feedback from a paying user...", value: wins, onChange: setWins },
        { label: "Misses", prompt: "What didn\u2019t land? No shame. Just data.", placeholder: "Only did 1 customer interview instead of 3. Kept putting off the calls...", value: misses, onChange: setMisses },
        { label: "Learning", prompt: "What did this week teach you?", placeholder: "I avoid phone calls when I'm anxious about the product. Need to separate the two...", value: learnings, onChange: setLearnings },
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
            value={sec.value}
            onChange={(e) => sec.onChange(e.target.value)}
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
          value={carryForward}
          onChange={(e) => setCarryForward(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
          aria-label="Carry forward"
        />
      </div>

      {/* Peer shoutout */}
      {hasSquad ? (
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
          {peers.length > 0 ? (
            <>
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
                value={appreciationNote}
                onChange={(e) => setAppreciationNote(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
                aria-label="Peer appreciation note"
              />
            </>
          ) : (
            <div className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Your squad roster is still syncing. Peer appreciation will open here once your members are loaded.
            </div>
          )}
        </div>
      ) : (
        <div
          className="py-4 px-5"
          style={{ background: "var(--accent-surface)", border: "1px solid var(--accent)", borderRadius: "4px" }}
        >
          <div
            className="text-[10px] uppercase tracking-[0.08em] mb-2"
            style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
          >
            PROVEN unlock
          </div>
          <div className="text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Peer appreciation opens once you earn a PROVEN squad. For now, keep the reflection honest and the score will tell the truth.
          </div>
        </div>
      )}

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
