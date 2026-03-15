"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Palette,
  Route,
  Grid3X3,
  Play,
  CheckCircle2,
  X,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { getProgressBarState } from "@/lib/progressService";
import type { ProgressBarState } from "@/types/progress";
import { cn } from "@/lib/utils";

interface BarConfig {
  label: string;
  description: string;
  cta: string;
  href: string;
  icon: React.ReactNode;
  color: "amber" | "blue" | "green";
}

const barConfigs: Record<ProgressBarState, BarConfig> = {
  "north-star": {
    label: "Complete your North Star",
    description:
      "Your business profile powers every AI tool. Complete it once and every output becomes personalised.",
    cta: "Complete North Star",
    href: "/north-star",
    icon: <Compass className="h-4 w-4" />,
    color: "amber",
  },
  "brand-guidelines": {
    label: "Build your Brand Guidelines",
    description:
      "Define your voice, personality, and language patterns so all AI outputs match your brand.",
    cta: "Build Guidelines",
    href: "/brand-guidelines",
    icon: <Palette className="h-4 w-4" />,
    color: "blue",
  },
  offer: {
    label: "Define your Offer",
    description:
      "Clarify your unique value proposition, core offer, and ideal customer profile.",
    cta: "Complete Offer",
    href: "/north-star",
    icon: <Compass className="h-4 w-4" />,
    color: "amber",
  },
  mechanism: {
    label: "Map your Sales Mechanism",
    description:
      "Map your buying journey, key metrics, and highest-leverage fixes to complete your Revenue Engine.",
    cta: "Map Mechanism",
    href: "/sales-mechanism/new",
    icon: <Route className="h-4 w-4" />,
    color: "blue",
  },
  "messaging-matrix": {
    label: "Build your Messaging Matrix",
    description:
      "7-step AI research flow that maps your audience psychology and messaging angles.",
    cta: "Build Matrix",
    href: "/messaging-matrix",
    icon: <Grid3X3 className="h-4 w-4" />,
    color: "blue",
  },
  "playbook-recommendation": {
    label: "Run the HIRO Campaign Launch playbook",
    description:
      "Your Revenue Engine is complete. Deploy it with the HIRO Campaign Launch playbook.",
    cta: "Launch Playbook",
    href: "/playbooks/hiro-campaign",
    icon: <Play className="h-4 w-4" />,
    color: "blue",
  },
  "all-complete": {
    label: "Revenue Engine Active",
    description:
      "All levers are mapped. Your full context is injected into every AI output.",
    cta: "View Revenue Engine",
    href: "/revenue-engine",
    icon: <Zap className="h-4 w-4" />,
    color: "green",
  },
};

const colorStyles = {
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    text: "text-amber-400",
    button: "bg-amber-500 hover:bg-amber-500/90 text-white",
  },
  blue: {
    border: "border-[#0ea5e9]/30",
    bg: "bg-[#0ea5e9]/5",
    iconBg: "bg-[#0ea5e9]/20",
    iconColor: "text-[#0ea5e9]",
    text: "text-[#0ea5e9]",
    button: "bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white",
  },
  green: {
    border: "border-green-500/30",
    bg: "bg-green-500/5",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
    text: "text-green-400",
    button:
      "border border-green-500/30 text-green-400 hover:bg-green-500/10",
  },
};

export function AdaptiveProgressBar() {
  const { state, isProgressStepDismissed, dismissProgressStep } = useApp();
  const [localDismissed, setLocalDismissed] = useState(false);

  const barState = getProgressBarState(state);
  const config = barConfigs[barState];
  const styles = colorStyles[config.color];

  // Don't show if this step has been dismissed this session or in state
  if (localDismissed || isProgressStepDismissed(barState)) {
    return null;
  }

  // "all-complete" shows as a compact success state
  if (barState === "all-complete") {
    return (
      <Link
        href={config.href}
        className={cn(
          "group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
          styles.border,
          styles.bg,
          "hover:border-green-500/50"
        )}
      >
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", styles.iconBg)}>
          <CheckCircle2 className={cn("h-4 w-4", styles.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <span className={cn("text-sm font-medium", styles.text)}>
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
            {config.description}
          </span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-green-400 transition-colors shrink-0" />
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border transition-all",
        styles.border,
        styles.bg
      )}
    >
      {/* Mobile: stacked layout */}
      <div className="flex items-center gap-3 px-4 py-3 sm:hidden">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            styles.iconBg
          )}
        >
          <span className={styles.iconColor}>{config.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-medium text-muted-foreground">
            Next Step:
          </span>
          <h3 className={cn("text-sm font-semibold leading-tight", styles.text)}>
            {config.label}
          </h3>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            setLocalDismissed(true);
            dismissProgressStep(barState);
          }}
          className="shrink-0 p-1 rounded-md hover:bg-[hsl(0_0%_100%/0.08)] text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="px-4 pb-3 sm:hidden">
        <Link
          href={config.href}
          className={cn(
            "flex items-center justify-center gap-1.5 w-full px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors",
            styles.button
          )}
        >
          {config.cta}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Desktop: single row layout */}
      <div className="hidden sm:flex items-center gap-4 px-4 py-3.5">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            styles.iconBg
          )}
        >
          <span className={styles.iconColor}>{config.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-medium text-muted-foreground">
            Next Step:
          </span>
          <h3 className={cn("text-sm font-semibold", styles.text)}>
            {config.label}
          </h3>
        </div>
        <Link
          href={config.href}
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors",
            styles.button
          )}
        >
          {config.cta}
          <ArrowRight className="h-3 w-3" />
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            setLocalDismissed(true);
            dismissProgressStep(barState);
          }}
          className="shrink-0 p-1 rounded-md hover:bg-[hsl(0_0%_100%/0.08)] text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
