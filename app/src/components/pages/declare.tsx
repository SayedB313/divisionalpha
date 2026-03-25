"use client";

import { useState } from "react";
import { PageWrapper } from "../page-wrapper";

export function DeclarePage() {
  const [goalCount, setGoalCount] = useState(3);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <PageWrapper page="declare">
      <h1 className="text-[1.75rem] font-bold leading-[1.2] mb-2">
        What will you deliver this week?
      </h1>
      <p className="text-[15px] leading-relaxed mb-9" style={{ color: "var(--text-secondary)" }}>
        Declare your commitments to your squad. Be specific. Be measurable.
      </p>

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
        onClick={() => setGoalCount((c) => c + 1)}
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
          placeholder="What might get in the way this week? How can your squad help?"
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
        {submitted ? "Submitted \u2713" : "Declare to your squad"}
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
