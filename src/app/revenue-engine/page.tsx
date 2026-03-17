"use client";

import Link from "next/link";
import {
  Zap,
  Compass,
  Palette,
  Route,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Grid3X3,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useApp } from "@/context/app-context";
import { StrategistCTA } from "@/components/shared/strategist-cta";
import { ProgressScoreRing } from "@/components/shared/progress-score-ring";
import { NextStepsPanel } from "@/components/shared/next-steps-panel";
import { computeProgressState } from "@/lib/progressService";
import { cn } from "@/lib/utils";
import { VideoWalkthroughBanner } from "@/components/shared/video-walkthrough-banner";

interface LeverStatus {
  label: string;
  icon: React.ReactNode;
  isComplete: boolean;
  statusLabel: string;
  href: string;
  ctaLabel: string;
  color: string;
  details: string[];
}

export default function RevenueEnginePage() {
  const { state, getActiveMechanism } = useApp();

  const hasNorthStar = state.hasCompletedNorthStar;
  const hasBrandGuidelines = state.hasCompletedBrandGuidelines;
  const hasMessagingMatrix = state.messagingMatrixState?.isComplete ?? false;
  const activeMechanism = getActiveMechanism();
  const hasMechanism = !!activeMechanism;

  // Offer lever = North Star complete (contains offer, ICP, etc.)
  const offerComplete = hasNorthStar;
  // Message lever = Brand Guidelines + Messaging Matrix
  const messageComplete = hasBrandGuidelines && hasMessagingMatrix;
  // Mechanism lever = has at least one mechanism
  const mechanismComplete = hasMechanism;

  const allComplete = offerComplete && messageComplete && mechanismComplete;
  const completedCount = [offerComplete, messageComplete, mechanismComplete].filter(Boolean).length;

  // Compute progress for score ring and next steps
  const progressState = computeProgressState(state);

  const levers: LeverStatus[] = [
    {
      label: "Offer",
      icon: <Compass className="h-6 w-6" />,
      isComplete: offerComplete,
      statusLabel: offerComplete ? "Active" : "Incomplete",
      href: "/north-star",
      ctaLabel: offerComplete ? "View North Star" : "Complete North Star",
      color: "#0ea5e9",
      details: [
        hasNorthStar ? "North Star document complete" : "North Star needed",
        state.northStarData?.uvp
          ? `UVP: ${state.northStarData.uvp.slice(0, 60)}...`
          : "No UVP defined yet",
        state.northStarData?.offer
          ? `Offer: ${state.northStarData.offer.slice(0, 60)}...`
          : "No offer defined yet",
      ],
    },
    {
      label: "Message",
      icon: <Palette className="h-6 w-6" />,
      isComplete: messageComplete,
      statusLabel: messageComplete
        ? "Active"
        : hasBrandGuidelines || hasMessagingMatrix
          ? "Partial"
          : "Incomplete",
      href: hasBrandGuidelines ? "/messaging-matrix" : "/brand-guidelines",
      ctaLabel: messageComplete
        ? "View Guidelines"
        : hasBrandGuidelines
          ? "Build Messaging Matrix"
          : "Start Brand Guidelines",
      color: "#a855f7",
      details: [
        hasBrandGuidelines
          ? "Brand Guidelines complete"
          : "Brand Guidelines needed",
        hasMessagingMatrix
          ? "Messaging Matrix complete"
          : "Messaging Matrix needed",
        state.brandGuidelinesData?.personalityDescription
          ? `Voice: ${state.brandGuidelinesData.personalityDescription.slice(0, 50)}...`
          : "No brand voice defined",
      ],
    },
    {
      label: "Mechanism",
      icon: <Route className="h-6 w-6" />,
      isComplete: mechanismComplete,
      statusLabel: mechanismComplete ? "Active" : "Incomplete",
      href: hasMechanism
        ? `/sales-mechanism/${activeMechanism?.id}`
        : "/sales-mechanism/new",
      ctaLabel: hasMechanism ? "View Mechanism" : "Map Your Mechanism",
      color: "#f59e0b",
      details: [
        hasMechanism
          ? `${activeMechanism?.name} (${activeMechanism?.stages.length} stages)`
          : "No mechanism mapped",
        activeMechanism?.metrics.coreOfferPrice
          ? `Offer: ${activeMechanism.metrics.coreOfferPrice}`
          : "No metrics set",
        activeMechanism?.metrics.leadVolume
          ? `Monthly Leads: ${activeMechanism.metrics.leadVolume}`
          : "No lead volume set",
      ],
    },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Revenue Engine"
        subtitle="Your three core levers: Offer, Message, and Mechanism"
      />

      <VideoWalkthroughBanner section="revenue-engine" />

      {/* Overall Health */}
      <div
        className={cn(
          "rounded-xl border p-6 mb-8",
          allComplete
            ? "border-green-500/30 bg-green-500/5"
            : "border-[#0ea5e9]/30 bg-[#0ea5e9]/5"
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
              allComplete ? "bg-green-500/20" : "bg-[#0ea5e9]/20"
            )}
          >
            <Zap
              className={cn(
                "h-7 w-7",
                allComplete ? "text-green-400" : "text-[#0ea5e9]"
              )}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2
                className={cn(
                  "text-lg font-semibold",
                  allComplete ? "text-green-400" : "text-[#0ea5e9]"
                )}
              >
                {allComplete
                  ? "Revenue Engine Active"
                  : `${completedCount}/3 Levers Complete`}
              </h2>
              {/* Progress dots */}
              <div className="flex gap-1">
                {[offerComplete, messageComplete, mechanismComplete].map(
                  (done, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 w-2 rounded-full",
                        done ? "bg-green-400" : "bg-[hsl(0_0%_100%/0.15)]"
                      )}
                    />
                  )
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {allComplete
                ? "All three levers are mapped. Your business context, messaging, and sales mechanism data are injected into every AI output."
                : "Complete all three levers to unlock full context injection across all AI tools and playbooks."}
            </p>
          </div>
          {/* Progress Score Ring */}
          <ProgressScoreRing score={progressState.progressScore} />
        </div>
      </div>

      {/* Three Lever Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {levers.map((lever) => (
          <div
            key={lever.label}
            className={cn(
              "rounded-xl border p-6 transition-all",
              lever.isComplete
                ? "border-green-500/20 bg-[hsl(0_0%_100%/0.02)]"
                : "border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)]"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${lever.color}20`, color: lever.color }}
                >
                  {lever.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold">{lever.label}</h3>
                  <div className="flex items-center gap-1.5">
                    {lever.isComplete ? (
                      <CheckCircle2 className="h-3 w-3 text-green-400" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-amber-400" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        lever.isComplete ? "text-green-400" : "text-amber-400"
                      )}
                    >
                      {lever.statusLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              {lever.details.map((detail, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full mt-1.5 shrink-0",
                      detail.includes("complete") || detail.includes("Active")
                        ? "bg-green-400"
                        : detail.includes("needed") || detail.includes("No ")
                          ? "bg-amber-400"
                          : "bg-[hsl(0_0%_100%/0.2)]"
                    )}
                  />
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            <Link
              href={lever.href}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                lever.isComplete
                  ? "border border-[hsl(0_0%_100%/0.08)] text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
                  : "text-white hover:opacity-90"
              )}
              style={
                !lever.isComplete
                  ? { backgroundColor: lever.color }
                  : undefined
              }
            >
              {lever.ctaLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-6 mb-8">
        <h3 className="text-sm font-semibold mb-4">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/north-star"
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[hsl(0_0%_100%/0.08)] hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
          >
            <Compass className="h-4 w-4 text-[#0ea5e9]" />
            <span className="text-sm">North Star</span>
          </Link>
          <Link
            href="/brand-guidelines"
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[hsl(0_0%_100%/0.08)] hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
          >
            <Palette className="h-4 w-4 text-purple-400" />
            <span className="text-sm">Brand Guidelines</span>
          </Link>
          <Link
            href="/messaging-matrix"
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[hsl(0_0%_100%/0.08)] hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
          >
            <Grid3X3 className="h-4 w-4 text-green-400" />
            <span className="text-sm">Messaging Matrix</span>
          </Link>
          <Link
            href="/sales-mechanism"
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[hsl(0_0%_100%/0.08)] hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
          >
            <Route className="h-4 w-4 text-amber-400" />
            <span className="text-sm">Sales Mechanism</span>
          </Link>
        </div>
      </div>

      {/* Next Steps Panel */}
      {progressState.nextSteps.length > 0 && (
        <div className="mb-8">
          <NextStepsPanel steps={progressState.nextSteps} />
        </div>
      )}

      {/* StrategistCTA */}
      {allComplete && <StrategistCTA variant="banner" context="revenueEngine" />}
    </div>
  );
}
