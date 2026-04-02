"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigation } from "@/lib/navigation-context";
import { useApp } from "@/lib/app-context";
import { useCoach } from "@/lib/hooks/use-coach";
import { useBossPulse } from "@/lib/hooks/use-boss-pulse";
import { useDeclarations } from "@/lib/hooks/use-declarations";
import { useCheckins } from "@/lib/hooks/use-checkins";
import { useOperatorScore } from "@/lib/hooks/use-scores";
import { describePulseStatus, formatPulseStatus } from "@/lib/boss-loop";
import { PageWrapper } from "../page-wrapper";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Fallback mock data (used when not authenticated)
const MOCK_GOALS = [
  { text: "Ship pricing page with Stripe integration", done: true, status: "green" },
  { text: "Complete 4 deep work sessions (2hr+ each)", done: true, status: "green" },
  { text: "Run 3 customer discovery interviews", done: false, status: "yellow" },
  { text: "Morning routine 5 of 7 days", done: false, status: null },
];

const MOCK_SQUAD_MEMBERS = ["SR", "FN", "MH", "OT", "JL", "PK"];

function getPulseColor(status: string) {
  if (status === "completed") return "var(--green)";
  if (status === "blocked") return "var(--yellow)";
  if (status === "missed") return "var(--red)";
  return "var(--border)";
}

function getContextCard(dayOfWeek: number, hasSquad: boolean) {
  if (dayOfWeek === 1) {
    return {
      overline: "Monday \u00B7 Declaration Day",
      headline: "What are you committing to this week?",
      body: hasSquad
        ? "Your squad is waiting for your declaration. Last week you hit 3 of 4 goals \u2014 let\u2019s build on that momentum."
        : "The Boss is waiting for your declaration. Be specific, be measurable, and give yourself something real to execute against.",
      action: "Declare your goals \u2192",
      target: "declare" as const,
    };
  }
  if (dayOfWeek === 3) {
    return {
      overline: "Wednesday \u00B7 Check-in Day",
      headline: hasSquad ? "Your squad is waiting on your signal." : "Tell the Boss how the week is tracking.",
      body: hasSquad
        ? "5 of 7 members have checked in. You declared 4 goals on Monday \u2014 how are they tracking?"
        : "Mid-week honesty matters more than mid-week confidence. Green, yellow, or red \u2014 give the true signal.",
      action: "Submit check-in \u2192",
      target: "checkin" as const,
    };
  }
  if (dayOfWeek === 5) {
    return {
      overline: "Friday \u00B7 Reflection Day",
      headline: "Look back before you move forward.",
      body: "Week 4 is closing. Take 5 minutes to reflect on what landed, what didn\u2019t, and what you\u2019re carrying into next week.",
      action: "Write your reflection \u2192",
      target: "reflect" as const,
    };
  }
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      overline: "Weekend \u00B7 Recharge",
      headline: "Rest is part of the rhythm.",
      body: "No check-ins today. Monday\u2019s declaration round starts fresh. Use this time to think about what you want next week to look like.",
      action: "Review your sprint \u2192",
      target: "reflect" as const,
    };
  }
  return {
    overline: `${DAYS[dayOfWeek]} \u00B7 Execution Day`,
    headline: "Heads down. You know what to do.",
    body: hasSquad
      ? "Your goals are declared, your squad knows the plan. This is the work between the check-ins \u2014 the part that actually moves the needle."
      : "Your goals are declared and the Boss is keeping score. This is the quiet part of the proving ground \u2014 the part that actually moves the needle.",
    action: "View your goals \u2192",
    target: null,
  };
}

export function HomePage() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();
  const { profile, sprint, squad, squadMembers } = useApp();
  const { whisper } = useCoach();
  const { pulse, recentPulses, submit: submitPulse } = useBossPulse();
  const { declaration } = useDeclarations();
  const { squadCheckins } = useCheckins();
  const { data: scoreData } = useOperatorScore();
  const [goals, setGoals] = useState(user ? [] : MOCK_GOALS);
  const [sprintWidth, setSprintWidth] = useState("0%");
  const hasSquad = Boolean(squad);

  // Use real data when available, fall back to mock
  const userName = profile?.display_name?.split(" ")[0] || "Amir";
  const sprintNumber = sprint?.number ?? 3;
  const currentWeek = sprint?.current_week ?? 4;
  const sprintWeeks = sprint?.duration_weeks ?? 6;
  const sprintPct = sprintWeeks > 0 ? Math.round((currentWeek / sprintWeeks) * 100) : 66;
  const memberInitials = squadMembers.length > 0
    ? squadMembers.filter(m => m.user_id !== profile?.id).map(m => m.profile.initials)
    : (profile ? [] : MOCK_SQUAD_MEMBERS);
  const totalMembers = squadMembers.length > 0 ? squadMembers.length : 0;
  const checkedInCount = squadCheckins.length > 0 ? squadCheckins.length : null;
  const coachWhisper = whisper?.content || null;
  const currentScore = scoreData?.total_score ? Math.round(Number(scoreData.total_score)) : null;
  const currentStreak = Number(scoreData?.current_streak ?? pulse?.streak_after ?? 0);
  const pulsePrompt = pulse?.prompt_text || "Daily Boss pulse: did you move today, get blocked, or miss the standard?";
  const pulseStatus = pulse?.status ?? "pending";
  const recentPulseHistory = [...recentPulses].reverse();

  // Map declaration goals to display format
  useEffect(() => {
    if (declaration?.goals) {
      const declGoals = (declaration.goals as { text: string; order: number }[]).map(g => ({
        text: g.text,
        done: false,
        status: null as string | null,
      }));
      if (declGoals.length > 0) setGoals(declGoals);
      return;
    }
    setGoals(user ? [] : MOCK_GOALS);
  }, [declaration, user]);

  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = `${DAYS[dayOfWeek]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  const ctx = getContextCard(dayOfWeek, hasSquad);

  useEffect(() => {
    const t = setTimeout(() => setSprintWidth(`${sprintPct}%`), 300);
    return () => clearTimeout(t);
  }, [sprintPct]);

  const toggleGoal = (i: number) => {
    setGoals((prev) => prev.map((g, idx) => (idx === i ? { ...g, done: !g.done } : g)));
  };

  const handlePulseSubmit = async (status: "completed" | "blocked" | "missed") => {
    try {
      await submitPulse.mutateAsync({ status });
    } catch {
      // Keep the UI quiet for now; the mutation state is enough to prevent duplicate clicks.
    }
  };

  return (
    <PageWrapper page="home">
      {/* Meta */}
      <div
        className="text-[11px] uppercase tracking-[0.08em] mb-1"
        style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
      >
        Sprint {sprintNumber} &middot; Week {currentWeek}
      </div>
      <div className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        {dateStr}
      </div>

      {/* Greeting */}
      <h1 className="text-[1.75rem] font-bold leading-[1.2] mb-8">
        {greeting}, <span style={{ color: "var(--accent)" }}>{userName}</span>
      </h1>

      {/* Context Card */}
      <div
        className="p-7 mb-6 transition-shadow duration-300 hover:shadow-md cursor-pointer"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "4px",
        }}
      >
        <div
          className="text-[11px] uppercase tracking-[0.1em] mb-3"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
        >
          {ctx.overline}
        </div>
        <h2 className="text-2xl font-bold leading-[1.25] mb-2.5">{ctx.headline}</h2>
        <p className="text-[15px] leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
          {ctx.body}
        </p>
        <button
          onClick={() => ctx.target && navigateTo(ctx.target)}
          className="inline-flex items-center gap-2 px-6 py-3 border-none text-sm font-medium tracking-[0.02em] cursor-pointer transition-all duration-150 hover:-translate-y-px"
          style={{
            background: "var(--accent)",
            color: "var(--accent-text)",
            borderRadius: "2px",
          }}
        >
          {ctx.action}
        </button>
      </div>

      {/* Boss Pulse */}
      <div
        className="p-6 mb-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "4px",
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div
              className="text-[11px] uppercase tracking-[0.1em] mb-2"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
            >
              Daily Boss Pulse
            </div>
            <h2 className="text-[1.35rem] font-bold leading-[1.3] mb-2">{pulsePrompt}</h2>
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {describePulseStatus(pulseStatus as "pending" | "completed" | "blocked" | "missed")}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div
              className="text-[10px] uppercase tracking-[0.08em] mb-1"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Current streak
            </div>
            <div
              className="text-[1.6rem] leading-none"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text)" }}
            >
              {currentStreak}
            </div>
            {currentScore !== null && (
              <div className="text-[12px] mt-1" style={{ color: "var(--text-secondary)" }}>
                Score {currentScore}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {recentPulseHistory.length > 0 ? (
            recentPulseHistory.map((entry) => (
              <div
                key={entry.id}
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: getPulseColor(entry.status) }}
                title={`${entry.pulse_date} · ${formatPulseStatus(entry.status)}`}
              />
            ))
          ) : (
            <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
              Your pulse history starts today.
            </span>
          )}
        </div>

        {pulseStatus === "pending" ? (
          <div className="flex flex-wrap gap-2">
            {[
              { label: "I showed up", status: "completed" as const, bg: "var(--green)", color: "#fff" },
              { label: "Blocked", status: "blocked" as const, bg: "var(--yellow-soft)", color: "var(--yellow)" },
              { label: "Missed", status: "missed" as const, bg: "var(--red-soft)", color: "var(--red)" },
            ].map((option) => (
              <button
                key={option.status}
                onClick={() => handlePulseSubmit(option.status)}
                disabled={submitPulse.isPending}
                className="py-2.5 px-4 text-[13px] font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-px"
                style={{
                  background: option.bg,
                  color: option.color,
                  borderRadius: "2px",
                  opacity: submitPulse.isPending ? 0.7 : 1,
                  pointerEvents: submitPulse.isPending ? "none" : "auto",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <div
            className="inline-flex items-center gap-2 py-2 px-3"
            style={{
              background: pulseStatus === "completed" ? "var(--green-soft)" : pulseStatus === "blocked" ? "var(--yellow-soft)" : "var(--red-soft)",
              color: pulseStatus === "completed" ? "var(--green)" : pulseStatus === "blocked" ? "var(--yellow)" : "var(--red)",
              borderRadius: "2px",
            }}
          >
            <span
              className="text-[10px] uppercase tracking-[0.08em]"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              {formatPulseStatus(pulseStatus as "completed" | "blocked" | "missed")}
            </span>
            <span className="text-[13px]">Today's pulse is on the board.</span>
          </div>
        )}
      </div>

      {/* Goals */}
      <div className="mt-9">
        <div
          className="text-[11px] uppercase tracking-[0.1em] mb-3"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          This week&apos;s declarations
        </div>
        {goals.length > 0 ? (
          goals.map((g, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-3.5 cursor-pointer transition-opacity duration-150"
              style={{ borderBottom: i < goals.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
              onClick={() => toggleGoal(i)}
            >
              <div
                className="w-5 h-5 flex items-center justify-center text-xs shrink-0"
                style={{
                  border: g.done ? "none" : "1.5px solid var(--border)",
                  background: g.done ? "var(--green)" : "none",
                  color: g.done ? "#fff" : "transparent",
                  borderRadius: "2px",
                }}
              >
                &#10003;
              </div>
              <div
                className="text-[15px] flex-1"
                style={{
                  color: g.done ? "var(--text-muted)" : "var(--text)",
                  textDecoration: g.done ? "line-through" : "none",
                  textDecorationColor: "var(--border)",
                }}
              >
                {g.text}
              </div>
              {g.status && (
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: `var(--${g.status})` }}
                />
              )}
            </div>
          ))
        ) : (
          <div
            className="py-5 px-5 text-[14px] leading-relaxed"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
              color: "var(--text-secondary)",
            }}
          >
            No declaration submitted yet. Start the week with 1 to 3 concrete commitments so the Boss has something real to judge.
          </div>
        )}
      </div>

      {/* Coach Whisper */}
      {coachWhisper && (
        <div
          className="mt-9 py-5 px-6"
          style={{
            background: "var(--accent-surface)",
            borderLeft: "2px solid var(--accent)",
            borderRadius: "0 4px 4px 0",
          }}
        >
          <div
            className="text-[10px] uppercase tracking-[0.1em] font-medium mb-1.5"
            style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
          >
            Coach
          </div>
          <div className="text-sm italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {coachWhisper}
          </div>
        </div>
      )}

      {/* Squad Summary */}
      {hasSquad ? (
        <div
          className="mt-6 py-4 px-5 flex items-center justify-between cursor-pointer transition-shadow duration-150 hover:shadow-sm"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "4px",
          }}
          onClick={() => navigateTo("squad")}
        >
          <div className="flex items-center gap-3">
            <div className="flex ml-1">
              {memberInitials.map((m, i) => (
                <div
                  key={m}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold"
                  style={{
                    background: "var(--surface-hover)",
                    color: "var(--text-secondary)",
                    border: "2px solid var(--bg-page)",
                    marginLeft: i > 0 ? "-6px" : "0",
                  }}
                >
                  {m}
                </div>
              ))}
            </div>
            <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              {checkedInCount !== null ? `${checkedInCount} of ${totalMembers} checked in` : `${totalMembers} members`}
            </div>
          </div>
          <div className="text-sm" style={{ color: "var(--text-muted)" }}>&rarr;</div>
        </div>
      ) : (
        <div
          className="mt-6 py-4 px-5 flex items-center justify-between cursor-pointer transition-shadow duration-150 hover:shadow-sm"
          style={{
            background: "var(--accent-surface)",
            border: "1px solid var(--accent)",
            borderRadius: "4px",
          }}
          onClick={() => navigateTo("squad")}
        >
          <div>
            <div
              className="text-[10px] uppercase tracking-[0.08em] mb-1"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
            >
              PROVEN unlock
            </div>
            <div className="text-[15px] font-medium mb-1">Your squad is earned, not assigned on day one.</div>
            <div className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Finish the 40-day proving ground with a 70+ score to unlock PROVEN squad access.
            </div>
          </div>
          <div className="text-sm" style={{ color: "var(--accent)" }}>&rarr;</div>
        </div>
      )}

      {/* Sprint Bar */}
      <div
        className="mt-9 flex items-center gap-3 py-4"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <span
          className="text-[11px] whitespace-nowrap"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          Sprint {sprintNumber}
        </span>
        <div
          className="flex-1 h-[3px] overflow-hidden"
          style={{ background: "var(--surface)", borderRadius: "2px" }}
        >
          <div
            className="h-full transition-all duration-1000"
            style={{
              background: "var(--accent)",
              borderRadius: "2px",
              width: sprintWidth,
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
        <span
          className="text-[11px]"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          {sprintPct}%
        </span>
      </div>

      {/* Sprint Timeline */}
      <div className="mt-8 flex gap-1">
        {Array.from({ length: sprintWeeks }, (_, i) => i + 1).map((w) => (
          <div key={w} className="flex-1 text-center">
            <div
              className="text-[10px] uppercase tracking-[0.06em] mb-1.5"
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                color: w === currentWeek ? "var(--accent)" : "var(--text-muted)",
                fontWeight: w === currentWeek ? 500 : 400,
              }}
            >
              W{w}
            </div>
            <div
              className="h-1"
              style={{
                borderRadius: "2px",
                background:
                  w < currentWeek
                    ? "var(--accent)"
                    : w === currentWeek
                      ? "linear-gradient(90deg, var(--accent) 60%, var(--surface) 60%)"
                      : "var(--surface)",
              }}
            />
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
