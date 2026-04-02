"use client";

import { useEffect, useMemo, useState } from "react";
import { useJourneyState } from "@/lib/hooks/use-journey-state";
import type { CheckinSignal } from "@/lib/hooks/use-checkins";
import { PageWrapper } from "../page-wrapper";

type ReflectionDraft = {
  wins: string;
  misses: string;
  learnings: string;
  carry_forward: string;
  goals_hit: string;
  goals_total: string;
};

const SIGNAL_OPTIONS: Array<CheckinSignal["signal"]> = ["green", "yellow", "red"];

function getSignalColors(signal: CheckinSignal["signal"]) {
  if (signal === "green") return { text: "var(--green)", bg: "var(--green-soft)" };
  if (signal === "yellow") return { text: "var(--yellow)", bg: "var(--yellow-soft)" };
  return { text: "var(--red)", bg: "var(--red-soft)" };
}

export function JourneyPage() {
  const {
    sprint,
    day,
    progress,
    phase,
    milestones,
    declaration,
    checkin,
    reflection,
    submitDeclaration,
    submitCheckin,
    submitReflection,
  } = useJourneyState();

  const [goals, setGoals] = useState(["", "", ""]);
  const [blockers, setBlockers] = useState("");
  const [helpRequest, setHelpRequest] = useState("");
  const [signals, setSignals] = useState<CheckinSignal[]>([]);
  const [reflectionDraft, setReflectionDraft] = useState<ReflectionDraft>({
    wins: "",
    misses: "",
    learnings: "",
    carry_forward: "",
    goals_hit: "",
    goals_total: "",
  });

  useEffect(() => {
    const declarationGoals = Array.isArray(declaration?.goals)
      ? (declaration.goals as Array<{ text?: string }>).map((goal) => goal.text?.trim() || "").filter(Boolean)
      : [];

    if (declarationGoals.length > 0) {
      setGoals([...declarationGoals, "", ""].slice(0, 3));
    }

    setBlockers(declaration?.blockers || "");
    setHelpRequest(declaration?.help_request || "");
  }, [declaration]);

  useEffect(() => {
    if (!Array.isArray(checkin?.signals)) return;
    setSignals(
      (checkin.signals as CheckinSignal[]).map((signal) => ({
        goal_index: signal.goal_index,
        signal: signal.signal,
        note: signal.note || "",
      })),
    );
  }, [checkin]);

  useEffect(() => {
    if (!reflection) return;
    setReflectionDraft({
      wins: reflection.wins || "",
      misses: reflection.misses || "",
      learnings: reflection.learnings || "",
      carry_forward: reflection.carry_forward || "",
      goals_hit: reflection.goals_hit ? String(reflection.goals_hit) : "",
      goals_total: reflection.goals_total ? String(reflection.goals_total) : "",
    });
  }, [reflection]);

  const activeGoals = useMemo(() => goals.map((goal) => goal.trim()).filter(Boolean), [goals]);

  const checkinRows = useMemo(() => {
    return activeGoals.map((goal, index) => {
      const existing = signals.find((signal) => signal.goal_index === index);
      return {
        goal,
        goal_index: index,
        signal: existing?.signal || null,
        note: existing?.note || "",
      };
    });
  }, [activeGoals, signals]);

  const updateSignal = (goalIndex: number, nextSignal: CheckinSignal["signal"]) => {
    setSignals((current) => {
      const existing = current.find((item) => item.goal_index === goalIndex);
      if (existing) {
        return current.map((item) => item.goal_index === goalIndex ? { ...item, signal: nextSignal } : item);
      }

      return [...current, { goal_index: goalIndex, signal: nextSignal, note: "" }];
    });
  };

  const updateSignalNote = (goalIndex: number, note: string) => {
    setSignals((current) => {
      const existing = current.find((item) => item.goal_index === goalIndex);
      if (existing) {
        return current.map((item) => item.goal_index === goalIndex ? { ...item, note } : item);
      }

      return [...current, { goal_index: goalIndex, signal: "yellow", note }];
    });
  };

  const mono = { fontFamily: "var(--font-dm-mono), monospace" };
  const inputStyle = {
    background: "var(--bg-page)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text)",
    borderRadius: "4px",
    fontFamily: "inherit",
  };

  return (
    <PageWrapper page="journey" layout="two_column">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.1em] mb-2" style={{ ...mono, color: "var(--accent)" }}>
          Journey
        </div>
        <h1 className="text-[1.9rem] font-bold leading-[1.12] mb-2">One 40-day line, told honestly.</h1>
        <p className="text-[15px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
          Declaration, signal, reflection, and ceremony now live inside one narrative. The Boss does not forget what
          this sprint is trying to prove.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.9fr)] xl:items-start">
        <div className="space-y-5">
          <section
            className="p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] mb-2" style={{ ...mono, color: "var(--accent)" }}>
                  Monday ritual
                </div>
                <h2 className="text-[1.2rem] font-semibold mb-1">Declaration</h2>
                <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                  Give the Boss 1-3 real outcomes for the week, plus the blocker most likely to break your word.
                </p>
              </div>
              {declaration && (
                <div className="text-[10px] uppercase tracking-[0.08em]" style={{ ...mono, color: "var(--green)" }}>
                  Submitted
                </div>
              )}
            </div>

            <div className="space-y-3 mb-4">
              {goals.map((goal, index) => (
                <input
                  key={index}
                  value={goal}
                  onChange={(event) => {
                    const next = [...goals];
                    next[index] = event.target.value;
                    setGoals(next);
                  }}
                  className="w-full py-3.5 px-4 text-[15px] outline-none transition-colors duration-150"
                  style={inputStyle}
                  placeholder={`Goal ${index + 1}`}
                  onFocus={(event) => (event.target.style.borderColor = "var(--accent)")}
                  onBlur={(event) => (event.target.style.borderColor = "var(--border-subtle)")}
                />
              ))}
              <textarea
                value={blockers}
                onChange={(event) => setBlockers(event.target.value)}
                className="w-full min-h-[88px] py-3.5 px-4 text-[15px] leading-relaxed resize-y outline-none transition-colors duration-150"
                style={inputStyle}
                placeholder="Main blocker the Boss should keep in view"
                onFocus={(event) => (event.target.style.borderColor = "var(--accent)")}
                onBlur={(event) => (event.target.style.borderColor = "var(--border-subtle)")}
              />
              <textarea
                value={helpRequest}
                onChange={(event) => setHelpRequest(event.target.value)}
                className="w-full min-h-[80px] py-3.5 px-4 text-[15px] leading-relaxed resize-y outline-none transition-colors duration-150"
                style={inputStyle}
                placeholder="Optional: what pressure, context, or help would move this week faster?"
                onFocus={(event) => (event.target.style.borderColor = "var(--accent)")}
                onBlur={(event) => (event.target.style.borderColor = "var(--border-subtle)")}
              />
            </div>

            <button
              onClick={() => {
                const payloadGoals = activeGoals.map((goal, index) => ({ text: goal, order: index }));
                if (payloadGoals.length === 0) return;
                submitDeclaration.mutate({
                  goals: payloadGoals,
                  blockers,
                  help_request: helpRequest,
                });
              }}
              disabled={submitDeclaration.isPending || activeGoals.length === 0}
              className="py-3 px-5 text-sm font-medium cursor-pointer transition-all duration-150 hover:-translate-y-px"
              style={{
                background: "var(--accent)",
                border: "none",
                color: "var(--accent-text)",
                borderRadius: "2px",
                fontFamily: "inherit",
                opacity: submitDeclaration.isPending || activeGoals.length === 0 ? 0.6 : 1,
              }}
            >
              {submitDeclaration.isPending ? "Saving declaration..." : declaration ? "Update declaration" : "Save declaration"}
            </button>
          </section>

          <section
            className="p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] mb-2" style={{ ...mono, color: "var(--accent)" }}>
                  Wednesday ritual
                </div>
                <h2 className="text-[1.2rem] font-semibold mb-1">Signal</h2>
                <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                  Mid-week honesty matters more than confidence. Mark each line green, yellow, or red.
                </p>
              </div>
              {checkin && (
                <div className="text-[10px] uppercase tracking-[0.08em]" style={{ ...mono, color: "var(--green)" }}>
                  Submitted
                </div>
              )}
            </div>

            {checkinRows.length === 0 ? (
              <div
                className="py-4 px-4 text-[14px] leading-[1.65]"
                style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px", color: "var(--text-secondary)" }}
              >
                Start with your declaration. The signal follows the commitments you actually made.
              </div>
            ) : (
              <div className="space-y-4 mb-4">
                {checkinRows.map((row) => (
                  <div
                    key={row.goal_index}
                    className="py-4 px-4"
                    style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
                  >
                    <div className="text-[14px] font-medium mb-3">{row.goal}</div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {SIGNAL_OPTIONS.map((option) => {
                        const active = row.signal === option;
                        const colors = getSignalColors(option);
                        return (
                          <button
                            key={option}
                            onClick={() => updateSignal(row.goal_index, option)}
                            className="py-2.5 px-4 text-[12px] uppercase tracking-[0.06em] cursor-pointer transition-all duration-150"
                            style={{
                              ...mono,
                              background: active ? colors.bg : "transparent",
                              border: `1px solid ${active ? colors.text : "var(--border)"}`,
                              color: active ? colors.text : "var(--text-muted)",
                              borderRadius: "2px",
                            }}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      value={row.note}
                      onChange={(event) => updateSignalNote(row.goal_index, event.target.value)}
                      className="w-full py-3 px-4 text-[14px] outline-none transition-colors duration-150"
                      style={inputStyle}
                      placeholder="Optional context for yellow or red"
                      onFocus={(event) => (event.target.style.borderColor = "var(--accent)")}
                      onBlur={(event) => (event.target.style.borderColor = "var(--border-subtle)")}
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                const payload = checkinRows
                  .filter((row) => row.signal)
                  .map((row) => ({
                    goal_index: row.goal_index,
                    signal: row.signal as CheckinSignal["signal"],
                    note: row.note || null,
                  }));

                if (payload.length === 0) return;
                submitCheckin.mutate(payload);
              }}
              disabled={submitCheckin.isPending || checkinRows.length === 0 || checkinRows.every((row) => !row.signal)}
              className="py-3 px-5 text-sm font-medium cursor-pointer transition-all duration-150 hover:-translate-y-px"
              style={{
                background: "var(--accent)",
                border: "none",
                color: "var(--accent-text)",
                borderRadius: "2px",
                fontFamily: "inherit",
                opacity: submitCheckin.isPending || checkinRows.length === 0 || checkinRows.every((row) => !row.signal) ? 0.6 : 1,
              }}
            >
              {submitCheckin.isPending ? "Saving signal..." : checkin ? "Update signal" : "Save signal"}
            </button>
          </section>

          <section
            className="p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] mb-2" style={{ ...mono, color: "var(--accent)" }}>
                  Friday ritual
                </div>
                <h2 className="text-[1.2rem] font-semibold mb-1">Reflection</h2>
                <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                  Close the week with proof, misses, and the line you are carrying forward.
                </p>
              </div>
              {reflection && (
                <div className="text-[10px] uppercase tracking-[0.08em]" style={{ ...mono, color: "var(--green)" }}>
                  Submitted
                </div>
              )}
            </div>

            <div className="space-y-3 mb-4">
              {[
                { key: "wins", label: "What landed" },
                { key: "misses", label: "What slipped" },
                { key: "learnings", label: "What the week taught you" },
                { key: "carry_forward", label: "What you are carrying forward" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    {field.label}
                  </label>
                  <textarea
                    value={reflectionDraft[field.key as keyof ReflectionDraft] as string}
                    onChange={(event) => setReflectionDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                    className="w-full min-h-[88px] py-3.5 px-4 text-[15px] leading-relaxed resize-y outline-none transition-colors duration-150"
                    style={inputStyle}
                    onFocus={(event) => (event.target.style.borderColor = "var(--accent)")}
                    onBlur={(event) => (event.target.style.borderColor = "var(--border-subtle)")}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Goals hit
                </label>
                <input
                  value={reflectionDraft.goals_hit}
                  onChange={(event) => setReflectionDraft((current) => ({ ...current, goals_hit: event.target.value }))}
                  className="w-full py-3 px-4 text-[15px] outline-none transition-colors duration-150"
                  style={inputStyle}
                  inputMode="numeric"
                  onFocus={(event) => (event.target.style.borderColor = "var(--accent)")}
                  onBlur={(event) => (event.target.style.borderColor = "var(--border-subtle)")}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Goals total
                </label>
                <input
                  value={reflectionDraft.goals_total}
                  onChange={(event) => setReflectionDraft((current) => ({ ...current, goals_total: event.target.value }))}
                  className="w-full py-3 px-4 text-[15px] outline-none transition-colors duration-150"
                  style={inputStyle}
                  inputMode="numeric"
                  onFocus={(event) => (event.target.style.borderColor = "var(--accent)")}
                  onBlur={(event) => (event.target.style.borderColor = "var(--border-subtle)")}
                />
              </div>
            </div>

            <button
              onClick={() => {
                submitReflection.mutate({
                  wins: reflectionDraft.wins,
                  misses: reflectionDraft.misses,
                  learnings: reflectionDraft.learnings,
                  carry_forward: reflectionDraft.carry_forward,
                  goals_hit: Number(reflectionDraft.goals_hit || 0),
                  goals_total: Number(reflectionDraft.goals_total || activeGoals.length || 0),
                });
              }}
              disabled={submitReflection.isPending}
              className="py-3 px-5 text-sm font-medium cursor-pointer transition-all duration-150 hover:-translate-y-px"
              style={{
                background: "var(--accent)",
                border: "none",
                color: "var(--accent-text)",
                borderRadius: "2px",
                fontFamily: "inherit",
                opacity: submitReflection.isPending ? 0.6 : 1,
              }}
            >
              {submitReflection.isPending ? "Saving reflection..." : reflection ? "Update reflection" : "Save reflection"}
            </button>
          </section>
        </div>

        <div className="space-y-5 xl:sticky xl:top-8">
          <div
            className="p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-[1.25rem] font-semibold mb-1">{day > 0 ? `Day ${day} of 40` : "Sprint not live yet"}</div>
                <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                  {phase.label}. {sprint ? `Sprint ${sprint.number} · Week ${sprint.current_week} of ${sprint.duration_weeks}.` : "The line appears once the sprint starts."}
                </p>
              </div>
              <div
                className="py-3 px-4 min-w-[148px]"
                style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
              >
                <div className="text-[10px] uppercase tracking-[0.08em] mb-1" style={{ ...mono, color: "var(--text-muted)" }}>
                  Progress
                </div>
                <div className="text-[1.1rem] font-medium" style={{ ...mono, color: "var(--text)" }}>
                  {progress}%
                </div>
              </div>
            </div>

            <div className="w-full h-[6px] mb-5" style={{ background: "var(--bg-page)", borderRadius: "999px" }}>
              <div className="h-full" style={{ width: `${progress}%`, background: "var(--accent)", borderRadius: "999px" }} />
            </div>

            <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
              {phase.body}
            </p>
          </div>

          <div
            className="p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div className="text-[10px] uppercase tracking-[0.08em] mb-2" style={{ ...mono, color: "var(--text-muted)" }}>
              Milestones
            </div>
            <h2 className="text-[1.2rem] font-semibold mb-4">Where the sprint bends</h2>
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.day}
                  className="py-4 px-4"
                  style={{
                    background: milestone.status === "current" ? "var(--accent-surface)" : "var(--bg-page)",
                    border: `1px solid ${milestone.status === "current" ? "var(--accent)" : "var(--border-subtle)"}`,
                    borderRadius: "4px",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="text-[11px] uppercase tracking-[0.08em]" style={{ ...mono, color: milestone.status === "current" ? "var(--accent)" : "var(--text-muted)" }}>
                      Day {milestone.day}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-[0.08em]"
                      style={{ ...mono, color: milestone.status === "completed" ? "var(--green)" : milestone.status === "current" ? "var(--accent)" : "var(--text-muted)" }}
                    >
                      {milestone.status}
                    </div>
                  </div>
                  <div className="text-[1rem] font-semibold mb-1">{milestone.title}</div>
                  <p className="text-[13px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                    {milestone.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
