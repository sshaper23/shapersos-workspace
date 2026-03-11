import Link from "next/link";
import type { Tool } from "@/types/tool";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5 transition-all hover:border-[hsl(0_0%_100%/0.12)] hover:bg-[hsl(0_0%_100%/0.04)]"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(0_0%_100%/0.06)]">
          <span className="text-lg">{tool.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm text-foreground group-hover:text-white truncate">
            {tool.name}
          </h3>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[hsl(0_0%_100%/0.06)] text-muted-foreground capitalize">
            {tool.category.replace("-", " ")}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {tool.shortDescription}
      </p>
      {tool.popular && (
        <div className="mt-3 flex items-center gap-1">
          <span className="text-[10px] font-medium text-[#71a474]">Popular</span>
        </div>
      )}
    </Link>
  );
}
