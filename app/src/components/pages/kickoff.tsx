"use client";

import { useState } from "react";
import { PageWrapper } from "../page-wrapper";

const SQUAD_MEMBERS = [
  { avatar: "SR", name: "Sara R. \u00B7 London", goal: "Building a SaaS product for interior designers. Ship onboarding + get 10 beta users.", type: "Builder" },
  { avatar: "FN", name: "Fatima N. \u00B7 Dubai", goal: "Launching a consulting practice. Land 3 paying clients and build a referral system.", type: "Rewirer" },
  { avatar: "MH", name: "Marcus H. \u00B7 Toronto", goal: "Scaling a YouTube channel to 100K subs. Publish 12 videos in 6 weeks.", type: "Builder" },
  { avatar: "OT", name: "Omar T. \u00B7 New York", goal: "Raising a pre-seed round. Finalize pitch deck, book 15 investor meetings.", type: "Builder" },
  { avatar: "JL", name: "James L. \u00B7 San Francisco", goal: "Pivoting from corporate to freelance. Land first 2 clients and build a portfolio site.", type: "Pivot" },
  { avatar: "PK", name: "Priya K. \u00B7 Austin", goal: "Building a fitness coaching business. Launch group program and enroll 20 members.", type: "Builder" },
  { avatar: "AM", name: "Amir M. \u00B7 Chicago", goal: "Ship pricing page, run 12 customer interviews, maintain morning routine.", type: "Builder", isYou: true },
];

const NORMS = [
  { bold: "Honesty over performance", rest: " \u2014 don\u2019t tell us what we want to hear. Tell us what\u2019s real." },
  { bold: "Struggling is data, hiding is the problem.", rest: " We can\u2019t help what we can\u2019t see." },
  { bold: "What\u2019s shared here stays here.", rest: "" },
  { bold: "If you need to pause, say so", rest: " \u2014 we\u2019d rather adjust than lose you." },
  { bold: "Progress, not perfection.", rest: " The goal is movement." },
];

export function KickoffPage() {
  const [committed, setCommitted] = useState(false);

  return (
    <PageWrapper page="kickoff">
      <div className="text-center">
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-[32px]"
          style={{ border: "2px solid var(--accent)", color: "var(--accent)" }}
        >
          &#9670;
        </div>
        <h1
          className="text-[2rem] leading-[1.2] mb-2"
          style={{ fontFamily: "var(--font-instrument-serif), serif" }}
        >
          Sprint 3 Kickoff
        </h1>
        <p className="text-[15px] leading-relaxed mb-9" style={{ color: "var(--text-secondary)" }}>
          This is Alpha Vanguard. Seven operators. Six weeks. Here&apos;s who you&apos;re building with.
        </p>
      </div>

      <div
        className="text-[11px] uppercase tracking-[0.1em] mb-3"
        style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
      >
        Your squad
      </div>

      {SQUAD_MEMBERS.map((m, i) => (
        <div
          key={i}
          className="flex items-center gap-3 py-3.5"
          style={{ borderBottom: i < SQUAD_MEMBERS.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0"
            style={{ background: "var(--surface-hover)", color: "var(--text-secondary)" }}
          >
            {m.avatar}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium mb-0.5">
              {m.name}
              {m.isYou && <span style={{ color: "var(--accent)" }}> (You)</span>}
            </div>
            <div className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {m.goal}
            </div>
          </div>
          <span
            className="text-[10px] uppercase tracking-[0.06em] py-[3px] px-2 shrink-0"
            style={{
              fontFamily: "var(--font-dm-mono), monospace",
              color: "var(--text-muted)",
              background: "var(--surface)",
              borderRadius: "2px",
            }}
          >
            {m.type}
          </span>
        </div>
      ))}

      {/* Norms */}
      <div
        className="my-7 py-5 px-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
      >
        <div
          className="text-[11px] uppercase tracking-[0.1em] mb-3"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          How we operate
        </div>
        <ol className="pl-5 space-y-2.5">
          {NORMS.map((n, i) => (
            <li key={i} className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text)" }}>{n.bold}</strong>{n.rest}
            </li>
          ))}
        </ol>
      </div>

      {/* Commitment */}
      <div
        className="text-center py-8 px-6 my-7"
        style={{ background: "var(--accent-surface)", border: "1px solid var(--accent)", borderRadius: "4px" }}
      >
        <p className="text-[15px] leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
          You&apos;re about to declare your goals in front of six people who will ask you every single week what happened.
          This isn&apos;t a private journal entry. This is a commitment to this unit.
        </p>
        <button
          onClick={() => setCommitted(true)}
          className="py-3.5 px-9 text-[15px] font-semibold border-none cursor-pointer transition-all duration-150 hover:-translate-y-px"
          style={{
            background: committed ? "var(--green)" : "var(--accent)",
            color: "var(--accent-text)",
            borderRadius: "2px",
            fontFamily: "inherit",
            pointerEvents: committed ? "none" : "auto",
          }}
        >
          {committed ? "You\u2019re in \u2713" : "I\u2019m in"}
        </button>
      </div>

      <div className="text-center pt-9 mt-9" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <p className="text-[0.95rem] italic leading-relaxed mb-1.5" style={{ color: "var(--text-secondary)" }}>
          &ldquo;And hold firmly to the rope of Allah, all together, and do not become divided.&rdquo;
        </p>
        <span
          className="text-[10px] uppercase tracking-[0.08em]"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          Quran 3:103 &middot; Unity in purpose
        </span>
      </div>
    </PageWrapper>
  );
}
