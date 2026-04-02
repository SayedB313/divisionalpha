"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigation } from "@/lib/navigation-context";
import { Topbar } from "@/components/topbar";
import { MobileNav } from "@/components/mobile-nav";
import { ScoreOverlay } from "@/components/score-overlay";

const PUBLIC_PAGES = new Set(["landing", "login", "apply"]);

export function AppFrame({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentPage } = useNavigation();
  const showMemberShell = Boolean(user) && !PUBLIC_PAGES.has(currentPage);

  return (
    <>
      <Topbar />
      <main className={showMemberShell ? "min-h-screen pt-[56px] md:pt-0 md:pl-[var(--shell-rail)]" : "min-h-screen pt-[56px]"}>
        {children}
      </main>
      <MobileNav />
      <ScoreOverlay />
    </>
  );
}
