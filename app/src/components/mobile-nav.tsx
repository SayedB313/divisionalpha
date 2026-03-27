"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { useAuth } from "@/lib/auth-context";

const MOBILE_ITEMS = [
  { page: "home" as const, icon: "\u25A0", label: "Home" },
  { page: "declare" as const, icon: "\u270E", label: "Declare" },
  { page: "checkin" as const, icon: "\u25CF", label: "Signal" },
  { page: "reflect" as const, icon: "\u269B", label: "Reflect" },
  { page: "squad" as const, icon: "\u25C9", label: "Squad" },
];

const MORE_ITEMS = [
  { page: "coach" as const, label: "Coach" },
  { page: "leaderboard" as const, label: "Leaderboard" },
  { page: "kickoff" as const, label: "Sprint Kickoff" },
  { page: "completion" as const, label: "Sprint Completion" },
  { page: "apply" as const, label: "Apply" },
  { page: "settings" as const, label: "Settings" },
];

export function MobileNav() {
  const { currentPage, navigateTo } = useNavigation();
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Hide mobile nav on public pages when not authenticated
  const isPublicPage = ["landing", "login", "apply"].includes(currentPage);

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

  if (!user && isPublicPage) return null;

  const isMoreActive = MORE_ITEMS.some((item) => item.page === currentPage);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-[52px] flex md:hidden justify-around items-center z-[100] transition-colors duration-300"
      style={{
        background: "var(--bg-page)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      {MOBILE_ITEMS.map((item) => (
        <button
          key={item.page}
          onClick={() => navigateTo(item.page)}
          className="bg-transparent border-none text-[10px] cursor-pointer px-2 py-2 flex flex-col items-center gap-0.5 transition-colors duration-150 min-w-[44px] min-h-[44px] justify-center"
          style={{
            color: currentPage === item.page ? "var(--accent)" : "var(--text-muted)",
          }}
        >
          <span className="text-base">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}

      {/* More menu */}
      <div className="relative" ref={moreRef}>
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className="bg-transparent border-none text-[10px] cursor-pointer px-2 py-2 flex flex-col items-center gap-0.5 transition-colors duration-150 min-w-[44px] min-h-[44px] justify-center"
          style={{
            color: isMoreActive ? "var(--accent)" : "var(--text-muted)",
          }}
        >
          <span className="text-base">&middot;&middot;&middot;</span>
          <span>More</span>
        </button>
        {moreOpen && (
          <div
            className="absolute bottom-full right-0 mb-2 py-1 min-w-[180px]"
            style={{
              background: "var(--bg-page)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {MORE_ITEMS.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  navigateTo(item.page);
                  setMoreOpen(false);
                }}
                className="w-full text-left bg-transparent border-none text-[13px] font-medium px-4 py-3 cursor-pointer transition-colors duration-150"
                style={{
                  color: currentPage === item.page ? "var(--accent)" : "var(--text-secondary)",
                  fontFamily: "inherit",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
