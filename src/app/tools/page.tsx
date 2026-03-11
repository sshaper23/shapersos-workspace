"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilter } from "@/components/tools/category-filter";
import { ToolCard } from "@/components/tools/tool-card";
import { tools } from "@/data/tools";
import { toolCategories } from "@/data/categories";

export default function ToolsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    let result = tools;
    if (category !== "all") {
      result = result.filter((t) => t.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, category]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Tools"
        subtitle="Discover and manage AI-powered tools for your business"
      />

      <CategoryFilter
        categories={toolCategories}
        selected={category}
        onChange={setCategory}
      />

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search tools..."
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} tools found
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
