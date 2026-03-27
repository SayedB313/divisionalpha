"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageWrapper } from "../page-wrapper";

const STEPS = [
  {
    label: "Step 1 \u00B7 Identity",
    fields: [
      { type: "text", label: "Full name", placeholder: "Your name" },
      { type: "email", label: "Email", placeholder: "you@email.com" },
      { type: "text", label: "Timezone", placeholder: "e.g. EST, GMT+1, PST" },
      { type: "text", label: "In one sentence, what do you do?", placeholder: "e.g. Building a SaaS for restaurants" },
    ],
    options: [],
  },
  {
    label: "Step 2 \u00B7 Goals",
    fields: [
      { type: "textarea", label: "What are the 1-3 goals you want to accomplish in the next 6 weeks?", placeholder: "Be specific. Not 'work on my business' \u2014 what does done look like?" },
    ],
    options: [
      { label: "Primary focus", choices: ["Professional", "Personal", "Spiritual", "All three"] },
      { label: "Current stage", choices: ["Just Starting Out", "Building & Growing", "Scaling", "Pivoting"] },
    ],
    extraFields: [
      { type: "textarea", label: "Why are you applying?", placeholder: "What\u2019s driving you to seek accountability right now?" },
    ],
  },
  {
    label: "Step 3 \u00B7 Accountability Style",
    fields: [],
    options: [
      { label: "How do you respond best to accountability?", choices: ["Direct and Challenging", "Supportive and Encouraging", "Data-Driven and Analytical", "Mix of All"] },
      { label: "When someone in your squad is struggling, what\u2019s your instinct?", choices: ["Ask how I can help", "Give them space", "Push them harder", "Help them problem-solve"] },
      { label: "Are you more of a...", choices: ["Builder \u2014 launching projects, needs deadlines", "Rewirer \u2014 changing habits, needs consistency", "Pivot \u2014 changing direction, needs clarity"] },
    ],
  },
  {
    label: "Step 4 \u00B7 Commitment",
    fields: [],
    options: [
      { label: "Can you commit to 3 check-ins per week (Mon/Wed/Fri) for 6 weeks?", choices: ["Yes \u2014 I\u2019m ready", "Not right now"] },
      { label: "Are you willing to share your progress \u2014 and your struggles \u2014 openly with 5-7 strangers?", choices: ["Yes", "I need to think about it"] },
      { label: "Do you understand that ghosting your squad isn\u2019t an option?", choices: ["Yes \u2014 if life happens, I communicate", "I understand"] },
    ],
  },
];

export function ApplyPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const formRef = useRef<Record<string, string>>({});

  const selectOption = (label: string, choice: string) => {
    setSelectedOptions((prev) => ({ ...prev, [label]: choice }));
  };

  const currentStep = STEPS[step];
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
          <h2 className="text-2xl font-bold mb-2">Application Received</h2>
          <p className="text-[15px] leading-relaxed max-w-[400px] mx-auto" style={{ color: "var(--text-secondary)" }}>
            Sprint 4 begins April 6. Your squad will be announced 5 days before launch. Check your email for next steps.
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper page="apply">
      <h1 className="text-[1.75rem] font-bold leading-[1.2] mb-1">Apply to Division Alpha</h1>
      <p className="text-[15px] leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
        This isn&apos;t a signup form. It&apos;s an application. We use your answers to build squads that actually work.
      </p>

      {/* Progress */}
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
                onChange={(e) => { formRef.current[f.label] = e.target.value; }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
                aria-label={f.label}
              />
            ) : (
              <input
                type={f.type}
                className="py-3.5 px-4 text-[15px] outline-none transition-colors duration-150"
                style={inputStyle}
                placeholder={f.placeholder}
                onChange={(e) => { formRef.current[f.label] = e.target.value; }}
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
              {opt.choices.map((c) => (
                <button
                  key={c}
                  onClick={() => selectOption(opt.label, c)}
                  className="py-3.5 px-4 text-sm text-left cursor-pointer transition-all duration-150"
                  style={{
                    background: selectedOptions[opt.label] === c ? "var(--accent-surface)" : "var(--surface)",
                    border: `1px solid ${selectedOptions[opt.label] === c ? "var(--accent)" : "var(--border-subtle)"}`,
                    color: selectedOptions[opt.label] === c ? "var(--text)" : "var(--text-secondary)",
                    borderRadius: "4px",
                    fontFamily: "inherit",
                  }}
                >
                  {c}
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
              onChange={(e) => { formRef.current[f.label] = e.target.value; }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
              aria-label={f.label}
            />
          </div>
        ))}
      </div>

      {/* Navigation */}
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
            if (step < STEPS.length - 1) {
              setStep((s) => s + 1);
            } else {
              // Submit application to Supabase
              setSubmitting(true);
              try {
                const supabase = createClient();

                // Map persona type from the long form
                let personaType = selectedOptions["Are you more of a..."] || "";
                if (personaType.startsWith("Builder")) personaType = "Builder";
                else if (personaType.startsWith("Rewirer")) personaType = "Rewirer";
                else if (personaType.startsWith("Pivot")) personaType = "Pivot";

                await supabase.from("applications").insert({
                  full_name: formRef.current["Full name"] || "",
                  email: formRef.current["Email"] || "",
                  timezone: formRef.current["Timezone"] || "",
                  one_liner: formRef.current["In one sentence, what do you do?"] || "",
                  goals_text: formRef.current["What are the 1-3 goals you want to accomplish in the next 6 weeks?"] || "",
                  primary_focus: selectedOptions["Primary focus"] || null,
                  current_stage: selectedOptions["Current stage"] || null,
                  why_applying: formRef.current["Why are you applying?"] || "",
                  accountability_style: selectedOptions["How do you respond best to accountability?"] || null,
                  support_instinct: selectedOptions["When someone in your squad is struggling, what\u2019s your instinct?"] || null,
                  persona_type: personaType || null,
                  can_commit_3x_week: selectedOptions["Can you commit to 3 check-ins per week (Mon/Wed/Fri) for 6 weeks?"]?.startsWith("Yes") || false,
                  willing_to_share: selectedOptions["Are you willing to share your progress \u2014 and your struggles \u2014 openly with 5-7 strangers?"] === "Yes",
                  no_ghosting_understood: true,
                  status: "submitted",
                });
              } catch (err) {
                console.error("Application submit error:", err);
              }
              setSubmitting(false);
              setSubmitted(true);
            }
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
          {submitting ? "Submitting..." : step < STEPS.length - 1 ? "Continue" : "Submit Application"}
        </button>
      </div>
    </PageWrapper>
  );
}
