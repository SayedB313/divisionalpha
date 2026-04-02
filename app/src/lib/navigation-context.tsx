"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Page = "landing" | "login" | "apply" | "boss" | "journey" | "squad" | "coach" | "proof" | "settings" | "admin";
export type LegacyPage = "home" | "declare" | "checkin" | "reflect" | "leaderboard" | "kickoff" | "completion" | "squad-chat";

export const LEGACY_PAGE_MAP: Record<LegacyPage, Page> = {
  home: "boss",
  declare: "journey",
  checkin: "journey",
  reflect: "journey",
  leaderboard: "proof",
  kickoff: "journey",
  completion: "journey",
  "squad-chat": "squad",
};

export function resolvePage(page: Page | LegacyPage): Page {
  return (page in LEGACY_PAGE_MAP ? LEGACY_PAGE_MAP[page as LegacyPage] : page) as Page;
}

interface NavigationContextType {
  currentPage: Page;
  navigateTo: (page: Page | LegacyPage) => void;
  scoreOpen: boolean;
  setScoreOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [scoreOpen, setScoreOpen] = useState(false);

  const navigateTo = useCallback((page: Page | LegacyPage) => {
    const nextPage = resolvePage(page);
    setCurrentPage(nextPage);
    window.scrollTo(0, 0);
  }, []);

  return (
    <NavigationContext.Provider value={{ currentPage, navigateTo, scoreOpen, setScoreOpen }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}
