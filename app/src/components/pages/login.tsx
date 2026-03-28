"use client";

import { useState } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { createClient } from "@/lib/supabase/client";
import { PageWrapper } from "../page-wrapper";

export function LoginPage() {
  const { navigateTo } = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "magic">("magic");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const supabase = createClient();

  function friendlyError(msg: string): string {
    const m = msg.toLowerCase();
    if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a few minutes before trying again.";
    if (m.includes("invalid login") || m.includes("invalid credentials")) return "Incorrect email or password.";
    if (m.includes("email not confirmed")) return "Your email isn't confirmed yet. Check your inbox for a confirmation link.";
    if (m.includes("user not found")) return "No account found with this email. Apply for the next sprint below.";
    if (m.includes("invalid email")) return "Please enter a valid email address.";
    if (m.includes("network") || m.includes("fetch")) return "Connection error. Check your internet and try again.";
    return "Something went wrong. Please try again.";
  }

  const handleMagicLink = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    setLoading(false);
    if (error) {
      setError(friendlyError(error.message));
    } else {
      setMessage("Magic link sent. Check your inbox — it expires in 1 hour.");
    }
  };

  const handlePassword = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(friendlyError(error.message));
    } else {
      navigateTo("home");
    }
  };

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text)",
    borderRadius: "4px",
    fontFamily: "inherit",
  };

  return (
    <PageWrapper page="login">
      <div className="max-w-[400px] mx-auto pt-8">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="text-[13px] font-semibold tracking-[0.04em] uppercase mb-2"
            style={{ color: "var(--accent)" }}
          >
            Division Alpha
          </div>
          <h1 className="text-[1.75rem] font-bold leading-[1.2] mb-2">Welcome back, operator.</h1>
          <p className="text-[15px]" style={{ color: "var(--text-secondary)" }}>
            Your squad is waiting.
          </p>
        </div>

        {/* Toggle */}
        <div
          className="flex mb-6"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          {(["magic", "login"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 py-2.5 text-[13px] font-medium cursor-pointer relative bg-transparent border-none"
              style={{ color: mode === m ? "var(--text)" : "var(--text-muted)", fontFamily: "inherit" }}
            >
              {m === "magic" ? "Magic Link" : "Password"}
              {mode === m && (
                <span className="absolute bottom-[-1px] left-4 right-4 h-[1.5px]" style={{ background: "var(--accent)" }} />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="block text-[10px] uppercase tracking-[0.08em] mb-2"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3.5 px-4 text-[15px] outline-none transition-colors duration-150"
              style={inputStyle}
              placeholder="you@email.com"
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
            />
          </div>

          {mode === "login" && (
            <div>
              <label
                className="block text-[10px] uppercase tracking-[0.08em] mb-2"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handlePassword(); }}
                className="w-full py-3.5 px-4 text-[15px] outline-none transition-colors duration-150"
                style={inputStyle}
                placeholder="Your password"
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
              />
            </div>
          )}

          {error && (
            <div className="text-[13px] py-2 px-3" style={{ color: "var(--red)", background: "var(--surface)", borderRadius: "4px" }}>
              {error}
            </div>
          )}

          {message && (
            <div className="text-[13px] py-2 px-3" style={{ color: "var(--accent)", background: "var(--accent-surface)", borderRadius: "4px" }}>
              {message}
            </div>
          )}

          <button
            onClick={mode === "magic" ? handleMagicLink : handlePassword}
            disabled={loading || !email}
            className="w-full py-3.5 text-[15px] font-medium border-none cursor-pointer transition-all duration-150"
            style={{
              background: loading ? "var(--border)" : "var(--accent)",
              color: "var(--accent-text)",
              borderRadius: "2px",
              fontFamily: "inherit",
              opacity: loading || !email ? 0.6 : 1,
            }}
          >
            {loading ? "Sending..." : mode === "magic" ? "Send Magic Link" : "Sign In"}
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            Not a member yet?{" "}
            <button
              onClick={() => navigateTo("apply")}
              className="bg-transparent border-none cursor-pointer underline"
              style={{ color: "var(--accent)", fontFamily: "inherit", fontSize: "13px" }}
            >
              Apply for the next sprint
            </button>
          </p>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigateTo("landing")}
            className="text-[12px] bg-transparent border-none cursor-pointer"
            style={{ color: "var(--text-muted)", fontFamily: "inherit" }}
          >
            &larr; Back to home
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
