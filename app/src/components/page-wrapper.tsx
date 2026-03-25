"use client";

import { useNavigation } from "@/lib/navigation-context";
import type { ReactNode } from "react";

type Page = "home" | "declare" | "checkin" | "reflect" | "squad" | "squad-chat" | "coach" | "leaderboard" | "kickoff" | "completion" | "apply" | "settings";

export function PageWrapper({ page, children }: { page: Page; children: ReactNode }) {
  const { currentPage } = useNavigation();

  if (currentPage !== page) return null;

  return (
    <section
      className="max-w-[660px] mx-auto pb-16 md:pb-0"
      style={{
        padding: "clamp(28px, 5vw, 56px) clamp(16px, 4vw, 40px)",
        animation: "fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      }}
    >
      {children}
    </section>
  );
}
