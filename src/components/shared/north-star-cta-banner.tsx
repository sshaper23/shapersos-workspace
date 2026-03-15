"use client";

import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

export function NorthStarCTABanner() {
  return (
    <Link
      href="/north-star"
      className="flex items-center gap-3 p-4 mb-4 rounded-xl border border-[#0ea5e9]/30 bg-[#0ea5e9]/5 hover:bg-[#0ea5e9]/10 transition-colors group"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0ea5e9]/20">
        <Compass className="h-5 w-5 text-[#0ea5e9]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#0ea5e9]">
          Complete your North Star first for better results
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your business context powers every AI tool. Complete it once and every
          output becomes personalised to your business.
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-[#0ea5e9] shrink-0 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
