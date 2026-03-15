"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, Palette } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useApp } from "@/context/app-context";

export default function BrandGuidelinesViewPage() {
  const { state } = useApp();
  const guidelines = state.brandGuidelinesData?.synthesizedGuidelines;

  if (!guidelines) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <PageHeader title="Brand Guidelines" subtitle="View your synthesised brand guidelines" />
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(0_0%_100%/0.08)] mx-auto mb-4">
            <Palette className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No Guidelines Yet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Complete the brand discovery process to generate your guidelines.
          </p>
          <Link
            href="/brand-guidelines/build"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors"
          >
            Start Brand Discovery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Brand Guidelines" subtitle="Your synthesised brand identity document">
        <div className="flex items-center gap-2">
          <Link
            href="/brand-guidelines/build"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[hsl(0_0%_100%/0.08)] text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Edit Answers
          </Link>
          <Link
            href="/brand-guidelines"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[hsl(0_0%_100%/0.08)] text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Link>
        </div>
      </PageHeader>

      <div className="max-w-3xl mx-auto">
        {/* Status badge */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Active — Injected into all AI outputs
          </div>
        </div>

        {/* Guidelines Content */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-8">
          <div className="prose prose-sm prose-invert max-w-none text-sm whitespace-pre-wrap leading-relaxed">
            {guidelines}
          </div>
        </div>
      </div>
    </div>
  );
}
