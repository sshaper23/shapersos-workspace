"use client";

import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: readonly { slug: string; label: string }[];
  selected: string;
  onChange: (slug: string) => void;
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onChange(cat.slug)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            selected === cat.slug
              ? "bg-[#71a474]/20 text-[#71a474] border border-[#71a474]/30"
              : "bg-[hsl(0_0%_100%/0.04)] text-muted-foreground border border-transparent hover:bg-[hsl(0_0%_100%/0.08)] hover:text-foreground"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
