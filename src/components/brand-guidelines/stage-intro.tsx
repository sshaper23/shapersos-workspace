"use client";

import { MessageCircle } from "lucide-react";

interface StageIntroProps {
  intro: string;
}

export function StageIntro({ intro }: StageIntroProps) {
  return (
    <div className="flex gap-3 mb-6 rounded-xl border border-[#0ea5e9]/15 bg-[#0ea5e9]/5 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0ea5e9]/20 mt-0.5">
        <MessageCircle className="h-4 w-4 text-[#0ea5e9]" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{intro}</p>
    </div>
  );
}
