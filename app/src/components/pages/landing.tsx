"use client";

import { useEffect, useState } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { createClient } from "@/lib/supabase/client";
import { PageWrapper } from "../page-wrapper";

function useNextSprint() {
  const [sprintInfo, setSprintInfo] = useState<{
    name: string | null;
    number: number;
    startDate: string;
    spotsRemaining: number;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      // Get next upcoming or active sprint
      const { data: sprint } = await supabase
        .from('sprints')
        .select('*')
        .in('status', ['upcoming', 'handshake', 'active'])
        .order('start_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!sprint) return;

      // Count enrolled members to estimate remaining spots
      const { count } = await supabase
        .from('squad_members')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      // Estimate spots: ~50 target capacity minus enrolled
      const capacity = sprint.max_members || 50;
      const enrolled = count || 0;
      const remaining = Math.max(0, capacity - enrolled);

      const startDate = new Date(sprint.start_date);
      const formatted = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

      setSprintInfo({
        name: sprint.name,
        number: sprint.number,
        startDate: formatted,
        spotsRemaining: remaining,
      });
    })();
  }, []);

  return sprintInfo;
}

export function LandingPage() {
  const { navigateTo } = useNavigation();
  const nextSprint = useNextSprint();

  const sprintNum = nextSprint?.number ?? 4;
  const sprintDate = nextSprint?.startDate ?? "April 6";
  const spotsLeft = nextSprint?.spotsRemaining ?? 18;

  return (
    <PageWrapper page="landing">
      {/* ── Hero ── */}
      <div className="pt-4 pb-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div
          className="text-[10px] uppercase tracking-[0.12em] mb-6"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
        >
          Structured Peer Accountability
        </div>

        <h1 className="text-[2rem] md:text-[2.5rem] font-bold leading-[1.15] mb-6">
          People who set goals alone{" "}
          <span style={{ color: "var(--text-muted)", textDecoration: "line-through", textDecorationColor: "var(--red)" }}>
            complete 43%
          </span>
          <br />
          People with accountability partners{" "}
          <span style={{ color: "var(--accent)" }}>complete 76%</span>
        </h1>

        <p className="text-[17px] leading-[1.7] mb-8" style={{ color: "var(--text-secondary)" }}>
          The research is not ambiguous. Dr. Gail Matthews at Dominican University proved it.
          The ASTD pushed the number to 95% with scheduled accountability appointments.
          <br /><br />
          The problem was never motivation. The problem was infrastructure.
          Who matches you with the right people? Who runs the check-ins?
          Who catches you when you go quiet in Week 3?
          <br /><br />
          That used to require a human facilitator charging $200/hour.
          <br />
          Now it requires Division Alpha.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigateTo("apply")}
            className="py-4 px-8 text-[15px] font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-px"
            style={{ background: "var(--accent)", color: "var(--accent-text)", borderRadius: "2px", fontFamily: "inherit" }}
          >
            Apply for the Next Sprint
          </button>
          <button
            onClick={() => navigateTo("login")}
            className="py-4 px-8 text-[15px] font-medium cursor-pointer transition-all duration-150"
            style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "2px", fontFamily: "inherit" }}
          >
            I&apos;m already a member
          </button>
        </div>

        <div
          className="mt-6 text-[11px]"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          Sprint {sprintNum} begins {sprintDate} &middot; {spotsLeft} spots remaining &middot; $49/month
        </div>
      </div>

      {/* ── The Mechanism ── */}
      <div className="py-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div
          className="text-[10px] uppercase tracking-[0.12em] mb-4"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          How It Works
        </div>
        <h2 className="text-[1.5rem] font-bold leading-[1.25] mb-6">
          6 people who know your goals.<br />
          AI makes it run at scale.
        </h2>

        <p className="text-[15px] leading-[1.7] mb-8" style={{ color: "var(--text-secondary)" }}>
          You are placed in a squad of 6&ndash;8 operators. Not random strangers&thinsp;&mdash;&thinsp;people
          matched by timezone, goal type, personality, and experience level. Real humans
          who will ask you every Friday what happened with Monday&apos;s commitments.
          The AI handles the matching, the scheduling, the nudging. Your squad handles
          the part that actually changes behavior.
        </p>

        <div className="space-y-6">
          {[
            {
              day: "Monday",
              title: "Declare",
              desc: "You tell your squad exactly what you will deliver this week. Not vague intentions. Specific, measurable commitments. Your squad sees them. There is nowhere to hide.",
            },
            {
              day: "Wednesday",
              title: "Signal",
              desc: "Green, Yellow, or Red. For each goal, one honest signal. If you are stuck, your squad knows before Friday. Marcus is blocked on Stripe? Sara integrated it last month. The AI connects them in minutes.",
            },
            {
              day: "Friday",
              title: "Reflect",
              desc: "What landed. What did not. What you learned. No shame, no performance theater. Just data. The squad celebrates wins and extracts learning from misses. Then you rest. Monday starts again.",
            },
          ].map((item) => (
            <div
              key={item.day}
              className="py-5 px-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="text-[10px] uppercase tracking-[0.08em] py-1 px-2"
                  style={{ fontFamily: "var(--font-dm-mono), monospace", background: "var(--accent-surface)", color: "var(--accent)", borderRadius: "2px" }}
                >
                  {item.day}
                </span>
                <span className="text-[15px] font-semibold">{item.title}</span>
              </div>
              <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── The AI Layer ── */}
      <div className="py-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div
          className="text-[10px] uppercase tracking-[0.12em] mb-4"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          What the AI Does
        </div>
        <h2 className="text-[1.5rem] font-bold leading-[1.25] mb-4">
          The infrastructure that makes squads work.
        </h2>
        <p className="text-[15px] leading-[1.7] mb-8" style={{ color: "var(--text-secondary)" }}>
          Every mastermind group that works has a facilitator. The best ones have
          a coach, a matchmaker, and someone watching for disengagement. Division Alpha
          has all five&thinsp;&mdash;&thinsp;running in the background so your squad can focus on
          what matters: holding each other accountable.
        </p>

        <div className="space-y-4">
          {[
            { name: "Matchmaker", desc: "Forms your squad from the applicant pool. Timezone, personality, goal diversity, experience level. Gets smarter every sprint." },
            { name: "Facilitator", desc: "Runs the Monday/Wednesday/Friday rhythm. Posts prompts, acknowledges submissions, connects members who can help each other." },
            { name: "Coach", desc: "Your private AI advisor. 24/7. Full context on your goals, your patterns, your check-in history. Says what needs to be said." },
            { name: "Guardian", desc: "Watches for silence. Two missed check-ins and you get a private message. Not a threat. A question: are you struggling, or just busy?" },
            { name: "Analytics", desc: "Calculates your Operator Score across 6 factors. Tracks squad health. Predicts who might disengage before they do." },
          ].map((agent) => (
            <div key={agent.name} className="flex gap-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <span
                className="text-[11px] uppercase tracking-[0.06em] w-[90px] shrink-0 pt-0.5"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
              >
                {agent.name}
              </span>
              <p className="text-[14px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                {agent.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── The Numbers ── */}
      <div className="py-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <h2 className="text-[1.5rem] font-bold leading-[1.25] mb-6">
          The research that built this product.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { stat: "43%", label: "Goal completion rate when you set goals alone", cite: "Dominican University" },
            { stat: "76%", label: "With an accountability partner and weekly reports", cite: "Dr. Gail Matthews" },
            { stat: "95%", label: "With scheduled accountability appointments", cite: "ASTD" },
          ].map((item) => (
            <div
              key={item.stat}
              className="text-center py-5 px-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
            >
              <div
                className="text-[2rem] font-bold leading-none mb-1"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
              >
                {item.stat}
              </div>
              <div className="text-[12px] leading-[1.5] mb-1" style={{ color: "var(--text-secondary)" }}>
                {item.label}
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.06em]"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
              >
                {item.cite}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[15px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
          Division Alpha gives you the squad, the scheduled appointments, the weekly reports,
          and the group pressure that research proves works&thinsp;&mdash;&thinsp;at a fraction of the cost of a
          human mastermind. AI handles the logistics. Your squad handles the accountability.
        </p>
      </div>

      {/* ── Who This Is For ── */}
      <div className="py-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <h2 className="text-[1.5rem] font-bold leading-[1.25] mb-4">
          This is not for everyone.
        </h2>
        <p className="text-[15px] leading-[1.7] mb-6" style={{ color: "var(--text-secondary)" }}>
          Division Alpha is for solo founders, ambitious professionals, and operators who
          have goals they keep failing to hit&thinsp;&mdash;&thinsp;not because they lack ability, but because
          they lack the structure. If you have never set a goal and struggled to finish it,
          this product is not for you. If you have, keep reading.
        </p>

        <div className="space-y-3">
          {[
            "You have a project, a business, or a transformation you have been putting off",
            "You work alone and nobody asks you what happened with last week\u2019s plan",
            "You have tried accountability apps, habit trackers, and AI coaches. They did not work because there was no human on the other end who cared",
            "You would pay $49/month if it meant actually finishing what you start",
          ].map((item, i) => (
            <div key={i} className="flex gap-3 py-2">
              <span className="text-[13px] shrink-0 mt-0.5" style={{ color: "var(--accent)" }}>&#10003;</span>
              <p className="text-[14px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pricing ── */}
      <div className="py-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <h2 className="text-[1.5rem] font-bold leading-[1.25] mb-2">$49/month.</h2>
        <p className="text-[15px] leading-[1.7] mb-6" style={{ color: "var(--text-secondary)" }}>
          Human-led masterminds charge $97&ndash;$2,000 per month. AI coaching apps charge $20
          but give you a chatbot with no skin in the game.
          <br /><br />
          Division Alpha gives you a squad of real humans, AI that actually knows your history,
          and a structure that research proves works. For $49.
        </p>

        <div
          className="py-5 px-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
        >
          <div className="text-lg font-semibold mb-3">Sprint Access &middot; $49/mo</div>
          <div className="space-y-2">
            {[
              "AI-matched squad of 6\u20138 operators",
              "6-week structured sprint with Monday/Wednesday/Friday rhythm",
              "Private AI coach available 24/7",
              "Operator Score tracking across 6 performance factors",
              "Squad continuation vote every 6 weeks",
              "Cancel anytime. No contracts.",
            ].map((item, i) => (
              <div key={i} className="flex gap-2 text-[14px]" style={{ color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--accent)" }}>&#8226;</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── The Question ── */}
      <div className="py-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <h2 className="text-[1.5rem] font-bold leading-[1.25] mb-4">
          The question is not whether accountability works.
        </h2>
        <p className="text-[15px] leading-[1.7] mb-8" style={{ color: "var(--text-secondary)" }}>
          The research settled that decades ago. The question is whether you will build
          the structure around yourself, or keep hoping discipline alone will be enough.
          <br /><br />
          It will not. It never has. The people who achieve consistently are not more
          disciplined. They are more accountable. They have people who know their goals
          and will not let them hide.
          <br /><br />
          That is what Division Alpha builds for you. Every Monday. Every Wednesday.
          Every Friday. For as long as you show up.
        </p>

        <button
          onClick={() => navigateTo("apply")}
          className="w-full py-4 text-[15px] font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-px"
          style={{ background: "var(--accent)", color: "var(--accent-text)", borderRadius: "2px", fontFamily: "inherit" }}
        >
          Apply for Sprint {sprintNum} &mdash; Begins {sprintDate}
        </button>

        <div
          className="mt-4 text-center text-[11px]"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          {spotsLeft} spots remaining &middot; Applications reviewed within 48 hours
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="py-8 text-center">
        <div
          className="text-[12px] font-semibold tracking-[0.04em] uppercase mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Division Alpha
        </div>
        <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
          Your squad holds you accountable. AI makes it scale.
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={() => navigateTo("login")}
            className="text-[12px] bg-transparent border-none cursor-pointer underline"
            style={{ color: "var(--text-muted)", fontFamily: "inherit" }}
          >
            Member Login
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
