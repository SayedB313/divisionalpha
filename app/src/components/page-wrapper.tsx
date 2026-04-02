"use client";

import { useNavigation, type Page, type LegacyPage, resolvePage } from "@/lib/navigation-context";
import type { ReactNode } from "react";

export function PageWrapper({ page, children }: { page: Page | LegacyPage; children: ReactNode }) {
  const { currentPage } = useNavigation();
  const resolvedPage = resolvePage(page);

  if (currentPage !== resolvedPage) return null;

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
