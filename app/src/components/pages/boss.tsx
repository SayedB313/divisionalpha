"use client";

import { useNavigation } from "@/lib/navigation-context";
import { useDashboardSnapshot } from "@/lib/hooks/use-dashboard-snapshot";
import { describePulseStatus, formatPulseStatus } from "@/lib/boss-loop";
import { PageWrapper } from "../page-wrapper";

function getPulseColor(status?: string | null) {
  if (status === "completed") return "var(--green)";
  if (status === "blocked") return "var(--yellow)";
  if (status === "missed") return "var(--red)";
  return "var(--border)";
}

function getTierAccent(tier: string) {
  if (tier === "operator") {
    return {
      border: "rgba(61, 107, 74, 0.45)",
      background: "linear-gradient(180deg, var(--accent-surface) 0%, var(--surface) 100%)",
      label: "OPERATOR",
    };
  }

  if (tier === "qualified") {
    return {
      border: "var(--accent)",
      background: "var(--accent-surface)",
      label: "QUALIFIED",
    };
  }

  return {
    border: "var(--border-subtle)",
    background: "var(--surface)",
    label: "RECRUIT",
  };
}

export function BossPage() {
  const { navigateTo } = useNavigation();
  const snapshot = useDashboardSnapshot();
  const {
    firstName,
    sprint,
    pulse,
    recentPulses,
    submitPulse,
    coachWhisper,
    tier,
    sprintDay,
    sprintProgress,
    phase,
    weekday,
    nextRitual,
    ritualState,
    unlockedModules,
  } = snapshot;

  const pulseHistory = [...recentPulses].reverse();
  const tierAccent = getTierAccent(tier.activeTier);
  const currentScore = tier.score;
  const nextTierLabel = tier.nextTier ? tier.nextTier.toUpperCase() : "OPERATOR";
  const pulseStatus = pulse?.status ?? "pending";

  return (
    <PageWrapper page="boss" layout="two_column">
      <div className="mb-8">
        <div
          className="text-[11px] uppercase tracking-[0.1em] mb-2"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
        >
          Boss Home
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[1.95rem] font-bold leading-[1.1] mb-2">
              {firstName}, the Boss is watching.
            </h1>
            <p className="text-[15px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
              {weekday} is not asking for a different identity. It is asking for a clean answer, an honest line,
              and the next step inside your 40-day proving ground.
            </p>
          </div>
          <div
            className="py-2.5 px-3 min-w-[150px]"
            style={{
              background: tierAccent.background,
              border: `1px solid ${tierAccent.border}`,
              borderRadius: "4px",
            }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.08em] mb-1"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
            >
              Current tier
            </div>
            <div className="text-[1rem] font-semibold">{tierAccent.label}</div>
            <div className="text-[12px] mt-1" style={{ color: "var(--text-secondary)" }}>
              Score {currentScore} · Streak {tier.currentStreak}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)] xl:items-start">
        <div className="space-y-5">
          <div
            className="p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-5 mb-4">
              <div className="max-w-[460px]">
                <div
                  className="text-[10px] uppercase tracking-[0.1em] mb-2"
                  style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
                >
                  Daily Boss pulse
                </div>
                <h2 className="text-[1.4rem] font-semibold leading-[1.28] mb-2">
                  {pulse?.prompt_text || "Did you move today, get blocked, or miss the standard?"}
                </h2>
                <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                  {describePulseStatus(pulseStatus)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 min-w-[220px]">
                {[
                  { label: "Day", value: sprintDay > 0 ? `${sprintDay}/40` : "Waiting" },
                  { label: "Phase", value: phase.label },
                  { label: "Score", value: String(currentScore) },
                  { label: "Standard", value: formatPulseStatus(pulseStatus) },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="py-3 px-3"
                    style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
                  >
                    <div
                      className="text-[9px] uppercase tracking-[0.08em] mb-1"
                      style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
                    >
                      {item.label}
                    </div>
                    <div
                      className="text-[1rem] font-medium"
                      style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text)" }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { key: "completed", label: "Moved" },
                { key: "blocked", label: "Blocked" },
                { key: "missed", label: "Missed" },
              ].map((option) => {
                const active = pulseStatus === option.key;
                return (
                  <button
                    key={option.key}
                    onClick={() => submitPulse.mutate({ status: option.key as "completed" | "blocked" | "missed" })}
                    disabled={submitPulse.isPending || active}
                    className="py-3 px-5 text-sm font-medium cursor-pointer transition-all duration-150 hover:-translate-y-px disabled:translate-y-0"
                    style={{
                      background: active ? "var(--accent)" : "var(--bg-page)",
                      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      color: active ? "var(--accent-text)" : "var(--text-secondary)",
                      borderRadius: "2px",
                      fontFamily: "inherit",
                      opacity: submitPulse.isPending ? 0.7 : 1,
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {pulseHistory.length > 0 ? (
                  pulseHistory.map((entry) => (
                    <span
                      key={entry.id}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: getPulseColor(entry.status) }}
                      title={`${entry.pulse_date} · ${formatPulseStatus(entry.status)}`}
                    />
                  ))
                ) : (
                  <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                    Your pulse chain starts today.
                  </span>
                )}
              </div>
              <button
                onClick={() => navigateTo("proof")}
                className="text-[12px] bg-transparent border-none cursor-pointer"
                style={{ color: "var(--accent)", fontFamily: "inherit" }}
              >
                Open full proof view &rarr;
              </button>
            </div>
          </div>

          <div
            className="p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
            }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.08em] mb-2"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Modules in reach
            </div>
            <h2 className="text-[1.2rem] font-semibold mb-4">What the Boss wants you to use next</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {unlockedModules.map((module) => (
                <button
                  key={module.key}
                  onClick={() => navigateTo(module.key as "journey" | "squad" | "proof")}
                  className="text-left py-5 px-5 cursor-pointer transition-all duration-150 hover:-translate-y-px"
                  style={{
                    background: "var(--bg-page)",
                    border: `1px solid ${module.state === "open" ? "var(--border-subtle)" : "var(--border)"}`,
                    opacity: module.state === "open" ? 1 : 0.9,
                    borderRadius: "4px",
                    fontFamily: "inherit",
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div
                      className="text-[10px] uppercase tracking-[0.08em]"
                      style={{ fontFamily: "var(--font-dm-mono), monospace", color: module.state === "open" ? "var(--accent)" : "var(--text-muted)" }}
                    >
                      {module.state === "open" ? "Open" : "Locked"}
                    </div>
                    <span style={{ color: "var(--text-muted)" }}>&rarr;</span>
                  </div>
                  <div className="text-[1rem] font-semibold mb-2">{module.title}</div>
                  <p className="text-[13px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                    {module.body}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div
            className="p-6"
            style={{
              background: "var(--accent-surface)",
              border: "1px solid var(--accent)",
              borderRadius: "4px",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <div
                  className="text-[10px] uppercase tracking-[0.08em] mb-2"
                  style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
                >
                  Score, streak, progression
                </div>
                <h2 className="text-[1.25rem] font-semibold mb-1">
                  {tier.nextTier ? `${tier.gapToNext} points from ${nextTierLabel}.` : "You are operating at the highest unlocked layer."}
                </h2>
                <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                  RECRUIT stays open. QUALIFIED is earned at 30+. OPERATOR opens at 70+ across the kind of evidence the room respects.
                </p>
              </div>
              <button
                onClick={() => navigateTo("proof")}
                className="py-3 px-5 text-sm font-medium cursor-pointer transition-all duration-150 hover:-translate-y-px"
                style={{
                  background: "var(--accent)",
                  border: "none",
                  color: "var(--accent-text)",
                  borderRadius: "2px",
                  fontFamily: "inherit",
                }}
              >
                See the ladder
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {tier.tiers.map((card) => (
                <div
                  key={card.key}
                  className="py-4 px-4"
                  style={{
                    background: "var(--bg-page)",
                    border: `1px solid ${card.status === "current" ? "var(--accent)" : "var(--border-subtle)"}`,
                    borderRadius: "4px",
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div
                      className="text-[10px] uppercase tracking-[0.08em]"
                      style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
                    >
                      {card.label}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-[0.08em]"
                      style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
                    >
                      {card.price}
                    </div>
                  </div>
                  <div
                    className="text-[1.15rem] font-medium mb-2"
                    style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text)" }}
                  >
                    {card.threshold !== null ? `${card.threshold}+` : "—"}
                  </div>
                  <p className="text-[13px] leading-[1.6] mb-3" style={{ color: "var(--text-secondary)" }}>
                    {card.body}
                  </p>
                  <div
                    className="text-[10px] uppercase tracking-[0.08em]"
                    style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
                  >
                    {card.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
            }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.08em] mb-2"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Today in the arena
            </div>
            <h2 className="text-[1.2rem] font-semibold mb-2">{nextRitual}</h2>
            <div className="w-full h-[5px] mb-4" style={{ background: "var(--bg-page)", borderRadius: "999px" }}>
              <div
                className="h-full"
                style={{
                  width: `${sprintProgress}%`,
                  background: "var(--accent)",
                  borderRadius: "999px",
                }}
              />
            </div>
            <div className="space-y-3">
              {[
                { label: "Monday declaration", done: ritualState.declarationDone },
                { label: "Wednesday signal", done: ritualState.checkinDone },
                { label: "Friday reflection", done: ritualState.reflectionDone },
              ].map((item) => (
                <div
                  key={item.label}
                  className="py-3 px-3"
                  style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: item.done ? "var(--green)" : "var(--yellow)" }} />
                    <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
            }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.08em] mb-2"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Coach whisper
            </div>
            <p className="text-[15px] leading-[1.75] mb-4" style={{ color: "var(--text-secondary)" }}>
              {coachWhisper || "The Boss remembers your line. When the whisper changes, it means the pattern changed first."}
            </p>
            <button
              onClick={() => navigateTo("coach")}
              className="text-[12px] bg-transparent border-none cursor-pointer"
              style={{ color: "var(--accent)", fontFamily: "inherit" }}
            >
              Open coach thread &rarr;
            </button>
          </div>

          {sprint && (
            <div
              className="rounded-[4px] px-4 py-3 text-[11px]"
              style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Sprint {sprint.number} · Week {sprint.current_week} of {sprint.duration_weeks} · {phase.label}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
