"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Upload,
  Megaphone,
  PenTool,
  Clock,
  Pencil,
  Wrench,
  BookOpen,
  ExternalLink,
  Sparkles,
  BarChart3,
  Lock,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { computeProgressState } from "@/lib/progressService";
import { QUICK_LINKS } from "@/config/quickLinks";
import { PRO_QUICK_LINK_KEYS } from "@/data/tier-config";
import { useTier } from "@/hooks/use-tier";
import { cn } from "@/lib/utils";
import { VideoWalkthroughBanner } from "@/components/shared/video-walkthrough-banner";

// ─── Helpers ───

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


// ─── Quick Links Config ───

const quickLinks = [
  {
    key: "TASK_REQUEST_URL" as const,
    icon: ClipboardList,
    label: "Task Request",
    description: "Submit a task or request to the Shapers team",
  },
  {
    key: "CREATIVE_SUBMISSIONS_URL" as const,
    icon: Upload,
    label: "Creative Submissions",
    description: "Submit creative assets for review and approval",
  },
  {
    key: "CAMPAIGN_BRIEF_URL" as const,
    icon: Megaphone,
    label: "Campaign Brief",
    description: "Brief a new campaign for the Shapers team to build",
  },
  {
    key: "CREATIVE_BRIEF_URL" as const,
    icon: PenTool,
    label: "Creative Brief",
    description: "Brief new creative assets for production",
  },
];

// ─── Lever colours ───

const leverColors: Record<string, { bg: string; text: string }> = {
  offer: { bg: "bg-amber-500/10", text: "text-amber-400" },
  message: { bg: "bg-[#0ea5e9]/10", text: "text-[#0ea5e9]" },
  mechanism: { bg: "bg-purple-500/10", text: "text-purple-400" },
  foundation: { bg: "bg-blue-500/10", text: "text-blue-400" },
  growth: { bg: "bg-green-500/10", text: "text-green-400" },
};

// ─── Page ───

export default function HomePage() {
  const { state } = useApp();
  const { isPro } = useTier();

  const progress = computeProgressState(state);
  const firstName = state.northStarData?.name?.split(" ")[0] || "";
  const businessName = state.northStarData?.company || "";
  const today = formatDate(new Date());

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <VideoWalkthroughBanner section="home" />

      {/* ─── Row 1: Personalised Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">
            {firstName ? `Welcome back, ${firstName}` : "Welcome to ShapersOS"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {businessName ? `${businessName} \u00B7 ${today}` : today}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Progress score pill */}
          {progress.progressScore >= 20 && (
            <Link
              href="/revenue-engine"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.08)] text-xs font-medium text-muted-foreground hover:text-foreground hover:border-[hsl(0_0%_100%/0.15)] transition-colors"
            >
              <span
                className={cn(
                  "font-semibold",
                  progress.progressScore >= 80
                    ? "text-green-400"
                    : progress.progressScore >= 50
                      ? "text-[#0ea5e9]"
                      : "text-amber-400"
                )}
              >
                {progress.progressScore}%
              </span>
              Engine Score
            </Link>
          )}
        </div>
      </div>

      {/* ─── Row 1b: This Week's Focus + Weekly Update ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeeklyFocusCard />
        <WeeklyUpdateCard />
      </div>

      {/* ─── Row 1c: Alignment Analysis ─── */}
      <AlignmentAnalysisCard />

      {/* ─── Row 2: Quick Links ─── */}
      <div>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map((link) => {
            const url = QUICK_LINKS[link.key];
            const Icon = link.icon;
            const enabled = !!url;
            const isLocked = !isPro && PRO_QUICK_LINK_KEYS.includes(link.key);

            const inner = (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(0_0%_100%/0.06)]">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {isLocked ? (
                    <Lock className="h-3 w-3 text-[#0ea5e9]" />
                  ) : enabled ? (
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  ) : null}
                </div>
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    {enabled ? link.label : "Coming soon"}
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#0ea5e9]/15 text-[#0ea5e9]">
                        PRO
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {link.description}
                  </p>
                </div>
              </>
            );

            // Locked for free users — link to upgrade
            if (isLocked) {
              return (
                <Link
                  key={link.key}
                  href="/settings#subscription"
                  className="group flex flex-col gap-3 rounded-xl border p-4 transition-all border-[#0ea5e9]/10 bg-[#0ea5e9]/[0.02] hover:border-[#0ea5e9]/25 hover:bg-[#0ea5e9]/[0.04] cursor-pointer"
                >
                  {inner}
                </Link>
              );
            }

            return enabled ? (
              <a
                key={link.key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-3 rounded-xl border p-4 transition-all border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] hover:border-[hsl(0_0%_100%/0.15)] hover:bg-[hsl(0_0%_100%/0.04)] cursor-pointer"
              >
                {inner}
              </a>
            ) : (
              <div
                key={link.key}
                className="group flex flex-col gap-3 rounded-xl border p-4 transition-all border-[hsl(0_0%_100%/0.04)] bg-[hsl(0_0%_100%/0.01)] opacity-50 cursor-default"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Row 2b: Recent Activity ─── */}
      <RecentActivityStrip />

      {/* ─── Row 3: Next Step Card ─── */}
      <NextStepCard />
    </div>
  );
}

// ─── Alignment Analysis Card ───

function AlignmentAnalysisCard() {
  const { state, getActiveMechanism, getAlignmentAnalysis } = useApp();
  const mechanism = getActiveMechanism();
  const hasMechanism = !!mechanism;
  const analysis = mechanism ? getAlignmentAnalysis(mechanism.id) : null;
  const hasAnalysis = !!analysis && analysis.overallScore > 0;

  return (
    <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] p-5 transition-all hover:border-[hsl(0_0%_100%/0.12)] hover:bg-[hsl(0_0%_100%/0.04)]">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0ea5e9]/10">
          <BarChart3 className="h-5 w-5 text-[#0ea5e9]" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold">Alignment Analysis</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Uncover your revenue leaks and bottlenecks with key insights on what
            to do next
          </p>

          {hasAnalysis ? (
            <div className="mt-3 flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                  analysis.overallScore >= 80
                    ? "bg-green-500/10 text-green-400"
                    : analysis.overallScore >= 50
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-red-500/10 text-red-400"
                )}
              >
                {analysis.overallScore}/100
              </div>
              {analysis.revenueLeak && analysis.revenueLeak !== "See analysis" && (
                <span className="text-xs text-red-400">
                  {analysis.revenueLeak} leak
                </span>
              )}
              <Link
                href={`/sales-mechanism/${mechanism!.id}`}
                className="text-xs font-medium text-[#0ea5e9] hover:text-[#0ea5e9]/80 flex items-center gap-1 transition-colors ml-auto"
              >
                View Analysis <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : hasMechanism ? (
            <Link
              href={`/sales-mechanism/${mechanism!.id}`}
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-[#0ea5e9] text-white text-xs font-medium hover:bg-[#0ea5e9]/90 transition-colors"
            >
              Run Analysis <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            <Link
              href="/sales-mechanism/new"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Build a Sales Mechanism first{" "}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Weekly Focus Card ───

function WeeklyFocusCard() {
  const { state, setWeeklyFocus } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(state.weeklyFocus || "");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(state.weeklyFocus || "");
  }, [state.weeklyFocus]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      );
    }
  }, [editing]);

  const handleSave = () => {
    setWeeklyFocus(draft.trim());
    setEditing(false);
  };

  return (
    <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] p-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">This Week&apos;s Focus</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSave();
            }
          }}
          placeholder="What's the one thing you're focused on this week?"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[60px]"
          maxLength={300}
          rows={2}
        />
      ) : (
        <p
          className={cn(
            "text-sm",
            state.weeklyFocus
              ? "text-foreground"
              : "text-muted-foreground italic"
          )}
        >
          {state.weeklyFocus ||
            "No focus set for this week. Add one to keep your priorities visible every time you log in."}
        </p>
      )}
    </div>
  );
}

// ─── Weekly Update Card ───

function WeeklyUpdateCard() {
  const { state, setWeeklyUpdate } = useApp();
  const [editing, setEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(state.weeklyUpdate?.label || "");
  const [draftUrl, setDraftUrl] = useState(state.weeklyUpdate?.url || "");
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftLabel(state.weeklyUpdate?.label || "");
    setDraftUrl(state.weeklyUpdate?.url || "");
  }, [state.weeklyUpdate]);

  useEffect(() => {
    if (editing && labelRef.current) labelRef.current.focus();
  }, [editing]);

  const handleSave = () => {
    setWeeklyUpdate({ label: draftLabel.trim(), url: draftUrl.trim() });
    setEditing(false);
  };

  const hasUpdate = state.weeklyUpdate?.label && state.weeklyUpdate?.url;

  return (
    <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] p-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#0ea5e9]" />
          Weekly Update
        </h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <input
            ref={labelRef}
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder="Update title, e.g. Week 12 Update"
            className="w-full h-8 px-3 bg-transparent border border-[hsl(0_0%_100%/0.08)] rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50"
          />
          <input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleSave(); }
            }}
            onBlur={handleSave}
            placeholder="Link (Loom, Notion, etc.)"
            className="w-full h-8 px-3 bg-transparent border border-[hsl(0_0%_100%/0.08)] rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50"
          />
        </div>
      ) : hasUpdate ? (
        <a
          href={state.weeklyUpdate.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[#0ea5e9] hover:text-[#0ea5e9]/80 transition-colors"
        >
          {state.weeklyUpdate.label}
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No update this week. Add a link to your latest Loom or update.
        </p>
      )}
    </div>
  );
}

// ─── Recent Activity Strip ───

function RecentActivityStrip() {
  const { state } = useApp();
  const recent = (state.recentActivity || []).slice(0, 3);

  return (
    <div>
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Recent Activity
      </h2>
      {recent.length === 0 ? (
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            No recent activity — run your first tool to get started
          </p>
          <Link
            href="/tools"
            className="shrink-0 text-xs font-medium text-[#0ea5e9] hover:text-[#0ea5e9]/80 flex items-center gap-1 transition-colors"
          >
            Browse Tools <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recent.map((item) => (
            <Link
              key={item.id}
              href={
                item.href
                  ? item.href
                  : item.type === "tool"
                    ? `/tools/${item.slug}`
                    : `/playbooks/${item.slug}`
              }
              className="group flex items-center gap-3 rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] px-4 py-3 hover:border-[hsl(0_0%_100%/0.12)] hover:bg-[hsl(0_0%_100%/0.04)] transition-all"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(0_0%_100%/0.06)]">
                {item.type === "tool" ? (
                  <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span>{item.action}</span>
                  <span className="opacity-40">·</span>
                  <Clock className="h-2.5 w-2.5 inline" />
                  {timeAgo(item.timestamp)}
                </p>
              </div>
              <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Next Step Card ───

function NextStepCard() {
  const { state } = useApp();
  const progress = computeProgressState(state);
  const nextStep = progress.nextSteps[0];

  // All complete
  if (progress.progressScore === 100 || !nextStep) {
    return (
      <Link
        href="/revenue-engine"
        className="group block rounded-xl border border-green-500/20 bg-green-500/5 p-6 hover:border-green-500/30 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/20">
            <Sparkles className="h-5 w-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-green-400">
              Your Revenue Engine is complete
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Head to the Revenue Engine for your full overview.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-green-400 transition-colors" />
        </div>
      </Link>
    );
  }

  const colors = leverColors[nextStep.lever] || leverColors.foundation;

  return (
    <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Next Step
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
                colors.bg,
                colors.text
              )}
            >
              {nextStep.lever}
            </span>
            {nextStep.estimatedTime && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                {nextStep.estimatedTime}
              </span>
            )}
            {nextStep.isBlocking && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-[10px] font-medium text-amber-400">
                Blocking
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold">{nextStep.label}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {nextStep.description}
          </p>
        </div>
        <Link
          href={nextStep.route}
          className="shrink-0 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white text-sm font-medium transition-colors w-full sm:w-auto"
        >
          {nextStep.cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
