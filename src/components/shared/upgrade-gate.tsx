"use client";

import Link from "next/link";
import { Lock, Sparkles, Check } from "lucide-react";
import { UPGRADE_COPY } from "@/data/tier-config";

// ─── Pro Badge ───
// Small pill for cards, nav tooltips, etc.
export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#0ea5e9]/15 text-[#0ea5e9] ${className}`}
    >
      PRO
    </span>
  );
}

// ─── Upgrade Gate ───
// Full-page or inline overlay shown when a free user hits a pro feature.
export function UpgradeGate({
  feature,
  inline = false,
}: {
  feature: string;
  inline?: boolean;
}) {
  const copy = UPGRADE_COPY[feature] || UPGRADE_COPY.tools;

  if (inline) {
    // Compact inline version for embedding within existing UI
    return (
      <div className="rounded-xl border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-[#0ea5e9]" />
          <span className="text-sm font-semibold text-[#0ea5e9]">Pro Feature</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{copy.description}</p>
        <Link
          href="/settings#subscription"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0ea5e9] text-white text-sm font-medium hover:bg-[#0ea5e9]/90 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  // Full-page centered gate
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0ea5e9]/10 mb-6">
          <Lock className="h-8 w-8 text-[#0ea5e9]" />
        </div>

        <h2 className="text-xl font-bold mb-2">{copy.title}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {copy.description}
        </p>

        <div className="text-left rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            What&apos;s included
          </p>
          <ul className="space-y-2.5">
            {copy.features.map((feat) => (
              <li key={feat} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-[#0ea5e9] mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/settings#subscription"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Upgrade to Pro
        </Link>

        <p className="mt-4 text-xs text-muted-foreground">
          Unlock the full platform and remove all limits.
        </p>
      </div>
    </div>
  );
}
