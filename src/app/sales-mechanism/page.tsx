"use client";

import Link from "next/link";
import {
  ArrowRight,
  Route,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useApp } from "@/context/app-context";
import { useTier } from "@/hooks/use-tier";
import { UpgradeGate } from "@/components/shared/upgrade-gate";
import { VideoWalkthroughBanner } from "@/components/shared/video-walkthrough-banner";

const stageTypeColors: Record<string, string> = {
  entry: "bg-blue-500/20 text-blue-400",
  nurture: "bg-purple-500/20 text-purple-400",
  conversion: "bg-green-500/20 text-green-400",
  onboarding: "bg-cyan-500/20 text-cyan-400",
  ascension: "bg-amber-500/20 text-amber-400",
};

export default function SalesMechanismPage() {
  const { state, deleteMechanism, setActiveMechanism } = useApp();
  const { canCreateMechanism } = useTier();
  const mechanisms = state.mechanisms;
  const canCreate = canCreateMechanism();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Sales Mechanism"
        subtitle="Map your buying journey, key metrics, and highest-leverage fixes"
      >
        {canCreate ? (
          <Link
            href="/sales-mechanism/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0ea5e9] text-white text-sm font-medium hover:bg-[#0ea5e9]/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Map New Mechanism
          </Link>
        ) : (
          <Link
            href="/settings#subscription"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#0ea5e9]/30 text-[#0ea5e9] text-sm font-medium hover:bg-[#0ea5e9]/10 transition-colors"
          >
            Upgrade for More
          </Link>
        )}
      </PageHeader>

      <VideoWalkthroughBanner section="sales-mechanism" />

      {/* Explanation */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0ea5e9]/10">
            <Route className="h-5 w-5 text-[#0ea5e9]" />
          </div>
          <div>
            <h2 className="text-base font-semibold mb-2">
              What is a Sales Mechanism?
            </h2>
            <p className="text-sm text-muted-foreground">
              Your sales mechanism is the system that converts attention into
              revenue. It maps every stage of your buying journey — from first
              touch to ascension — alongside the key metrics that determine
              whether your engine is profitable. By identifying leverage points
              and bottlenecks, you can prioritise the single fix that will have
              the biggest impact on revenue.
            </p>
          </div>
        </div>
      </div>

      {/* Mechanism Cards */}
      {mechanisms.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(0_0%_100%/0.08)] mx-auto mb-4">
            <Route className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No Mechanisms Yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Map your first sales mechanism to unlock revenue insights and
            inject buying journey context into every AI output.
          </p>
          <Link
            href="/sales-mechanism/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Map Your First Mechanism
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mechanisms.map((mech) => {
            const isActive = state.activeMechanismId === mech.id;
            const statusIcon =
              mech.status === "Complete" ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-400" />
              );

            return (
              <div
                key={mech.id}
                className={`rounded-xl border p-5 transition-all ${
                  isActive
                    ? "border-[#0ea5e9]/40 bg-[#0ea5e9]/5"
                    : "border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] hover:border-[hsl(0_0%_100%/0.15)]"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {statusIcon}
                    <h3 className="font-semibold text-sm">{mech.name}</h3>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#0ea5e9]/20 text-[#0ea5e9]">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  {mech.linkedOffer || mech.businessName || "No offer linked"}
                </p>

                {/* Stage pills */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {mech.stages.slice(0, 5).map((stage) => (
                    <span
                      key={stage.id}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        stageTypeColors[stage.type] || "bg-[hsl(0_0%_100%/0.08)] text-muted-foreground"
                      }`}
                    >
                      {stage.name}
                    </span>
                  ))}
                  {mech.stages.length > 5 && (
                    <span className="text-[10px] text-muted-foreground px-1">
                      +{mech.stages.length - 5} more
                    </span>
                  )}
                </div>

                {/* Quick metrics */}
                {(mech.metrics.coreOfferPrice || mech.metrics.leadVolume) && (
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    {mech.metrics.coreOfferPrice && (
                      <div className="bg-[hsl(0_0%_100%/0.04)] rounded-lg p-2">
                        <span className="text-muted-foreground">
                          Offer Price
                        </span>
                        <p className="font-semibold">
                          {mech.metrics.coreOfferPrice}
                        </p>
                      </div>
                    )}
                    {mech.metrics.leadVolume && (
                      <div className="bg-[hsl(0_0%_100%/0.04)] rounded-lg p-2">
                        <span className="text-muted-foreground">
                          Monthly Leads
                        </span>
                        <p className="font-semibold">
                          {mech.metrics.leadVolume}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/sales-mechanism/${mech.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#0ea5e9]/30 text-[#0ea5e9] text-xs font-medium hover:bg-[#0ea5e9]/10 transition-colors"
                  >
                    View Map <ArrowRight className="h-3 w-3" />
                  </Link>
                  {!isActive && (
                    <button
                      onClick={() => setActiveMechanism(mech.id)}
                      className="px-3 py-2 rounded-lg border border-[hsl(0_0%_100%/0.08)] text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => deleteMechanism(mech.id)}
                    className="p-2 rounded-lg border border-[hsl(0_0%_100%/0.08)] text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
