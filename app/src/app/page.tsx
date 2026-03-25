"use client";

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

export default function Page() {
  return (
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
      <ApplyPage />
      <SettingsPage />
    </>
  );
}
