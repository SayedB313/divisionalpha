"use client";

import { useNavigation, type Page, type LegacyPage, resolvePage } from "@/lib/navigation-context";
import type { ReactNode } from "react";

type LayoutVariant = "editorial" | "two_column" | "three_column" | "wide";

const LAYOUT_CLASSNAMES: Record<LayoutVariant, string> = {
  editorial: "max-w-[760px]",
  two_column: "max-w-[1320px]",
  three_column: "max-w-[1480px]",
  wide: "max-w-[1580px]",
};

export function PageWrapper({
  page,
  children,
  layout = "editorial",
  className = "",
}: {
  page: Page | LegacyPage;
  children: ReactNode;
  layout?: LayoutVariant;
  className?: string;
}) {
  const { currentPage } = useNavigation();
  const resolvedPage = resolvePage(page);

  if (currentPage !== resolvedPage) return null;

  return (
    <section
      className={`${LAYOUT_CLASSNAMES[layout]} mx-auto pb-16 md:pb-0 ${className}`.trim()}
      style={{
        padding: "clamp(28px, 5vw, 56px) clamp(16px, 4vw, 40px)",
        animation: "fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      }}
    >
      {children}
    </section>
  );
}
