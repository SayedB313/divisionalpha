"use client";

import { useNavigation } from "@/lib/navigation-context";
import { useApp } from "@/lib/app-context";
import { useOperatorScore } from "@/lib/hooks/use-scores";
import { useEffect, useState, useRef } from "react";

const MOCK_FACTORS = [
  { name: "Goal Completion", value: 82 },
  { name: "Attendance", value: 95 },
  { name: "Contribution", value: 78 },
  { name: "Leadership", value: 70 },
  { name: "Growth", value: 88 },
  { name: "Communication", value: 90 },
];

export function ScoreOverlay() {
  const { scoreOpen, setScoreOpen } = useNavigation();
  const { profile, sprint } = useApp();
  const { data: scoreData } = useOperatorScore();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [barsVisible, setBarsVisible] = useState(false);
  const animRef = useRef<number | null>(null);

  // Use real score data or mock
  const totalScore = scoreData?.total_score ? Math.round(Number(scoreData.total_score)) : 84;
  const factors = scoreData ? [
    { name: "Goal Completion", value: Math.round(Number(scoreData.goal_completion ?? 82)) },
    { name: "Attendance", value: Math.round(Number(scoreData.attendance ?? 95)) },
    { name: "Contribution", value: Math.round(Number(scoreData.squad_contribution ?? 78)) },
    { name: "Leadership", value: Math.round(Number(scoreData.leadership ?? 70)) },
    { name: "Growth", value: Math.round(Number(scoreData.growth ?? 88)) },
    { name: "Communication", value: Math.round(Number(scoreData.communication ?? 90)) },
  ] : MOCK_FACTORS;

  const sprintNumber = sprint?.number ?? 3;

  useEffect(() => {
    if (scoreOpen) {
      setAnimatedScore(0);
      setBarsVisible(false);

      const timeout = setTimeout(() => {
        setBarsVisible(true);
        let current = 0;
        const step = () => {
          current += 2;
          if (current >= totalScore) current = totalScore;
          setAnimatedScore(current);
          if (current < totalScore) {
            animRef.current = requestAnimationFrame(step);
          }
        };
        animRef.current = requestAnimationFrame(step);
      }, 200);

      return () => {
        clearTimeout(timeout);
        if (animRef.current) cancelAnimationFrame(animRef.current);
      };
    }
  }, [scoreOpen, totalScore]);

  if (!scoreOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "var(--overlay)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setScoreOpen(false);
      }}
    >
      <div
        className="w-[90%] max-w-[520px] max-h-[85vh] overflow-y-auto p-8"
        style={{
          background: "var(--bg-page)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          boxShadow: "var(--shadow-lg)",
          animation: "fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        <button
          onClick={() => setScoreOpen(false)}
          className="float-right bg-transparent border-none text-lg cursor-pointer p-1 transition-colors duration-150"
          style={{ color: "var(--text-muted)" }}
          aria-label="Close"
        >
          &times;
        </button>

        {/* Crest */}
        <div className="text-center pt-12 pb-6">
          <div
            className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center text-2xl"
            style={{
              border: "2px solid var(--accent)",
              color: "var(--accent)",
            }}
          >
            &#9670;
          </div>
        </div>

        {/* Score */}
        <div
          className="text-center text-[4.5rem] leading-none mb-1"
          style={{ fontFamily: "var(--font-instrument-serif), serif" }}
        >
          {animatedScore}
        </div>
        <div
          className="text-center text-[11px] uppercase tracking-[0.1em] mb-9"
          style={{
            fontFamily: "var(--font-dm-mono), monospace",
            color: "var(--text-muted)",
          }}
        >
          Operator Score
        </div>

        {/* Factor bars */}
        <div className="space-y-3.5">
          {factors.map((f) => (
            <div key={f.name} className="flex items-center gap-3">
              <span
                className="text-[13px] w-[120px] shrink-0"
                style={{ color: "var(--text-secondary)" }}
              >
                {f.name}
              </span>
              <div
                className="flex-1 h-1 overflow-hidden"
                style={{ background: "var(--surface)", borderRadius: "2px" }}
              >
                <div
                  className="h-full transition-all duration-[800ms]"
                  style={{
                    background: "var(--accent)",
                    borderRadius: "2px",
                    width: barsVisible ? `${f.value}%` : "0%",
                    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </div>
              <span
                className="w-6 text-right text-xs"
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  color: "var(--text-muted)",
                }}
              >
                {f.value}
              </span>
            </div>
          ))}
        </div>

        {/* Sprint summary */}
        <div
          className="mt-8 p-6"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "4px",
          }}
        >
          <div className="text-sm font-semibold mb-4">Sprint {sprintNumber} at a glance</div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: "14/18", label: "Goals hit" },
              { val: "100%", label: "Attendance" },
              { val: "3", label: "Sprints done" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="text-xl font-medium leading-none mb-[3px]"
                  style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                >
                  {s.val}
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.06em]"
                  style={{
                    fontFamily: "var(--font-dm-mono), monospace",
                    color: "var(--text-muted)",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 3 whisper */}
        <div
          className="mt-6 p-4 text-center text-[13px] leading-relaxed"
          style={{
            background: "var(--accent-surface)",
            border: "1px solid var(--accent)",
            borderRadius: "4px",
            color: "var(--accent)",
          }}
        >
          Your score qualifies you for <strong>The Operator Fund</strong>. You&apos;ll
          receive an invitation at sprint completion.
        </div>
      </div>
    </div>
  );
}
