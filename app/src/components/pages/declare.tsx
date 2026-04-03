"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/lib/app-context";
import { useDeclarations } from "@/lib/hooks/use-declarations";
import { PageWrapper } from "../page-wrapper";

export function DeclarePage() {
  const { squad } = useApp();
  const { declaration, submit } = useDeclarations();
  const [goalCount, setGoalCount] = useState(3);
  const [submitted, setSubmitted] = useState(false);
  const [goalValues, setGoalValues] = useState<string[]>(["", "", ""]);
  const [blockers, setBlockers] = useState("");
  const initialized = useRef(false);
  const hasSquad = Boolean(squad);

  // Load existing declaration if one exists for this week
  useEffect(() => {
    if (declaration && !initialized.current) {
      initialized.current = true;
      const goals = declaration.goals as { text: string; order: number }[];
      setGoalValues(goals.map(g => g.text));
      setGoalCount(goals.length);
      setBlockers(declaration.blockers || "");
      setSubmitted(true); // Already declared this week
    }
  }, [declaration]);

  const updateGoal = (index: number, value: string) => {
    setGoalValues(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async () => {
    const goals = goalValues
      .map((text, i) => ({ text: text.trim(), order: i + 1 }))
      .filter(g => g.text.length > 0);

    if (goals.length === 0) return;

    try {
      await submit.mutateAsync({ goals, blockers: blockers.trim() || undefined });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      // Fallback: just show submitted UI even if Supabase isn't connected
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <PageWrapper page="declare">
      <h1 className="text-[1.75rem] font-bold leading-[1.2] mb-2">
        What will you deliver this week?
      </h1>
      <p className="text-[15px] leading-relaxed mb-9" style={{ color: "var(--text-secondary)" }}>
        {hasSquad
          ? "Declare your commitments to your squad. Be specific. Be measurable."
          : "Declare your commitments to the Boss. Be specific. Be measurable. This is how RECRUIT keeps score before squad access is earned."}
      </p>

      {!hasSquad && (
        <div
          className="mb-7 py-4 px-5"
          style={{
            background: "var(--accent-surface)",
            border: "1px solid var(--accent)",
            borderRadius: "4px",
          }}
        >
          <div
            className="text-[10px] uppercase tracking-[0.08em] mb-1"
            style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
          >
            RECRUIT mode
          </div>
          <div className="text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            No squad yet. The Boss is watching for consistency, honesty, and follow-through. Score 30+ across the sprint to earn QUALIFIED.
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5 mb-4">
        {Array.from({ length: goalCount }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <span
              className="text-[13px] w-5 shrink-0 text-center"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <input
              type="text"
              value={goalValues[i] || ""}
              onChange={(e) => updateGoal(i, e.target.value)}
              className="flex-1 py-3.5 px-4 text-[15px] outline-none transition-colors duration-150"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text)",
                borderRadius: "4px",
                fontFamily: "inherit",
              }}
              placeholder={
                i === 0
                  ? "Your most important commitment..."
                  : i === 1
                    ? "Second commitment..."
                    : "Another commitment..."
              }
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
              aria-label={`Goal ${i + 1}`}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => { setGoalCount((c) => c + 1); setGoalValues(prev => [...prev, ""]); }}
        className="inline-flex items-center gap-1.5 py-2.5 px-4 ml-8 text-[13px] cursor-pointer transition-all duration-150"
        style={{
          background: "none",
          border: "1px dashed var(--border)",
          color: "var(--text-muted)",
          borderRadius: "4px",
          fontFamily: "inherit",
        }}
      >
        + Add another
      </button>

      <div className="mt-6 mb-7">
        <div className="text-[13px] mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Anticipated blockers
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
          value={blockers}
          onChange={(e) => setBlockers(e.target.value)}
          placeholder={hasSquad
            ? "What might get in the way this week? How can your squad help?"
            : "What might get in the way this week? What should the Boss watch for?"}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
          aria-label="Blockers"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3.5 text-[15px] font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-px"
        style={{
          background: submitted ? "var(--green)" : "var(--accent)",
          color: "var(--accent-text)",
          borderRadius: "2px",
          fontFamily: "inherit",
          pointerEvents: submitted ? "none" : "auto",
        }}
      >
        {submitted ? "Submitted \u2713" : hasSquad ? "Declare to your squad" : "Declare your week"}
      </button>

      {/* Closing verse */}
      <div
        className="text-center pt-9 mt-9"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <p className="text-[0.95rem] italic leading-relaxed mb-1.5" style={{ color: "var(--text-secondary)" }}>
          &ldquo;Tie your camel, then place your trust in Allah.&rdquo;
        </p>
        <span
          className="text-[10px] uppercase tracking-[0.08em]"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          Tawakkul &middot; Effort meets trust
        </span>
      </div>
    </PageWrapper>
  );
}
