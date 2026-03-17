"use client";

import { useState, useMemo } from "react";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilter } from "@/components/tools/category-filter";
import { CategorySection } from "@/components/shared/category-section";
import { ToolCard } from "@/components/tools/tool-card";
import { tools } from "@/data/tools";
import { toolSuperCategories } from "@/data/categories";
import { VideoWalkthroughBanner } from "@/components/shared/video-walkthrough-banner";

/* Build pill-bar categories from super-categories */
const filterCategories = [
  { slug: "all", label: "All" },
  ...toolSuperCategories.map((sc) => ({ slug: sc.slug, label: sc.label })),
] as const;

export default function ToolsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  /* Popular tools (only shown when not searching) */
  const popularTools = useMemo(() => tools.filter((t) => t.popular), []);

  /* Group tools by super-category, then apply search filter */
  const groupedTools = useMemo(() => {
    const q = search.toLowerCase();
    return toolSuperCategories
      .map((superCat) => {
        const sectionTools = tools.filter((t) =>
          (superCat.categories as readonly string[]).includes(t.category)
        );
        const filtered = search
          ? sectionTools.filter(
              (t) =>
                t.name.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q)
            )
          : sectionTools;
        return { ...superCat, tools: filtered };
      })
      .filter((group) => group.tools.length > 0);
  }, [search]);

  /* Search-filtered popular */
  const filteredPopular = useMemo(() => {
    if (!search) return popularTools;
    const q = search.toLowerCase();
    return popularTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [search, popularTools]);

  const totalCount = groupedTools.reduce((sum, g) => sum + g.tools.length, 0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Tools"
        subtitle="AI-powered tools for your business"
      />

      <VideoWalkthroughBanner section="tools" />

      <CategoryFilter
        categories={filterCategories}
        selected={activeCategory}
        onChange={setActiveCategory}
        scrollMode
      />

      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search tools..."
          />
        </div>
        <span className="text-sm text-muted-foreground tabular-nums">
          {totalCount} tools
        </span>
      </div>

      {/* ── Popular section ── */}
      {filteredPopular.length > 0 && !search && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Star className="h-4 w-4 text-amber-400" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Popular
            </h2>
            <span className="text-[11px] text-muted-foreground bg-[hsl(0_0%_100%/0.06)] px-2 py-0.5 rounded-full tabular-nums">
              {filteredPopular.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredPopular.map((tool) => (
              <ToolCard key={`popular-${tool.slug}`} tool={tool} />
            ))}
          </div>
          <hr className="mt-10 border-[hsl(0_0%_100%/0.06)]" />
        </section>
      )}

      {/* ── Category sections ── */}
      {groupedTools.map((group) => (
        <CategorySection
          key={group.slug}
          id={group.slug}
          label={group.label}
          icon={group.icon}
          count={group.tools.length}
          description={group.description}
        >
          {group.tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </CategorySection>
      ))}

      {totalCount === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">
            No tools found matching &ldquo;{search}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
