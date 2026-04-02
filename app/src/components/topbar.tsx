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

/* ─── Compact nav icon (used in rail) ─── */
function NavIcon({
  label,
  short,
  active,
  size = "sm",
}: {
  label: string;
  short: string;
  active?: boolean;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-[10px]";
  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center font-medium`}
      style={{
        background: active ? "var(--accent)" : "var(--surface)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border-subtle)"}`,
        borderRadius: "3px",
        color: active ? "var(--accent-text)" : "var(--text-muted)",
      }}
      aria-label={label}
      title={label}
    >
      {short}
    </div>
  );
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
  const visibleSecondaryNav = SECONDARY_NAV.filter(
    (item) => item.page !== "admin" || profile?.role === "admin" || profile?.role === "founder"
  );

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
      className="min-w-[200px] overflow-hidden"
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

  /* ═══ PUBLIC HEADER ═══ */
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

  /* ═══ AUTHENTICATED: MOBILE HEADER ═══ */
  /* ═══ AUTHENTICATED: DESKTOP RAIL + TOP BAR ═══ */
  return (
    <>
      {/* ── Mobile header (unchanged pattern, md:hidden) ── */}
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

      {/* ── Desktop thin top bar (hidden on mobile) ── */}
      <header
        className="fixed top-0 right-0 z-[115] hidden md:flex h-[var(--shell-topbar)] items-center justify-between"
        style={{
          left: "var(--shell-rail)",
          background: "var(--bg-page)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Left: page context */}
        <div className="flex items-center gap-2 pl-5">
          <span
            className="text-[10px] uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
          >
            {pageLabel}
          </span>
          <span className="text-[10px]" style={{ color: "var(--border)" }}>·</span>
          <span
            className="text-[10px] uppercase tracking-[0.06em]"
            style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
          >
            {tierLabel}
          </span>
          {sprint && (
            <>
              <span className="text-[10px]" style={{ color: "var(--border)" }}>·</span>
              <span
                className="text-[10px]"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
              >
                Sprint {sprint.number}
              </span>
            </>
          )}
        </div>

        {/* Right: utilities */}
        <div className="flex items-center gap-1 pr-4">
          <button
            onClick={() => setScoreOpen(true)}
            className="flex h-7 cursor-pointer items-center gap-1.5 rounded-[3px] border-none px-2 text-[10px]"
            style={{
              background: "var(--accent-surface)",
              color: "var(--accent)",
              fontFamily: "var(--font-dm-mono), monospace",
            }}
            aria-label="View Operator Score"
            title="View Operator Score"
          >
            <span className="font-semibold">{tier.score}</span>
            {tier.currentStreak > 0 && (
              <span style={{ color: "var(--text-muted)" }}>
                · {tier.currentStreak}d
              </span>
            )}
          </button>

          <div className="relative" ref={desktopNotifRef}>
            <button
              onClick={() => setDesktopNotifOpen((open) => !open)}
              className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-[3px] border-none text-[10px]"
              style={{
                background: desktopNotifOpen ? "var(--surface)" : "transparent",
                color: "var(--text-muted)",
              }}
              aria-label="Notifications"
              title="Notifications"
            >
              N
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[12px] rounded-full px-[2px] text-[7px] font-bold leading-[12px] text-center"
                  style={{ background: "var(--red)", color: "#fff" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {desktopNotifOpen && <div className="absolute right-0 top-[32px]">{notificationPanel}</div>}
          </div>

          <button
            onClick={toggleTheme}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[3px] border-none text-[10px]"
            style={{ background: "transparent", color: "var(--text-muted)" }}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "light" ? "M" : "L"}
          </button>

          <div className="relative" ref={desktopAvatarRef}>
            <button
              onClick={() => setDesktopAvatarOpen((open) => !open)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none text-[9px] font-semibold"
              style={{
                background: desktopAvatarOpen || currentPage === "settings" ? "var(--accent)" : "var(--surface-hover)",
                color: desktopAvatarOpen || currentPage === "settings" ? "var(--accent-text)" : "var(--text-secondary)",
              }}
              aria-label="Account menu"
              title="Account menu"
            >
              {initials}
            </button>
            {desktopAvatarOpen && <div className="absolute right-0 top-[32px]">{accountPanel}</div>}
          </div>
        </div>
      </header>

      {/* ── Desktop compact left rail ── */}
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
            {/* Top: brand + tier + nav */}
            <div className="flex flex-col gap-3 px-2 py-3">
              {/* Brand mark */}
              <button
                onClick={() => handleNavigate("boss")}
                className="flex w-full items-center gap-2.5 bg-transparent border-none cursor-pointer p-0 px-1 text-left"
                style={{ fontFamily: "inherit" }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-[9px] font-semibold uppercase tracking-[0.08em]"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--text)" }}
                >
                  DA
                </div>
                <div className={railCopyClass}>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--text)" }}>
                    Division Alpha
                  </div>
                  <div className="text-[9px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                    Step into the arena
                  </div>
                </div>
              </button>

              {/* Tier badge */}
              <div
                className="flex items-center gap-2.5 rounded-[3px] px-1 py-0.5 mx-1"
                style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center text-[9px] font-medium"
                  style={{ background: "var(--accent-surface)", border: "1px solid var(--accent)", borderRadius: "2px", color: "var(--accent)" }}
                >
                  {tierLabel.slice(0, 1)}
                </div>
                <div className={railCopyClass}>
                  <div className="text-[9px] uppercase tracking-[0.08em]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}>
                    {tierLabel}
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                    {sprint ? `Sprint ${sprint.number} · Week ${sprint.current_week}` : "Waiting on sprint"}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-2 border-t" style={{ borderColor: "var(--border-subtle)" }} />

              {/* Primary nav */}
              <div className="space-y-0.5">
                {PRIMARY_NAV.map((item) => {
                  const active = currentPage === item.page;
                  return (
                    <button
                      key={item.page}
                      onClick={() => handleNavigate(item.page)}
                      className="relative flex w-full items-center gap-2.5 rounded-[3px] border-none bg-transparent px-1 py-1 text-left cursor-pointer"
                      style={{ fontFamily: "inherit", background: active ? "var(--accent-surface)" : "transparent" }}
                      aria-current={active ? "page" : undefined}
                      aria-label={item.label}
                      title={item.label}
                    >
                      {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px]" style={{ background: "var(--accent)" }} />}
                      <NavIcon label={item.label} short={item.short} active={active} />
                      <div className={railCopyClass}>
                        <div className="text-[12px] font-medium" style={{ color: active ? "var(--text)" : "var(--text-secondary)" }}>
                          {item.label}
                        </div>
                        <div className="text-[9px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                          {item.note}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mx-2 border-t" style={{ borderColor: "var(--border-subtle)" }} />

              {/* Secondary nav */}
              <div className="space-y-0.5">
                {visibleSecondaryNav.map((item) => {
                  const active = currentPage === item.page;
                  return (
                    <button
                      key={item.page}
                      onClick={() => handleNavigate(item.page)}
                      className="relative flex w-full items-center gap-2.5 rounded-[3px] border-none bg-transparent px-1 py-1 text-left cursor-pointer"
                      style={{ fontFamily: "inherit", background: active ? "var(--accent-surface)" : "transparent" }}
                      aria-current={active ? "page" : undefined}
                      aria-label={item.label}
                      title={item.label}
                    >
                      {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px]" style={{ background: "var(--accent)" }} />}
                      <NavIcon label={item.label} short={item.short} active={active} />
                      <div className={railCopyClass}>
                        <div className="text-[12px] font-medium" style={{ color: active ? "var(--text)" : "var(--text-secondary)" }}>
                          {item.label}
                        </div>
                        <div className="text-[9px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                          {item.note}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom: sign out */}
            <div className="px-2 pb-3">
              <button
                onClick={async () => {
                  await signOut();
                  navigateTo("landing");
                }}
                className="flex w-full items-center gap-2.5 rounded-[3px] border-none bg-transparent px-1 py-1 text-left cursor-pointer"
                style={{ fontFamily: "inherit" }}
                aria-label="Sign Out"
                title="Sign Out"
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-medium"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "3px",
                    color: "var(--text-muted)",
                  }}
                >
                  X
                </div>
                <div className={railCopyClass}>
                  <div className="text-[12px] font-medium" style={{ color: "var(--red)" }}>
                    Sign Out
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
