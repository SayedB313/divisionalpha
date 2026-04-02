import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Page from "../app/page";

const authState = {
  user: null as null | { id: string },
  loading: false,
};

const navigationState = {
  currentPage: "landing",
  navigateTo: vi.fn(),
};

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => authState,
}));

vi.mock("@/lib/navigation-context", () => ({
  useNavigation: () => navigationState,
}));

vi.mock("@/components/pages/landing", () => ({
  LandingPage: () => <div>Landing Mock</div>,
}));

vi.mock("@/components/pages/login", () => ({
  LoginPage: () => <div>Login Mock</div>,
}));

vi.mock("@/components/pages/apply", () => ({
  ApplyPage: () => <div>Apply Mock</div>,
}));

vi.mock("@/components/pages/boss", () => ({
  BossPage: () => <div>Boss Mock</div>,
}));

vi.mock("@/components/pages/journey", () => ({
  JourneyPage: () => <div>Journey Mock</div>,
}));

vi.mock("@/components/pages/squad", () => ({
  SquadPage: () => <div>Squad Mock</div>,
}));

vi.mock("@/components/pages/coach", () => ({
  CoachPage: () => <div>Coach Mock</div>,
}));

vi.mock("@/components/pages/proof", () => ({
  ProofPage: () => <div>Proof Mock</div>,
}));

vi.mock("@/components/pages/settings", () => ({
  SettingsPage: () => <div>Settings Mock</div>,
}));

vi.mock("@/components/pages/admin", () => ({
  AdminPage: () => <div>Admin Mock</div>,
}));

describe("page auth gating", () => {
  beforeEach(() => {
    authState.user = null;
    authState.loading = false;
    navigationState.currentPage = "landing";
    navigationState.navigateTo.mockReset();
  });

  it("renders public pages immediately while auth is still loading", () => {
    authState.loading = true;
    navigationState.currentPage = "landing";

    const html = renderToStaticMarkup(<Page />);

    expect(html).toContain("Landing Mock");
    expect(html).not.toContain("Loading...");
  });

  it("shows the loading shell while a protected page is resolving auth", () => {
    authState.loading = true;
    navigationState.currentPage = "boss";

    const html = renderToStaticMarkup(<Page />);

    expect(html).toContain("Loading...");
    expect(html).not.toContain("Boss Mock");
  });

  it("renders the protected shell once the user is available", () => {
    authState.loading = false;
    authState.user = { id: "user-1" };
    navigationState.currentPage = "boss";

    const html = renderToStaticMarkup(<Page />);

    expect(html).toContain("Boss Mock");
  });
});
