"use client";

import { useEffect, useState } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "../theme-provider";
import { createClient } from "@/lib/supabase/client";
import { PageWrapper } from "../page-wrapper";

type SettingsTab = "profile" | "preferences" | "notifications" | "account";

const SETTINGS_TABS: { id: SettingsTab; label: string; note: string }[] = [
  { id: "profile", label: "Profile", note: "Identity and public line" },
  { id: "preferences", label: "Preferences", note: "Theme and workspace behavior" },
  { id: "notifications", label: "Notifications", note: "What the Boss is allowed to surface" },
  { id: "account", label: "Account", note: "Plan, billing, and access" },
];

export function SettingsPage() {
  const { navigateTo } = useNavigation();
  const { profile, squad, refreshProfile } = useApp();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [displayName, setDisplayName] = useState(profile?.display_name || "Amir M.");
  const [bio, setBio] = useState(profile?.bio || "Building with purpose. S3 operator.");
  const [timezone, setTimezone] = useState(profile?.timezone || "America/New_York");
  const [sprintReminders, setSprintReminders] = useState(true);
  const [squadActivity, setSquadActivity] = useState(true);
  const [coachMessages, setCoachMessages] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio || "");
      setTimezone(profile.timezone);
    }
  }, [profile]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio,
        timezone,
        initials: displayName
          .split(" ")
          .map((name) => name[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      })
      .eq("id", user.id);
    await refreshProfile();
    setSaving(false);
  };

  return (
    <PageWrapper page="settings" layout="two_column">
      <div className="mb-8">
        <div
          className="text-[10px] uppercase tracking-[0.1em] mb-2"
          style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
        >
          Settings
        </div>
        <h1 className="text-[1.9rem] font-bold leading-[1.12] mb-2">Keep the room aligned with how you operate.</h1>
        <p className="text-[15px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
          Profile, preferences, notifications, and account all live here now. The Boss uses this layer to tune the
          experience without turning it into admin clutter.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-start">
        <aside className="space-y-5">
          <div
            className="p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-xl font-semibold shrink-0"
                style={{ background: "var(--surface-hover)", color: "var(--text-secondary)", border: "2px solid var(--border)" }}
              >
                {profile?.initials || "AM"}
              </div>
              <div className="min-w-0">
                <div className="text-[1.1rem] font-semibold">{profile?.display_name || "Operator"}</div>
                <div className="text-[11px] mb-2" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                  {squad?.name || "ENTER"} · S{profile?.sprints_completed ?? 0} operator
                </div>
                <p className="text-[13px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                  {profile?.bio || "Building with purpose."}
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
          >
            <div className="mb-2 px-2 text-[10px] uppercase tracking-[0.08em]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
              Sections
            </div>
            <div className="space-y-1">
              {SETTINGS_TABS.map((settingsTab) => (
                <button
                  key={settingsTab.id}
                  onClick={() => setTab(settingsTab.id)}
                  className="w-full rounded-[4px] border-none bg-transparent px-3 py-3 text-left cursor-pointer"
                  style={{ background: tab === settingsTab.id ? "var(--accent-surface)" : "transparent", fontFamily: "inherit" }}
                >
                  <div className="text-[13px] font-medium" style={{ color: tab === settingsTab.id ? "var(--text)" : "var(--text-secondary)" }}>
                    {settingsTab.label}
                  </div>
                  <div className="text-[10px]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                    {settingsTab.note}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div
            className="p-5"
            style={{ background: "var(--accent-surface)", border: "1px solid var(--accent)", borderRadius: "4px" }}
          >
            <div className="text-[10px] uppercase tracking-[0.08em] mb-1" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}>
              Current plan
            </div>
            <div className="text-[1rem] font-semibold mb-1">ENTER</div>
            <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              $19/mo · 40-day proving ground with earned progression to PROVEN.
            </div>
          </div>
        </aside>

        <div
          className="p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
        >
          {tab === "profile" && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}>
                  Profile
                </div>
                <h2 className="text-[1.25rem] font-semibold mb-1">How the room sees you</h2>
                <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                  Keep the identity layer current so the Boss and the room are reading the same person.
                </p>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="w-full text-[15px] py-3 px-4 outline-none transition-colors duration-150"
                  style={{ background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text)", fontFamily: "inherit" }}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={3}
                  className="w-full text-[15px] py-3 px-4 outline-none transition-colors duration-150 resize-none"
                  style={{ background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text)", fontFamily: "inherit" }}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  className="w-full text-[15px] py-3 px-4 outline-none cursor-pointer transition-colors duration-150"
                  style={{ background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text)", fontFamily: "inherit", appearance: "none" }}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Central European (CET)</option>
                  <option value="Asia/Dubai">Gulf (GST)</option>
                  <option value="Asia/Karachi">Pakistan (PKT)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="Asia/Tokyo">Japan (JST)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="text-[13px] font-medium py-2.5 px-6 cursor-pointer transition-all duration-150"
                  style={{ background: saving ? "var(--green)" : "var(--accent)", color: "var(--accent-text)", border: "none", borderRadius: "4px", opacity: saving ? 0.8 : 1 }}
                >
                  {saving ? "Saved +" : "Save profile"}
                </button>
              </div>
            </div>
          )}

          {tab === "preferences" && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}>
                  Preferences
                </div>
                <h2 className="text-[1.25rem] font-semibold mb-1">How the app should feel</h2>
                <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                  These settings shape the surface without changing the proving ground itself.
                </p>
              </div>

              <div className="flex items-center justify-between py-4 px-5" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
                <div>
                  <div className="text-[15px] font-medium mb-0.5">Appearance</div>
                  <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                    {theme === "light" ? "Light mode" : "Dark mode"}
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="w-12 h-7 rounded-full cursor-pointer transition-colors duration-200 relative border-none"
                  style={{ background: theme === "dark" ? "var(--accent)" : "var(--border)" }}
                >
                  <span
                    className="absolute top-[3px] w-[22px] h-[22px] rounded-full transition-transform duration-200"
                    style={{ background: "#fff", left: theme === "dark" ? "calc(100% - 25px)" : "3px" }}
                  />
                </button>
              </div>

              <div className="py-4 px-5" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
                <div className="text-[15px] font-medium mb-3">Sprint day display</div>
                {[
                  { label: "Show day context on Boss Home", desc: "Keep the daily view tied to the Monday/Wednesday/Friday rhythm", checked: true },
                  { label: "Show sprint progress bar", desc: "Display progress through the current 40-day arc", checked: true },
                  { label: "Show coach whisper on Boss Home", desc: "Keep one quiet coach note visible inside the shell", checked: true },
                ].map((pref, index, list) => (
                  <div key={pref.label} className="flex items-center justify-between py-3" style={{ borderBottom: index === list.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
                    <div>
                      <div className="text-[13px] font-medium">{pref.label}</div>
                      <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {pref.desc}
                      </div>
                    </div>
                    <div className="w-10 h-6 rounded-full relative" style={{ background: pref.checked ? "var(--accent)" : "var(--border)" }}>
                      <span className="absolute top-[2px] w-[20px] h-[20px] rounded-full" style={{ background: "#fff", left: pref.checked ? "calc(100% - 22px)" : "2px" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}>
                  Notifications
                </div>
                <h2 className="text-[1.25rem] font-semibold mb-1">What the Boss is allowed to surface</h2>
                <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                  Keep the right pressure on and mute the noise that is not helping execution.
                </p>
              </div>

              {[
                { label: "Sprint reminders", desc: "Monday declarations, Wednesday signals, Friday reflections", state: sprintReminders, setter: setSprintReminders },
                { label: "Squad activity", desc: "When proven operators in your room move, miss, or post", state: squadActivity, setter: setSquadActivity },
                { label: "Coach messages", desc: "Boss insights and private thread replies", state: coachMessages, setter: setCoachMessages },
                { label: "Weekly digest", desc: "One clean summary of the week on Sunday evening", state: weeklyDigest, setter: setWeeklyDigest },
              ].map((notif) => (
                <div key={notif.label} className="flex items-center justify-between py-4 px-5" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
                  <div>
                    <div className="text-[15px] font-medium mb-0.5">{notif.label}</div>
                    <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                      {notif.desc}
                    </div>
                  </div>
                  <button
                    onClick={() => notif.setter(!notif.state)}
                    className="w-12 h-7 rounded-full cursor-pointer transition-colors duration-200 relative border-none"
                    style={{ background: notif.state ? "var(--accent)" : "var(--border)" }}
                  >
                    <span className="absolute top-[3px] w-[22px] h-[22px] rounded-full transition-all duration-200" style={{ background: "#fff", left: notif.state ? "calc(100% - 25px)" : "3px" }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "account" && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}>
                  Account
                </div>
                <h2 className="text-[1.25rem] font-semibold mb-1">Plan, access, and hard edges</h2>
                <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
                  Membership, account details, sign-out, and destructive actions all stay in one quiet place.
                </p>
              </div>

              <div className="py-4 px-5" style={{ background: "var(--accent-surface)", border: "1px solid var(--accent)", borderRadius: "4px" }}>
                <div className="text-[10px] uppercase tracking-[0.08em] mb-1" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}>
                  Current plan
                </div>
                <div className="text-lg font-semibold mb-1">ENTER</div>
                <div className="text-[13px] mb-3" style={{ color: "var(--text-secondary)" }}>
                  $19/mo · 40-day proving ground with earned progression to PROVEN
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="text-[12px] font-medium py-2 px-4 cursor-pointer transition-colors duration-150"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text)", fontFamily: "inherit" }}
                  >
                    Manage subscription
                  </button>
                  <button
                    onClick={() => navigateTo("proof")}
                    className="text-[12px] font-medium py-2 px-4 cursor-pointer transition-colors duration-150"
                    style={{ background: "none", border: "1px solid var(--accent)", borderRadius: "4px", color: "var(--accent)", fontFamily: "inherit" }}
                  >
                    View PROVEN path
                  </button>
                </div>
              </div>

              <div className="py-4 px-5" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
                <div className="text-[15px] font-medium mb-4">Account information</div>
                {[
                  { label: "Email", value: profile?.email || "operator@example.com" },
                  { label: "Member since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "January 2026" },
                  { label: "Sprints completed", value: String(profile?.sprints_completed ?? 0) },
                  { label: "Current squad", value: squad?.name || "Not earned yet" },
                ].map((info, index, list) => (
                  <div key={info.label} className="flex items-center justify-between py-2.5" style={{ borderBottom: index === list.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
                    <span className="text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}>
                      {info.label}
                    </span>
                    <span className="text-[13px] font-medium">{info.value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={async () => {
                  await signOut();
                  navigateTo("landing");
                }}
                className="w-full text-[13px] font-medium py-3 px-5 cursor-pointer transition-colors duration-150"
                style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px", color: "var(--text-secondary)", fontFamily: "inherit", textAlign: "left" }}
              >
                Sign out
              </button>

              <div className="py-4 px-5" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
                <div className="text-[15px] font-medium mb-1">Danger zone</div>
                <div className="text-[12px] mb-4" style={{ color: "var(--text-muted)" }}>
                  These actions cannot be undone.
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="text-[12px] font-medium py-2 px-4 cursor-pointer"
                    style={{ background: "none", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontFamily: "inherit" }}
                  >
                    Leave squad
                  </button>
                  <button
                    className="text-[12px] font-medium py-2 px-4 cursor-pointer"
                    style={{ background: "none", border: "1px solid var(--red)", borderRadius: "4px", color: "var(--red)", fontFamily: "inherit" }}
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
