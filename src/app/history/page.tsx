"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Download, Heart } from "lucide-react";

export default function HistoryPage() {
  const [tab, setTab] = useState<"tokens" | "tools">("tokens");

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Usage History"
        subtitle="View your token usage history and analytics over time"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[hsl(0_0%_100%/0.06)]">
        <button
          onClick={() => setTab("tokens")}
          className={
            tab === "tokens"
              ? "px-4 py-3 text-sm font-medium text-[#71a474] border-b-2 border-[#71a474]"
              : "px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          }
        >
          Token Usage
        </button>
        <button
          onClick={() => setTab("tools")}
          className={
            tab === "tools"
              ? "px-4 py-3 text-sm font-medium text-[#71a474] border-b-2 border-[#71a474]"
              : "px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          }
        >
          Tool Usage
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <select className="h-9 px-3 rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] text-xs text-foreground outline-none">
          <option>By Day</option>
          <option>By Week</option>
          <option>By Month</option>
        </select>
        <input
          type="date"
          className="h-9 px-3 rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] text-xs text-foreground outline-none"
        />
        <button className="ml-auto flex items-center gap-2 h-9 px-4 rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] text-xs text-foreground hover:bg-[hsl(0_0%_100%/0.08)] transition-colors">
          <Download className="h-3 w-3" /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] overflow-hidden mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Prompt Tokens</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion Tokens</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Tokens</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                No usage data yet. Start using tools to see your history.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Favorites */}
      <div>
        <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
          <Heart className="h-4 w-4" />
          Favorite Messages (0)
        </h3>
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-8 text-center text-sm text-muted-foreground">
          No favorites yet. Click the heart icon on any AI response to save it here.
        </div>
      </div>
    </div>
  );
}
