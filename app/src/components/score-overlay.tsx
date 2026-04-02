"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { useOperatorScore } from "@/lib/hooks/use-scores";
import { useTierState } from "@/lib/hooks/use-tier-state";
import { formatPulseStatus } from "@/lib/boss-loop";

const FALLBACK_FACTORS = [
  { name: "Consistency", value: 78 },
  { name: "Goal Progress", value: 74 },
  { name: "Engagement", value: 72 },
  { name: "Community", value: 64 },
  { name: "Growth", value: 69 },
];

export function ScoreOverlay() {
  const { scoreOpen, setScoreOpen, navigateTo } = useNavigation();
  const { data: scoreData } = useOperatorScore();
  const tier = useTierState();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [barsVisible, setBarsVisible] = useState(false);
  const animRef = useRef<number | null>(null);

  const totalScore = scoreData?.total_score ? Math.round(Number(scoreData.total_score)) : tier.score || 0;
  const factors = scoreData ? [
    { name: "Consistency", value: Math.round(Number(scoreData.consistency ?? 0)) },
    { name: "Goal Progress", value: Math.round(Number(scoreData.goal_progress ?? scoreData.goal_completion ?? 0)) },
    { name: "Engagement", value: Math.round(Number(scoreData.engagement_quality ?? scoreData.attendance ?? 0)) },
    { name: "Community", value: Math.round(Number(scoreData.community ?? scoreData.squad_contribution ?? 0)) },
    { name: "Growth", value: Math.round(Number(scoreData.growth ?? 0)) },
  ].filter((factor) => factor.value > 0) : FALLBACK_FACTORS;

  const currentStreak = Number(scoreData?.current_streak ?? tier.currentStreak ?? 0);
  const bestStreak = Number(scoreData?.best_streak ?? tier.bestStreak ?? 0);
  const lastPulseStatus = formatPulseStatus((scoreData?.last_pulse_status as any) || null);

  useEffect(() => {
    if (!scoreOpen) return;

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
    }, 180);

    return () => {
      clearTimeout(timeout);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [scoreOpen, totalScore]);

  if (!scoreOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "var(--overlay)" }}
      onClick={(event) => {
        if (event.target === event.currentTarget) setScoreOpen(false);
      }}
    >
      <div
        className="w-[90%] max-w-[540px] max-h-[85vh] overflow-y-auto p-8"
        style={{
          background: "var(--bg-page)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          boxShadow: "var(--shadow-lg)",
          animation: "fadeUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        <button
          onClick={() => setScoreOpen(false)}
          className="float-right bg-transparent border-none text-lg cursor-pointer p-1"
          style={{ color: "var(--text-muted)" }}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="text-center pt-10 pb-6">
          <div
            className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center text-2xl"
            style={{ border: "2px solid var(--accent)", color: "var(--accent)" }}
          >
            &#9670;
          </div>
          <div className="text-[4.5rem] leading-none mb-1" style={{ fontFamily: "var(--font-instrument-serif), serif" }}>
            {animatedScore}
          </div>
          <div
            className="text-[11px] uppercase tracking-[0.1em]"
            style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
          >
            Operator score
          </div>
        </div>

        <div className="space-y-3.5 mb-8">
          {factors.map((factor) => (
            <div key={factor.name} className="flex items-center gap-3">
              <span className="text-[13px] w-[120px] shrink-0" style={{ color: "var(--text-secondary)" }}>
                {factor.name}
              </span>
              <div className="flex-1 h-[5px] overflow-hidden" style={{ background: "var(--surface)", borderRadius: "999px" }}>
                <div
                  className="h-full transition-all duration-[800ms]"
                  style={{
                    background: "var(--accent)",
                    borderRadius: "999px",
                    width: barsVisible ? `${factor.value}%` : "0%",
                    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </div>
              <span className="w-6 text-right text-xs" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                {factor.value}
              </span>
            </div>
          ))}
        </div>

        <div
          className="p-6 mb-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
        >
          <div className="text-sm font-semibold mb-4">Proof at a glance</div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: String(currentStreak), label: "Current streak" },
              { val: String(bestStreak), label: "Best streak" },
              { val: lastPulseStatus, label: "Last pulse" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-xl font-medium leading-none mb-[3px]" style={{ fontFamily: "var(--font-dm-mono), monospace" }}>
                  {item.val}
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.06em]"
                  style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="p-4 text-center text-[13px] leading-relaxed"
          style={{ background: "var(--accent-surface)", border: "1px solid var(--accent)", borderRadius: "4px", color: "var(--accent)" }}
        >
          {tier.provenUnlocked
            ? "PROVEN is earned. Your next question is whether the score and your behavior justify stronger responsibility."
            : `ENTER is open. PROVEN unlocks at 70+. You are ${Math.max(0, 70 - tier.score)} points away.`}
        </div>

        <button
          onClick={() => {
            setScoreOpen(false);
            navigateTo("proof");
          }}
          className="w-full mt-4 py-3.5 text-sm font-medium border-none cursor-pointer transition-colors duration-150"
          style={{ background: "var(--accent)", color: "var(--accent-text)", borderRadius: "2px", fontFamily: "inherit" }}
        >
          Open full proof view
        </button>
      </div>
    </div>
  );
}
