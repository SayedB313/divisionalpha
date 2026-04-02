"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigation, type Page } from "@/lib/navigation-context";
import { useAuth } from "@/lib/auth-context";
import { useApp } from "@/lib/app-context";
import { useTierState } from "@/lib/hooks/use-tier-state";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useTheme } from "./theme-provider";

const PUBLIC_PAGES = new Set(["landing", "login", "apply"]);

const PRIMARY_NAV = [
  { page: "boss" as const, label: "Boss", short: "B", note: "Daily command" },
  { page: "journey" as const, label: "Journey", short: "J", note: "40-day line" },
  { page: "squad" as const, label: "Squad", short: "S", note: "Earned room" },
  { page: "coach" as const, label: "Coach", short: "C", note: "Private thread" },
  { page: "proof" as const, label: "Proof", short: "P", note: "Score and ladder" },
];

const SECONDARY_NAV = [
  { page: "settings" as const, label: "Settings", short: "T", note: "Account and prefs" },
  { page: "admin" as const, label: "Admin", short: "A", note: "Control room" },
];

const railCopyClass =
  "min-w-0 overflow-hidden whitespace-nowrap transition-all duration-150 opacity-0 translate-x-2 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-focus-within/sidebar:opacity-100 group-focus-within/sidebar:translate-x-0";

function formatPageLabel(page: Page) {
  return page.charAt(0).toUpperCase() + page.slice(1);
}

function getInitials(displayName?: string | null, fallback = "DA") {
  if (!displayName) return fallback;
  const initials = displayName
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || fallback;
}

export function Topbar() {
  const { currentPage, navigateTo, setScoreOpen } = useNavigation();
  const { user, signOut } = useAuth();
  const { profile, sprint } = useApp();
  const tier = useTierState();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, notifications, markAllRead, markRead } = useNotifications();
  const [mobileNotifOpen, setMobileNotifOpen] = useState(false);
  const [mobileAvatarOpen, setMobileAvatarOpen] = useState(false);
  const [desktopNotifOpen, setDesktopNotifOpen] = useState(false);
  const [desktopAvatarOpen, setDesktopAvatarOpen] = useState(false);
  const mobileNotifRef = useRef<HTMLDivElement>(null);
  const mobileAvatarRef = useRef<HTMLDivElement>(null);
  const desktopNotifRef = useRef<HTMLDivElement>(null);
  const desktopAvatarRef = useRef<HTMLDivElement>(null);

  const isPublicPage = PUBLIC_PAGES.has(currentPage);
  const showMemberShell = Boolean(user) && !isPublicPage;
  const initials = profile?.initials || getInitials(profile?.display_name);
  const tierLabel = tier.activeTier.toUpperCase();
  const pageLabel = formatPageLabel(currentPage);
  const visibleSecondaryNav = SECONDARY_NAV.filter((item) => item.page !== "admin" || profile?.role === "admin" || profile?.role === "founder");

  useEffect(() => {
    if (!mobileNotifOpen && !mobileAvatarOpen && !desktopNotifOpen && !desktopAvatarOpen) return;

    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideNotifications = [mobileNotifRef.current, desktopNotifRef.current].some((node) => node?.contains(target));
      const insideAccount = [mobileAvatarRef.current, desktopAvatarRef.current].some((node) => node?.contains(target));

      if (!insideNotifications) {
        setMobileNotifOpen(false);
        setDesktopNotifOpen(false);
      }

      if (!insideAccount) {
        setMobileAvatarOpen(false);
        setDesktopAvatarOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileNotifOpen, mobileAvatarOpen, desktopNotifOpen, desktopAvatarOpen]);

  const handleNavigate = (page: Page) => {
    setMobileNotifOpen(false);
    setMobileAvatarOpen(false);
    setDesktopNotifOpen(false);
    setDesktopAvatarOpen(false);
    navigateTo(page);
  };

  const handleNotificationClick = async (notification: any) => {
    await markRead(notification.id);
    if (notification.action_page) navigateTo(notification.action_page);
    setMobileNotifOpen(false);
    setDesktopNotifOpen(false);
  };

  const notificationPanel = (
    <div
      className="w-[calc(100vw-24px)] max-w-[320px] overflow-hidden"
      style={{
        background: "var(--bg-page)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div
          className="text-[10px] uppercase tracking-[0.08em]"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          Notifications
        </div>
        {notifications.length > 0 && (
          <button
            onClick={async () => {
              await markAllRead();
              setMobileNotifOpen(false);
              setDesktopNotifOpen(false);
            }}
            className="bg-transparent border-none text-[10px] cursor-pointer"
            style={{ color: "var(--accent)", fontFamily: "inherit" }}
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="px-4 py-6 text-[13px]" style={{ color: "var(--text-muted)" }}>
          No notifications yet.
        </div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto">
          {notifications.slice(0, 10).map((notification: any) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className="w-full cursor-pointer border-none bg-transparent px-4 py-3 text-left transition-colors duration-150"
              style={{
                background: notification.read ? "transparent" : "var(--accent-surface)",
                borderBottom: "1px solid var(--border-subtle)",
                fontFamily: "inherit",
              }}
            >
              <div className="mb-1 text-[13px] font-medium" style={{ color: "var(--text)" }}>
                {notification.title}
              </div>
              {notification.body && (
                <div className="text-[11px] leading-[1.55]" style={{ color: "var(--text-muted)" }}>
                  {notification.body}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const accountPanel = (
    <div
      className="min-w-[220px] overflow-hidden"
      style={{
        background: "var(--bg-page)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="text-[13px] font-medium">{profile?.display_name || "Operator"}</div>
        <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
          {tierLabel} · score {tier.score}
        </div>
      </div>
      <button
        onClick={() => handleNavigate("settings")}
        className="w-full cursor-pointer border-none bg-transparent px-4 py-3 text-left text-[12px] font-medium"
        style={{ color: "var(--text-secondary)", fontFamily: "inherit", borderBottom: "1px solid var(--border-subtle)" }}
      >
        Settings
      </button>
      {(profile?.role === "admin" || profile?.role === "founder") && (
        <button
          onClick={() => handleNavigate("admin")}
          className="w-full cursor-pointer border-none bg-transparent px-4 py-3 text-left text-[12px] font-medium"
          style={{ color: "var(--text-secondary)", fontFamily: "inherit", borderBottom: "1px solid var(--border-subtle)" }}
        >
          Admin
        </button>
      )}
      <button
        onClick={async () => {
          setMobileAvatarOpen(false);
          setDesktopAvatarOpen(false);
          await signOut();
          navigateTo("landing");
        }}
        className="w-full cursor-pointer border-none bg-transparent px-4 py-3 text-left text-[12px] font-medium"
        style={{ color: "var(--red)", fontFamily: "inherit" }}
      >
        Sign Out
      </button>
    </div>
  );

  if (!showMemberShell) {
    return (
      <header
        className="fixed top-0 left-0 right-0 z-[110] flex h-[56px] items-center justify-between px-4 md:px-7"
        style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--border-subtle)" }}
      >
        <button
          onClick={() => navigateTo("landing")}
          className="bg-transparent border-none cursor-pointer text-left p-0"
          style={{ fontFamily: "inherit" }}
        >
          <div className="text-[13px] font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--text)" }}>
            Division Alpha
          </div>
          <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
            Step into the arena
          </div>
        </button>

        <div className="flex items-center gap-2">
          {currentPage !== "login" && (
            <button
              onClick={() => navigateTo("login")}
              className="hidden sm:inline-flex cursor-pointer items-center justify-center border-none px-3 py-2 text-[12px] font-medium"
              style={{ background: "transparent", color: "var(--text-secondary)", fontFamily: "inherit" }}
            >
              Login
            </button>
          )}
          {currentPage !== "apply" && (
            <button
              onClick={() => navigateTo("apply")}
              className="cursor-pointer items-center justify-center px-3 py-2 text-[12px] font-medium"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "3px",
                color: "var(--text-secondary)",
                fontFamily: "inherit",
              }}
            >
              Apply
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-xs"
            style={{ border: "1px solid var(--border)", background: "none", color: "var(--text-muted)", borderRadius: "3px" }}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "light" ? "M" : "L"}
          </button>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[110] flex h-[56px] items-center justify-between px-4 md:hidden"
        style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--border-subtle)" }}
      >
        <button
          onClick={() => handleNavigate("boss")}
          className="bg-transparent border-none cursor-pointer text-left p-0"
          style={{ fontFamily: "inherit" }}
        >
          <div className="text-[13px] font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--text)" }}>
            Division Alpha
          </div>
          <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
            {pageLabel} · {tierLabel}
          </div>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-xs"
            style={{ border: "1px solid var(--border)", background: "none", color: "var(--text-muted)", borderRadius: "3px" }}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "light" ? "M" : "L"}
          </button>

          <div className="relative" ref={mobileNotifRef}>
            <button
              onClick={() => setMobileNotifOpen((open) => !open)}
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center text-xs"
              style={{
                border: "1px solid var(--border)",
                background: mobileNotifOpen ? "var(--surface)" : "none",
                color: "var(--text-muted)",
                borderRadius: "3px",
              }}
              aria-label="Notifications"
              title="Notifications"
            >
              N
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[14px] rounded-full px-[3px] text-[8px] font-bold"
                  style={{ background: "var(--red)", color: "#fff" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {mobileNotifOpen && <div className="absolute right-0 top-[42px]">{notificationPanel}</div>}
          </div>

          <button
            onClick={() => setScoreOpen(true)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-xs"
            style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", borderRadius: "3px" }}
            aria-label="View Operator Score"
            title="View Operator Score"
          >
            S
          </button>

          <div className="relative" ref={mobileAvatarRef}>
            <button
              onClick={() => setMobileAvatarOpen((open) => !open)}
              className="ml-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[10px] font-semibold"
              style={{
                background: mobileAvatarOpen || currentPage === "settings" ? "var(--accent)" : "var(--surface-hover)",
                color: mobileAvatarOpen || currentPage === "settings" ? "var(--accent-text)" : "var(--text-secondary)",
                border: "none",
              }}
              aria-label="Account menu"
              title="Account menu"
            >
              {initials}
            </button>
            {mobileAvatarOpen && <div className="absolute right-0 top-[42px]">{accountPanel}</div>}
          </div>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-[120] hidden md:block w-[var(--shell-rail)]">
        <div className="group/sidebar relative h-full w-[var(--shell-rail)] overflow-visible">
          <div
            className="absolute inset-y-0 left-0 flex h-full w-[var(--shell-rail)] flex-col justify-between overflow-hidden transition-[width] duration-200 ease-out group-hover/sidebar:w-[var(--shell-flyout)] group-focus-within/sidebar:w-[var(--shell-flyout)]"
            style={{
              background: "color-mix(in srgb, var(--bg-page) 94%, var(--surface) 6%)",
              borderRight: "1px solid var(--border-subtle)",
              boxShadow: "0 18px 32px rgba(28, 26, 21, 0.06)",
            }}
          >
            <div className="flex flex-col gap-6 px-4 py-5">
              <button
                onClick={() => handleNavigate("boss")}
                className="flex w-full items-center gap-3 bg-transparent border-none cursor-pointer p-0 text-left"
                style={{ fontFamily: "inherit" }}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center text-[11px] font-semibold uppercase tracking-[0.08em]"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text)" }}
                >
                  DA
                </div>
                <div className={railCopyClass}>
                  <div className="text-[13px] font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--text)" }}>
                    Division Alpha
                  </div>
                  <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                    Step into the arena
                  </div>
                </div>
              </button>

              <div
                className="flex items-center gap-3 rounded-[4px] px-1 py-1"
                style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center text-[11px] font-medium"
                  style={{ background: "var(--accent-surface)", border: "1px solid var(--accent)", borderRadius: "3px", color: "var(--accent)" }}
                >
                  {tierLabel.slice(0, 1)}
                </div>
                <div className={railCopyClass}>
                  <div className="text-[10px] uppercase tracking-[0.08em]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}>
                    {tierLabel}
                  </div>
                  <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    {sprint ? `Sprint ${sprint.number} · Week ${sprint.current_week}` : "Waiting on sprint"}
                  </div>
                </div>
              </div>

              <div>
                <div className={`mb-3 px-1 text-[10px] uppercase tracking-[0.08em] ${railCopyClass}`} style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                  Command center
                </div>
                <div className="space-y-1">
                  {PRIMARY_NAV.map((item) => {
                    const active = currentPage === item.page;
                    return (
                      <button
                        key={item.page}
                        onClick={() => handleNavigate(item.page)}
                        className="relative flex w-full items-center gap-3 rounded-[4px] border-none bg-transparent px-1 py-1.5 text-left cursor-pointer"
                        style={{ fontFamily: "inherit", background: active ? "var(--accent-surface)" : "transparent" }}
                        aria-current={active ? "page" : undefined}
                        aria-label={item.label}
                        title={item.label}
                      >
                        {active && <span className="absolute left-0 top-2 bottom-2 w-[2px]" style={{ background: "var(--accent)" }} />}
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center text-[11px] font-medium"
                          style={{
                            background: active ? "var(--accent)" : "var(--surface)",
                            border: `1px solid ${active ? "var(--accent)" : "var(--border-subtle)"}`,
                            borderRadius: "3px",
                            color: active ? "var(--accent-text)" : "var(--text-muted)",
                          }}
                        >
                          {item.short}
                        </div>
                        <div className={railCopyClass}>
                          <div className="text-[13px] font-medium" style={{ color: active ? "var(--text)" : "var(--text-secondary)" }}>
                            {item.label}
                          </div>
                          <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                            {item.note}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className={`mb-3 px-1 text-[10px] uppercase tracking-[0.08em] ${railCopyClass}`} style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                  Settings
                </div>
                <div className="space-y-1">
                  {visibleSecondaryNav.map((item) => {
                    const active = currentPage === item.page;
                    return (
                      <button
                        key={item.page}
                        onClick={() => handleNavigate(item.page)}
                        className="relative flex w-full items-center gap-3 rounded-[4px] border-none bg-transparent px-1 py-1.5 text-left cursor-pointer"
                        style={{ fontFamily: "inherit", background: active ? "var(--accent-surface)" : "transparent" }}
                        aria-current={active ? "page" : undefined}
                        aria-label={item.label}
                        title={item.label}
                      >
                        {active && <span className="absolute left-0 top-2 bottom-2 w-[2px]" style={{ background: "var(--accent)" }} />}
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center text-[11px] font-medium"
                          style={{
                            background: active ? "var(--accent)" : "var(--surface)",
                            border: `1px solid ${active ? "var(--accent)" : "var(--border-subtle)"}`,
                            borderRadius: "3px",
                            color: active ? "var(--accent-text)" : "var(--text-muted)",
                          }}
                        >
                          {item.short}
                        </div>
                        <div className={railCopyClass}>
                          <div className="text-[13px] font-medium" style={{ color: active ? "var(--text)" : "var(--text-secondary)" }}>
                            {item.label}
                          </div>
                          <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                            {item.note}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-4 pb-5">
              <div
                className="rounded-[4px] p-2"
                style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="space-y-1">
                  <button
                    onClick={() => setScoreOpen(true)}
                    className="flex w-full items-center gap-3 rounded-[4px] border-none bg-transparent px-1 py-1.5 text-left cursor-pointer"
                    style={{ fontFamily: "inherit" }}
                    aria-label="View Operator Score"
                    title="View Operator Score"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center text-[11px] font-medium"
                      style={{ background: "var(--accent-surface)", border: "1px solid var(--accent)", borderRadius: "3px", color: "var(--accent)" }}
                    >
                      S
                    </div>
                    <div className={railCopyClass}>
                      <div className="text-[13px] font-medium" style={{ color: "var(--text)" }}>
                        Operator Score
                      </div>
                      <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                        Score {tier.score} · streak {tier.currentStreak}
                      </div>
                    </div>
                  </button>

                  <div className="relative" ref={desktopNotifRef}>
                    <button
                      onClick={() => setDesktopNotifOpen((open) => !open)}
                      className="relative flex w-full items-center gap-3 rounded-[4px] border-none bg-transparent px-1 py-1.5 text-left cursor-pointer"
                      style={{ fontFamily: "inherit" }}
                      aria-label="Notifications"
                      title="Notifications"
                    >
                      <div
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center text-[11px] font-medium"
                        style={{ background: desktopNotifOpen ? "var(--accent-surface)" : "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "3px", color: "var(--text-muted)" }}
                      >
                        N
                        {unreadCount > 0 && (
                          <span
                            className="absolute -top-1 -right-1 min-w-[14px] rounded-full px-[3px] text-[8px] font-bold"
                            style={{ background: "var(--red)", color: "#fff" }}
                          >
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </div>
                      <div className={railCopyClass}>
                        <div className="text-[13px] font-medium" style={{ color: "var(--text)" }}>
                          Notifications
                        </div>
                        <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                          {unreadCount > 0 ? `${unreadCount} unread` : "Inbox is clear"}
                        </div>
                      </div>
                    </button>

                    {desktopNotifOpen && <div className="absolute bottom-0 left-full ml-3">{notificationPanel}</div>}
                  </div>

                  <button
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 rounded-[4px] border-none bg-transparent px-1 py-1.5 text-left cursor-pointer"
                    style={{ fontFamily: "inherit" }}
                    aria-label="Toggle theme"
                    title="Toggle theme"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center text-[11px] font-medium"
                      style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "3px", color: "var(--text-muted)" }}
                    >
                      {theme === "light" ? "M" : "L"}
                    </div>
                    <div className={railCopyClass}>
                      <div className="text-[13px] font-medium" style={{ color: "var(--text)" }}>
                        Appearance
                      </div>
                      <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                        {theme === "light" ? "Morning review" : "Evening review"}
                      </div>
                    </div>
                  </button>

                  <div className="relative" ref={desktopAvatarRef}>
                    <button
                      onClick={() => setDesktopAvatarOpen((open) => !open)}
                      className="flex w-full items-center gap-3 rounded-[4px] border-none bg-transparent px-1 py-1.5 text-left cursor-pointer"
                      style={{ fontFamily: "inherit" }}
                      aria-label="Account menu"
                      title="Account menu"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                        style={{
                          background: desktopAvatarOpen || currentPage === "settings" ? "var(--accent)" : "var(--surface-hover)",
                          color: desktopAvatarOpen || currentPage === "settings" ? "var(--accent-text)" : "var(--text-secondary)",
                        }}
                      >
                        {initials}
                      </div>
                      <div className={railCopyClass}>
                        <div className="text-[13px] font-medium" style={{ color: "var(--text)" }}>
                          {profile?.display_name || "Operator"}
                        </div>
                        <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                          {pageLabel} · {tierLabel}
                        </div>
                      </div>
                    </button>

                    {desktopAvatarOpen && <div className="absolute bottom-0 left-full ml-3">{accountPanel}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
