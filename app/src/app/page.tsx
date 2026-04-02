"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigation } from "@/lib/navigation-context";
import { LandingPage } from "@/components/pages/landing";
import { LoginPage } from "@/components/pages/login";
import { BossPage } from "@/components/pages/boss";
import { JourneyPage } from "@/components/pages/journey";
import { SquadPage } from "@/components/pages/squad";
import { CoachPage } from "@/components/pages/coach";
import { ProofPage } from "@/components/pages/proof";
import { ApplyPage } from "@/components/pages/apply";
import { SettingsPage } from "@/components/pages/settings";
import { AdminPage } from "@/components/pages/admin";

// Pages that require authentication (redirect to landing if not logged in)
const AUTH_PAGES = new Set(["boss", "journey", "squad", "coach", "proof", "settings", "admin"]);

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

  // On login success, redirect to Boss Home (only once)
  useEffect(() => {
    if (loading || hasRedirected.current) return;

    if (user && (currentPage === "landing" || currentPage === "login")) {
      hasRedirected.current = true;
      navigateTo("boss");
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
          <BossPage />
          <JourneyPage />
          <SquadPage />
          <CoachPage />
          <ProofPage />
          <SettingsPage />
          <AdminPage />
        </>
      )}
    </>
  );
}
