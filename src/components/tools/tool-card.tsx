"use client";

import Link from "next/link";
import type { Tool } from "@/types/tool";
import { getIcon } from "@/lib/icons";
import { useTier } from "@/hooks/use-tier";
import { ProBadge } from "@/components/shared/upgrade-gate";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = getIcon(tool.icon);
  const { canAccessTool } = useTier();
  const isLocked = !canAccessTool(tool.slug);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={`group flex flex-col rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5 transition-all hover:border-[hsl(0_0%_100%/0.12)] hover:bg-[hsl(0_0%_100%/0.04)] ${isLocked ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(0_0%_100%/0.06)]">
          <Icon className={`h-5 w-5 ${isLocked ? "text-muted-foreground" : "text-[#0ea5e9]"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm text-foreground group-hover:text-white truncate">
              {tool.name}
            </h3>
            {isLocked && <ProBadge />}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[hsl(0_0%_100%/0.06)] text-muted-foreground capitalize">
              {tool.category.replace("-", " ")}
            </span>
            {tool.isNew && (
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
                New
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {tool.shortDescription}
      </p>
      {tool.popular && !isLocked && (
        <div className="mt-3 flex items-center gap-1">
          <span className="text-[10px] font-medium text-[#0ea5e9]">Popular</span>
        </div>
      )}
    </Link>
  );
}
