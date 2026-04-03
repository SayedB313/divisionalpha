"use client";

import { useMemo, useState } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { useSquadState } from "@/lib/hooks/use-squad-state";
import { PageWrapper } from "../page-wrapper";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function summarizeSignals(signals: any[] = []) {
  const green = signals.filter((signal) => signal.signal === "green").length;
  const yellow = signals.filter((signal) => signal.signal === "yellow").length;
  const red = signals.filter((signal) => signal.signal === "red").length;
  if (red > 0) return `${green} green · ${yellow} yellow · ${red} red`;
  if (yellow > 0) return `${green} green · ${yellow} yellow`;
  return `${green} green`;
}

export function SquadPage() {
  const { navigateTo } = useNavigation();
  const {
    isLocked,
    tier,
    squad,
    memberCount,
    otherMembers,
    checkedInCount,
    squadDamage,
    squadDeclarations,
    squadCheckins,
    messages,
    sendMessage,
    isLoading,
  } = useSquadState();
  const [draft, setDraft] = useState("");

  const activity = useMemo(() => {
    const declarationActivity = squadDeclarations.map((entry: any) => ({
      id: `declaration-${entry.id}`,
      type: "declaration",
      initials: entry.profile?.initials || "DA",
      name: entry.profile?.display_name || "Operator",
      content: Array.isArray(entry.goals) ? entry.goals.map((goal: any) => goal.text).join(" · ") : "Declared the week",
      at: entry.submitted_at,
    }));

    const checkinActivity = squadCheckins.map((entry: any) => ({
      id: `checkin-${entry.id}`,
      type: "signal",
      initials: entry.profile?.initials || "DA",
      name: entry.profile?.display_name || "Operator",
      content: summarizeSignals(entry.signals),
      at: entry.submitted_at,
    }));

    return [...declarationActivity, ...checkinActivity].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 6);
  }, [squadDeclarations, squadCheckins]);

  if (isLocked) {
    return (
      <PageWrapper page="squad" layout="two_column">
        <div className="mb-8">
          <div
            className="text-[10px] uppercase tracking-[0.1em] mb-2"
            style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
          >
            Squad
          </div>
          <h1 className="text-[1.9rem] font-bold leading-[1.12] mb-2">The room is visible before it is yours.</h1>
          <p className="text-[15px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
            RECRUIT proves the individual first. At 30+, QUALIFIED unlocks the squad, shared pressure, roster visibility,
            and the kind of consequence that only works when everyone earned their way in.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.9fr)] xl:items-start">
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[
                {
                  title: "Roster",
                  body: "4-5 proven operators matched by timezone, goals, temperament, and the standard they can hold together.",
                },
                {
                  title: "Squad damage",
                  body: "The room starts to feel misses collectively. Your line affects more than your own score once the squad is live.",
                },
                {
                  title: "Live thread",
                  body: "Chat, session prep, facilitator nudges, and earned visibility all happen inside one shared space.",
                },
                {
                  title: "Session pressure",
                  body: "Weekly sessions matter because the people in the room have already shown enough proof to make the time expensive.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="py-5 px-5"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
                >
                  <div className="text-[1rem] font-semibold mb-2">{card.title}</div>
                  <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div
              className="p-6"
              style={{ background: "var(--accent-surface)", border: "1px solid var(--accent)", borderRadius: "4px" }}
            >
              <div
                className="text-[10px] uppercase tracking-[0.08em] mb-2"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
              >
                Unlock rule
              </div>
              <h2 className="text-[1.2rem] font-semibold mb-2">Cross 30+ to earn QUALIFIED.</h2>
              <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                Your score is {tier.score}. Keep answering the Boss, protect the streak, and finish the sprint with
                enough proof that a stronger room makes sense.
              </p>
            </div>

            <div
              className="p-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
            >
              <div
                className="text-[10px] uppercase tracking-[0.08em] mb-2"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
              >
                What unlocks with it
              </div>
              <div className="space-y-3">
                {[
                  "Shared roster visibility",
                  "Live room thread and facilitator prompts",
                  "Squad damage and social consequence",
                  "Leaderboard relevance and earned status",
                ].map((item) => (
                  <div
                    key={item}
                    className="py-3 px-4"
                    style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px", color: "var(--text-secondary)" }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigateTo("proof")}
                className="py-3 px-5 text-sm font-medium cursor-pointer transition-all duration-150 hover:-translate-y-px"
                style={{ background: "var(--accent)", border: "none", color: "var(--accent-text)", borderRadius: "2px", fontFamily: "inherit" }}
              >
                See the QUALIFIED path
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
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper page="squad" layout="three_column">
      <div className="mb-8">
        <div
          className="text-[10px] uppercase tracking-[0.1em] mb-2"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
        >
          Squad
        </div>
        <h1 className="text-[1.9rem] font-bold leading-[1.12] mb-2">{squad?.name || "Your earned room"}</h1>
        <p className="text-[15px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
          QUALIFIED adds shared consequence to the same system. The Boss still runs the loop, but now the room feels your
          line with you.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)_320px] xl:items-start">
        <div className="space-y-5">
          <section
            className="p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <div
                  className="text-[10px] uppercase tracking-[0.08em] mb-2"
                  style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
                >
                  Roster
                </div>
                <h2 className="text-[1.2rem] font-semibold">The operators in your room</h2>
              </div>
              <button
                onClick={() => navigateTo("proof")}
                className="text-[12px] bg-transparent border-none cursor-pointer"
                style={{ color: "var(--accent)", fontFamily: "inherit" }}
              >
                Open proof &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {otherMembers.length > 0 ? (
                otherMembers.map((member) => (
                  <div
                    key={member.id}
                    className="py-4 px-4 flex items-center gap-3"
                    style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-semibold"
                      style={{ background: "var(--surface-hover)", color: "var(--text-secondary)" }}
                    >
                      {member.profile.initials}
                    </div>
                    <div>
                      <div className="text-[14px] font-medium">{member.profile.display_name}</div>
                      <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {member.role}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
                  Roster will populate once squad membership is fully loaded.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section
            className="p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.08em] mb-2"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Live thread
            </div>
            <h2 className="text-[1.2rem] font-semibold mb-4">Talk inside the room</h2>

            <div className="space-y-2 mb-4 max-h-[420px] overflow-y-auto">
              {messages.length > 0 ? (
                messages.slice(-12).map((message: any) => (
                  <div
                    key={message.id}
                    className="py-3 px-4"
                    style={{
                      background: message.message_type === "user" ? "var(--bg-page)" : "var(--accent-surface)",
                      border: `1px solid ${message.message_type === "user" ? "var(--border-subtle)" : "var(--accent)"}`,
                      borderRadius: "4px",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[13px] font-medium">
                        {message.profile?.display_name || (message.message_type === "facilitator" ? "Boss" : "System")}
                      </span>
                      <span className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                        {message.message_type} · {timeAgo(message.created_at)}
                      </span>
                    </div>
                    <div className="text-[13px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                      {message.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
                  The thread is quiet for now. That will change as the room starts using it.
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="flex-1 py-3 px-4 text-[14px] outline-none transition-colors duration-150"
                style={{
                  background: "var(--bg-page)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text)",
                  borderRadius: "4px",
                  fontFamily: "inherit",
                }}
                placeholder="Share what matters with the room..."
                onFocus={(event) => (event.target.style.borderColor = "var(--accent)")}
                onBlur={(event) => (event.target.style.borderColor = "var(--border-subtle)")}
              />
              <button
                onClick={() => {
                  const content = draft.trim();
                  if (!content) return;
                  sendMessage.mutate(content, { onSuccess: () => setDraft("") });
                }}
                disabled={sendMessage.isPending || !draft.trim()}
                className="py-3 px-5 text-sm font-medium cursor-pointer transition-all duration-150"
                style={{
                  background: "var(--accent)",
                  border: "none",
                  color: "var(--accent-text)",
                  borderRadius: "2px",
                  fontFamily: "inherit",
                  opacity: sendMessage.isPending || !draft.trim() ? 0.6 : 1,
                }}
              >
                Send
              </button>
            </div>

            {isLoading && (
              <div className="mt-3 text-[12px]" style={{ color: "var(--text-muted)" }}>
                Loading squad thread...
              </div>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: "Operators", value: String(memberCount) },
              { label: "Checked in", value: String(checkedInCount) },
              { label: "Damage", value: squadDamage !== null ? `${Math.round(squadDamage)}%` : "—" },
            ].map((item) => (
              <div
                key={item.label}
                className="py-4 px-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
              >
                <div
                  className="text-[10px] uppercase tracking-[0.08em] mb-1"
                  style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
                >
                  {item.label}
                </div>
                <div className="text-[1.1rem] font-medium" style={{ fontFamily: "var(--font-dm-mono), monospace" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <section
            className="p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.08em] mb-2"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Activity
            </div>
            <h2 className="text-[1.2rem] font-semibold mb-4">What the room has shown recently</h2>
            <div className="space-y-2">
              {activity.length > 0 ? (
                activity.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 px-4"
                    style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold"
                        style={{ background: "var(--surface-hover)", color: "var(--text-secondary)" }}
                      >
                        {item.initials}
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium">{item.name}</div>
                        <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                          {item.type} · {timeAgo(item.at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-[13px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                      {item.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
                  Activity will show up here as declarations and signals land.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
