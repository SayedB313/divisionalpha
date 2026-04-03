"use client";

import { useNavigation } from "@/lib/navigation-context";
import { useProofState } from "@/lib/hooks/use-proof-state";
import { formatPulseStatus } from "@/lib/boss-loop";
import { PageWrapper } from "../page-wrapper";

function getProgressTone(progress: number) {
  if (progress >= 100) return "var(--green)";
  if (progress >= 65) return "var(--accent)";
  return "var(--yellow)";
}

export function ProofPage() {
  const { navigateTo, setScoreOpen } = useNavigation();
  const { tier, score, scoreData, redLineProgress, eliteLineProgress, operators, squads, recentPulses, badges } = useProofState();

  const factors = [
    { label: "Consistency", value: Math.round(Number(scoreData?.consistency ?? 0)) },
    { label: "Goal progress", value: Math.round(Number(scoreData?.goal_progress ?? scoreData?.goal_completion ?? 0)) },
    { label: "Engagement quality", value: Math.round(Number(scoreData?.engagement_quality ?? scoreData?.attendance ?? 0)) },
    { label: "Community", value: Math.round(Number(scoreData?.community ?? scoreData?.squad_contribution ?? 0)) },
    { label: "Growth", value: Math.round(Number(scoreData?.growth ?? 0)) },
  ].filter((factor) => factor.value > 0);

  return (
    <PageWrapper page="proof" layout="three_column">
      <div className="mb-8">
        <div
          className="text-[10px] uppercase tracking-[0.1em] mb-2"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
        >
          Proof
        </div>
        <h1 className="text-[1.9rem] font-bold leading-[1.12] mb-2">Your score tells the truth.</h1>
        <p className="text-[15px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
          The Boss is not here to flatter you. This is where the streak, score, unlock rules, badges, and leaderboard
          all line up into one clean read on whether you are rising.
        </p>
      </div>

      <div
        className="p-6 mb-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-6 mb-5">
          <div>
            <div className="text-[4.25rem] leading-none mb-2" style={{ fontFamily: "var(--font-instrument-serif), serif" }}>
              {score}
            </div>
            <div
              className="text-[10px] uppercase tracking-[0.1em]"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Operator score
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 min-w-[280px]">
            {[
              { label: "Current tier", value: tier.activeTier.toUpperCase() },
              { label: "Current streak", value: String(tier.currentStreak) },
              { label: "Best streak", value: String(tier.bestStreak) },
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
                <div className="text-[1rem] font-medium" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text)" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-5">
          <div
            className="py-4 px-4"
            style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="text-[13px] font-medium">QUALIFIED line</div>
              <div className="text-[10px] uppercase tracking-[0.08em]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}>
                30+
              </div>
            </div>
            <div className="w-full h-[6px] mb-2" style={{ background: "var(--surface)", borderRadius: "999px" }}>
              <div className="h-full" style={{ width: `${redLineProgress}%`, background: getProgressTone(redLineProgress), borderRadius: "999px" }} />
            </div>
            <p className="text-[13px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
              {tier.qualifiedUnlocked
                ? "You crossed the red line. Squad access is now earned rather than theoretical."
                : `${tier.gapToNext} more points until QUALIFIED unlocks.`}
            </p>
          </div>

          <div
            className="py-4 px-4"
            style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="text-[13px] font-medium">OPERATOR line</div>
              <div className="text-[10px] uppercase tracking-[0.08em]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}>
                70+
              </div>
            </div>
            <div className="w-full h-[6px] mb-2" style={{ background: "var(--surface)", borderRadius: "999px" }}>
              <div className="h-full" style={{ width: `${eliteLineProgress}%`, background: getProgressTone(eliteLineProgress), borderRadius: "999px" }} />
            </div>
            <p className="text-[13px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
              {tier.operatorEligible
                ? "You have the score profile for OPERATOR consideration once multi-sprint proof holds."
                : "OPERATOR is visible now so the standard stays clear before the room is open."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setScoreOpen(true)}
            className="py-3 px-5 text-sm font-medium cursor-pointer transition-all duration-150 hover:-translate-y-px"
            style={{ background: "var(--accent)", border: "none", color: "var(--accent-text)", borderRadius: "2px", fontFamily: "inherit" }}
          >
            Open score overlay
          </button>
          <button
            onClick={() => navigateTo("journey")}
            className="py-3 px-5 text-sm font-medium cursor-pointer transition-all duration-150 hover:-translate-y-px"
            style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "2px", fontFamily: "inherit" }}
          >
            Return to journey
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)_minmax(300px,0.9fr)] xl:items-start mb-6">
        <section
          className="p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
        >
          <div className="text-[10px] uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
            Factor breakdown
          </div>
          <h2 className="text-[1.2rem] font-semibold mb-4">What is moving the score</h2>
          <div className="space-y-3">
            {factors.length > 0 ? (
              factors.map((factor) => (
                <div key={factor.label} className="flex items-center gap-3">
                  <div className="w-[132px] text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    {factor.label}
                  </div>
                  <div className="flex-1 h-[6px]" style={{ background: "var(--bg-page)", borderRadius: "999px" }}>
                    <div className="h-full" style={{ width: `${factor.value}%`, background: "var(--accent)", borderRadius: "999px" }} />
                  </div>
                  <div className="w-8 text-right text-[12px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text)" }}>
                    {factor.value}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
                Score factors will show up here once the analytics loop has enough signal.
              </div>
            )}
          </div>
        </section>

        <section
          className="p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
        >
          <div className="text-[10px] uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
            Pulse trail
          </div>
          <h2 className="text-[1.2rem] font-semibold mb-4">Recent Boss answers</h2>
          <div className="space-y-2.5">
            {recentPulses.length > 0 ? (
              recentPulses.map((pulse) => (
                <div
                  key={pulse.id}
                  className="flex items-center justify-between gap-4 py-3 px-4"
                  style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
                >
                  <div className="text-[13px] font-medium">{pulse.pulse_date}</div>
                  <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    {formatPulseStatus(pulse.status)}
                  </div>
                  <div className="text-[12px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                    {pulse.score_delta !== null ? `${pulse.score_delta > 0 ? "+" : ""}${pulse.score_delta}` : "—"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
                The pulse trail starts once the daily loop has data.
              </div>
            )}
          </div>
        </section>

        <section
          className="p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
        >
          <div className="text-[10px] uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
            Badges
          </div>
          <h2 className="text-[1.2rem] font-semibold mb-4">Visible proof</h2>
          <div className="space-y-3">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="py-4 px-4"
                style={{
                  background: badge.unlocked ? "var(--accent-surface)" : "var(--bg-page)",
                  border: `1px solid ${badge.unlocked ? "var(--accent)" : "var(--border-subtle)"}`,
                  borderRadius: "4px",
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="text-[14px] font-medium">{badge.label}</div>
                  <div
                    className="text-[10px] uppercase tracking-[0.08em]"
                    style={{ fontFamily: "var(--font-dm-mono), monospace", color: badge.unlocked ? "var(--accent)" : "var(--text-muted)" }}
                  >
                    {badge.unlocked ? "Unlocked" : "Locked"}
                  </div>
                </div>
                <p className="text-[13px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                  {badge.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section
          className="p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
        >
          <div className="text-[10px] uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
            Operator leaderboard
          </div>
          <h2 className="text-[1.2rem] font-semibold mb-4">Who has earned visibility</h2>
          {operators.length > 0 ? (
            <div className="space-y-2">
              {operators.slice(0, 8).map((operator: any) => (
                <div
                  key={operator.user_id}
                  className="flex items-center gap-4 py-3 px-4"
                  style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
                >
                  <div className="w-8 text-[12px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                    #{operator.rank}
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold" style={{ background: "var(--surface-hover)", color: "var(--text-secondary)" }}>
                    {operator.initials || "DA"}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium">{operator.display_name}</div>
                    <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {operator.squad_name || "No squad yet"}
                    </div>
                  </div>
                  <div className="text-[14px] font-medium" style={{ fontFamily: "var(--font-dm-mono), monospace" }}>
                    {Math.round(Number(operator.total_score ?? 0))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
              The leaderboard becomes meaningful once QUALIFIED operators start stacking visible proof.
            </div>
          )}
        </section>

        <section
          className="p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
        >
          <div className="text-[10px] uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
            Squad leaderboard
          </div>
          <h2 className="text-[1.2rem] font-semibold mb-4">Rooms that are holding the line</h2>
          {squads.length > 0 ? (
            <div className="space-y-2">
              {squads.slice(0, 6).map((squad: any) => (
                <div
                  key={squad.squad_id}
                  className="flex items-center gap-4 py-3 px-4"
                  style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
                >
                  <div className="w-8 text-[12px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                    #{squad.rank}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium">{squad.name}</div>
                    <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {squad.member_count} operators · damage {Math.max(0, 100 - Math.round(Number(squad.completion_rate ?? 0)))}%
                    </div>
                  </div>
                  <div className="text-[14px] font-medium" style={{ fontFamily: "var(--font-dm-mono), monospace" }}>
                    {Math.round(Number(squad.completion_rate ?? 0))}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
              Squad proof unlocks once operators earn the right to be ranked together.
            </div>
          )}
        </section>
      </div>
    </PageWrapper>
  );
}
