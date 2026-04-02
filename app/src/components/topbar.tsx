"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigation, type Page } from "@/lib/navigation-context";
import { useAuth } from "@/lib/auth-context";
import { useApp } from "@/lib/app-context";
import { useTierState } from "@/lib/hooks/use-tier-state";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useTheme } from "./theme-provider";
import {
  Megaphone,
  Route,
  Users,
  MessageCircle,
  Trophy,
  Bell,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react";

const PUBLIC_PAGES = new Set(["landing", "login", "apply"]);

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

/* ─── Flyout stat row ─── */
function FlyoutStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-[5px]" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <span className="text-[10px] uppercase tracking-[0.06em]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>{label}</span>
      <span className="text-[11px] font-semibold" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text)" }}>{value}</span>
    </div>
  );
}

/* ─── Rail icon with premium hover flyout card ─── */
function RailItem({
  icon: Icon,
  label,
  active,
  onClick,
  children,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  active?: boolean;
  onClick: () => void;
  children?: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group/item relative flex w-full items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onClick}
        className="relative flex items-center justify-center border-none cursor-pointer py-[6px] w-full"
        style={{ fontFamily: "inherit", background: "transparent" }}
        aria-current={active ? "page" : undefined}
        aria-label={label}
      >
        {/* Active left accent bar */}
        {active && (
          <span
            className="absolute left-0 top-[8px] bottom-[8px] w-[3px] rounded-r-full"
            style={{ background: "var(--flyout-accent-line)" }}
          />
        )}

        {/* Icon container */}
        <span
          className="flex h-[38px] w-[38px] items-center justify-center rounded-lg transition-all duration-200"
          style={{
            background: active
              ? "var(--rail-icon-active-bg)"
              : hovered
                ? "var(--rail-icon-bg)"
                : "transparent",
            color: active
              ? "var(--rail-icon-active-text)"
              : hovered
                ? "var(--text-secondary)"
                : "var(--text-muted)",
            boxShadow: active
              ? "0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)"
              : hovered
                ? "0 1px 2px rgba(0,0,0,0.06)"
                : "none",
          }}
        >
          <Icon size={18} strokeWidth={active ? 2.2 : hovered ? 1.8 : 1.5} />
        </span>
      </button>

      {/* Flyout card — editorial rich card */}
      <div
        className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 pl-3 opacity-0 translate-x-2 transition-all duration-200 group-hover/item:pointer-events-auto group-hover/item:opacity-100 group-hover/item:translate-x-0"
        style={{ zIndex: 200, transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        <div
          className="w-[280px] overflow-hidden rounded-lg"
          style={{
            background: "var(--bg-page)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg), 0 0 0 1px var(--border-subtle)",
          }}
        >
          {/* Accent top stripe */}
          <div className="h-[3px]" style={{ background: "var(--flyout-accent-line)" }} />

          {/* Content */}
          <div className="px-4 pt-3 pb-3">
            {/* Label */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex h-[22px] w-[22px] items-center justify-center rounded-md"
                style={{ background: "var(--accent-surface)", color: "var(--accent)" }}
              >
                <Icon size={12} strokeWidth={2} />
              </div>
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.1em]"
                style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
              >
                {label}
              </div>
            </div>

            {children}
          </div>
        </div>
      </div>
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
  const isAdmin = profile?.role === "admin" || profile?.role === "founder";

  useEffect(() => {
    if (!mobileNotifOpen && !mobileAvatarOpen && !desktopNotifOpen && !desktopAvatarOpen) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (![mobileNotifRef.current, desktopNotifRef.current].some((n) => n?.contains(target))) {
        setMobileNotifOpen(false);
        setDesktopNotifOpen(false);
      }
      if (![mobileAvatarRef.current, desktopAvatarRef.current].some((n) => n?.contains(target))) {
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

  /* ─── Shared notification panel ─── */
  const notificationPanel = (
    <div className="w-[calc(100vw-24px)] max-w-[320px] overflow-hidden rounded-lg" style={{ background: "var(--bg-page)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
      <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>Notifications</div>
        {notifications.length > 0 && (
          <button onClick={async () => { await markAllRead(); setMobileNotifOpen(false); setDesktopNotifOpen(false); }} className="bg-transparent border-none text-[10px] cursor-pointer" style={{ color: "var(--accent)", fontFamily: "inherit" }}>Mark all read</button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="px-4 py-6 text-[13px]" style={{ color: "var(--text-muted)" }}>No notifications yet.</div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto">
          {notifications.slice(0, 10).map((notification: any) => (
            <button key={notification.id} onClick={() => handleNotificationClick(notification)} className="w-full cursor-pointer border-none bg-transparent px-4 py-3 text-left transition-colors duration-150" style={{ background: notification.read ? "transparent" : "var(--accent-surface)", borderBottom: "1px solid var(--border-subtle)", fontFamily: "inherit" }}>
              <div className="mb-1 text-[13px] font-medium" style={{ color: "var(--text)" }}>{notification.title}</div>
              {notification.body && <div className="text-[11px] leading-[1.55]" style={{ color: "var(--text-muted)" }}>{notification.body}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  /* ─── Account dropdown panel ─── */
  const accountPanel = (
    <div className="min-w-[220px] overflow-hidden rounded-lg" style={{ background: "var(--bg-page)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
      {/* Identity header */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{profile?.display_name || "Operator"}</div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}>{tierLabel}</span>
          <span className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>score {tier.score}</span>
        </div>
      </div>
      {/* Menu items */}
      <div className="py-1">
        <button onClick={() => handleNavigate("settings")} className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-2.5 text-left text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--surface)]" style={{ color: "var(--text-secondary)", fontFamily: "inherit" }}>
          Settings
        </button>
        {isAdmin && (
          <button onClick={() => handleNavigate("admin")} className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-2.5 text-left text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--surface)]" style={{ color: "var(--text-secondary)", fontFamily: "inherit" }}>
            Control Room
          </button>
        )}
      </div>
      <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <button
          onClick={async () => { setMobileAvatarOpen(false); setDesktopAvatarOpen(false); await signOut(); navigateTo("landing"); }}
          className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-2.5 text-left text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--surface)]"
          style={{ color: "var(--red)", fontFamily: "inherit" }}
        >Sign Out</button>
      </div>
    </div>
  );

  /* ═══ PUBLIC HEADER ═══ */
  if (!showMemberShell) {
    return (
      <header
        className="fixed top-0 left-0 right-0 z-[110] flex h-[56px] items-center justify-between px-4 md:px-7"
        style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--border-subtle)" }}
      >
        <button onClick={() => navigateTo("landing")} className="bg-transparent border-none cursor-pointer text-left p-0" style={{ fontFamily: "inherit" }}>
          <div className="text-[13px] font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--text)" }}>Division Alpha</div>
          <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>Step into the arena</div>
        </button>
        <div className="flex items-center gap-2">
          {currentPage !== "login" && (
            <button onClick={() => navigateTo("login")} className="hidden sm:inline-flex cursor-pointer items-center justify-center border-none px-3 py-2 text-[12px] font-medium" style={{ background: "transparent", color: "var(--text-secondary)", fontFamily: "inherit" }}>Login</button>
          )}
          {currentPage !== "apply" && (
            <button onClick={() => navigateTo("apply")} className="cursor-pointer items-center justify-center px-3 py-2 text-[12px] font-medium" style={{ background: "var(--accent)", border: "none", borderRadius: "4px", color: "var(--accent-text)", fontFamily: "inherit" }}>Apply</button>
          )}
          <button onClick={toggleTheme} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded" style={{ border: "1px solid var(--border)", background: "none", color: "var(--text-muted)" }} aria-label="Toggle theme">
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
      </header>
    );
  }

  /* ═══ AUTHENTICATED SHELL ═══ */
  return (
    <>
      {/* ── Mobile header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-[110] flex h-[56px] items-center justify-between px-4 md:hidden"
        style={{ background: "var(--topbar-bg)", borderBottom: "1px solid var(--border-subtle)" }}
      >
        <button onClick={() => handleNavigate("boss")} className="bg-transparent border-none cursor-pointer text-left p-0" style={{ fontFamily: "inherit" }}>
          <div className="text-[13px] font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--text)" }}>Division Alpha</div>
          <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>{pageLabel} · {tierLabel}</div>
        </button>
        <div className="flex items-center gap-1">
          <button onClick={toggleTheme} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded" style={{ border: "1px solid var(--border)", background: "none", color: "var(--text-muted)" }} aria-label="Toggle theme">
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <div className="relative" ref={mobileNotifRef}>
            <button onClick={() => setMobileNotifOpen((o) => !o)} className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded" style={{ border: "1px solid var(--border)", background: mobileNotifOpen ? "var(--surface)" : "none", color: "var(--text-muted)" }} aria-label="Notifications">
              <Bell size={14} />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-[14px] rounded-full px-[3px] text-[8px] font-bold leading-[14px] text-center" style={{ background: "var(--red)", color: "#fff" }}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </button>
            {mobileNotifOpen && <div className="absolute right-0 top-[42px]">{notificationPanel}</div>}
          </div>
          <button onClick={() => setScoreOpen(true)} className="flex h-9 cursor-pointer items-center gap-1 rounded border-none px-2 text-[10px] font-semibold" style={{ background: "var(--accent-surface)", color: "var(--accent)", fontFamily: "var(--font-dm-mono), monospace" }} aria-label="View Operator Score">{tier.score}</button>
          <div className="relative" ref={mobileAvatarRef}>
            <button onClick={() => setMobileAvatarOpen((o) => !o)} className="ml-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[10px] font-semibold border-none" style={{ background: mobileAvatarOpen || currentPage === "settings" ? "var(--accent)" : "var(--surface-hover)", color: mobileAvatarOpen || currentPage === "settings" ? "var(--accent-text)" : "var(--text-secondary)" }} aria-label="Account menu">{initials}</button>
            {mobileAvatarOpen && <div className="absolute right-0 top-[42px]">{accountPanel}</div>}
          </div>
        </div>
      </header>

      {/* ── Desktop top bar ── */}
      <header
        className="fixed top-0 right-0 z-[115] hidden md:flex h-[var(--shell-topbar)] items-center justify-between"
        style={{
          left: "var(--shell-rail)",
          background: "var(--topbar-bg)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Left: breadcrumb context */}
        <div className="flex items-center gap-3 pl-5">
          <button
            onClick={() => handleNavigate("boss")}
            className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer p-0"
            style={{ fontFamily: "inherit" }}
          >
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--text)" }}>
              Division Alpha
            </span>
          </button>
          <ChevronRight size={10} style={{ color: "var(--text-muted)", opacity: 0.5 }} />
          <span
            className="text-[11px] font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {pageLabel}
          </span>
          <span className="hidden lg:inline-flex items-center gap-2">
            <span className="text-[10px]" style={{ color: "var(--border)" }}>·</span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em]"
              style={{
                background: "var(--accent-surface)",
                color: "var(--accent)",
                fontFamily: "var(--font-dm-mono), monospace",
              }}
            >
              {tierLabel}
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-mono), monospace" }}>
              {tier.activeTier === "enter"
                ? "Build your proof"
                : tier.activeTier === "proven"
                  ? "Squad earned"
                  : "Elite operator"}
            </span>
          </span>
          {sprint && (
            <span className="hidden xl:inline-flex items-center gap-2">
              <span className="text-[10px]" style={{ color: "var(--border)" }}>·</span>
              <span className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>Sprint {sprint.number} · W{sprint.current_week}</span>
            </span>
          )}
        </div>

        {/* Right: score pill, notifications, theme, account */}
        <div className="flex items-center gap-1.5 pr-4">
          {/* Score pill */}
          <button
            onClick={() => setScoreOpen(true)}
            className="flex h-[30px] cursor-pointer items-center gap-2 rounded-full border-none px-3 transition-all duration-200"
            style={{
              background: "var(--accent-surface)",
              color: "var(--accent)",
              fontFamily: "var(--font-dm-mono), monospace",
            }}
            aria-label="View Operator Score"
            title="View Operator Score"
          >
            <span className="text-[11px] font-bold">{tier.score}</span>
            {tier.currentStreak > 0 && (
              <>
                <span className="w-px h-3 rounded-full" style={{ background: "var(--border)" }} />
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{tier.currentStreak}d</span>
              </>
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={desktopNotifRef}>
            <button
              onClick={() => setDesktopNotifOpen((o) => !o)}
              className="relative flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-none transition-colors duration-200"
              style={{
                background: desktopNotifOpen ? "var(--surface)" : "transparent",
                color: "var(--text-muted)",
              }}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={15} strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full px-[3px] text-[8px] font-bold"
                  style={{ background: "var(--red)", color: "#fff" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {desktopNotifOpen && <div className="absolute right-0 top-[36px]">{notificationPanel}</div>}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-none transition-colors duration-200"
            style={{ background: "transparent", color: "var(--text-muted)" }}
            aria-label="Toggle theme"
            title={theme === "light" ? "Dark mode" : "Light mode"}
          >
            {theme === "light" ? <Moon size={15} strokeWidth={1.5} /> : <Sun size={15} strokeWidth={1.5} />}
          </button>

          {/* Account avatar */}
          <div className="relative" ref={desktopAvatarRef}>
            <button
              onClick={() => setDesktopAvatarOpen((o) => !o)}
              className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-none text-[10px] font-bold transition-all duration-200"
              style={{
                background: desktopAvatarOpen || currentPage === "settings"
                  ? "var(--accent)"
                  : "var(--surface)",
                color: desktopAvatarOpen || currentPage === "settings"
                  ? "var(--accent-text)"
                  : "var(--text-secondary)",
                border: `1px solid ${desktopAvatarOpen || currentPage === "settings" ? "var(--accent)" : "var(--border)"}`,
              }}
              aria-label="Account menu"
              title="Account menu"
            >
              {initials}
            </button>
            {desktopAvatarOpen && <div className="absolute right-0 top-[36px]">{accountPanel}</div>}
          </div>
        </div>
      </header>

      {/* ── Desktop editorial rail ── */}
      <aside
        className="fixed inset-y-0 left-0 z-[120] hidden md:flex w-[var(--shell-rail)] flex-col overflow-visible"
        style={{
          background: "var(--rail-bg)",
          borderRight: "1px solid var(--border-subtle)",
        }}
      >
        {/* Brand mark at top */}
        <div className="flex items-center justify-center pt-3 pb-2">
          <button
            onClick={() => handleNavigate("boss")}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border-none cursor-pointer text-[10px] font-black tracking-[0.04em] uppercase transition-all duration-200"
            style={{
              background: "var(--accent)",
              color: "var(--accent-text)",
              fontFamily: "inherit",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
            title="Division Alpha — Home"
          >
            DA
          </button>
        </div>

        {/* Separator */}
        <div className="mx-3 mb-1" style={{ borderTop: "1px solid var(--border-subtle)" }} />

        {/* Nav items */}
        <nav className="flex flex-col items-center gap-0.5 px-1">
          {/* ── Boss ── */}
          <RailItem icon={Megaphone} label="Boss" active={currentPage === "boss"} onClick={() => handleNavigate("boss")}>
            <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--text)" }}>Your daily command</div>
            <div className="text-[11px] leading-[1.55] mb-2" style={{ color: "var(--text-muted)" }}>
              The Boss checks in every day. Answer the pulse, move your score.
            </div>
            <FlyoutStat label="Score" value={tier.score} />
            <FlyoutStat label="Streak" value={tier.currentStreak > 0 ? `${tier.currentStreak}d` : "—"} />
          </RailItem>

          {/* ── Journey ── */}
          <RailItem icon={Route} label="Journey" active={currentPage === "journey"} onClick={() => handleNavigate("journey")}>
            <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--text)" }}>Your 40-day arc</div>
            <div className="text-[11px] leading-[1.55] mb-2" style={{ color: "var(--text-muted)" }}>
              Declarations, signals, and reflections. The rhythm that builds proof.
            </div>
            <FlyoutStat label="Sprint" value={sprint ? `Sprint ${sprint.number}` : "—"} />
            <FlyoutStat label="Week" value={sprint ? `Week ${sprint.current_week}` : "—"} />
          </RailItem>

          {/* ── Squad ── */}
          <RailItem icon={Users} label="Squad" active={currentPage === "squad"} onClick={() => handleNavigate("squad")}>
            <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--text)" }}>
              {tier.score >= 70 ? "Your earned room" : "Earned at Proven"}
            </div>
            <div className="text-[11px] leading-[1.55]" style={{ color: "var(--text-muted)" }}>
              {tier.score >= 70
                ? "4-5 proven operators. Real accountability, real stakes."
                : "Hit score 70 to unlock your squad. Keep building proof."}
            </div>
          </RailItem>

          {/* ── Coach ── */}
          <RailItem icon={MessageCircle} label="Coach" active={currentPage === "coach"} onClick={() => handleNavigate("coach")}>
            <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--text)" }}>Private thread</div>
            <div className="text-[11px] leading-[1.55]" style={{ color: "var(--text-muted)" }}>
              One-on-one with the Boss. Strategy, blockers, and honest feedback.
            </div>
          </RailItem>

          {/* ── Proof ── */}
          <RailItem icon={Trophy} label="Proof" active={currentPage === "proof"} onClick={() => handleNavigate("proof")}>
            <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--text)" }}>Score and ladder</div>
            <div className="text-[11px] leading-[1.55] mb-2" style={{ color: "var(--text-muted)" }}>
              Your evidence. Score thresholds, badges, and where you stand.
            </div>
            <FlyoutStat label="Score" value={tier.score} />
            <FlyoutStat label="Best streak" value={tier.bestStreak > 0 ? `${tier.bestStreak}d` : "—"} />
          </RailItem>
        </nav>

        {/* Bottom spacer — keeps rail balanced */}
        <div className="flex-1" />
      </aside>
    </>
  );
}
