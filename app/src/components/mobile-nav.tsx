"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { useAuth } from "@/lib/auth-context";
import { useApp } from "@/lib/app-context";

const MOBILE_ITEMS = [
  { page: "boss" as const, icon: "\u25A0", label: "Boss" },
  { page: "journey" as const, icon: "\u25C8", label: "Journey" },
  { page: "squad" as const, icon: "\u25C9", label: "Squad" },
  { page: "proof" as const, icon: "\u25C6", label: "Proof" },
];

const MORE_ITEMS = [
  { page: "coach" as const, label: "Coach" },
  { page: "settings" as const, label: "Settings" },
  { page: "admin" as const, label: "Admin" },
];

export function MobileNav() {
  const { currentPage, navigateTo } = useNavigation();
  const { user, signOut } = useAuth();
  const { profile } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const isPublicPage = ["landing", "login", "apply"].includes(currentPage);

  useEffect(() => {
    if (!moreOpen) return;

    const handler = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  if (!user && isPublicPage) return null;

  const isMoreActive = MORE_ITEMS.some((item) => item.page === currentPage);
  const visibleMoreItems = MORE_ITEMS.filter((item) => item.page !== "admin" || profile?.role === "admin" || profile?.role === "founder");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-[56px] flex md:hidden justify-around items-center z-[100]"
      style={{ background: "var(--bg-page)", borderTop: "1px solid var(--border-subtle)" }}
    >
      {MOBILE_ITEMS.map((item) => (
        <button
          key={item.page}
          onClick={() => navigateTo(item.page)}
          className="bg-transparent border-none text-[10px] cursor-pointer px-2 py-2 flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center"
          style={{ color: currentPage === item.page ? "var(--accent)" : "var(--text-muted)" }}
        >
          <span className="text-base">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}

      <div className="relative" ref={moreRef}>
        <button
          onClick={() => setMoreOpen((open) => !open)}
          className="bg-transparent border-none text-[10px] cursor-pointer px-2 py-2 flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center"
          style={{ color: isMoreActive ? "var(--accent)" : "var(--text-muted)" }}
        >
          <span className="text-base">&middot;&middot;&middot;</span>
          <span>More</span>
        </button>
        {moreOpen && (
          <div
            className="absolute bottom-full right-0 mb-2 py-1 min-w-[180px]"
            style={{ background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "4px", boxShadow: "var(--shadow-lg)" }}
          >
            {visibleMoreItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  navigateTo(item.page);
                  setMoreOpen(false);
                }}
                className="w-full text-left bg-transparent border-none text-[13px] font-medium px-4 py-3 cursor-pointer"
                style={{ color: currentPage === item.page ? "var(--accent)" : "var(--text-secondary)", fontFamily: "inherit", borderBottom: "1px solid var(--border-subtle)" }}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={async () => {
                setMoreOpen(false);
                await signOut();
                navigateTo("landing");
              }}
              className="w-full text-left bg-transparent border-none text-[13px] font-medium px-4 py-3 cursor-pointer"
              style={{ color: "var(--red)", fontFamily: "inherit" }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
