"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageWrapper } from "../page-wrapper";

const STORAGE_KEY = "da_apply_draft";

const FIELD_KEYS = {
  fullName: "Full name",
  email: "Email",
  timezone: "Timezone",
  oneLiner: "In one sentence, what do you do?",
  goals: "What are the 1-3 outcomes you want to achieve in the next 40 days?",
  whyNow: "Why now?",
  referral: "How did you hear about Division Alpha? (optional)",
  focus: "Primary focus",
  stage: "Current stage",
  accountability: "How should the Boss push you when you drift?",
  supportInstinct: "When another operator is slipping, what's your instinct?",
  persona: "Which best describes your current operating mode?",
  commitment: "Can you commit to daily Boss check-ins plus the Monday/Wednesday/Friday rhythm for 40 days?",
  honesty: "Are you willing to answer honestly when the Boss asks for your progress — and your struggles?",
  noGhosting: "Do you understand that ghosting the system isn't an option?",
  communication: "How often do you want to hear from the Boss?",
} as const;

const STEPS = [
  {
    label: "Step 1 · Operator Profile",
    fields: [
      { type: "text", label: FIELD_KEYS.fullName, placeholder: "Your name" },
      { type: "email", label: FIELD_KEYS.email, placeholder: "you@email.com" },
      { type: "text", label: FIELD_KEYS.timezone, placeholder: "e.g. EST, GMT+1, PST" },
      { type: "text", label: FIELD_KEYS.oneLiner, placeholder: "e.g. Building a SaaS for restaurants" },
    ],
    options: [],
  },
  {
    label: "Step 2 · What You're Proving",
    fields: [
      {
        type: "textarea",
        label: FIELD_KEYS.goals,
        placeholder: "Be concrete. What does a strong 40-day finish actually look like?",
      },
    ],
    options: [
      { label: FIELD_KEYS.focus, choices: ["Professional", "Personal", "Spiritual", "All three"] },
      { label: FIELD_KEYS.stage, choices: ["Just Starting Out", "Building & Growing", "Scaling", "Pivoting"] },
    ],
    extraFields: [
      { type: "textarea", label: FIELD_KEYS.whyNow, placeholder: "Why are you stepping into the arena now?" },
      { type: "text", label: FIELD_KEYS.referral, placeholder: "e.g. a friend, LinkedIn, community, podcast" },
    ],
  },
  {
    label: "Step 3 · How You Respond",
    fields: [],
    options: [
      {
        label: FIELD_KEYS.accountability,
        choices: ["Direct and Challenging", "Supportive and Encouraging", "Data-Driven and Analytical", "Mix of All"],
      },
      {
        label: FIELD_KEYS.supportInstinct,
        choices: ["Ask how I can help", "Give them space", "Push them harder", "Help them problem-solve"],
      },
      {
        label: FIELD_KEYS.persona,
        choices: ["Builder — shipping and launching", "Rewirer — changing habits and staying consistent", "Pivot — regaining clarity and direction"],
      },
    ],
  },
  {
    label: "Step 4 · Commitment",
    fields: [],
    options: [
      { label: FIELD_KEYS.commitment, choices: ["Yes — I'm ready", "Not right now"] },
      { label: FIELD_KEYS.honesty, choices: ["Yes", "I need to think about it"] },
      { label: FIELD_KEYS.noGhosting, choices: ["Yes — if life happens, I communicate", "I understand"] },
      { label: FIELD_KEYS.communication, choices: ["Daily", "Somewhere in between", "Only check-ins"] },
    ],
  },
];

export function ApplyPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const formRef = useRef<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { fields, options, step: savedStep } = JSON.parse(saved);
        if (fields) formRef.current = fields;
        if (options) setSelectedOptions(options);
        if (typeof savedStep === "number") setStep(savedStep);
      }
    } catch {}
  }, []);

  const saveDraft = (fields: Record<string, string>, options: Record<string, string>, currentStep: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ fields, options, step: currentStep }));
    } catch {}
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const selectOption = (label: string, choice: string) => {
    const next = { ...selectedOptions, [label]: choice };
    setSelectedOptions(next);
    saveDraft(formRef.current, next, step);
  };

  const currentStep = STEPS[step];
  const isFinalStep = step === STEPS.length - 1;
  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text)",
    borderRadius: "4px",
    fontFamily: "inherit",
  };

  if (submitted) {
    return (
      <PageWrapper page="apply">
        <div
          className="text-center py-12"
          style={{ animation: "fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
        >
          <div
            className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center text-[32px]"
            style={{ border: "2px solid var(--accent)", color: "var(--accent)" }}
          >
            &#10003;
          </div>
          <h2 className="text-2xl font-bold mb-2">Application Saved</h2>
          <p className="text-[15px] leading-relaxed max-w-[420px] mx-auto" style={{ color: "var(--text-secondary)" }}>
            We saved your application, but checkout did not open correctly. We&apos;ll follow up by email with the next step.
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper page="apply">
      <h1 className="text-[1.75rem] font-bold leading-[1.2] mb-1">Apply to Enter the Arena</h1>
      <p className="text-[15px] leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
        You are applying to <strong>RECRUIT</strong>, the 40-day proving ground. Everyone gets a chance.
        QUALIFIED and squads are earned later through your score and your behavior.
      </p>

      <div className="flex gap-1 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[3px] transition-colors duration-300"
            style={{
              borderRadius: "2px",
              background: i < step ? "var(--accent)" : i === step ? "var(--accent)" : "var(--surface)",
              opacity: i === step ? 0.5 : 1,
            }}
          />
        ))}
      </div>

      <div
        className="text-[10px] uppercase tracking-[0.06em] mb-2"
        style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
      >
        {currentStep.label}
      </div>

      <div className="space-y-4 mb-7">
        {currentStep.fields?.map((f) => (
          <div key={f.label} className="flex flex-col gap-1">
            <label className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
              {f.label}
            </label>
            {f.type === "textarea" ? (
              <textarea
                className="w-full min-h-[100px] py-3.5 px-4 text-[15px] leading-relaxed resize-y outline-none transition-colors duration-150"
                style={inputStyle}
                placeholder={f.placeholder}
                defaultValue={formRef.current[f.label] || ""}
                onChange={(e) => {
                  formRef.current[f.label] = e.target.value;
                  saveDraft(formRef.current, selectedOptions, step);
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
                aria-label={f.label}
              />
            ) : (
              <input
                type={f.type}
                className="w-full py-3.5 px-4 text-[15px] outline-none transition-colors duration-150"
                style={inputStyle}
                placeholder={f.placeholder}
                defaultValue={formRef.current[f.label] || ""}
                onChange={(e) => {
                  formRef.current[f.label] = e.target.value;
                  saveDraft(formRef.current, selectedOptions, step);
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
                aria-label={f.label}
              />
            )}
          </div>
        ))}

        {currentStep.options?.map((opt) => (
          <div key={opt.label} className="flex flex-col gap-1">
            <label className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
              {opt.label}
            </label>
            <div className="flex flex-col gap-2">
              {opt.choices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => selectOption(opt.label, choice)}
                  className="py-3.5 px-4 text-sm text-left cursor-pointer transition-all duration-150"
                  style={{
                    background: selectedOptions[opt.label] === choice ? "var(--accent-surface)" : "var(--surface)",
                    border: `1px solid ${selectedOptions[opt.label] === choice ? "var(--accent)" : "var(--border-subtle)"}`,
                    color: selectedOptions[opt.label] === choice ? "var(--text)" : "var(--text-secondary)",
                    borderRadius: "4px",
                    fontFamily: "inherit",
                  }}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        ))}

        {"extraFields" in currentStep && currentStep.extraFields?.map((f) => (
          <div key={f.label} className="flex flex-col gap-1">
            <label className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
              {f.label}
            </label>
            <textarea
              className="w-full min-h-[80px] py-3.5 px-4 text-[15px] leading-relaxed resize-y outline-none transition-colors duration-150"
              style={inputStyle}
              placeholder={f.placeholder}
              defaultValue={formRef.current[f.label] || ""}
              onChange={(e) => {
                formRef.current[f.label] = e.target.value;
                saveDraft(formRef.current, selectedOptions, step);
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
              aria-label={f.label}
            />
          </div>
        ))}
      </div>

      {isFinalStep && (
        <div
          className="py-4 px-5 mb-6"
          style={{ background: "var(--accent-surface)", border: "1px solid var(--accent)", borderRadius: "4px" }}
        >
          <div
            className="text-[10px] uppercase tracking-[0.08em] mb-1"
            style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
          >
            What happens next
          </div>
          <p className="text-[14px] leading-[1.6] mb-3" style={{ color: "var(--text-secondary)" }}>
            After this step, you&apos;ll continue to secure checkout for <strong>RECRUIT ($9/mo)</strong>.
            Once payment goes through, we&apos;ll email your next step and get you ready for Sprint 4.
          </p>
          <div className="space-y-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            <div>• Daily Boss pulse and 40-day proving ground</div>
            <div>• Weekly operator session and embedded human support</div>
            <div>• QUALIFIED and squads are earned later at 30+</div>
          </div>
        </div>
      )}

      <div className="flex gap-2.5 mt-2">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="py-3.5 px-6 text-sm font-medium cursor-pointer transition-all duration-150"
            style={{
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              borderRadius: "2px",
              fontFamily: "inherit",
            }}
          >
            &larr; Back
          </button>
        )}
        <button
          disabled={submitting}
          onClick={async () => {
            if (!isFinalStep) {
              const next = step + 1;
              setStep(next);
              saveDraft(formRef.current, selectedOptions, next);
              return;
            }

            setSubmitting(true);

            try {
              const supabase = createClient();

              let personaType = selectedOptions[FIELD_KEYS.persona] || "";
              if (personaType.startsWith("Builder")) personaType = "Builder";
              else if (personaType.startsWith("Rewirer")) personaType = "Rewirer";
              else if (personaType.startsWith("Pivot")) personaType = "Pivot";

              await supabase.from("applications").insert({
                full_name: formRef.current[FIELD_KEYS.fullName] || "",
                email: formRef.current[FIELD_KEYS.email] || "",
                timezone: formRef.current[FIELD_KEYS.timezone] || "",
                one_liner: formRef.current[FIELD_KEYS.oneLiner] || "",
                goals_text: formRef.current[FIELD_KEYS.goals] || "",
                primary_focus: selectedOptions[FIELD_KEYS.focus] || null,
                current_stage: selectedOptions[FIELD_KEYS.stage] || null,
                why_applying: formRef.current[FIELD_KEYS.whyNow] || "",
                referral_source: formRef.current[FIELD_KEYS.referral] || null,
                accountability_style: selectedOptions[FIELD_KEYS.accountability] || null,
                support_instinct: selectedOptions[FIELD_KEYS.supportInstinct] || null,
                persona_type: personaType || null,
                can_commit_3x_week: selectedOptions[FIELD_KEYS.commitment]?.startsWith("Yes") || false,
                willing_to_share: selectedOptions[FIELD_KEYS.honesty] === "Yes",
                no_ghosting_understood: !!selectedOptions[FIELD_KEYS.noGhosting],
                communication_freq: selectedOptions[FIELD_KEYS.communication] || null,
                status: "submitted",
              });
            } catch (err) {
              console.error("Application submit error:", err);
            }

            try {
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: formRef.current[FIELD_KEYS.email] || "",
                  name: formRef.current[FIELD_KEYS.fullName] || "",
                }),
              });
              const data = await res.json();
              if (data.url) {
                clearDraft();
                window.location.href = data.url;
                return;
              }
            } catch (err) {
              console.error("Checkout redirect error:", err);
            }

            clearDraft();
            setSubmitting(false);
            setSubmitted(true);
          }}
          className="flex-1 py-3.5 text-sm font-medium border-none cursor-pointer transition-colors duration-150"
          style={{
            background: submitting ? "var(--border)" : "var(--accent)",
            color: "var(--accent-text)",
            borderRadius: "2px",
            fontFamily: "inherit",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Preparing checkout..." : isFinalStep ? "Continue to Checkout" : "Continue"}
        </button>
      </div>
    </PageWrapper>
  );
}
