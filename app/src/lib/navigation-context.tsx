"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Page = "home" | "declare" | "checkin" | "reflect" | "squad" | "squad-chat" | "coach" | "leaderboard" | "kickoff" | "completion" | "apply" | "settings";

interface NavigationContextType {
  currentPage: Page;
  navigateTo: (page: Page) => void;
  scoreOpen: boolean;
  setScoreOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [scoreOpen, setScoreOpen] = useState(false);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
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
