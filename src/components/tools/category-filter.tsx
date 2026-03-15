"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: readonly { slug: string; label: string }[];
  selected: string;
  onChange: (slug: string) => void;
  /** When true, pills scroll-to sections instead of filtering. Active pill auto-highlights via IntersectionObserver. */
  scrollMode?: boolean;
}

export function CategoryFilter({
  categories,
  selected,
  onChange,
  scrollMode,
}: CategoryFilterProps) {
  const [activeSection, setActiveSection] = useState("all");

  // IntersectionObserver: watch section headings and highlight the one in view
  useEffect(() => {
    if (!scrollMode) return;

    const sectionIds = categories
      .filter((c) => c.slug !== "all")
      .map((c) => c.slug);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [scrollMode, categories]);

  const handleClick = useCallback(
    (slug: string) => {
      if (scrollMode) {
        if (slug === "all") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          const el = document.getElementById(slug);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }
        setActiveSection(slug);
      }
      onChange(slug);
    },
    [scrollMode, onChange]
  );

  const current = scrollMode ? activeSection : selected;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 mb-4",
        scrollMode && "sticky top-0 z-10 bg-[#060918]/95 backdrop-blur-sm py-3 -mx-6 px-6"
      )}
    >
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => handleClick(cat.slug)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            current === cat.slug
              ? "bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/30"
              : "bg-[hsl(0_0%_100%/0.04)] text-muted-foreground border border-transparent hover:bg-[hsl(0_0%_100%/0.08)] hover:text-foreground"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
