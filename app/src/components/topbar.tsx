"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { useAuth } from "@/lib/auth-context";
import { useApp } from "@/lib/app-context";
import { useTierState } from "@/lib/hooks/use-tier-state";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useTheme } from "./theme-provider";

const PRIMARY_NAV = [
  { page: "boss" as const, label: "Boss" },
  { page: "journey" as const, label: "Journey" },
  { page: "squad" as const, label: "Squad" },
  { page: "coach" as const, label: "Coach" },
  { page: "proof" as const, label: "Proof" },
];

const MORE_NAV = [
  { page: "settings" as const, label: "Settings" },
  { page: "admin" as const, label: "Admin" },
];

export function Topbar() {
  const { currentPage, navigateTo, setScoreOpen } = useNavigation();
  const { user, signOut } = useAuth();
  const { profile, sprint } = useApp();
  const tier = useTierState();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, notifications, markAllRead, markRead } = useNotifications();
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const isPublicPage = ["landing", "login", "apply"].includes(currentPage);
  const showMemberShell = !!user && !isPublicPage;
  const initials = profile?.initials || profile?.display_name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "DA";
  const tierLabel = tier.activeTier.toUpperCase();
  const visibleMoreNav = MORE_NAV.filter((item) => item.page !== "admin" || profile?.role === "admin" || profile?.role === "founder");
  const isMoreActive = visibleMoreNav.some((item) => item.page === currentPage);

  useEffect(() => {
    if (!moreOpen && !notifOpen && !avatarOpen) return;

    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (moreRef.current && !moreRef.current.contains(target)) setMoreOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(target)) setAvatarOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen, notifOpen, avatarOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 h-[56px] flex items-center justify-between z-[100]"
      style={{
        background: "var(--bg-page)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "0 clamp(12px, 3vw, 28px)",
      }}
    >
      <button
        onClick={() => navigateTo(user ? "boss" : "landing")}
        className="flex items-center gap-3 shrink-0 bg-transparent border-none cursor-pointer p-0"
        style={{ fontFamily: "inherit" }}
      >
        <div>
          <div className="text-[13px] font-semibold tracking-[0.04em] uppercase" style={{ color: "var(--text)" }}>
            Division Alpha
          </div>
          <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
            Step into the arena
          </div>
        </div>
        {showMemberShell && (
          <div
            className="hidden sm:block py-1.5 px-2"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "2px" }}
          >
            <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}>
              {tierLabel}
            </div>
            <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
              {sprint ? `S${sprint.number} · W${sprint.current_week}` : "Waiting"}
            </div>
          </div>
        )}
      </button>

      <div className="hidden md:flex items-center gap-0" style={{ display: showMemberShell ? undefined : "none" }}>
        {PRIMARY_NAV.map((item) => (
          <button
            key={item.page}
            onClick={() => navigateTo(item.page)}
            className="bg-transparent border-none text-[12px] font-medium px-2.5 py-2 cursor-pointer relative"
            style={{ color: currentPage === item.page ? "var(--text)" : "var(--text-muted)" }}
          >
            {item.label}
            {currentPage === item.page && (
              <span className="absolute bottom-[-1px] left-2 right-2 h-[1.5px]" style={{ background: "var(--accent)" }} />
            )}
          </button>
        ))}

        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setMoreOpen((open) => !open)}
            className="bg-transparent border-none text-[12px] font-medium px-2.5 py-2 cursor-pointer relative"
            style={{ color: isMoreActive ? "var(--text)" : "var(--text-muted)" }}
          >
            More
            {isMoreActive && (
              <span className="absolute bottom-[-1px] left-2 right-2 h-[1.5px]" style={{ background: "var(--accent)" }} />
            )}
          </button>
          {moreOpen && (
            <div
              className="absolute top-full right-0 mt-1 py-1 min-w-[150px]"
              style={{ background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "4px", boxShadow: "var(--shadow-lg)" }}
            >
              {visibleMoreNav.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    navigateTo(item.page);
                    setMoreOpen(false);
                  }}
                  className="w-full text-left bg-transparent border-none text-[12px] font-medium px-4 py-2.5 cursor-pointer"
                  style={{ color: currentPage === item.page ? "var(--accent)" : "var(--text-secondary)", fontFamily: "inherit" }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 mx-1.5" style={{ background: "var(--border-subtle)" }} />
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center text-xs cursor-pointer"
          style={{ border: "1px solid var(--border)", background: "none", color: "var(--text-muted)", borderRadius: "2px" }}
          aria-label="Toggle theme"
        >
          {theme === "light" ? "\u263E" : "\u2600"}
        </button>

        {showMemberShell && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen((open) => !open);
                if (!notifOpen) markAllRead();
              }}
              className="w-9 h-9 flex items-center justify-center text-xs cursor-pointer relative"
              style={{ border: "1px solid var(--border)", background: notifOpen ? "var(--surface)" : "none", color: "var(--text-muted)", borderRadius: "2px" }}
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

            {notifOpen && (
              <div
                className="absolute right-0 top-[40px] w-[calc(100vw-24px)] max-w-[300px] max-h-[400px] overflow-y-auto z-[150]"
                style={{ background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "4px", boxShadow: "var(--shadow-lg)" }}
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
                  notifications.slice(0, 10).map((notification: any) => (
                    <button
                      key={notification.id}
                      onClick={() => {
                        markRead(notification.id);
                        if (notification.action_page) navigateTo(notification.action_page);
                        setNotifOpen(false);
                      }}
                      className="w-full text-left py-3 px-3 cursor-pointer transition-colors duration-150 bg-transparent border-none"
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        background: notification.read ? "transparent" : "var(--accent-surface)",
                        fontFamily: "inherit",
                      }}
                    >
                      <div className="text-[13px] font-medium mb-0.5" style={{ color: "var(--text)" }}>
                        {notification.title}
                      </div>
                      {notification.body && (
                        <div className="text-[11px] leading-[1.45]" style={{ color: "var(--text-muted)" }}>
                          {notification.body}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {showMemberShell && (
          <button
            onClick={() => setScoreOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-xs cursor-pointer"
            style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", borderRadius: "2px" }}
            title="Operator Score"
            aria-label="View Operator Score"
          >
            &#9670;
          </button>
        )}

        {showMemberShell && (
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => setAvatarOpen((open) => !open)}
              className="w-9 h-9 flex items-center justify-center text-[10px] font-semibold cursor-pointer rounded-full ml-1"
              style={{
                background: currentPage === "settings" || avatarOpen ? "var(--accent)" : "var(--surface-hover)",
                color: currentPage === "settings" || avatarOpen ? "var(--accent-text)" : "var(--text-secondary)",
                border: "none",
              }}
              aria-label="Account menu"
            >
              {initials}
            </button>
            {avatarOpen && (
              <div
                className="absolute top-full right-0 mt-1 py-1 min-w-[160px]"
                style={{ background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "4px", boxShadow: "var(--shadow-lg)" }}
              >
                <div className="px-4 py-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <div className="text-[12px] font-medium">{profile?.display_name || "Operator"}</div>
                  <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                    {tierLabel} · score {tier.score}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigateTo("settings");
                    setAvatarOpen(false);
                  }}
                  className="w-full text-left bg-transparent border-none text-[12px] font-medium px-4 py-2.5 cursor-pointer"
                  style={{ color: "var(--text-secondary)", fontFamily: "inherit" }}
                >
                  Settings
                </button>
                {(profile?.role === "admin" || profile?.role === "founder") && (
                  <button
                    onClick={() => {
                      navigateTo("admin");
                      setAvatarOpen(false);
                    }}
                    className="w-full text-left bg-transparent border-none text-[12px] font-medium px-4 py-2.5 cursor-pointer"
                    style={{ color: "var(--text-secondary)", fontFamily: "inherit" }}
                  >
                    Admin
                  </button>
                )}
                <div style={{ borderTop: "1px solid var(--border-subtle)", margin: "2px 0" }} />
                <button
                  onClick={async () => {
                    setAvatarOpen(false);
                    await signOut();
                    navigateTo("landing");
                  }}
                  className="w-full text-left bg-transparent border-none text-[12px] font-medium px-4 py-2.5 cursor-pointer"
                  style={{ color: "var(--red)", fontFamily: "inherit" }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
