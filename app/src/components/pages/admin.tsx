"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageWrapper } from "../page-wrapper";

interface DashboardData {
  sprint: { name: string; number: number; current_week: number; status: string; duration_weeks: number } | null;
  kpis: {
    total_users: number; active_users: number; paying_users: number;
    paused_users: number; churned_users: number; tier2_users: number;
    monthly_revenue_estimate: number; arr_estimate: number;
    avg_operator_score: number; tier3_eligible: number;
  };
  squads: {
    active_count: number; avg_health_score: number; avg_completion_rate: number;
    list: { name: string; members: number; health: number; completion: number; streak: number }[];
  };
  applications: { pending: number };
  at_risk: { count: number; users: { name: string; consecutive_misses: number; last_event: string }[] };
  active_pauses: { count: number; users: { name: string; paused_at: string }[] };
  recent_agent_activity: { last_24h: number };
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
      .then(res => res.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const triggerAgent = async (agent: string, params: Record<string, any> = {}) => {
    setTriggerResult("Running...");
    try {
      const res = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, ...params }),
      });
      const d = await res.json();
      setTriggerResult(JSON.stringify(d, null, 2));
    } catch (e: any) {
      setTriggerResult(`Error: ${e.message}`);
    }
  };

  const monoStyle = { fontFamily: "var(--font-dm-mono), monospace" };
  const cardStyle = { background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" };
  const labelStyle = { ...monoStyle, color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "0.08em" };

  if (loading) return <PageWrapper page="admin"><div className="text-center py-12" style={{ color: "var(--text-muted)" }}>Loading dashboard...</div></PageWrapper>;
  if (error) return <PageWrapper page="admin"><div className="py-8"><h1 className="text-xl font-semibold mb-2">Admin Dashboard</h1><div className="py-4 px-5" style={{ ...cardStyle, borderColor: "var(--red)" }}><div className="text-[13px]" style={{ color: "var(--red)" }}>{error}</div></div></div></PageWrapper>;

  const k = data!.kpis;

  return (
    <PageWrapper page="admin">
      <h1 className="text-[1.75rem] font-bold leading-[1.2] mb-1">Admin Dashboard</h1>
      <p className="text-[13px] mb-8" style={{ ...monoStyle, color: "var(--text-muted)" }}>
        {data!.sprint ? `${data!.sprint.name} \u00B7 Week ${data!.sprint.current_week} of ${data!.sprint.duration_weeks} \u00B7 ${data!.sprint.status}` : "No active sprint"}
      </p>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { val: k.active_users, label: "Active Users", color: "var(--text)" },
          { val: k.paying_users, label: "Paying", color: "var(--accent)" },
          { val: `$${k.monthly_revenue_estimate.toLocaleString()}`, label: "MRR", color: "var(--accent)" },
          { val: `$${k.arr_estimate.toLocaleString()}`, label: "ARR", color: "var(--accent)" },
          { val: k.paused_users, label: "Paused", color: "var(--yellow)" },
          { val: k.churned_users, label: "Churned", color: "var(--red)" },
          { val: k.avg_operator_score || "—", label: "Avg Score", color: "var(--text)" },
          { val: data!.applications.pending, label: "Pending Apps", color: "var(--text)" },
        ].map((kpi) => (
          <div key={kpi.label} className="text-center py-4 px-2" style={cardStyle}>
            <div className="text-xl font-bold leading-none mb-1" style={{ ...monoStyle, color: kpi.color }}>
              {kpi.val}
            </div>
            <div style={labelStyle}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Squads */}
      <div className="mb-8">
        <div className="mb-3" style={labelStyle}>Squads ({data!.squads.active_count} active)</div>
        <div className="py-3 px-4 mb-2 flex gap-3" style={{ ...monoStyle, fontSize: "11px", color: "var(--text-muted)" }}>
          <span className="flex-1">Squad</span>
          <span className="w-12 text-right">Health</span>
          <span className="w-14 text-right">Completion</span>
          <span className="w-10 text-right">Streak</span>
        </div>
        {data!.squads.list.map((s) => (
          <div key={s.name} className="flex items-center gap-3 py-3 px-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="flex-1">
              <div className="text-[13px] font-medium">{s.name}</div>
              <div className="text-[10px]" style={{ ...monoStyle, color: "var(--text-muted)" }}>{s.members} members</div>
            </div>
            <div className="w-12 text-right text-[13px] font-medium" style={{
              ...monoStyle,
              color: (s.health ?? 0) >= 75 ? "var(--green)" : (s.health ?? 0) >= 50 ? "var(--yellow)" : "var(--red)",
            }}>
              {s.health ?? "—"}
            </div>
            <div className="w-14 text-right text-[13px]" style={monoStyle}>{s.completion ?? "—"}%</div>
            <div className="w-10 text-right text-[11px]" style={{ ...monoStyle, color: "var(--text-muted)" }}>{s.streak}</div>
          </div>
        ))}
      </div>

      {/* At Risk */}
      {data!.at_risk.count > 0 && (
        <div className="mb-8">
          <div className="mb-3" style={labelStyle}>At-Risk Users ({data!.at_risk.count})</div>
          {data!.at_risk.users.map((u, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="text-[13px] font-medium">{u.name}</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] py-1 px-2" style={{ ...monoStyle, background: "var(--red)", color: "#fff", borderRadius: "2px", opacity: 0.8 }}>
                  {u.consecutive_misses} missed
                </span>
                <span className="text-[10px]" style={{ ...monoStyle, color: "var(--text-muted)" }}>{u.last_event}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Pauses */}
      {data!.active_pauses.count > 0 && (
        <div className="mb-8">
          <div className="mb-3" style={labelStyle}>Active Pauses ({data!.active_pauses.count})</div>
          {data!.active_pauses.users.map((u, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="text-[13px] font-medium">{u.name}</div>
              <div className="text-[10px]" style={{ ...monoStyle, color: "var(--text-muted)" }}>
                Since {new Date(u.paused_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agent Triggers */}
      <div className="mb-8">
        <div className="mb-3" style={labelStyle}>Agent Controls</div>
        <div className="py-4 px-5" style={cardStyle}>
          <div className="text-[13px] mb-3" style={{ color: "var(--text-secondary)" }}>
            Agent events last 24h: <strong>{data!.recent_agent_activity.last_24h}</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Monday Declare", agent: "facilitator", params: { action: "monday_declaration" } },
              { label: "Wednesday Check-in", agent: "facilitator", params: { action: "wednesday_checkin" } },
              { label: "Friday Reflect", agent: "facilitator", params: { action: "friday_reflection" } },
              { label: "Weekly Summary", agent: "facilitator", params: { action: "weekly_summary" } },
              { label: "Guardian Scan", agent: "guardian", params: {} },
              { label: "Calculate Scores", agent: "analytics", params: { action: "calculate_all_scores" } },
              { label: "Process Events", agent: "events", params: {} },
              { label: "Lifecycle Check", agent: "lifecycle", params: {} },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => triggerAgent(btn.agent, btn.params)}
                className="py-2 px-3 text-[11px] font-medium cursor-pointer transition-all duration-150"
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  borderRadius: "2px",
                  fontFamily: "inherit",
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {triggerResult && (
            <pre
              className="mt-4 py-3 px-4 text-[11px] leading-relaxed overflow-x-auto"
              style={{
                ...monoStyle,
                background: "var(--bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px",
                color: "var(--text-secondary)",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {triggerResult}
            </pre>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
