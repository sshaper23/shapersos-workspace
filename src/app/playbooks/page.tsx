"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilter } from "@/components/tools/category-filter";
import { CategorySection } from "@/components/shared/category-section";
import { FlowCard } from "@/components/flows/flow-card";
import { flows } from "@/data/flows";
import { flowCategories, flowCategoryMeta } from "@/data/categories";
import { VideoWalkthroughBanner } from "@/components/shared/video-walkthrough-banner";

export default function PlaybooksPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  /* Group playbooks by category, then apply search filter */
  const groupedFlows = useMemo(() => {
    const q = search.toLowerCase();
    const cats = flowCategories.filter((c) => c.slug !== "all");
    return cats
      .map((cat) => {
        const catFlows = flows.filter((f) => f.category === cat.slug);
        const filtered = search
          ? catFlows.filter(
              (f) =>
                f.name.toLowerCase().includes(q) ||
                f.description.toLowerCase().includes(q)
            )
          : catFlows;
        const meta = flowCategoryMeta[cat.slug] || {
          icon: "layers",
          description: "",
        };
        return {
          slug: cat.slug,
          label: cat.label,
          ...meta,
          flows: filtered,
        };
      })
      .filter((group) => group.flows.length > 0);
  }, [search]);

  const totalCount = groupedFlows.reduce((sum, g) => sum + g.flows.length, 0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Playbooks"
        subtitle="Guided execution of your proven strategies — follow the steps, get the results"
      />

      <VideoWalkthroughBanner section="playbooks" />

      <CategoryFilter
        categories={flowCategories}
        selected={activeCategory}
        onChange={setActiveCategory}
        scrollMode
      />

      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search playbooks..."
          />
        </div>
        <span className="text-sm text-muted-foreground tabular-nums">
          {totalCount} playbooks
        </span>
      </div>

      {/* ── Category sections ── */}
      {groupedFlows.map((group) => (
        <CategorySection
          key={group.slug}
          id={group.slug}
          label={group.label}
          icon={group.icon}
          count={group.flows.length}
          description={group.description}
        >
          {group.flows.map((flow) => (
            <FlowCard key={flow.slug} flow={flow} />
          ))}
        </CategorySection>
      ))}

      {totalCount === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">
            No playbooks found matching &ldquo;{search}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
