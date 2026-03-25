"use client";

import { useState } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { PageWrapper } from "../page-wrapper";

type Tab = "squads" | "operators";

const SQUADS = [
  { rank: 1, name: "Iron Circuit", sprint: "S3", members: 7, completion: 91, streak: 3, trend: "+4%", isTop: true },
  { rank: 2, name: "Alpha Vanguard", sprint: "S3", members: 7, completion: 78, streak: 3, trend: "+12%", isYou: true },
  { rank: 3, name: "Silent Forge", sprint: "S3", members: 6, completion: 76, streak: 2, trend: "+2%", isTop: false },
  { rank: 4, name: "Ember Protocol", sprint: "S3", members: 8, completion: 74, streak: 1, trend: "-3%", isTop: false },
  { rank: 5, name: "Night Architects", sprint: "S3", members: 7, completion: 71, streak: 3, trend: "+8%", isTop: false },
  { rank: 6, name: "Steady Currents", sprint: "S2", members: 6, completion: 69, streak: 2, trend: "+1%", isTop: false },
  { rank: 7, name: "Zenith Builders", sprint: "S3", members: 7, completion: 66, streak: 1, trend: "-5%", isTop: false },
  { rank: 8, name: "Dawn Patrol", sprint: "S3", members: 8, completion: 64, streak: 1, trend: "+3%", isTop: false },
  { rank: 9, name: "Grit Assembly", sprint: "S2", members: 6, completion: 61, streak: 2, trend: "-1%", isTop: false },
  { rank: 10, name: "Quiet Storm", sprint: "S1", members: 7, completion: 58, streak: 1, trend: "+6%", isTop: false },
];

const TOP_OPERATORS = [
  { rank: 1, name: "Sara R.", squad: "Alpha Vanguard", score: 94, goals: "18/18", sprints: 3 },
  { rank: 2, name: "Liam K.", squad: "Iron Circuit", score: 92, goals: "17/18", sprints: 4 },
  { rank: 3, name: "Noura A.", squad: "Iron Circuit", score: 91, goals: "16/18", sprints: 3 },
  { rank: 4, name: "Amir M.", squad: "Alpha Vanguard", score: 84, goals: "14/18", sprints: 3, isYou: true },
  { rank: 5, name: "Priya K.", squad: "Alpha Vanguard", score: 82, goals: "15/18", sprints: 2 },
  { rank: 6, name: "Dante F.", squad: "Silent Forge", score: 81, goals: "14/18", sprints: 3 },
  { rank: 7, name: "Fatima N.", squad: "Alpha Vanguard", score: 79, goals: "13/18", sprints: 2 },
  { rank: 8, name: "Yuki T.", squad: "Night Architects", score: 78, goals: "15/18", sprints: 3 },
  { rank: 9, name: "Marcus H.", squad: "Alpha Vanguard", score: 76, goals: "12/18", sprints: 1 },
  { rank: 10, name: "Elena V.", squad: "Ember Protocol", score: 75, goals: "14/18", sprints: 2 },
  { rank: 11, name: "Omar T.", squad: "Alpha Vanguard", score: 73, goals: "13/18", sprints: 2 },
  { rank: 12, name: "Asha M.", squad: "Steady Currents", score: 72, goals: "12/18", sprints: 3 },
  { rank: 13, name: "James L.", squad: "Alpha Vanguard", score: 68, goals: "10/18", sprints: 1 },
  { rank: 14, name: "Kai N.", squad: "Dawn Patrol", score: 67, goals: "11/18", sprints: 1 },
  { rank: 15, name: "Zara H.", squad: "Zenith Builders", score: 65, goals: "10/18", sprints: 2 },
];

export function LeaderboardPage() {
  const { navigateTo } = useNavigation();
  const [tab, setTab] = useState<Tab>("squads");

  return (
    <PageWrapper page="leaderboard">
      <h1 className="text-[1.75rem] font-bold leading-[1.2] mb-1">Leaderboard</h1>
      <p className="text-[15px] leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
        How squads and operators are performing across Division Alpha.
      </p>

      {/* Tabs */}
      <div
        className="flex mb-6"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        {(["squads", "operators"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="py-2.5 px-5 text-[13px] font-medium cursor-pointer transition-colors duration-150 relative bg-transparent border-none capitalize"
            style={{
              color: tab === t ? "var(--text)" : "var(--text-muted)",
              fontFamily: "inherit",
            }}
          >
            {t}
            {tab === t && (
              <span
                className="absolute bottom-[-1px] left-5 right-5 h-[1.5px]"
                style={{ background: "var(--accent)" }}
              />
            )}
          </button>
        ))}
      </div>

      {tab === "squads" ? (
        <>
          {/* Your squad highlight */}
          <div
            className="p-5 mb-6"
            style={{
              background: "var(--accent-surface)",
              border: "1px solid var(--accent)",
              borderRadius: "4px",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div
                  className="text-[10px] uppercase tracking-[0.08em] mb-1"
                  style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
                >
                  Your Squad &middot; Rank #2
                </div>
                <div className="text-lg font-semibold">Alpha Vanguard</div>
              </div>
              <div className="text-right">
                <div
                  className="text-2xl font-medium"
                  style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
                >
                  78%
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.06em]"
                  style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
                >
                  Completion
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              {[
                { label: "Members", val: "7" },
                { label: "Streak", val: "3 sprints" },
                { label: "Trend", val: "+12%" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] uppercase tracking-[0.06em]"
                    style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
                  >
                    {s.label}:
                  </span>
                  <span
                    className="text-[11px] font-medium"
                    style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-secondary)" }}
                  >
                    {s.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Squad table header */}
          <div
            className="flex items-center gap-3 py-2 px-3 mb-1"
          >
            <span
              className="w-8 text-[10px] uppercase tracking-[0.06em]"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              #
            </span>
            <span
              className="flex-1 text-[10px] uppercase tracking-[0.06em]"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Squad
            </span>
            <span
              className="w-16 text-right text-[10px] uppercase tracking-[0.06em]"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Rate
            </span>
            <span
              className="w-14 text-right text-[10px] uppercase tracking-[0.06em]"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Trend
            </span>
          </div>

          {/* Squad rows */}
          {SQUADS.map((s) => (
            <div
              key={s.rank}
              className="flex items-center gap-3 py-3 px-3 cursor-pointer transition-all duration-150 hover:shadow-sm"
              style={{
                borderBottom: "1px solid var(--border-subtle)",
                background: s.isYou ? "var(--accent-surface)" : "transparent",
                borderRadius: s.isYou ? "4px" : "0",
              }}
              onClick={() => s.isYou && navigateTo("squad")}
            >
              <span
                className="w-8 text-[13px] font-medium"
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  color: s.rank <= 3 ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {s.rank}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium flex items-center gap-2">
                  {s.name}
                  {s.isYou && (
                    <span
                      className="text-[9px] uppercase tracking-[0.06em] py-[2px] px-1.5"
                      style={{
                        fontFamily: "var(--font-dm-mono), monospace",
                        background: "var(--accent)",
                        color: "var(--accent-text)",
                        borderRadius: "2px",
                      }}
                    >
                      You
                    </span>
                  )}
                </div>
                <div
                  className="text-[10px]"
                  style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
                >
                  {s.sprint} &middot; {s.members} ops &middot; {s.streak} sprint{s.streak > 1 ? "s" : ""}
                </div>
              </div>
              <div className="w-16 text-right">
                <div
                  className="text-sm font-medium"
                  style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                >
                  {s.completion}%
                </div>
                <div
                  className="h-[3px] mt-1 overflow-hidden"
                  style={{ background: "var(--surface)", borderRadius: "2px" }}
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${s.completion}%`,
                      background: s.completion >= 75 ? "var(--green)" : s.completion >= 60 ? "var(--yellow)" : "var(--red)",
                      borderRadius: "2px",
                    }}
                  />
                </div>
              </div>
              <span
                className="w-14 text-right text-[11px] font-medium"
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  color: s.trend.startsWith("+") ? "var(--green)" : "var(--red)",
                }}
              >
                {s.trend}
              </span>
            </div>
          ))}
        </>
      ) : (
        <>
          {/* Operator table header */}
          <div className="flex items-center gap-3 py-2 px-3 mb-1">
            <span
              className="w-8 text-[10px] uppercase tracking-[0.06em]"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              #
            </span>
            <span
              className="flex-1 text-[10px] uppercase tracking-[0.06em]"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Operator
            </span>
            <span
              className="w-14 text-right text-[10px] uppercase tracking-[0.06em]"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Score
            </span>
            <span
              className="w-14 text-right text-[10px] uppercase tracking-[0.06em]"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Goals
            </span>
          </div>

          {/* Operator rows */}
          {TOP_OPERATORS.map((op) => (
            <div
              key={op.rank}
              className="flex items-center gap-3 py-3 px-3 transition-all duration-150"
              style={{
                borderBottom: "1px solid var(--border-subtle)",
                background: op.isYou ? "var(--accent-surface)" : "transparent",
                borderRadius: op.isYou ? "4px" : "0",
              }}
            >
              <span
                className="w-8 text-[13px] font-medium"
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  color: op.rank <= 3 ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {op.rank}
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0"
                style={{ background: "var(--surface-hover)", color: "var(--text-secondary)" }}
              >
                {op.name.split(" ").map((w) => w[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium flex items-center gap-2">
                  {op.name}
                  {op.isYou && (
                    <span
                      className="text-[9px] uppercase tracking-[0.06em] py-[2px] px-1.5"
                      style={{
                        fontFamily: "var(--font-dm-mono), monospace",
                        background: "var(--accent)",
                        color: "var(--accent-text)",
                        borderRadius: "2px",
                      }}
                    >
                      You
                    </span>
                  )}
                </div>
                <div
                  className="text-[10px]"
                  style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
                >
                  {op.squad} &middot; {op.sprints} sprint{op.sprints > 1 ? "s" : ""}
                </div>
              </div>
              <div className="w-14 text-right">
                <span
                  className="text-sm font-medium"
                  style={{
                    fontFamily: "var(--font-dm-mono), monospace",
                    color: op.score >= 85 ? "var(--accent)" : "var(--text)",
                  }}
                >
                  {op.score}
                </span>
              </div>
              <span
                className="w-14 text-right text-[11px]"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-secondary)" }}
              >
                {op.goals}
              </span>
            </div>
          ))}
        </>
      )}

      {/* Season summary */}
      <div
        className="mt-8 py-4 px-5"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "4px",
        }}
      >
        <div className="grid grid-cols-3 gap-4">
          {[
            { val: "10", label: "Active squads" },
            { val: "71", label: "Operators" },
            { val: "72%", label: "Avg completion" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="text-lg font-medium leading-none mb-1"
                style={{ fontFamily: "var(--font-dm-mono), monospace" }}
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
      </div>
    </PageWrapper>
  );
}
