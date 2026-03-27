"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "./theme-provider";

const PRIMARY_NAV = [
  { page: "home" as const, label: "Home" },
  { page: "declare" as const, label: "Declare" },
  { page: "checkin" as const, label: "Check-in" },
  { page: "reflect" as const, label: "Reflect" },
  { page: "squad" as const, label: "Squad" },
  { page: "leaderboard" as const, label: "Board" },
  { page: "coach" as const, label: "Coach" },
];

const MORE_NAV = [
  { page: "kickoff" as const, label: "Sprint Kickoff" },
  { page: "completion" as const, label: "Sprint Completion" },
  { page: "apply" as const, label: "Apply" },
];

export function Topbar() {
  const { currentPage, navigateTo, setScoreOpen } = useNavigation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Hide full nav on public pages when not authenticated
  const isPublicPage = ["landing", "login", "apply"].includes(currentPage);
  const showFullNav = !!user && !isPublicPage;

  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  const isMoreActive = MORE_NAV.some((item) => item.page === currentPage);

  return (
    <header
      className="fixed top-0 left-0 right-0 h-[52px] flex items-center justify-between z-[100] transition-colors duration-300"
      style={{
        background: "var(--bg-page)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "0 clamp(12px, 3vw, 32px)",
      }}
    >
      {/* Brand — clickable home link */}
      <button
        onClick={() => navigateTo(user ? "home" : "landing")}
        className="flex items-center gap-3 shrink-0 bg-transparent border-none cursor-pointer p-0"
        style={{ fontFamily: "inherit" }}
      >
        <div
          className="text-[13px] font-semibold tracking-[0.04em] uppercase whitespace-nowrap"
          style={{ color: "var(--text)" }}
        >
          Division Alpha
        </div>
        <div
          className="text-[10px] px-1.5 py-[2px] hidden sm:block"
          style={{
            fontFamily: "var(--font-dm-mono), monospace",
            color: "var(--text-muted)",
            background: "var(--surface)",
            borderRadius: "2px",
          }}
        >
          S3 W4
        </div>
      </button>

      {/* Desktop nav — hidden on mobile, hidden on public pages */}
      <div className="hidden md:flex items-center gap-0" style={{ display: showFullNav ? undefined : "none" }}>
        {PRIMARY_NAV.map((item) => (
          <button
            key={item.page}
            onClick={() => navigateTo(item.page)}
            className="bg-transparent border-none text-[12px] font-medium px-2 lg:px-2.5 py-2 cursor-pointer relative transition-colors duration-150 whitespace-nowrap"
            style={{
              color: currentPage === item.page ? "var(--text)" : "var(--text-muted)",
            }}
          >
            {item.label}
            {currentPage === item.page && (
              <span
                className="absolute bottom-[-1px] left-2 right-2 h-[1.5px]"
                style={{ background: "var(--accent)" }}
              />
            )}
          </button>
        ))}

        {/* More dropdown */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="bg-transparent border-none text-[12px] font-medium px-2 lg:px-2.5 py-2 cursor-pointer relative transition-colors duration-150"
            style={{
              color: isMoreActive ? "var(--text)" : "var(--text-muted)",
            }}
          >
            &middot;&middot;&middot;
            {isMoreActive && (
              <span
                className="absolute bottom-[-1px] left-2 right-2 h-[1.5px]"
                style={{ background: "var(--accent)" }}
              />
            )}
          </button>
          {moreOpen && (
            <div
              className="absolute top-full right-0 mt-1 py-1 min-w-[160px]"
              style={{
                background: "var(--bg-page)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              {MORE_NAV.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    navigateTo(item.page);
                    setMoreOpen(false);
                  }}
                  className="w-full text-left bg-transparent border-none text-[12px] font-medium px-4 py-2.5 cursor-pointer transition-colors duration-150"
                  style={{
                    color: currentPage === item.page ? "var(--accent)" : "var(--text-secondary)",
                    fontFamily: "inherit",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="w-px h-5 mx-1.5"
          style={{ background: "var(--border-subtle)" }}
        />
      </div>

      {/* Action buttons — hidden on public pages when not authenticated */}
      <div className="flex items-center gap-1" style={{ display: showFullNav ? undefined : "none" }}>
        <button
          onClick={() => setScoreOpen(true)}
          className="w-7 h-7 flex items-center justify-center text-xs cursor-pointer transition-all duration-150"
          style={{
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text-muted)",
            borderRadius: "2px",
          }}
          title="Operator Score"
          aria-label="View Operator Score"
        >
          &#9670;
        </button>

        <button
          onClick={toggleTheme}
          className="w-7 h-7 flex items-center justify-center text-xs cursor-pointer transition-all duration-150"
          style={{
            border: "1px solid var(--border)",
            background: "none",
            color: "var(--text-muted)",
            borderRadius: "2px",
          }}
          aria-label="Toggle theme"
        >
          {theme === "light" ? "\u2604" : "\u263E"}
        </button>

        <button
          onClick={() => navigateTo("settings")}
          className="w-7 h-7 flex items-center justify-center text-[10px] font-semibold cursor-pointer transition-all duration-150 rounded-full ml-1"
          style={{
            background: currentPage === "settings" ? "var(--accent)" : "var(--surface-hover)",
            color: currentPage === "settings" ? "var(--accent-text)" : "var(--text-secondary)",
            border: "none",
          }}
          aria-label="Settings"
        >
          AM
        </button>
      </div>
    </header>
  );
}
