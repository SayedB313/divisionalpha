import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Topbar } from "../components/topbar";
import { PageWrapper } from "../components/page-wrapper";

const authState = {
  user: null as null | { id: string },
  signOut: vi.fn(),
};

const navigationState = {
  currentPage: "landing",
  navigateTo: vi.fn(),
  setScoreOpen: vi.fn(),
};

const appState = {
  profile: null as any,
  sprint: null as any,
};

const tierState = {
  activeTier: "enter",
  score: 32,
  currentStreak: 4,
};

const themeState = {
  theme: "light",
  toggleTheme: vi.fn(),
};

const notificationState = {
  unreadCount: 2,
  notifications: [],
  markAllRead: vi.fn(),
  markRead: vi.fn(),
};

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    ...authState,
    session: null,
    loading: false,
  }),
}));

vi.mock("@/lib/navigation-context", async () => {
  const actual = await vi.importActual<typeof import("../lib/navigation-context")>("../lib/navigation-context");
  return {
    ...actual,
    useNavigation: () => navigationState,
  };
});

vi.mock("@/lib/app-context", () => ({
  useApp: () => appState,
}));

vi.mock("@/lib/hooks/use-tier-state", () => ({
  useTierState: () => ({
    ...tierState,
    nextTier: "proven",
    nextThreshold: 70,
    gapToNext: 38,
    provenUnlocked: false,
    eliteEligible: false,
    eliteUnlocked: false,
    completedSprints: 0,
    bestStreak: 6,
    tiers: [],
  }),
}));

vi.mock("../components/theme-provider", () => ({
  useTheme: () => themeState,
}));

vi.mock("@/lib/hooks/use-notifications", () => ({
  useNotifications: () => notificationState,
}));

describe("shell chrome", () => {
  beforeEach(() => {
    authState.user = null;
    appState.profile = null;
    appState.sprint = null;
    navigationState.currentPage = "landing";
    navigationState.navigateTo.mockReset();
    navigationState.setScoreOpen.mockReset();
    authState.signOut.mockReset();
    themeState.toggleTheme.mockReset();
    notificationState.markAllRead.mockReset();
    notificationState.markRead.mockReset();
  });

  it("renders the public header on public pages", () => {
    const html = renderToStaticMarkup(<Topbar />);

    expect(html).toContain("Division Alpha");
    expect(html).toContain("Login");
    expect(html).toContain("Apply");
    expect(html).not.toContain("Command center");
  });

  it("renders the editorial member rail for authenticated users", () => {
    authState.user = { id: "user-1" };
    navigationState.currentPage = "boss";
    appState.profile = {
      initials: "DA",
      display_name: "Division Alpha",
      role: "founder",
    };
    appState.sprint = {
      number: 4,
      current_week: 1,
    };

    const html = renderToStaticMarkup(<Topbar />);

    expect(html).toContain("Command center");
    expect(html).toContain("Boss");
    expect(html).toContain("Journey");
    expect(html).toContain("Squad");
    expect(html).toContain("Operator Score");
    expect(html).toContain("Notifications");
    expect(html).toContain("Settings");
    expect(html).toContain("Admin");
  });

  it("applies the requested width variant in page wrapper", () => {
    navigationState.currentPage = "boss";

    const html = renderToStaticMarkup(
      <PageWrapper page="boss" layout="three_column">
        <div>Body</div>
      </PageWrapper>,
    );

    expect(html).toContain("max-w-[1480px]");
    expect(html).toContain("Body");
  });
});
