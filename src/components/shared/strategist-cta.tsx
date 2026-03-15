"use client";

import { useApp } from "@/context/app-context";
import { ArrowRight, X } from "lucide-react";
import {
  STRATEGIST_BOOKING_URL,
  ctaMessages,
  type CTAContext,
} from "@/config/upsell";

interface StrategistCTAProps {
  variant: "inline" | "banner" | "modal-footer";
  context: CTAContext;
}

export function StrategistCTA({ variant, context }: StrategistCTAProps) {
  const { dismissCTA, isCTAVisible } = useApp();

  if (!isCTAVisible()) return null;

  const msg = ctaMessages[context];

  if (variant === "banner") {
    return (
      <div className="relative rounded-xl border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 p-5 mb-4">
        <button
          onClick={dismissCTA}
          className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.08)] transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium text-[#0ea5e9] mb-1 pr-8">
          {msg.headline}
        </p>
        <p className="text-xs text-muted-foreground mb-3">{msg.body}</p>
        <a
          href={STRATEGIST_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#0ea5e9]/30 text-[#0ea5e9] text-xs font-medium hover:bg-[#0ea5e9]/10 transition-colors"
        >
          {msg.ctaLabel} <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    );
  }

  if (variant === "modal-footer") {
    return (
      <div className="flex items-center justify-between rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 mt-4">
        <div className="flex-1 min-w-0 mr-4">
          <p className="text-sm font-medium text-foreground">{msg.headline}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{msg.body}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={dismissCTA}
            className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
          <a
            href={STRATEGIST_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#0ea5e9]/30 text-[#0ea5e9] text-xs font-medium hover:bg-[#0ea5e9]/10 transition-colors"
          >
            {msg.ctaLabel} <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  // inline variant (default)
  return (
    <div className="relative rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 mt-4">
      <button
        onClick={dismissCTA}
        className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.08)] transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="text-sm font-medium text-foreground mb-1 pr-8">
        {msg.headline}
      </p>
      <p className="text-xs text-muted-foreground mb-3">{msg.body}</p>
      <a
        href={STRATEGIST_BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#0ea5e9]/30 text-[#0ea5e9] text-xs font-medium hover:bg-[#0ea5e9]/10 transition-colors"
      >
        {msg.ctaLabel} <ArrowRight className="h-3 w-3" />
      </a>
    </div>
  );
}
