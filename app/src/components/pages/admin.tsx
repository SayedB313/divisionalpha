"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageWrapper } from "../page-wrapper";

interface DashboardData {
  sprint: { name: string; number: number; current_week: number; status: string; duration_weeks: number } | null;
  pricing: { recruit: number; qualified: number; operator: number };
  thresholds: { recruit: number | null; qualified: number; operator: number };
  kpis: {
    total_users: number;
    active_users: number;
    paying_users: number;
    paused_users: number;
    churned_users: number;
    avg_operator_score: number;
    monthly_revenue_estimate: number;
    arr_estimate: number;
  };
  tiers: { recruit: number; qualified: number; operator: number };
  boss: {
    pulses_sent_today: number;
    answered_today: number;
    blocked_today: number;
    missed_today: number;
    answer_rate_7d: number;
  };
  retention: { active_7d: number; active_14d: number };
  funnel: {
    submitted_applications: number;
    paying_users: number;
    qualified_unlock_volume: number;
    operator_candidate_pipeline: number;
  };
  squads: {
    active_count: number;
    avg_health_score: number;
    avg_completion_rate: number;
    list: { id: string; name: string; members: number; health: number; completion: number; streak: number }[];
  };
  at_risk: {
    count: number;
    users: { name: string; squad_name: string | null; consecutive_misses: number; latest_event: string; event_at: string }[];
  };
  active_pauses: {
    count: number;
    users: { name: string; paused_at: string; user_id: string }[];
  };
  recent_agent_activity: {
    last_24h: number;
    events: { source_agent: string; target_agent: string; event_type: string; processed: boolean; created_at: string }[];
  };
}

export function AdminPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [triggerResult, setTriggerResult] = useState("");

  useEffect(() => {
    if (!user) return;

    fetch("/api/admin/dashboard")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.error) setError(payload.error);
        else setData(payload);
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [user]);

  const triggerAgent = async (agent: string, params: Record<string, any> = {}) => {
    setTriggerResult("Running...");
    try {
      const response = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, ...params }),
      });
      const payload = await response.json();
      setTriggerResult(JSON.stringify(payload, null, 2));
    } catch (reason: any) {
      setTriggerResult(`Error: ${reason.message}`);
    }
  };

  const mono = { fontFamily: "var(--font-dm-mono), monospace" };
  const card = { background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" };
  const label = { ...mono, color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "0.08em" };

  if (loading) {
    return (
      <PageWrapper page="admin" layout="wide">
        <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
          Loading dashboard...
        </div>
      </PageWrapper>
    );
  }

  if (error || !data) {
    return (
      <PageWrapper page="admin" layout="wide">
        <div className="py-8">
          <h1 className="text-[1.75rem] font-bold mb-2">Admin</h1>
          <div className="py-4 px-5" style={{ ...card, borderColor: "var(--red)" }}>
            <div className="text-[13px]" style={{ color: "var(--red)" }}>
              {error || "No dashboard data found."}
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper page="admin" layout="wide">
      <div className="mb-8">
        <div style={label}>Admin</div>
        <h1 className="text-[1.9rem] font-bold leading-[1.12] mb-2">Operator control room</h1>
        <p className="text-[13px]" style={{ ...mono, color: "var(--text-muted)" }}>
          {data.sprint
            ? `${data.sprint.name} · Week ${data.sprint.current_week} of ${data.sprint.duration_weeks} · ${data.sprint.status}`
            : "No active sprint"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8 mb-8">
        {[
          { label: "Active users", value: data.kpis.active_users, color: "var(--text)" },
          { label: "Paying", value: data.kpis.paying_users, color: "var(--accent)" },
          { label: "MRR", value: `$${data.kpis.monthly_revenue_estimate.toLocaleString()}`, color: "var(--accent)" },
          { label: "Avg score", value: data.kpis.avg_operator_score || "—", color: "var(--text)" },
          { label: "RECRUIT", value: data.tiers.recruit, color: "var(--text)" },
          { label: "QUALIFIED", value: data.tiers.qualified, color: "var(--accent)" },
          { label: "OPERATOR", value: data.tiers.operator, color: "var(--accent)" },
          { label: "Apps", value: data.funnel.submitted_applications, color: "var(--text)" },
        ].map((item) => (
          <div key={item.label} className="py-4 px-3 text-center" style={card}>
            <div className="text-xl font-bold leading-none mb-1" style={{ ...mono, color: item.color }}>
              {item.value}
            </div>
            <div style={label}>{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.9fr)] mb-8">
        <div className="space-y-5">
          <section className="p-5" style={card}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <div style={label}>Business model</div>
                <h2 className="text-[1.2rem] font-semibold">Pricing and thresholds</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {[
                { name: "RECRUIT", price: `$${data.pricing.recruit}`, line: "Entry tier" },
                { name: "QUALIFIED", price: `$${data.pricing.qualified}`, line: `${data.thresholds.qualified}+ unlock line` },
                { name: "OPERATOR", price: `$${data.pricing.operator}`, line: `${data.thresholds.operator}+ candidate line` },
              ].map((item) => (
                <div key={item.name} className="py-4 px-4" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="text-[14px] font-medium">{item.name}</div>
                    <div style={label}>{item.price}</div>
                  </div>
                  <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    {item.line}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="p-5" style={card}>
              <div className="mb-4">
                <div style={label}>Boss loop</div>
                <h2 className="text-[1.2rem] font-semibold">Daily pulse health</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Sent today", value: data.boss.pulses_sent_today },
                  { label: "Answered", value: data.boss.answered_today },
                  { label: "Blocked", value: data.boss.blocked_today },
                  { label: "Missed", value: data.boss.missed_today },
                  { label: "7d rate", value: `${data.boss.answer_rate_7d}%` },
                  { label: "Active 7d", value: data.retention.active_7d },
                  { label: "Active 14d", value: data.retention.active_14d },
                  { label: "ARR", value: `$${data.kpis.arr_estimate.toLocaleString()}` },
                ].map((item) => (
                  <div key={item.label} className="py-4 px-3" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
                    <div className="text-[1rem] font-medium mb-1" style={{ ...mono, color: "var(--text)" }}>
                      {item.value}
                    </div>
                    <div style={label}>{item.label}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-5" style={card}>
              <div className="mb-4">
                <div style={label}>Unlock funnel</div>
                <h2 className="text-[1.2rem] font-semibold">Who is moving up</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: "Applications", value: data.funnel.submitted_applications },
                  { label: "Paying users", value: data.funnel.paying_users },
                  { label: "QUALIFIED ready", value: data.funnel.qualified_unlock_volume },
                  { label: "OPERATOR pipeline", value: data.funnel.operator_candidate_pipeline },
                ].map((item) => (
                  <div key={item.label} className="py-4 px-4" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
                    <div className="text-[1.1rem] font-medium mb-1" style={{ ...mono }}>
                      {item.value}
                    </div>
                    <div style={label}>{item.label}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="p-5" style={card}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <div style={label}>Squads</div>
                <h2 className="text-[1.2rem] font-semibold">Earned rooms currently active</h2>
              </div>
              <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                {data.squads.active_count} active · avg health {data.squads.avg_health_score}
              </div>
            </div>
            <div className="space-y-2">
              {data.squads.list.length > 0 ? (
                data.squads.list.map((squad) => (
                  <div key={squad.id} className="flex items-center gap-3 py-3 px-4" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium">{squad.name}</div>
                      <div className="text-[11px]" style={{ ...mono, color: "var(--text-muted)" }}>
                        {squad.members} members
                      </div>
                    </div>
                    <div className="w-12 text-right text-[12px]" style={{ ...mono, color: (squad.health ?? 0) >= 75 ? "var(--green)" : (squad.health ?? 0) >= 50 ? "var(--yellow)" : "var(--red)" }}>
                      {squad.health ?? "—"}
                    </div>
                    <div className="w-14 text-right text-[12px]" style={{ ...mono }}>
                      {squad.completion ?? "—"}%
                    </div>
                    <div className="w-10 text-right text-[11px]" style={{ ...mono, color: "var(--text-muted)" }}>
                      {squad.streak}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
                  No active squads yet.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="p-5" style={card}>
            <div className="mb-4">
              <div style={label}>Manual controls</div>
              <h2 className="text-[1.2rem] font-semibold">Run the system by hand</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Boss Pulse", agent: "boss", params: { action: "dispatch_daily_pulse" } },
                { label: "Boss Nudge", agent: "boss", params: { action: "pulse_nudge" } },
                { label: "Mon Declare", agent: "facilitator", params: { action: "monday_declaration" } },
                { label: "Wed Signal", agent: "facilitator", params: { action: "wednesday_checkin" } },
                { label: "Fri Reflection", agent: "facilitator", params: { action: "friday_reflection" } },
                { label: "Guardian Scan", agent: "guardian", params: {} },
                { label: "Scores", agent: "analytics", params: { action: "calculate_all_scores" } },
                { label: "Lifecycle", agent: "lifecycle", params: {} },
              ].map((button) => (
                <button
                  key={button.label}
                  onClick={() => triggerAgent(button.agent, button.params)}
                  className="py-2.5 px-3 text-[11px] font-medium cursor-pointer"
                  style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "2px", fontFamily: "inherit" }}
                >
                  {button.label}
                </button>
              ))}
            </div>

            {triggerResult && (
              <pre
                className="mt-4 py-3 px-4 text-[11px] leading-relaxed overflow-x-auto"
                style={{ ...mono, background: "var(--bg)", border: "1px solid var(--border-subtle)", borderRadius: "4px", color: "var(--text-secondary)", maxHeight: "220px", overflowY: "auto" }}
              >
                {triggerResult}
              </pre>
            )}
          </section>

          {data.at_risk.count > 0 && (
            <section className="p-5" style={card}>
              <div className="mb-4">
                <div style={label}>At-risk</div>
                <h2 className="text-[1.2rem] font-semibold">Who may need Guardian attention</h2>
              </div>
              <div className="space-y-2">
                {data.at_risk.users.map((member, index) => (
                  <div key={`${member.name}-${index}`} className="flex items-center justify-between gap-3 py-3 px-4" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
                    <div>
                      <div className="text-[14px] font-medium">{member.name}</div>
                      <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {member.squad_name || "RECRUIT"} · {member.latest_event}
                      </div>
                    </div>
                    <div className="text-[10px] py-1 px-2" style={{ ...mono, background: "var(--red-soft)", color: "var(--red)", borderRadius: "2px" }}>
                      {member.consecutive_misses} misses
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.active_pauses.count > 0 && (
            <section className="p-5" style={card}>
              <div className="mb-4">
                <div style={label}>Pause protocol</div>
                <h2 className="text-[1.2rem] font-semibold">Active pauses</h2>
              </div>
              <div className="space-y-2">
                {data.active_pauses.users.map((member) => (
                  <div key={member.user_id} className="py-3 px-4" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
                    <div className="text-[14px] font-medium">{member.name}</div>
                    <div className="text-[11px]" style={{ ...mono, color: "var(--text-muted)" }}>
                      paused {new Date(member.paused_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="p-5" style={card}>
            <div className="mb-4">
              <div style={label}>Recent agent activity</div>
              <h2 className="text-[1.2rem] font-semibold">Last 24 hours</h2>
            </div>
            <div className="space-y-2">
              {data.recent_agent_activity.events.length > 0 ? (
                data.recent_agent_activity.events.map((event, index) => (
                  <div key={`${event.source_agent}-${event.created_at}-${index}`} className="py-3 px-4" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="text-[13px] font-medium">
                        {event.source_agent} -&gt; {event.target_agent || "system"}
                      </div>
                      <div className="text-[10px]" style={{ ...mono, color: "var(--text-muted)" }}>
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {event.event_type} · {event.processed ? "processed" : "pending"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
                  No agent events in the last 24 hours.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
