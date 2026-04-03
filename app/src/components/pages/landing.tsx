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
      const { data: sprint } = await supabase
        .from("sprints")
        .select("*")
        .in("status", ["upcoming", "handshake", "active"])
        .order("start_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!sprint) return;

      const { count } = await supabase
        .from("squad_members")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");

      const capacity = sprint.max_members || 50;
      const enrolled = count || 0;
      const remaining = Math.max(0, capacity - enrolled);

      const startDate = new Date(sprint.start_date);
      const formatted = startDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });

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

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.days <= 0 && timeLeft.hours <= 0 && timeLeft.minutes <= 0) return null;

  return (
    <div
      className="flex items-center gap-4 py-3 px-5 mb-6"
      style={{ background: "var(--accent-surface)", border: "1px solid var(--accent)", borderRadius: "4px" }}
    >
      <span className="text-[11px] uppercase tracking-[0.08em] font-medium" style={{ color: "var(--accent)" }}>
        Enrollment closes in
      </span>
      <div className="flex gap-3">
        {[
          { value: timeLeft.days, label: "d" },
          { value: timeLeft.hours, label: "h" },
          { value: timeLeft.minutes, label: "m" },
        ].map((t) => (
          <span key={t.label} style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }} className="text-[15px] font-medium">
            {t.value}
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  const { navigateTo } = useNavigation();
  const nextSprint = useNextSprint();
  const [checkoutState, setCheckoutState] = useState<"success" | "cancel" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("checkout");

    if (state !== "success" && state !== "cancel") return;

    setCheckoutState(state);
    params.delete("checkout");

    const next = params.toString();
    const cleanUrl = `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", cleanUrl);
  }, []);

  const sprintNum = nextSprint?.number ?? 4;
  const sprintDate = nextSprint?.startDate ?? "April 6";
  const spotsLeft = nextSprint?.spotsRemaining ?? 18;

  return (
    <PageWrapper page="landing">
      <div className="pt-4 pb-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Countdown targetDate="2026-04-04T23:59:00" />

        {checkoutState && (
          <div
            className="py-4 px-5 mb-6"
            style={{
              background: checkoutState === "success" ? "var(--accent-surface)" : "var(--surface)",
              border: `1px solid ${checkoutState === "success" ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "4px",
            }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.08em] mb-1"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: checkoutState === "success" ? "var(--accent)" : "var(--text-muted)" }}
            >
              {checkoutState === "success" ? "Checkout complete" : "Checkout canceled"}
            </div>
            <p className="text-[14px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
              {checkoutState === "success"
                ? "You are in. Check your email for your magic link and Sprint 4 next steps."
                : "No problem. Your place is still here if you want to step back into the arena."}
            </p>
          </div>
        )}

        <div
          className="text-[10px] uppercase tracking-[0.12em] mb-6"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
        >
          40-Day Proving Ground
        </div>

        <h1 className="text-[2rem] md:text-[2.5rem] font-bold leading-[1.15] mb-6">
          Everyone gets a chance.
          <br />
          The best <span style={{ color: "var(--accent)" }}>earn their squad.</span>
        </h1>

        <p className="text-[17px] leading-[1.7] mb-8" style={{ color: "var(--text-secondary)" }}>
          Division Alpha starts at <strong>RECRUIT</strong>. For 40 days, the Boss tracks what you said
          you would do, what you actually did, and whether your score says you belong higher.
          <br />
          <br />
          Daily pulse. Five-minute micro-sessions. A visible streak. A score that updates in real time.
          Humans show up when it matters, but the experience stays unified. One system. One memory.
          <br />
          <br />
          You do not buy your way into a squad here. You prove your way into one.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigateTo("apply")}
            className="py-4 px-8 text-[15px] font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-px"
            style={{ background: "var(--accent)", color: "var(--accent-text)", borderRadius: "2px", fontFamily: "inherit" }}
          >
            Apply for Sprint {sprintNum}
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
          Sprint {sprintNum} begins {sprintDate} &middot; {spotsLeft} spots remaining &middot; RECRUIT $9/mo &middot; QUALIFIED unlocks at 30+
        </div>
      </div>

      <div className="py-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div
          className="text-[10px] uppercase tracking-[0.12em] mb-4"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          How It Works
        </div>
        <h2 className="text-[1.5rem] font-bold leading-[1.25] mb-6">
          The Boss runs the proving ground.
        </h2>

        <p className="text-[15px] leading-[1.7] mb-8" style={{ color: "var(--text-secondary)" }}>
          The daily entry point is simple on purpose. The depth comes from what the Boss remembers,
          what your score reflects, and whether you can hold your line for 40 days without drifting.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              day: "Daily",
              title: "Pulse",
              desc: "Every morning the Boss asks one clean question: did you move yesterday? Reply, update the streak, move the score, stay in the fight.",
            },
            {
              day: "Weekly",
              title: "Rhythm",
              desc: "Monday declare. Wednesday signal. Friday reflect. The week has posture, not just reminders. The Boss keeps the narrative intact.",
            },
            {
              day: "Earned",
              title: "Progression",
              desc: "RECRUIT is open. QUALIFIED is earned at 30+. OPERATOR is 70+ across multiple sprints. Access rises with evidence.",
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

      <div className="py-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div
          className="text-[10px] uppercase tracking-[0.12em] mb-4"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          Earned Progression
        </div>
        <h2 className="text-[1.5rem] font-bold leading-[1.25] mb-4">
          One path. Three levels.
        </h2>
        <p className="text-[15px] leading-[1.7] mb-8" style={{ color: "var(--text-secondary)" }}>
          Division Alpha is not selling the same promise to everyone. The front door is open.
          The climb is earned. That is the brand.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              name: "RECRUIT",
              stat: "$9",
              desc: "40-day proving ground. Daily Boss pulse, streak, score, weekly operator session, and embedded human support.",
            },
            {
              name: "QUALIFIED",
              stat: "30+",
              desc: "Earned squad access. Matched operators, weekly squad sessions, leaderboard pressure, and squad damage.",
            },
            {
              name: "OPERATOR",
              stat: "70+",
              desc: "Venture funding, elite network, tools, frameworks, and high-trust building with the best.",
            },
          ].map((tier) => (
            <div
              key={tier.name}
              className="py-5 px-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
            >
              <div
                className="text-[10px] uppercase tracking-[0.08em] mb-3"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
              >
                {tier.name}
              </div>
              <div
                className="text-[1.75rem] font-bold leading-none mb-3"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
              >
                {tier.stat}
              </div>
              <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                {tier.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="py-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <h2 className="text-[1.5rem] font-bold leading-[1.25] mb-6">
          Why this feels different.
        </h2>

        <div className="space-y-4 mb-8">
          {[
            {
              title: "One experience",
              desc: "The Boss is the relationship. Humans appear inside it when they matter. No split between app, coach, and system memory.",
            },
            {
              title: "Your score tells the truth",
              desc: "The score is not decoration. It determines whether you stay at RECRUIT, unlock QUALIFIED, or eventually reach OPERATOR.",
            },
            {
              title: "Squads are earned",
              desc: "You do not get placed into a random pod on hope. You prove yourself first, then earn a stronger room.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="py-5 px-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
            >
              <div className="text-[15px] font-semibold mb-2">{item.title}</div>
              <div className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[15px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
          Accountability works when there is follow-through, visibility, and consequence.
          Division Alpha gives you all three without turning the experience into a noisy dashboard
          or a dead chatbot.
        </p>
      </div>

      <div className="py-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <h2 className="text-[1.5rem] font-bold leading-[1.25] mb-4">
          This is not for everyone.
        </h2>
        <p className="text-[15px] leading-[1.7] mb-6" style={{ color: "var(--text-secondary)" }}>
          Division Alpha is for builders who are tired of private promises. People with real work
          to ship, values they care about, and enough self-awareness to admit that talent without
          structure still leaks.
        </p>

        <div className="space-y-3">
          {[
            "You work alone and the hardest part is follow-through, not ideas",
            "You want a system that notices when you drift instead of waiting for you to ask for help",
            "You can handle the truth of a visible score and a broken streak",
            "You want the chance to prove yourself before you earn a stronger room",
            "You are willing to pay $9 to step in and let your behavior decide what opens next",
          ].map((item, i) => (
            <div key={i} className="flex gap-3 py-2">
              <span className="text-[13px] shrink-0 mt-0.5" style={{ color: "var(--accent)" }}>
                &#10003;
              </span>
              <p className="text-[14px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="py-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <h2 className="text-[1.5rem] font-bold leading-[1.25] mb-2">RECRUIT &middot; $9/month.</h2>
        <p className="text-[15px] leading-[1.7] mb-6" style={{ color: "var(--text-secondary)" }}>
          The entry point is deliberately low-friction. Everyone gets a chance to step in.
          The filter is not price. The filter is whether you can hold your line for 40 days.
          <br />
          <br />
          If you do, the next room opens. If you do not, the score tells the truth.
        </p>

        <div
          className="py-5 px-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
        >
          <div className="text-lg font-semibold mb-3">RECRUIT &middot; $9/mo</div>
          <div className="space-y-2">
            {[
              "40-day proving ground with daily Boss pulse",
              "5-minute micro-sessions and Monday/Wednesday/Friday rhythm",
              "Visible streak + real-time Operator Score",
              "Weekly operator session, monthly 1:1, Guardian escalation",
              "Private AI coach with full context on your goals and patterns",
              "QUALIFIED invitation when you finish at 30+",
              "Cancel anytime. No contracts.",
            ].map((item, i) => (
              <div key={i} className="flex gap-2 text-[14px]" style={{ color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--accent)" }}>&#8226;</span>
                {item}
              </div>
            ))}
          </div>
          <div
            className="mt-4 pt-3 flex items-center gap-2"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <span
              className="text-[10px] uppercase tracking-[0.06em] py-1 px-2"
              style={{ fontFamily: "var(--font-dm-mono), monospace", background: "var(--accent)", color: "var(--accent-text)", borderRadius: "2px" }}
            >
              Founding Operator
            </span>
            <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
              Sprint {sprintNum} members earn a permanent Founding Operator badge on their profile
            </span>
          </div>
        </div>
      </div>

      <div className="py-12" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <h2 className="text-[1.5rem] font-bold leading-[1.25] mb-4">
          Step into the arena.
        </h2>
        <p className="text-[15px] leading-[1.7] mb-8" style={{ color: "var(--text-secondary)" }}>
          Sprint {sprintNum} begins {sprintDate}. The daily pulse starts the relationship.
          The score tracks whether you are climbing. The best operators earn their squad next.
          <br />
          <br />
          The question is not whether you are interested. The question is whether you can keep your word for 40 days.
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
          {spotsLeft} spots remaining &middot; RECRUIT starts at $9/mo &middot; Applications reviewed within 48 hours
        </div>
      </div>

      <div className="py-8 text-center">
        <div
          className="text-[12px] font-semibold tracking-[0.04em] uppercase mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Division Alpha
        </div>
        <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
          Everyone gets a chance. The best earn their squad.
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
