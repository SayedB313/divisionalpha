"use client";

import { useState, useEffect } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "../theme-provider";
import { createClient } from "@/lib/supabase/client";
import { PageWrapper } from "../page-wrapper";

type SettingsTab = "profile" | "preferences" | "notifications" | "account";

const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "preferences", label: "Preferences" },
  { id: "notifications", label: "Notifications" },
  { id: "account", label: "Account" },
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

  // Sync from profile when it loads
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
    await supabase.from("profiles").update({
      display_name: displayName,
      bio,
      timezone,
      initials: displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
    }).eq("id", user.id);
    await refreshProfile();
    setSaving(false);
  };

  return (
    <PageWrapper page="settings">
      {/* Header with avatar */}
      <div className="flex items-start gap-5 mb-8">
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-xl font-semibold shrink-0 cursor-pointer relative group"
          style={{
            background: "var(--surface-hover)",
            color: "var(--text-secondary)",
            border: "2px solid var(--border)",
          }}
        >
          {profile?.initials || "AM"}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <span className="text-white text-[10px] font-medium">Edit</span>
          </div>
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h1 className="text-[1.75rem] font-bold leading-[1.2] mb-1">Settings</h1>
          <p
            className="text-[13px]"
            style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
          >
            {squad?.name || "Alpha Vanguard"} &middot; S{profile?.sprints_completed ?? 3} Operator
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex mb-6 overflow-x-auto"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        {SETTINGS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="py-2.5 px-3 sm:px-4 text-[13px] font-medium cursor-pointer transition-colors duration-150 relative bg-transparent border-none whitespace-nowrap shrink-0"
            style={{
              color: tab === t.id ? "var(--text)" : "var(--text-muted)",
              fontFamily: "inherit",
            }}
          >
            {t.label}
            {tab === t.id && (
              <span
                className="absolute bottom-[-1px] left-4 right-4 h-[1.5px]"
                style={{ background: "var(--accent)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="space-y-6">
          <div>
            <label
              className="block text-[10px] uppercase tracking-[0.08em] mb-2"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full text-[15px] py-3 px-4 outline-none transition-colors duration-150"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                color: "var(--text)",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div>
            <label
              className="block text-[10px] uppercase tracking-[0.08em] mb-2"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full text-[15px] py-3 px-4 outline-none transition-colors duration-150 resize-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                color: "var(--text)",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div>
            <label
              className="block text-[10px] uppercase tracking-[0.08em] mb-2"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
            >
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full text-[15px] py-3 px-4 outline-none cursor-pointer transition-colors duration-150"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                color: "var(--text)",
                fontFamily: "inherit",
                appearance: "none",
              }}
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
              style={{
                background: saving ? "var(--green)" : "var(--accent)",
                color: "var(--accent-text)",
                border: "none",
                borderRadius: "4px",
                opacity: saving ? 0.8 : 1,
              }}
            >
              {saving ? "Saved \u2713" : "Save Profile"}
            </button>
          </div>
        </div>
      )}

      {/* Preferences tab */}
      {tab === "preferences" && (
        <div className="space-y-6">
          {/* Theme */}
          <div
            className="flex items-center justify-between py-4 px-5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
            }}
          >
            <div>
              <div className="text-[15px] font-medium mb-0.5">Appearance</div>
              <div
                className="text-[12px]"
                style={{ color: "var(--text-muted)" }}
              >
                {theme === "light" ? "Light mode" : "Dark mode"}
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="w-12 h-7 rounded-full cursor-pointer transition-colors duration-200 relative border-none"
              style={{
                background: theme === "dark" ? "var(--accent)" : "var(--border)",
              }}
            >
              <span
                className="absolute top-[3px] w-[22px] h-[22px] rounded-full transition-transform duration-200"
                style={{
                  background: "white",
                  left: theme === "dark" ? "calc(100% - 25px)" : "3px",
                }}
              />
            </button>
          </div>

          {/* Sprint day preferences */}
          <div
            className="py-4 px-5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
            }}
          >
            <div className="text-[15px] font-medium mb-3">Sprint Day Display</div>
            {[
              { label: "Show day context on home", desc: "Adapts home page to Monday/Wednesday/Friday rhythm", checked: true },
              { label: "Show sprint progress bar", desc: "Display progress through current sprint week", checked: true },
              { label: "Show coach whisper on home", desc: "AI coach insight on the home dashboard", checked: true },
            ].map((pref) => (
              <div
                key={pref.label}
                className="flex items-center justify-between py-3"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <div>
                  <div className="text-[13px] font-medium">{pref.label}</div>
                  <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {pref.desc}
                  </div>
                </div>
                <div
                  className="w-10 h-6 rounded-full cursor-pointer relative"
                  style={{
                    background: pref.checked ? "var(--accent)" : "var(--border)",
                  }}
                >
                  <span
                    className="absolute top-[2px] w-[20px] h-[20px] rounded-full"
                    style={{
                      background: "white",
                      left: pref.checked ? "calc(100% - 22px)" : "2px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {tab === "notifications" && (
        <div className="space-y-4">
          {[
            { label: "Sprint reminders", desc: "Monday declarations, Wednesday check-ins, Friday reflections", state: sprintReminders, setter: setSprintReminders },
            { label: "Squad activity", desc: "When squad members declare, check in, or complete goals", state: squadActivity, setter: setSquadActivity },
            { label: "Coach messages", desc: "AI coach insights and nudges", state: coachMessages, setter: setCoachMessages },
            { label: "Weekly digest", desc: "Summary of your week every Sunday evening", state: weeklyDigest, setter: setWeeklyDigest },
          ].map((notif) => (
            <div
              key={notif.label}
              className="flex items-center justify-between py-4 px-5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px",
              }}
            >
              <div>
                <div className="text-[15px] font-medium mb-0.5">{notif.label}</div>
                <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                  {notif.desc}
                </div>
              </div>
              <button
                onClick={() => notif.setter(!notif.state)}
                className="w-12 h-7 rounded-full cursor-pointer transition-colors duration-200 relative border-none"
                style={{
                  background: notif.state ? "var(--accent)" : "var(--border)",
                }}
              >
                <span
                  className="absolute top-[3px] w-[22px] h-[22px] rounded-full transition-all duration-200"
                  style={{
                    background: "white",
                    left: notif.state ? "calc(100% - 25px)" : "3px",
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Account tab */}
      {tab === "account" && (
        <div className="space-y-6">
          {/* Membership */}
          <div
            className="py-4 px-5"
            style={{
              background: "var(--accent-surface)",
              border: "1px solid var(--accent)",
              borderRadius: "4px",
            }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.08em] mb-1"
              style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent)" }}
            >
              Current Plan
            </div>
            <div className="text-lg font-semibold mb-1">Sprint Access</div>
            <div className="text-[13px] mb-3" style={{ color: "var(--text-secondary)" }}>
              $49/mo &middot; 6-week accountability sprints with squads
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="text-[12px] font-medium py-2 px-4 cursor-pointer transition-colors duration-150"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  color: "var(--text)",
                  fontFamily: "inherit",
                }}
              >
                Manage Subscription
              </button>
              <button
                onClick={() => navigateTo("apply")}
                className="text-[12px] font-medium py-2 px-4 cursor-pointer transition-colors duration-150"
                style={{
                  background: "none",
                  border: "1px solid var(--accent)",
                  borderRadius: "4px",
                  color: "var(--accent)",
                  fontFamily: "inherit",
                }}
              >
                Upgrade to Operator Fund
              </button>
            </div>
          </div>

          {/* Account info */}
          <div
            className="py-4 px-5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
            }}
          >
            <div className="text-[15px] font-medium mb-4">Account Information</div>
            {[
              { label: "Email", value: profile?.email || "amir@example.com" },
              { label: "Member since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "January 2026" },
              { label: "Sprints completed", value: String(profile?.sprints_completed ?? 2) },
              { label: "Current squad", value: squad?.name || "Alpha Vanguard" },
            ].map((info) => (
              <div
                key={info.label}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <span
                  className="text-[11px] uppercase tracking-[0.06em]"
                  style={{ fontFamily: "var(--font-dm-mono), monospace", color: "var(--text-muted)" }}
                >
                  {info.label}
                </span>
                <span className="text-[13px] font-medium">{info.value}</span>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div
            className="py-4 px-5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
            }}
          >
            <div className="text-[15px] font-medium mb-1">Danger Zone</div>
            <div className="text-[12px] mb-4" style={{ color: "var(--text-muted)" }}>
              These actions cannot be undone.
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="text-[12px] font-medium py-2 px-4 cursor-pointer"
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  color: "var(--text-muted)",
                  fontFamily: "inherit",
                }}
              >
                Leave Squad
              </button>
              <button
                className="text-[12px] font-medium py-2 px-4 cursor-pointer"
                style={{
                  background: "none",
                  border: "1px solid var(--red)",
                  borderRadius: "4px",
                  color: "var(--red)",
                  fontFamily: "inherit",
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
