"use client";

import { getIcon } from "@/lib/icons";

interface CategorySectionProps {
  id: string;
  label: string;
  icon: string;
  count: number;
  description?: string;
  children: React.ReactNode;
}

export function CategorySection({
  id,
  label,
  icon,
  count,
  description,
  children,
}: CategorySectionProps) {
  const Icon = getIcon(icon);

  return (
    <section id={id} className="mb-10 scroll-mt-28">
      <div className="flex items-center gap-3 mb-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0ea5e9]/10">
          <Icon className="h-4 w-4 text-[#0ea5e9]" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{label}</h2>
        <span className="text-[11px] text-muted-foreground bg-[hsl(0_0%_100%/0.06)] px-2 py-0.5 rounded-full tabular-nums">
          {count}
        </span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mb-4 ml-11">
          {description}
        </p>
      )}
      {!description && <div className="mb-4" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {children}
      </div>
    </section>
  );
}
