import Link from "next/link";
import type { Flow } from "@/types/flow";

interface FlowCardProps {
  flow: Flow;
}

export function FlowCard({ flow }: FlowCardProps) {
  return (
    <Link
      href={`/workflows/${flow.slug}`}
      className="group flex flex-col rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5 transition-all hover:border-[hsl(0_0%_100%/0.12)] hover:bg-[hsl(0_0%_100%/0.04)]"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(0_0%_100%/0.06)]">
          <span className="text-lg">{flow.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm text-foreground group-hover:text-white truncate">
            {flow.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[hsl(0_0%_100%/0.06)] text-muted-foreground capitalize">
              {flow.category}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {flow.steps.length} steps
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {flow.shortDescription}
      </p>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>~{flow.estimatedTime}</span>
      </div>
    </Link>
  );
}
