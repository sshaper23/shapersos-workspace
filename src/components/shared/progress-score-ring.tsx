"use client";

import { cn } from "@/lib/utils";

interface ProgressScoreRingProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressScoreRing({
  score,
  size = 72,
  strokeWidth = 5,
  className,
}: ProgressScoreRingProps) {
  // Never show below 20%
  if (score < 20) return null;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Color based on score
  const color =
    score >= 80
      ? "#22c55e" // green
      : score >= 50
        ? "#0ea5e9" // blue
        : "#f59e0b"; // amber

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(0 0% 100% / 0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-lg font-bold leading-none"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-[9px] text-muted-foreground leading-none mt-0.5">
          score
        </span>
      </div>
    </div>
  );
}
