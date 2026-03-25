"use client";

import { useState } from "react";
import { PageWrapper } from "../page-wrapper";

const GOALS = [
  "Ship pricing page with Stripe integration",
  "Complete 4 deep work sessions (2hr+ each)",
  "Run 3 customer discovery interviews",
  "Morning routine 5 of 7 days",
];

type Signal = "green" | "yellow" | "red" | null;

export function CheckinPage() {
  const [signals, setSignals] = useState<Signal[]>(GOALS.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const selectSignal = (goalIdx: number, signal: Signal) => {
    setSignals((prev) => prev.map((s, i) => (i === goalIdx ? signal : s)));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <PageWrapper page="checkin">
      <h1 className="text-[1.75rem] font-bold leading-[1.2] mb-2">Mid-week signal</h1>
      <p className="text-[15px] leading-relaxed mb-9" style={{ color: "var(--text-secondary)" }}>
        For each goal, give your squad an honest signal.
      </p>

      {GOALS.map((goal, i) => (
        <div
          key={i}
          className="py-4"
          style={{ borderBottom: i < GOALS.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
        >
          <div className="text-[15px] mb-2.5">
            {i + 1}. {goal}
          </div>
          <div className="flex gap-1.5">
            {(["green", "yellow", "red"] as const).map((s) => (
              <button
                key={s}
                onClick={() => selectSignal(i, s)}
                className="flex-1 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-center cursor-pointer transition-all duration-150"
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  border: `1px solid ${signals[i] === s ? `var(--${s})` : "var(--border)"}`,
                  background: signals[i] === s ? `var(--${s}-soft)` : "none",
                  color: signals[i] === s ? `var(--${s})` : "var(--text-muted)",
                  borderRadius: "2px",
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          {(signals[i] === "yellow" || signals[i] === "red") && (
            <div className="mt-2">
              <input
                type="text"
                className="w-full py-2.5 px-3.5 text-[13px] outline-none transition-colors duration-150"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text)",
                  borderRadius: "4px",
                  fontFamily: "inherit",
                }}
                placeholder="What's blocking you?"
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
              />
            </div>
          )}
        </div>
      ))}

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
        {submitted ? "Submitted \u2713" : "Submit check-in"}
      </button>
    </PageWrapper>
  );
}
