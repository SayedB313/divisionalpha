"use client";

import { useNavigation } from "@/lib/navigation-context";
import { useApp } from "@/lib/app-context";
import { PageWrapper } from "../page-wrapper";

const ACTIVITY = [
  {
    avatar: "SR", name: "Sara R.", type: "check-in", time: "2h ago",
    content: "\u201COnboarding flow is live. Got 3 beta signups in the first hour. Feeling good about this one.\u201D",
    signals: ["green", "green", "green"],
  },
  {
    avatar: "FN", name: "Fatima N.", type: "check-in", time: "3h ago",
    content: "Solid on product work, behind on outreach. Shifting schedule to front-load calls tomorrow.",
    signals: ["green", "green", "yellow"],
  },
  {
    avatar: "MH", name: "Marcus H.", type: "check-in", time: "5h ago",
    content: "\u201CStuck on the Stripe webhook integration. Has anyone here dealt with recurring subscription events? Could use a 15-min call.\u201D",
    signals: ["green", "yellow", "yellow"],
  },
  {
    avatar: "OT", name: "Omar T.", type: "declaration", time: "1d ago",
    content: "This week: finalize pitch deck, book 5 investor meetings, close partnership agreement with co-working space.",
    signals: [],
  },
  {
    avatar: "PK", name: "Priya K.", type: "check-in", time: "1d ago",
    content: "All on track. Quiet week, heads down executing.",
    signals: ["green", "green"],
  },
  {
    avatar: "JL", name: "James L.", type: "", time: "No check-in",
    content: "Last active 4 days ago.",
    signals: [],
    ghost: true,
  },
];

export function SquadPage() {
  const { navigateTo } = useNavigation();
  const { squad, sprint } = useApp();

  const squadName = squad?.name || "Alpha Vanguard";
  const memberCount = squad?.member_count ?? 7;
  const sprintNumber = sprint?.number ?? 3;
  const currentWeek = sprint?.current_week ?? 4;
  const sprintWeeks = sprint?.duration_weeks ?? 6;

  return (
    <PageWrapper page="squad">
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-0.5">{squadName}</h1>
        <div
          className="text-[11px] tracking-[0.04em]"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          {memberCount} operators &middot; Sprint {sprintNumber} &middot; Week {currentWeek} of {sprintWeeks}
        </div>
      </div>

      {/* Health bar */}
      <div
        className="flex gap-4 py-3.5 px-5 mb-7"
        style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
      >
        {[
          { dot: "var(--green)", text: "5 checked in" },
          { dot: "var(--yellow)", text: "1 pending" },
          { dot: "var(--red)", text: "1 quiet" },
        ].map((h) => (
          <div key={h.text} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: h.dot }} />
            <span
              className="text-[11px]"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-secondary)" }}
            >
              {h.text}
            </span>
          </div>
        ))}
      </div>

      {/* Squad Chat CTA */}
      <button
        onClick={() => navigateTo("squad-chat")}
        className="w-full py-3 px-5 mb-7 flex items-center justify-between cursor-pointer transition-all duration-150 hover:shadow-sm"
        style={{
          background: "var(--accent-surface)",
          border: "1px solid var(--accent)",
          borderRadius: "4px",
          fontFamily: "inherit",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">💬</span>
          <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            Squad Chat
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
          >
            3
          </span>
        </div>
        <span style={{ color: "var(--accent)" }}>&rarr;</span>
      </button>

      <div
        className="text-[11px] uppercase tracking-[0.1em] mb-3"
        style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
      >
        Recent activity
      </div>

      {/* Activity feed */}
      {ACTIVITY.map((a, i) => (
        <div
          key={i}
          className="py-4"
          style={{
            borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--border-subtle)" : "none",
            opacity: a.ghost ? 0.5 : 1,
          }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0"
              style={{ background: "var(--surface-hover)", color: "var(--text-secondary)" }}
            >
              {a.avatar}
            </div>
            <span className="text-[13px] font-medium">{a.name}</span>
            {a.type && (
              <span
                className="text-[10px] uppercase tracking-[0.06em] ml-1"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
              >
                {a.type}
              </span>
            )}
            <span
              className="text-[10px] ml-auto"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              {a.time}
            </span>
          </div>
          <div className="ml-[38px] text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {a.content}
          </div>
          {a.signals.length > 0 && (
            <div className="flex gap-1 ml-[38px] mt-1.5">
              {a.signals.map((s, si) => (
                <span
                  key={si}
                  className="text-[10px] font-medium tracking-[0.02em] py-[3px] px-2"
                  style={{
                    fontFamily: "var(--font-dm-mono), monospace",
                    background: `var(--${s}-soft)`,
                    color: `var(--${s})`,
                    borderRadius: "2px",
                  }}
                >
                  {s.charAt(0).toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Facilitator */}
      <div
        className="mt-6 py-4 px-5"
        style={{
          background: "var(--accent-surface)",
          borderLeft: "2px solid var(--accent)",
          borderRadius: "0 4px 4px 0",
        }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.1em] mb-1"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
        >
          Facilitator
        </div>
        <div className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          This week, Alpha Vanguard committed to 22 goals across 7 members. Marcus flagged a Stripe blocker
          &mdash; Sara, you integrated Stripe last month. Can you connect? James, we&apos;re waiting on your check-in.
        </div>
      </div>
    </PageWrapper>
  );
}
