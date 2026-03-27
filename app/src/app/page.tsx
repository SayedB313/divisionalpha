"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigation } from "@/lib/navigation-context";
import { LandingPage } from "@/components/pages/landing";
import { LoginPage } from "@/components/pages/login";
import { HomePage } from "@/components/pages/home";
import { DeclarePage } from "@/components/pages/declare";
import { CheckinPage } from "@/components/pages/checkin";
import { ReflectPage } from "@/components/pages/reflect";
import { SquadPage } from "@/components/pages/squad";
import { SquadChatPage } from "@/components/pages/squad-chat";
import { CoachPage } from "@/components/pages/coach";
import { LeaderboardPage } from "@/components/pages/leaderboard";
import { KickoffPage } from "@/components/pages/kickoff";
import { CompletionPage } from "@/components/pages/completion";
import { ApplyPage } from "@/components/pages/apply";
import { SettingsPage } from "@/components/pages/settings";
import { AdminPage } from "@/components/pages/admin";

// Pages that don't require authentication
const PUBLIC_PAGES = new Set(["landing", "login", "apply"]);

// Pages that require authentication (redirect to landing if not logged in)
const AUTH_PAGES = new Set(["home", "declare", "checkin", "reflect", "squad", "squad-chat", "coach", "leaderboard", "kickoff", "completion", "settings", "admin"]);

export default function Page() {
  const { user, loading } = useAuth();
  const { currentPage, navigateTo } = useNavigation();

  // Session gating: redirect unauthenticated users to landing page
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!user && AUTH_PAGES.has(currentPage)) {
      navigateTo("landing");
    }
  }, [user, loading, currentPage, navigateTo]);

  // On login success, redirect to home (only once)
  useEffect(() => {
    if (loading || hasRedirected.current) return;

    if (user && (currentPage === "landing" || currentPage === "login")) {
      hasRedirected.current = true;
      navigateTo("home");
    }
  }, [user, loading, currentPage, navigateTo]);

  // Reset redirect flag on logout
  useEffect(() => {
    if (!user) hasRedirected.current = false;
  }, [user]);

  // Show loading state while auth resolves
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="text-[11px] uppercase tracking-[0.08em]"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
        >
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Public pages */}
      <LandingPage />
      <LoginPage />
      <ApplyPage />

      {/* Protected pages — only render if authenticated */}
      {user && (
        <>
          <HomePage />
          <DeclarePage />
          <CheckinPage />
          <ReflectPage />
          <SquadPage />
          <SquadChatPage />
          <CoachPage />
          <LeaderboardPage />
          <KickoffPage />
          <CompletionPage />
          <SettingsPage />
          <AdminPage />
        </>
      )}
    </>
  );
}
