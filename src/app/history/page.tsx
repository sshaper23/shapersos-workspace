"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Download, Heart, Trash2, X } from "lucide-react";
import { useApp } from "@/context/app-context";

export default function HistoryPage() {
  const { getTokenUsageHistory, clearTokenUsageHistory, getFavorites, removeFavorite } = useApp();
  const [tab, setTab] = useState<"tokens" | "favorites">("tokens");
  const [expandedFav, setExpandedFav] = useState<string | null>(null);

  const usageHistory = getTokenUsageHistory();
  const favorites = getFavorites();

  // Summary stats
  const stats = useMemo(() => {
    const records = usageHistory;
    const totalPrompt = records.reduce((sum, r) => sum + r.promptTokens, 0);
    const totalCompletion = records.reduce((sum, r) => sum + r.completionTokens, 0);
    return {
      totalRequests: records.length,
      totalPrompt,
      totalCompletion,
      totalTokens: totalPrompt + totalCompletion,
    };
  }, [usageHistory]);

  const handleExportCSV = () => {
    if (usageHistory.length === 0) return;
    const headers = "Model,Prompt Tokens,Completion Tokens,Total Tokens,Tool,Playbook,Date\n";
    const rows = usageHistory
      .map((r) =>
        [
          r.model,
          r.promptTokens,
          r.completionTokens,
          r.totalTokens,
          r.toolSlug || "",
          r.playbookSlug || "",
          new Date(r.timestamp).toISOString(),
        ].join(",")
      )
      .join("\n");
    const csv = headers + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shapers-usage-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Usage History"
        subtitle="View your token usage history and saved favorites"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
          <p className="text-xs text-muted-foreground">Total Requests</p>
          <p className="text-2xl font-semibold mt-1">{stats.totalRequests.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
          <p className="text-xs text-muted-foreground">Prompt Tokens</p>
          <p className="text-2xl font-semibold mt-1">{stats.totalPrompt.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
          <p className="text-xs text-muted-foreground">Completion Tokens</p>
          <p className="text-2xl font-semibold mt-1">{stats.totalCompletion.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
          <p className="text-xs text-muted-foreground">Total Tokens</p>
          <p className="text-2xl font-semibold mt-1">{stats.totalTokens.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[hsl(0_0%_100%/0.06)]">
        <button
          onClick={() => setTab("tokens")}
          className={
            tab === "tokens"
              ? "px-4 py-3 text-sm font-medium text-[#0ea5e9] border-b-2 border-[#0ea5e9]"
              : "px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          }
        >
          Token Usage ({usageHistory.length})
        </button>
        <button
          onClick={() => setTab("favorites")}
          className={
            tab === "favorites"
              ? "px-4 py-3 text-sm font-medium text-[#0ea5e9] border-b-2 border-[#0ea5e9]"
              : "px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          }
        >
          <span className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5" />
            Favorites ({favorites.length})
          </span>
        </button>
      </div>

      {tab === "tokens" && (
        <>
          {/* Actions */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleExportCSV}
              disabled={usageHistory.length === 0}
              className="flex items-center gap-2 h-9 px-4 rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] text-xs text-foreground hover:bg-[hsl(0_0%_100%/0.08)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download className="h-3 w-3" /> Export CSV
            </button>
            {usageHistory.length > 0 && (
              <button
                onClick={clearTokenUsageHistory}
                className="flex items-center gap-2 h-9 px-4 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Clear History
              </button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tool / Playbook</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Prompt</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {usageHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No usage data yet. Start using tools to see your history.
                    </td>
                  </tr>
                ) : (
                  usageHistory.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-[hsl(0_0%_100%/0.04)] hover:bg-[hsl(0_0%_100%/0.02)]"
                    >
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-0.5 rounded bg-[hsl(0_0%_100%/0.06)] text-xs">
                          {record.model.replace("claude-", "").replace(/-\d{8}$/, "")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {record.toolSlug || record.playbookSlug || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right tabular-nums">
                        {record.promptTokens.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right tabular-nums">
                        {record.completionTokens.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right tabular-nums font-medium">
                        {record.totalTokens.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                        {new Date(record.timestamp).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "favorites" && (
        <div className="space-y-3">
          {favorites.length === 0 ? (
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-8 text-center text-sm text-muted-foreground">
              No favorites yet. Click the heart icon on any AI response to save it here.
            </div>
          ) : (
            favorites.map((fav) => (
              <div
                key={fav.id}
                className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(0_0%_100%/0.04)]">
                  <div className="flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5 text-red-400 fill-red-400" />
                    <span className="text-xs text-muted-foreground">
                      {fav.toolName || fav.playbookName || "AI Response"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {new Date(fav.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedFav(expandedFav === fav.id ? null : fav.id)}
                      className="text-xs text-[#0ea5e9] hover:underline"
                    >
                      {expandedFav === fav.id ? "Collapse" : "Expand"}
                    </button>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="p-1 rounded text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="px-4 py-3">
                  {expandedFav === fav.id ? (
                    <MarkdownRenderer content={fav.content} />
                  ) : (
                    <p className="text-sm text-[hsl(0_0%_100%/0.6)] line-clamp-3">
                      {fav.content.slice(0, 300)}{fav.content.length > 300 ? "..." : ""}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
