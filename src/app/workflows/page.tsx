"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilter } from "@/components/tools/category-filter";
import { FlowCard } from "@/components/flows/flow-card";
import { flows } from "@/data/flows";
import { flowCategories } from "@/data/categories";

export default function WorkflowsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    let result = flows;
    if (category !== "all") {
      result = result.filter((f) => f.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, category]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Workflows"
        subtitle="Multi-step AI workflows that chain tools together"
      />

      <CategoryFilter
        categories={flowCategories}
        selected={category}
        onChange={setCategory}
      />

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search workflows..."
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} workflows found
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((flow) => (
          <FlowCard key={flow.slug} flow={flow} />
        ))}
      </div>
    </div>
  );
}
