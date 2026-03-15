"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Route,
  AlertTriangle,
  BarChart3,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/app-context";
import { PageHeader } from "@/components/shared/page-header";
import { AlignmentChat } from "@/components/alignment/alignment-chat";
import type { MechanismStageType } from "@/types/context";

const stageTypeColors: Record<MechanismStageType, { bg: string; border: string; text: string; dot: string }> = {
  entry: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", dot: "bg-blue-400" },
  nurture: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", dot: "bg-purple-400" },
  conversion: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", dot: "bg-green-400" },
  onboarding: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", dot: "bg-cyan-400" },
  ascension: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400" },
};

export default function MechanismViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { state, deleteMechanism, setActiveMechanism } = useApp();
  const mechanism = state.mechanisms.find((m) => m.id === id);

  if (!mechanism) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto text-center py-20">
        <Route className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">Mechanism Not Found</h2>
        <p className="text-sm text-muted-foreground mb-4">
          This mechanism may have been deleted.
        </p>
        <Link
          href="/sales-mechanism"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0ea5e9] text-white text-sm font-medium hover:bg-[#0ea5e9]/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Mechanisms
        </Link>
      </div>
    );
  }

  const isActive = state.activeMechanismId === mechanism.id;

  const handleDelete = () => {
    deleteMechanism(mechanism.id);
    router.push("/sales-mechanism");
  };

  // Revenue calculations — use stage-level close rate if available
  let closeRate = 0;
  for (const stage of mechanism.stages) {
    if (stage.type === "conversion") {
      const cr = (stage.stageMetrics || []).find(
        (m) => m.label.toLowerCase().includes("close") || m.label.toLowerCase().includes("conversion rate")
      );
      if (cr?.value) {
        closeRate = parseFloat(cr.value) || 0;
      }
    }
  }

  const price =
    parseFloat(mechanism.metrics.coreOfferPrice?.replace(/[^0-9.]/g, "") || "0") || 0;
  const ltv =
    parseFloat(mechanism.metrics.ltv?.replace(/[^0-9.]/g, "") || "0") || 0;
  const leadVol = parseFloat(mechanism.metrics.leadVolume) || 0;
  const cpl = parseFloat(mechanism.metrics.costPerLead?.replace(/[^0-9.]/g, "") || "0") || 0;
  const revPer100 = (closeRate / 100) * 100 * price;
  const ltvMultiple = price > 0 ? ltv / price : 0;
  const monthlyRevenue = leadVol * (closeRate / 100) * price;
  const monthlyCost = leadVol * cpl;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title={mechanism.name}
        subtitle={[mechanism.linkedOffer, mechanism.funnelType && `${mechanism.funnelType} funnel`].filter(Boolean).join(" · ") || "Sales Mechanism Map"}
      >
        <div className="flex items-center gap-2">
          {!isActive && (
            <button
              onClick={() => setActiveMechanism(mechanism.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#0ea5e9]/30 text-xs font-medium text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition-colors"
            >
              Set as Active
            </button>
          )}
          {isActive && (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0ea5e9]/10 text-xs font-medium text-[#0ea5e9]">
              Active Context
            </span>
          )}
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[hsl(0_0%_100%/0.08)] text-xs font-medium text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
          <Link
            href="/sales-mechanism"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[hsl(0_0%_100%/0.08)] text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Link>
        </div>
      </PageHeader>

      {/* Visual Journey Map */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-6 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
          <Route className="h-4 w-4" />
          Buying Journey
        </h2>
        <div className="overflow-x-auto">
          <div className="flex items-stretch gap-0 min-w-max">
            {mechanism.stages.map((stage, idx) => {
              const colors = stageTypeColors[stage.type];
              const stageMetrics = stage.stageMetrics || [];

              return (
                <div key={stage.id} className="flex items-stretch">
                  <div
                    className={cn(
                      "relative rounded-xl border p-4 w-60 flex flex-col",
                      colors.bg,
                      colors.border,
                      stage.dropOffRisk === "high" && "ring-1 ring-red-500/40"
                    )}
                  >
                    {/* Stage number + type */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                            colors.bg,
                            colors.text
                          )}
                        >
                          {idx + 1}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full",
                            colors.bg,
                            colors.text
                          )}
                        >
                          {stage.type}
                        </span>
                      </div>
                      {stage.dropOffRisk === "high" && (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      )}
                    </div>

                    <h3 className="font-semibold text-sm mb-1">{stage.name}</h3>

                    {stage.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {stage.description}
                      </p>
                    )}

                    {stage.action && (
                      <div className="pt-2 border-t border-[hsl(0_0%_100%/0.06)]">
                        <span className="text-[10px] text-muted-foreground">
                          Action:
                        </span>
                        <p className="text-xs font-medium">{stage.action}</p>
                      </div>
                    )}

                    {stage.tool && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Tool: {stage.tool}
                      </p>
                    )}

                    {/* Per-stage tracked metrics */}
                    {stageMetrics.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[hsl(0_0%_100%/0.06)] space-y-1">
                        {stageMetrics.map((m) => (
                          <div key={m.id} className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground flex items-center gap-1">
                              {m.suggestedByAI && (
                                <Sparkles className="h-2.5 w-2.5 text-[#0ea5e9]" />
                              )}
                              {m.label}
                            </span>
                            <span className={cn("font-medium", m.value ? "text-foreground" : "text-muted-foreground/50")}>
                              {m.value || "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Drop-off indicator */}
                    <div className="mt-auto pt-2 flex items-center gap-1.5">
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          stage.dropOffRisk === "high"
                            ? "bg-red-400"
                            : stage.dropOffRisk === "medium"
                              ? "bg-amber-400"
                              : "bg-green-400"
                        )}
                      />
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {stage.dropOffRisk} drop-off
                      </span>
                      {stage.conversionRate && (
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {stage.conversionRate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow connector */}
                  {idx < mechanism.stages.length - 1 && (
                    <div className="flex items-center px-2">
                      <div className="w-8 h-px bg-[hsl(0_0%_100%/0.2)]" />
                      <ArrowRight className="h-4 w-4 text-[hsl(0_0%_100%/0.3)] -ml-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metrics & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Key Metrics */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#0ea5e9]" />
            Key Metrics
          </h3>
          <div className="space-y-3 text-sm">
            {mechanism.metrics.primaryLeadSource && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lead Source</span>
                <span className="font-medium">{mechanism.metrics.primaryLeadSource}</span>
              </div>
            )}
            {mechanism.metrics.leadVolume && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Leads</span>
                <span className="font-medium">{mechanism.metrics.leadVolume}</span>
              </div>
            )}
            {mechanism.metrics.costPerLead && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPL</span>
                <span className="font-medium">{mechanism.metrics.costPerLead}</span>
              </div>
            )}
            {mechanism.metrics.coreOfferPrice && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Offer Price</span>
                <span className="font-medium">{mechanism.metrics.coreOfferPrice}</span>
              </div>
            )}
            {mechanism.metrics.ltv && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client LTV</span>
                <span className="font-medium">{mechanism.metrics.ltv}</span>
              </div>
            )}
            {mechanism.metrics.hasUpsell && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upsell</span>
                <span className="font-medium">
                  {mechanism.metrics.upsellDescription} (${mechanism.metrics.upsellPrice})
                </span>
              </div>
            )}
            {mechanism.metrics.hasContinuity && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Continuity</span>
                <span className="font-medium">
                  {mechanism.metrics.continuityDescription} (${mechanism.metrics.continuityMonthlyValue}/mo)
                </span>
              </div>
            )}
            <div className="border-t border-[hsl(0_0%_100%/0.06)] pt-3 mt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rev / 100 Leads</span>
                <span className="font-bold text-green-400">
                  ${revPer100.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">LTV Multiple</span>
                <span className="font-bold">{ltvMultiple.toFixed(1)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Monthly Rev</span>
                <span className="font-bold text-[#0ea5e9]">
                  ${monthlyRevenue.toLocaleString()}
                </span>
              </div>
              {monthlyCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Monthly Profit</span>
                  <span className={cn("font-bold", monthlyRevenue - monthlyCost >= 0 ? "text-green-400" : "text-red-400")}>
                    ${(monthlyRevenue - monthlyCost).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#0ea5e9]" />
            AI Summary
          </h3>
          {mechanism.mechanismSummary ? (
            <div className="prose prose-sm prose-invert max-w-none text-xs whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
              {mechanism.mechanismSummary}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No AI summary generated. Edit this mechanism to generate one.
            </p>
          )}
        </div>
      </div>

      {/* Journey Notes */}
      {mechanism.journeyNotes && (
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5 mb-6">
          <h3 className="text-sm font-semibold mb-3">Journey Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {mechanism.journeyNotes}
          </p>
        </div>
      )}

      {/* Alignment Analysis Chat */}
      <div className="mb-6">
        <AlignmentChat mechanism={mechanism} />
      </div>
    </div>
  );
}
