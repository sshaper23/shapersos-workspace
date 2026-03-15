"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
} from "lucide-react";
import type { NextStep } from "@/types/progress";
import { cn } from "@/lib/utils";

interface NextStepsPanelProps {
  steps: NextStep[];
  maxVisible?: number;
}

const leverColors: Record<string, string> = {
  foundation: "#0ea5e9",
  offer: "#0ea5e9",
  message: "#a855f7",
  mechanism: "#f59e0b",
  growth: "#22c55e",
};

export function NextStepsPanel({
  steps,
  maxVisible = 5,
}: NextStepsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (steps.length === 0) return null;

  const visibleSteps = expanded ? steps : steps.slice(0, maxVisible);
  const hasMore = steps.length > maxVisible;

  return (
    <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)]">
      <div className="px-5 py-4 border-b border-[hsl(0_0%_100%/0.06)]">
        <h3 className="text-sm font-semibold">Your Next Steps</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Prioritised actions to strengthen your Revenue Engine
        </p>
      </div>

      <div className="divide-y divide-[hsl(0_0%_100%/0.04)]">
        {visibleSteps.map((step, index) => (
          <Link
            key={step.id}
            href={step.route}
            className="group flex items-start gap-3 px-5 py-4 hover:bg-[hsl(0_0%_100%/0.03)] transition-colors"
          >
            {/* Step number */}
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5"
              style={{
                backgroundColor: `${leverColors[step.lever] || "#0ea5e9"}15`,
                color: leverColors[step.lever] || "#0ea5e9",
              }}
            >
              {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                  {step.label}
                </span>
                {step.isBlocking && (
                  <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {step.description}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-medium",
                    step.isBlocking
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-[hsl(0_0%_100%/0.06)] text-muted-foreground"
                  )}
                >
                  {step.isBlocking ? "Blocking" : step.lever}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  {step.estimatedTime}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0 mt-1 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Expand / Collapse */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-3 border-t border-[hsl(0_0%_100%/0.06)] text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Show {steps.length - maxVisible} more{" "}
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
