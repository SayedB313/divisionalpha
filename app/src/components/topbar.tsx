"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/hooks/use-notifications";
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
  { page: "admin" as const, label: "Admin Dashboard" },
];

export function Topbar() {
  const { currentPage, navigateTo, setScoreOpen } = useNavigation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, notifications, markAllRead, markRead } = useNotifications();
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

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

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* Theme toggle — always visible */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center text-xs cursor-pointer transition-all duration-150"
          style={{
            border: "1px solid var(--border)",
            background: "none",
            color: "var(--text-muted)",
            borderRadius: "2px",
          }}
          aria-label="Toggle theme"
        >
          {theme === "light" ? "\u263E" : "\u2600"}
        </button>

        {/* Notification bell — only when authenticated */}
        {showFullNav && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllRead(); }}
              className="w-9 h-9 flex items-center justify-center text-xs cursor-pointer transition-all duration-150 relative"
              style={{
                border: "1px solid var(--border)",
                background: notifOpen ? "var(--surface)" : "none",
                color: "var(--text-muted)",
                borderRadius: "2px",
              }}
              aria-label="Notifications"
            >
              &#9993;
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center text-[8px] font-bold rounded-full"
                  style={{ background: "var(--red)", color: "#fff", padding: "0 3px" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {notifOpen && (
              <div
                className="absolute right-0 top-[40px] w-[calc(100vw-24px)] max-w-[300px] max-h-[400px] overflow-y-auto z-[150]"
                style={{
                  background: "var(--bg-page)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  boxShadow: "var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.12))",
                }}
              >
                <div className="flex items-center justify-between py-2.5 px-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <span className="text-[11px] font-medium uppercase tracking-[0.06em]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                    Notifications
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] bg-transparent border-none cursor-pointer"
                      style={{ color: "var(--accent)", fontFamily: "inherit" }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n: any) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        if (n.action_page) navigateTo(n.action_page);
                        setNotifOpen(false);
                      }}
                      className="w-full text-left py-3 px-3 cursor-pointer transition-colors duration-150 bg-transparent border-none"
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        background: n.read ? "transparent" : "var(--accent-surface)",
                        fontFamily: "inherit",
                      }}
                    >
                      <div className="text-[13px] font-medium mb-0.5" style={{ color: "var(--text)" }}>
                        {n.title}
                      </div>
                      {n.body && (
                        <div className="text-[11px] leading-[1.4]" style={{ color: "var(--text-muted)" }}>
                          {n.body}
                        </div>
                      )}
                      <div
                        className="text-[9px] mt-1 uppercase tracking-[0.06em]"
                        style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
                      >
                        {new Date(n.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Score + Avatar — only when authenticated */}
        {showFullNav && (
          <button
            onClick={() => setScoreOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-xs cursor-pointer transition-all duration-150"
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
        )}

        {showFullNav && (
          <button
            onClick={() => navigateTo("settings")}
            className="w-9 h-9 flex items-center justify-center text-[10px] font-semibold cursor-pointer transition-all duration-150 rounded-full ml-1"
            style={{
              background: currentPage === "settings" ? "var(--accent)" : "var(--surface-hover)",
              color: currentPage === "settings" ? "var(--accent-text)" : "var(--text-secondary)",
              border: "none",
            }}
            aria-label="Settings"
          >
            AM
          </button>
        )}
      </div>
    </header>
  );
}
