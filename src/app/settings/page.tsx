"use client";

import { useState } from "react";
import { useAuthState } from "@/components/shared/auth-provider";
import { PageHeader } from "@/components/shared/page-header";
import { useApp } from "@/context/app-context";
import { LOCKED_MODEL_LABEL } from "@/data/models";
import { useTier } from "@/hooks/use-tier";
import {
  User,
  Cpu,
  Database,
  Trash2,
  AlertTriangle,
  Sparkles,
  Check,
  Cloud,
  CloudOff,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const { clerkUser } = useAuthState();
  const user = clerkUser.user;
  const isLoaded = clerkUser.isLoaded;
  const { state, clearAllData, setSubscriptionTier, syncStatus } = useApp();
  const { tier, isPro } = useTier();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearAll = () => {
    clearAllData();
    setCleared(true);
    setShowConfirmClear(false);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(0_0%_100%/0.06)]">
            <User className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Profile</h3>
          </div>
          <div className="p-5">
            {isLoaded && user ? (
              <div className="flex items-center gap-4">
                {user.imageUrl && (
                  <img
                    src={user.imageUrl}
                    alt=""
                    className="h-12 w-12 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {user.fullName || user.firstName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.primaryEmailAddress?.emailAddress || "No email"}
                  </p>
                </div>
              </div>
            ) : isLoaded ? (
              <p className="text-sm text-muted-foreground">Guest mode — sign in for profile details</p>
            ) : (
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            )}
          </div>
        </div>

        {/* Subscription */}
        <div id="subscription" className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(0_0%_100%/0.06)]">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Subscription</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Current Plan</span>
                {isPro ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#0ea5e9]/15 text-[#0ea5e9]">
                    <Check className="h-3 w-3" />
                    Pro
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[hsl(0_0%_100%/0.06)] text-muted-foreground">
                    Free
                  </span>
                )}
              </div>
            </div>

            {isPro ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  You have full access to all tools, playbooks, and features.
                </p>
                <button
                  onClick={() => setSubscriptionTier("free")}
                  className="px-4 py-2 rounded-lg border border-[hsl(0_0%_100%/0.1)] text-sm font-medium text-muted-foreground hover:bg-[hsl(0_0%_100%/0.05)] transition-colors"
                >
                  Switch to Free (Testing)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Pro includes
                  </p>
                  <ul className="space-y-2">
                    {[
                      "All 42 AI-powered tools",
                      "9 multi-step playbooks",
                      "Unlimited sales mechanisms",
                      "Revenue alignment analysis",
                      "Brand guidelines builder",
                      "Messaging matrix",
                      "Unlimited access to The Mechanic",
                      "Notion sync",
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-[#0ea5e9] shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setSubscriptionTier("pro")}
                  className="w-full px-4 py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Upgrade to Pro
                </button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Currently toggles tier locally for testing. Payment integration coming soon.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Model Info */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(0_0%_100%/0.06)]">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">AI Model</h3>
          </div>
          <div className="p-5">
            <p className="text-sm font-medium">{LOCKED_MODEL_LABEL}</p>
            <p className="text-xs text-muted-foreground mt-1">
              All tools and playbooks use this model. Optimised for speed, quality, and consistency across the platform.
            </p>
          </div>
        </div>

        {/* Cloud Sync Status */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(0_0%_100%/0.06)]">
            <Cloud className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Cloud Sync</h3>
            <span className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
              syncStatus === "synced"
                ? "bg-green-500/10 text-green-400"
                : syncStatus === "saving"
                  ? "bg-amber-500/10 text-amber-400"
                  : syncStatus === "loading"
                    ? "bg-[#0ea5e9]/10 text-[#0ea5e9]"
                    : syncStatus === "error"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-[hsl(0_0%_100%/0.06)] text-muted-foreground"
            }`}>
              {syncStatus === "synced" && <><Check className="h-3 w-3" /> Synced</>}
              {syncStatus === "saving" && <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>}
              {syncStatus === "loading" && <><Loader2 className="h-3 w-3 animate-spin" /> Loading...</>}
              {syncStatus === "error" && <><CloudOff className="h-3 w-3" /> Sync Error</>}
              {syncStatus === "idle" && <>Local Only</>}
            </span>
          </div>
          <div className="p-5">
            <p className="text-xs text-muted-foreground">
              {syncStatus === "synced" || syncStatus === "saving"
                ? "Your data is backed up to the cloud. Changes sync automatically and persist across devices and browsers."
                : syncStatus === "error"
                  ? "Cloud sync encountered an error. Your data is still saved locally. It will retry automatically."
                  : "Data is stored locally in this browser. Sign in to enable cloud backup and cross-device sync."}
            </p>
          </div>
        </div>

        {/* Data Summary */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(0_0%_100%/0.06)]">
            <Database className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Stored Data</h3>
          </div>
          <div className="divide-y divide-[hsl(0_0%_100%/0.06)]">
            {[
              {
                label: "North Star Profiles",
                value: state.northStarProfiles?.length ?? 0,
              },
              {
                label: "Brand Guidelines",
                value: state.brandGuidelinesProfiles?.length ?? 0,
              },
              {
                label: "Sales Mechanisms",
                value: state.mechanisms?.length ?? 0,
              },
              {
                label: "Saved Favorites",
                value: state.favorites?.length ?? 0,
              },
              {
                label: "Token Usage Records",
                value: state.tokenUsageHistory?.length ?? 0,
              },
              {
                label: "Tools Used",
                value: state.toolsUsed ?? 0,
              },
              {
                label: "Playbooks Completed",
                value: state.playbooksCompleted ?? 0,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-5 py-3"
              >
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-sm font-medium tabular-nums">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-red-500/20">
            <Trash2 className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
          </div>
          <div className="p-5">
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete all locally stored data including North Star profiles,
              brand guidelines, sales mechanisms, favorites, and usage history.
            </p>

            {cleared ? (
              <p className="text-sm text-green-400 font-medium">All data cleared successfully.</p>
            ) : !showConfirmClear ? (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
              >
                Clear All Data
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Are you sure?</span>
                </div>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Yes, Clear Everything
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-4 py-2 rounded-lg border border-[hsl(0_0%_100%/0.1)] text-sm font-medium hover:bg-[hsl(0_0%_100%/0.05)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
