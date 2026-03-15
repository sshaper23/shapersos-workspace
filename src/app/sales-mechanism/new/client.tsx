"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Loader2,
  Sparkles,
  Route,
  BarChart3,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/app-context";
import { useAIStream } from "@/hooks/use-ai-stream";
import { StrategistCTA } from "@/components/shared/strategist-cta";
import { useTier } from "@/hooks/use-tier";
import { UpgradeGate } from "@/components/shared/upgrade-gate";
import type {
  SalesMechanism,
  MechanismStage,
  MechanismStageType,
  MechanismMetrics,
  StageMetric,
  DropOffRisk,
} from "@/types/context";

const STAGE_TYPES: { value: MechanismStageType; label: string; color: string }[] = [
  { value: "entry", label: "Entry", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "nurture", label: "Nurture", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "conversion", label: "Conversion", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "onboarding", label: "Onboarding", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { value: "ascension", label: "Ascension", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
];

const DROP_OFF_OPTIONS: { value: DropOffRisk; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const emptyMetrics: MechanismMetrics = {
  primaryLeadSource: "",
  leadVolume: "",
  costPerLead: "",
  coreOfferPrice: "",
  ltv: "",
  hasUpsell: false,
  upsellDescription: "",
  upsellPrice: "",
  hasContinuity: false,
  continuityDescription: "",
  continuityMonthlyValue: "",
};

function createStage(order: number): MechanismStage {
  return {
    id: `stage-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    order,
    name: "",
    type: order === 0 ? "entry" : order <= 2 ? "nurture" : "conversion",
    description: "",
    action: "",
    tool: "",
    dropOffRisk: "low",
    notes: "",
    conversionRate: "",
    volumeIn: "",
    stageMetrics: [],
  };
}

function createMetric(label = "", benchmark = "", suggestedByAI = false): StageMetric {
  return {
    id: `metric-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    value: "",
    benchmark,
    suggestedByAI,
    notes: "",
  };
}

export default function MechanismBuildClient() {
  const router = useRouter();
  const { state, saveMechanism, incrementAIGenerations } = useApp();
  const { canUseAIGeneration, isPro } = useTier();
  const { generate, isStreaming, streamedContent, reset: resetStream } = useAIStream();

  const [currentPart, setCurrentPart] = useState(0); // 0=Journey, 1=Metrics & Data
  const [mechanismName, setMechanismName] = useState("");
  const [linkedOffer, setLinkedOffer] = useState("");
  const [funnelType, setFunnelType] = useState("");
  const [stages, setStages] = useState<MechanismStage[]>([
    createStage(0),
    createStage(1),
    createStage(2),
  ]);
  const [metrics, setMetrics] = useState<MechanismMetrics>(emptyMetrics);
  const [journeyNotes, setJourneyNotes] = useState("");
  const [mechanismSummary, setMechanismSummary] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [metricsGenerated, setMetricsGenerated] = useState(false);
  const [isGeneratingMetrics, setIsGeneratingMetrics] = useState(false);
  const [expandedMetricStage, setExpandedMetricStage] = useState<string | null>(null);

  const DRAFT_KEY = "shapers-mechanism-draft";

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.mechanismName) setMechanismName(draft.mechanismName);
        if (draft.linkedOffer) setLinkedOffer(draft.linkedOffer);
        if (draft.funnelType) setFunnelType(draft.funnelType);
        if (draft.stages?.length >= 3) setStages(draft.stages);
        if (draft.metrics) setMetrics({ ...emptyMetrics, ...draft.metrics });
        if (draft.journeyNotes) setJourneyNotes(draft.journeyNotes);
        if (draft.mechanismSummary) setMechanismSummary(draft.mechanismSummary);
        if (typeof draft.currentPart === "number") setCurrentPart(draft.currentPart);
        if (draft.metricsGenerated) setMetricsGenerated(true);
        setDraftRestored(true);
      }
    } catch { /* ignore corrupt drafts */ }
  }, []);

  // Auto-save draft to localStorage on every change
  useEffect(() => {
    const hasContent =
      mechanismName.trim() !== "" ||
      stages.some((s) => s.name.trim() !== "") ||
      Object.values(metrics).some((v) => typeof v === "string" && v.trim() !== "");
    if (!hasContent) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          mechanismName,
          linkedOffer,
          funnelType,
          stages,
          metrics,
          journeyNotes,
          mechanismSummary,
          currentPart,
          metricsGenerated,
        })
      );
    } catch { /* storage full — silently fail */ }
  }, [mechanismName, linkedOffer, funnelType, stages, metrics, journeyNotes, mechanismSummary, currentPart, metricsGenerated]);

  // Clear draft after successful save
  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setDraftRestored(false);
  };

  const parts = [
    { label: "Journey Map", description: "Define your buying journey stages" },
    { label: "Metrics & Data Points", description: "AI-suggested metrics to track per stage" },
  ];

  // ─── Stage management ───

  const addStage = () => {
    setStages((prev) => [...prev, createStage(prev.length)]);
  };

  const removeStage = (id: string) => {
    if (stages.length <= 3) return;
    setStages((prev) =>
      prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i }))
    );
  };

  const updateStage = (id: string, update: Partial<MechanismStage>) => {
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...update } : s))
    );
  };

  const moveStage = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= stages.length) return;
    setStages((prev) => {
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  };

  // ─── Stage Metric management ───

  const addStageMetric = (stageId: string) => {
    setStages((prev) =>
      prev.map((s) =>
        s.id === stageId
          ? { ...s, stageMetrics: [...(s.stageMetrics || []), createMetric()] }
          : s
      )
    );
  };

  const updateStageMetric = (stageId: string, metricId: string, update: Partial<StageMetric>) => {
    setStages((prev) =>
      prev.map((s) =>
        s.id === stageId
          ? {
              ...s,
              stageMetrics: (s.stageMetrics || []).map((m) =>
                m.id === metricId ? { ...m, ...update } : m
              ),
            }
          : s
      )
    );
  };

  const removeStageMetric = (stageId: string, metricId: string) => {
    setStages((prev) =>
      prev.map((s) =>
        s.id === stageId
          ? { ...s, stageMetrics: (s.stageMetrics || []).filter((m) => m.id !== metricId) }
          : s
      )
    );
  };

  // Metrics update helper
  const updateMetrics = (update: Partial<MechanismMetrics>) => {
    setMetrics((prev) => ({ ...prev, ...update }));
  };

  // ─── Revenue calculations ───

  const revenueCalc = useCallback(() => {
    const leadVol = parseFloat(metrics.leadVolume) || 0;
    const price = parseFloat(metrics.coreOfferPrice?.replace(/[^0-9.]/g, "") || "0") || 0;
    const ltv = parseFloat(metrics.ltv?.replace(/[^0-9.]/g, "") || "0") || 0;
    const cpl = parseFloat(metrics.costPerLead?.replace(/[^0-9.]/g, "") || "0") || 0;

    // Try to find a close rate from the last conversion-type stage metrics
    let closeRate = 0;
    for (const stage of stages) {
      if (stage.type === "conversion") {
        const cr = stage.stageMetrics?.find((m) =>
          m.label.toLowerCase().includes("close") || m.label.toLowerCase().includes("conversion rate")
        );
        if (cr?.value) {
          closeRate = parseFloat(cr.value) || 0;
        }
      }
    }

    const closesPerHundred = (closeRate / 100) * 100;
    const revPer100 = closesPerHundred * price;
    const ltvMultiple = price > 0 ? ltv / price : 0;
    const monthlyRevenue = leadVol * (closeRate / 100) * price;
    const monthlyCost = leadVol * cpl;
    const monthlyProfit = monthlyRevenue - monthlyCost;

    return { closesPerHundred, revPer100, ltvMultiple, monthlyRevenue, monthlyCost, monthlyProfit };
  }, [metrics, stages]);

  // ─── AI: Generate Suggested Metrics ───

  const generateSuggestedMetrics = async () => {
    setIsGeneratingMetrics(true);

    const stagesSummary = stages
      .map(
        (s) =>
          `${s.order + 1}. "${s.name}" (type: ${s.type}) — ${s.description || "No description"} — Key action: ${s.action || "N/A"} — Tool: ${s.tool || "N/A"} — Drop-off risk: ${s.dropOffRisk}`
      )
      .join("\n");

    // Pull business context from North Star
    const ns = state.northStarData;
    const businessContext = ns
      ? [
          ns.businessModelType && `Business Model: ${ns.businessModelType}`,
          ns.salesModel && `Sales Model: ${ns.salesModel}`,
          ns.primaryChannel && `Primary Channel: ${ns.primaryChannel}`,
          ns.industry && `Industry: ${ns.industry}`,
          ns.avgDealSize && `Average Deal Size: ${ns.avgDealSize}`,
          ns.salesCycleLength && `Sales Cycle Length: ${ns.salesCycleLength}`,
          ns.offer && `Offer Details: ${ns.offer}`,
          ns.icp && `Ideal Customer: ${ns.icp}`,
        ]
          .filter(Boolean)
          .join("\n")
      : "";

    const systemPrompt = `You are a senior revenue strategist specialising in sales mechanism optimisation. Given a business context, funnel type, and set of buying journey stages, suggest the most important metrics/data points to track for each stage.

IMPORTANT: Your metric suggestions must be CALIBRATED to the specific business model, sales model, funnel type, price point, and channel. Do NOT give generic metrics — give the RIGHT metrics for THIS type of business.

## METRIC HIERARCHY FRAMEWORK

Metrics are NOT created equal. Apply this hierarchy when selecting what to suggest:

### Tier 1: Milestone KPIs (2-3 max per mechanism)
These are the numbers the business LIVES by. They should be tracked as trends over months/quarters/years and drive major decisions. Mark these with "[KPI]" prefix in the label.
- Examples: ARR Growth %, Pipeline Coverage, Net Dollar Retention, Win Rate, Close Rate

### Tier 2: Weekly Operational Metrics
Always-on visibility metrics that support coaching and point decisions. These are the metrics teams should see week-to-week.
- Examples: MQLs generated, Pipeline by Stage, Activities by Rep, New Pipeline Created, Short Term Pipeline Trend

### Tier 3: Unit Economics (for mature businesses)
Evaluation metrics that tell you whether the ENGINE is healthy, not just whether it's running.
- Examples: LTV/CAC Ratio, Months to Recover CAC, Average Revenue per Account, Gross Margin, Magic Number

## CUSTOMER JOURNEY LENS

Map metrics to the full journey — do NOT stop at the sale:
- AWARENESS → PIPE DEVELOPMENT → PIPE CONVERSION → LAND → EXPAND
- Entry stages map to Awareness + Pipe Dev
- Nurture stages map to Pipe Development
- Conversion stages map to Pipe Conversion + Land
- Onboarding stages map to Land
- Ascension stages map to Expand (retention, upsell, referral, NDR)

## BENCHMARK REFERENCE BY SALES MODEL

### High-Ticket Sales Call (>$3,000)
- Landing Page → Opt-in: 15-30%
- Application/Booking Rate: 10-25%
- Show Rate: 60-80%
- Close Rate: 15-30%
- Revenue Per Call: track as core KPI
- Sales Cycle: 1-14 days typical
- Pipeline Coverage: 3-4x target

### Application Funnel (Apply → Call → Close)
- Application Rate: 5-15%
- Application-to-Call Booked: 30-50%
- Discovery Call Show Rate: 65-80%
- Discovery-to-Close Rate: 20-40%
- Application Quality Score: track % qualified
- Time from Application to Close: 7-21 days
- Stage Conversion Efficiency: track per transition

### Event-Based Close (Webinar / Workshop / Challenge)
- Registration Rate: 20-40%
- Attendance / Show Rate: 25-45%
- Engagement Rate (stayed to pitch): 60-75% of attendees
- Pitch Close Rate: 3-10%
- Post-Event Follow-Up Close Rate: 2-5%
- Revenue Per Attendee: track as core KPI

### Self-Serve Checkout (<$500)
- Landing Page Conversion: 2-8%
- Add to Cart Rate: 8-15%
- Cart → Checkout Completion: 60-80%
- Order Bump Take Rate: 15-35%
- Upsell Take Rate: 10-25%
- Refund Rate: 3-10%
- Average Order Value: track

### Outbound Sales (Cold → Warm → Close)
- Reply Rate (Cold): 3-8%
- Positive Reply Rate: 1-3%
- Meeting Booked Rate: 5-15% of replies
- Pipeline-to-Close: 15-30%
- Sales Cycle Length: 30-90 days
- Touches to Close: 7-12
- Activities per Rep: track weekly

### Content / Lead Magnet Funnel
- Opt-in Rate: 20-45%
- Lead Magnet Consumption Rate: 30-50%
- Email Open Rate: 25-40%
- Click-Through Rate: 2-5%
- Nurture-to-Application/Call Rate: 3-8%
- Time to Conversion: 7-30 days

### Product-Led / Free Trial (SaaS)
- Trial Signup Rate: 5-15%
- Activation Rate (key action): 20-40%
- Trial-to-Paid Conversion: 10-25%
- Time to First Value: track in days
- Monthly Churn: 3-7%
- Expansion Revenue Rate: 10-20%
- Net Dollar Retention: 100-130%

## PRICE POINT ADJUSTMENTS
- Under $100: prioritise VOLUME metrics (conversion rate, AOV, cart abandonment, refund rate)
- $100-$2,000: prioritise ENGAGEMENT metrics (show rate, consumption rate, follow-up conversion)
- $2,000-$10,000: prioritise PIPELINE metrics (show rate, close rate, revenue per call, sales cycle)
- $10,000+: prioritise RELATIONSHIP metrics (qualification rate, proposal-to-close, deal velocity, expansion, NDR)

## CHANNEL ADJUSTMENTS
- Paid Social: include CPL, ROAS, hook CTR, thumb-stop rate for entry stages
- Paid Search: include CPC, quality score, search impression share for entry stages
- Organic Social: include engagement rate, DM conversion rate, content-to-lead rate
- SEO: include organic traffic, keyword rankings, content conversion rate
- Referral: include referral rate, activation rate, viral coefficient

## KEY UNIT ECONOMICS TO CONSIDER
When the business has sufficient data, include these where relevant:
- LTV/CAC Ratio (healthy = 3:1+) — "How much is a new account worth vs cost to acquire?"
- Net Dollar Retention — "Do customers buy more after initial purchase?"
- Gross Margin — "How efficient is delivery of the product/service?"
- Pipeline Coverage vs Performance — "Do we have enough pipeline to hit target?"
- Months to Recover CAC — "How fast do we earn back acquisition cost?"

For each stage, suggest 2-4 metrics with:
- label: metric name specific to this business type. Prefix the 1-2 most critical metrics with "[KPI]" to mark them as milestone KPIs vs operational metrics.
- benchmark: calibrated benchmark range for this specific business model and price point

Return ONLY valid JSON in this exact format — no markdown, no code fences:
{
  "stages": [
    {
      "stageOrder": 0,
      "metrics": [
        { "label": "Metric Name", "benchmark": "X-Y%" }
      ]
    }
  ]
}`;

    const userMessage = `MECHANISM: ${mechanismName}
LINKED OFFER: ${linkedOffer}
FUNNEL TYPE: ${funnelType || "Not specified"}

BUSINESS CONTEXT:
${businessContext || "No business profile set up yet"}

BUYING JOURNEY STAGES:
${stagesSummary}

JOURNEY NOTES: ${journeyNotes || "None provided"}

Generate suggested metrics calibrated to this specific business and funnel type.`;

    try {
      const result = await generate(
        [{ role: "user", content: userMessage }],
        systemPrompt
      );

      // Parse the JSON response
      const cleaned = result.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.stages && Array.isArray(parsed.stages)) {
        setStages((prev) =>
          prev.map((stage) => {
            const suggestions = parsed.stages.find(
              (s: { stageOrder: number }) => s.stageOrder === stage.order
            );
            if (!suggestions?.metrics) return stage;

            const newMetrics: StageMetric[] = suggestions.metrics.map(
              (m: { label: string; benchmark: string }) =>
                createMetric(m.label, m.benchmark, true)
            );

            return {
              ...stage,
              stageMetrics: [...(stage.stageMetrics || []), ...newMetrics],
            };
          })
        );
        setMetricsGenerated(true);
        incrementAIGenerations();
      }
    } catch {
      // If JSON parsing fails, still mark as generated so user can add manually
      setMetricsGenerated(true);
    } finally {
      setIsGeneratingMetrics(false);
      resetStream();
    }
  };

  // ─── AI: Generate Mechanism Summary ───

  const runSynthesis = async () => {
    const stagesSummary = stages
      .map((s) => {
        const metricsStr = (s.stageMetrics || [])
          .filter((m) => m.value)
          .map((m) => `${m.label}: ${m.value} (benchmark: ${m.benchmark})`)
          .join(", ");
        return `${s.order + 1}. ${s.name} (${s.type}) — ${s.description || "No description"} [Drop-off: ${s.dropOffRisk}]${metricsStr ? ` | Metrics: ${metricsStr}` : ""}`;
      })
      .join("\n");

    const systemPrompt = `You are a senior revenue strategist. Given the buying journey stages, key metrics, and per-stage data points below, produce a structured Mechanism Summary.

The summary must include:
1. MECHANISM OVERVIEW — one-paragraph narrative of how this sales system works end-to-end
2. JOURNEY FLOW — bullet list of each stage with its purpose, critical action, and tracked metrics. Map to the full customer journey: Awareness → Pipe Development → Pipe Conversion → Land → Expand
3. CORE KPIs (2-3 MAX) — identify the 2-3 milestone KPIs this business should live by. These are the numbers leadership should see weekly and trend monthly/quarterly. Explain WHY each was chosen.
4. KEY METRICS SNAPSHOT — formatted table of the most important numbers (both global and per-stage). Separate into: Milestone KPIs vs Weekly Operational Metrics vs Unit Economics
5. GAP ANALYSIS — where metrics are missing or below benchmark, identify potential bottlenecks. Include what decisions/events could change the trajectory of these metrics.
6. RECOMMENDED NEXT MOVES — 3 specific, prioritised actions to improve the mechanism

Be specific, not generic. Reference the actual stage names, metrics, and data provided. Write in strategic, senior-consultant tone. Remember: metrics are just numbers — your job is to provide the NARRATIVE that makes them actionable.`;

    // Pull business context for synthesis
    const nsForSynth = state.northStarData;
    const synthBusinessContext = nsForSynth
      ? [
          nsForSynth.businessModelType && `Business Model: ${nsForSynth.businessModelType}`,
          nsForSynth.salesModel && `Sales Model: ${nsForSynth.salesModel}`,
          nsForSynth.primaryChannel && `Primary Channel: ${nsForSynth.primaryChannel}`,
          nsForSynth.industry && `Industry: ${nsForSynth.industry}`,
          nsForSynth.avgDealSize && `Average Deal Size: ${nsForSynth.avgDealSize}`,
          nsForSynth.salesCycleLength && `Sales Cycle Length: ${nsForSynth.salesCycleLength}`,
        ]
          .filter(Boolean)
          .join("\n")
      : "";

    const userMessage = `MECHANISM: ${mechanismName}
LINKED OFFER: ${linkedOffer}
FUNNEL TYPE: ${funnelType || "Not specified"}

BUSINESS CONTEXT:
${synthBusinessContext || "No business profile set up yet"}

BUYING JOURNEY STAGES:
${stagesSummary}

GLOBAL METRICS:
- Lead Source: ${metrics.primaryLeadSource}
- Monthly Lead Volume: ${metrics.leadVolume}
- Cost Per Lead: ${metrics.costPerLead}
- Core Offer Price: ${metrics.coreOfferPrice}
- Client LTV: ${metrics.ltv}
- Has Upsell: ${metrics.hasUpsell ? `Yes — ${metrics.upsellDescription} ($${metrics.upsellPrice})` : "No"}
- Has Continuity: ${metrics.hasContinuity ? `Yes — ${metrics.continuityDescription} ($${metrics.continuityMonthlyValue}/mo)` : "No"}

JOURNEY NOTES: ${journeyNotes}

Generate the Mechanism Summary now.`;

    resetStream();
    try {
      const result = await generate(
        [{ role: "user", content: userMessage }],
        systemPrompt
      );
      setMechanismSummary(result);
    } catch {
      // handled
    }
  };

  // ─── Save mechanism ───

  const handleSave = async () => {
    setIsSaving(true);
    const mechanism: SalesMechanism = {
      id: `mech-${Date.now()}`,
      businessName: state.northStarData?.company || "",
      name: mechanismName || "Untitled Mechanism",
      linkedOffer,
      funnelType,
      stages,
      metrics,
      journeyNotes,
      mechanismSummary: mechanismSummary || streamedContent,
      status: mechanismSummary ? "Complete" : "Partial",
      notionPageId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveMechanism(mechanism);

    // Save to Notion (fire and forget)
    try {
      const res = await fetch("/api/notion/sales-mechanism", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mechanism),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notionPageId) {
          saveMechanism({ ...mechanism, notionPageId: data.notionPageId });
        }
      }
    } catch {
      // Notion save failed silently
    }

    setIsSaving(false);
    clearDraft();
    router.push(`/sales-mechanism/${mechanism.id}`);
  };

  const canProceedFromJourney =
    mechanismName.trim() !== "" &&
    stages.length >= 3 &&
    stages.every((s) => s.name.trim() !== "");

  const calc = revenueCalc();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/sales-mechanism"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Link>
          <h1 className="text-xl font-bold">Map New Mechanism</h1>
        </div>
      </div>

      {/* Draft restored banner */}
      {draftRestored && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 px-4 py-2.5">
          <span className="text-xs text-[#0ea5e9]">
            Draft restored — your in-progress work was saved automatically
          </span>
          <button
            onClick={() => setDraftRestored(false)}
            className="text-xs text-[#0ea5e9]/60 hover:text-[#0ea5e9] transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-8">
        {parts.map((part, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (idx <= currentPart || (idx === 1 && canProceedFromJourney)) {
                setCurrentPart(idx);
              }
            }}
            className={cn(
              "flex-1 relative rounded-xl p-4 border transition-all text-left",
              idx === currentPart
                ? "border-[#0ea5e9]/40 bg-[#0ea5e9]/5"
                : idx < currentPart
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)]"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                  idx === currentPart
                    ? "bg-[#0ea5e9] text-white"
                    : idx < currentPart
                      ? "bg-green-500/20 text-green-400"
                      : "bg-[hsl(0_0%_100%/0.08)] text-muted-foreground"
                )}
              >
                {idx + 1}
              </span>
              <span className="text-sm font-semibold">{part.label}</span>
            </div>
            <p className="text-xs text-muted-foreground pl-8">
              {part.description}
            </p>
          </button>
        ))}
      </div>

      {/* ═══════ Step 1: Journey Map ═══════ */}
      {currentPart === 0 && (
        <div className="space-y-6">
          {/* Name & Offer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Mechanism Name <span className="text-[#0ea5e9]">*</span>
              </label>
              <input
                type="text"
                value={mechanismName}
                onChange={(e) => setMechanismName(e.target.value)}
                placeholder="e.g. High-Ticket Coaching Funnel"
                className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Linked Offer
              </label>
              <input
                type="text"
                value={linkedOffer}
                onChange={(e) => setLinkedOffer(e.target.value)}
                placeholder="e.g. Revenue Mechanics Accelerator"
                className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Funnel Type
              </label>
              <select
                value={funnelType}
                onChange={(e) => setFunnelType(e.target.value)}
                className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors text-sm appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#0c1220] text-muted-foreground">
                  Select funnel type (helps AI suggest better metrics)
                </option>
                <option value="application" className="bg-[#0c1220]">Application Funnel (Apply → Call → Close)</option>
                <option value="event" className="bg-[#0c1220]">Event Funnel (Webinar / Workshop / Challenge)</option>
                <option value="direct-sales" className="bg-[#0c1220]">Direct Sales (Call / Demo → Close)</option>
                <option value="self-serve" className="bg-[#0c1220]">Self-Serve Checkout</option>
                <option value="content" className="bg-[#0c1220]">Content Funnel (Lead Magnet → Nurture → Offer)</option>
                <option value="outbound" className="bg-[#0c1220]">Outbound (Cold → Warm → Close)</option>
                <option value="hybrid" className="bg-[#0c1220]">Hybrid / Multi-Touch</option>
                <option value="custom" className="bg-[#0c1220]">Custom / Other</option>
              </select>
            </div>
          </div>

          {/* Stages */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">
                Buying Journey Stages{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (min 3)
                </span>
              </h2>
              <button
                onClick={addStage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(0_0%_100%/0.08)] text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Stage
              </button>
            </div>

            <div className="space-y-2">
              {stages.map((stage, idx) => {
                const isExpanded = expandedStage === stage.id;
                const typeConfig = STAGE_TYPES.find((t) => t.value === stage.type);

                return (
                  <div
                    key={stage.id}
                    className={cn(
                      "rounded-xl border transition-all",
                      stage.dropOffRisk === "high"
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)]"
                    )}
                  >
                    {/* Stage Header Row */}
                    <div className="flex items-center gap-2 p-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveStage(idx, "up")}
                          disabled={idx === 0}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => moveStage(idx, "down")}
                          disabled={idx === stages.length - 1}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>

                      <GripVertical className="h-4 w-4 text-muted-foreground/50" />

                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(0_0%_100%/0.08)] text-xs font-bold">
                        {idx + 1}
                      </span>

                      <input
                        type="text"
                        value={stage.name}
                        onChange={(e) =>
                          updateStage(stage.id, { name: e.target.value })
                        }
                        placeholder="Stage name..."
                        className="flex-1 h-8 px-3 bg-transparent border-none text-sm font-medium outline-none placeholder:text-muted-foreground"
                      />

                      {/* Type selector */}
                      <select
                        value={stage.type}
                        onChange={(e) =>
                          updateStage(stage.id, {
                            type: e.target.value as MechanismStageType,
                          })
                        }
                        className={cn(
                          "text-[10px] font-medium px-2 py-1 rounded-full border outline-none cursor-pointer",
                          typeConfig?.color
                        )}
                      >
                        {STAGE_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>

                      {/* Drop-off risk */}
                      <select
                        value={stage.dropOffRisk}
                        onChange={(e) =>
                          updateStage(stage.id, {
                            dropOffRisk: e.target.value as DropOffRisk,
                          })
                        }
                        className={cn(
                          "text-[10px] font-medium px-2 py-1 rounded-full border outline-none cursor-pointer",
                          stage.dropOffRisk === "high"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : stage.dropOffRisk === "medium"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-[hsl(0_0%_100%/0.08)] text-muted-foreground border-[hsl(0_0%_100%/0.08)]"
                        )}
                      >
                        {DROP_OFF_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label} Risk
                          </option>
                        ))}
                      </select>

                      {stage.dropOffRisk === "high" && (
                        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                      )}

                      <button
                        onClick={() =>
                          setExpandedStage(isExpanded ? null : stage.id)
                        }
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isExpanded ? "Collapse" : "Details"}
                      </button>

                      {stages.length > 3 && (
                        <button
                          onClick={() => removeStage(stage.id)}
                          className="text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-[hsl(0_0%_100%/0.06)] grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">
                            Description
                          </label>
                          <textarea
                            value={stage.description}
                            onChange={(e) =>
                              updateStage(stage.id, {
                                description: e.target.value,
                              })
                            }
                            placeholder="What happens at this stage?"
                            rows={2}
                            className="w-full px-3 py-2 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-lg text-xs outline-none focus:border-[#0ea5e9]/50 resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">
                            Key Action
                          </label>
                          <input
                            type="text"
                            value={stage.action}
                            onChange={(e) =>
                              updateStage(stage.id, { action: e.target.value })
                            }
                            placeholder="e.g. Book a call"
                            className="w-full h-8 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-lg text-xs outline-none focus:border-[#0ea5e9]/50"
                          />
                          <label className="text-[10px] text-muted-foreground mb-1 block mt-2">
                            Tool Used
                          </label>
                          <input
                            type="text"
                            value={stage.tool}
                            onChange={(e) =>
                              updateStage(stage.id, { tool: e.target.value })
                            }
                            placeholder="e.g. Calendly, VSL page"
                            className="w-full h-8 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-lg text-xs outline-none focus:border-[#0ea5e9]/50"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">
                            Notes
                          </label>
                          <textarea
                            value={stage.notes}
                            onChange={(e) =>
                              updateStage(stage.id, { notes: e.target.value })
                            }
                            placeholder="Any additional notes..."
                            rows={4}
                            className="w-full px-3 py-2 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-lg text-xs outline-none focus:border-[#0ea5e9]/50 resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Journey Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Journey Notes
            </label>
            <textarea
              value={journeyNotes}
              onChange={(e) => setJourneyNotes(e.target.value)}
              placeholder="Any additional context about how your sales mechanism works..."
              rows={3}
              className="w-full px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors resize-y text-sm"
            />
          </div>

          <button
            onClick={() => setCurrentPart(1)}
            disabled={!canProceedFromJourney}
            className={cn(
              "w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2",
              canProceedFromJourney
                ? "bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                : "bg-[hsl(0_0%_100%/0.06)] text-muted-foreground cursor-not-allowed"
            )}
          >
            Continue to Metrics & Data Points
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ═══════ Step 2: Metrics & Data Points ═══════ */}
      {currentPart === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Per-stage metrics (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              {/* AI Suggestion Button */}
              {!metricsGenerated && !isGeneratingMetrics && canUseAIGeneration() && (
                <button
                  onClick={generateSuggestedMetrics}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-[#0ea5e9]/30 bg-[#0ea5e9]/5 text-[#0ea5e9] font-medium hover:bg-[#0ea5e9]/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Suggested Metrics per Stage
                </button>
              )}
              {!metricsGenerated && !isGeneratingMetrics && !canUseAIGeneration() && (
                <UpgradeGate feature="mechanisms" inline />
              )}

              {isGeneratingMetrics && (
                <div className="w-full py-4 rounded-xl border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0ea5e9]" />
                  <span className="text-sm text-[#0ea5e9] font-medium">
                    Analysing your journey and generating metric suggestions...
                  </span>
                </div>
              )}

              {/* Per-stage metric cards */}
              <div className="space-y-3">
                {stages.map((stage, idx) => {
                  const typeConfig = STAGE_TYPES.find((t) => t.value === stage.type);
                  const isExpanded = expandedMetricStage === stage.id;
                  const stageMetrics = stage.stageMetrics || [];

                  return (
                    <div
                      key={stage.id}
                      className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)]"
                    >
                      {/* Stage header */}
                      <button
                        onClick={() => setExpandedMetricStage(isExpanded ? null : stage.id)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-[hsl(0_0%_100%/0.03)] transition-colors rounded-t-xl"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(0_0%_100%/0.08)] text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold flex-1">
                          {stage.name}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                            typeConfig?.color
                          )}
                        >
                          {typeConfig?.label}
                        </span>
                        {stageMetrics.length > 0 && (
                          <span className="text-[10px] text-muted-foreground bg-[hsl(0_0%_100%/0.06)] px-2 py-0.5 rounded-full">
                            {stageMetrics.length} metrics
                          </span>
                        )}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>

                      {/* Expanded metrics */}
                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-[hsl(0_0%_100%/0.06)]">
                          {/* Conversion Rate & Volume (stage-level) */}
                          <div className="grid grid-cols-2 gap-3 py-3">
                            <div>
                              <label className="text-[10px] text-muted-foreground mb-1 block">
                                Conversion Rate
                              </label>
                              <input
                                type="text"
                                value={stage.conversionRate}
                                onChange={(e) =>
                                  updateStage(stage.id, { conversionRate: e.target.value })
                                }
                                placeholder="e.g. 45%"
                                className="w-full h-8 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-lg text-xs outline-none focus:border-[#0ea5e9]/50"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground mb-1 block">
                                Monthly Volume In
                              </label>
                              <input
                                type="text"
                                value={stage.volumeIn}
                                onChange={(e) =>
                                  updateStage(stage.id, { volumeIn: e.target.value })
                                }
                                placeholder="e.g. 500"
                                className="w-full h-8 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-lg text-xs outline-none focus:border-[#0ea5e9]/50"
                              />
                            </div>
                          </div>

                          {/* Metric rows */}
                          {stageMetrics.length > 0 && (
                            <div className="space-y-2 mb-3">
                              <div className="grid grid-cols-[1fr_120px_120px_32px] gap-2 text-[10px] text-muted-foreground font-medium px-1">
                                <span>Metric</span>
                                <span>Your Value</span>
                                <span>Benchmark</span>
                                <span />
                              </div>
                              {stageMetrics.map((metric) => (
                                <div
                                  key={metric.id}
                                  className="grid grid-cols-[1fr_120px_120px_32px] gap-2 items-center"
                                >
                                  <div className="flex items-center gap-1.5">
                                    {metric.suggestedByAI && (
                                      <Sparkles className="h-3 w-3 text-[#0ea5e9] shrink-0" />
                                    )}
                                    <input
                                      type="text"
                                      value={metric.label}
                                      onChange={(e) =>
                                        updateStageMetric(stage.id, metric.id, {
                                          label: e.target.value,
                                        })
                                      }
                                      placeholder="Metric name"
                                      className="w-full h-7 px-2 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded text-xs outline-none focus:border-[#0ea5e9]/50"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    value={metric.value}
                                    onChange={(e) =>
                                      updateStageMetric(stage.id, metric.id, {
                                        value: e.target.value,
                                      })
                                    }
                                    placeholder="Enter value"
                                    className="h-7 px-2 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded text-xs outline-none focus:border-[#0ea5e9]/50"
                                  />
                                  <span className="text-[10px] text-muted-foreground px-2 truncate">
                                    {metric.benchmark || "—"}
                                  </span>
                                  <button
                                    onClick={() => removeStageMetric(stage.id, metric.id)}
                                    className="flex items-center justify-center h-7 w-7 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => addStageMetric(stage.id)}
                            className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1"
                          >
                            <Plus className="h-3 w-3" />
                            Add Metric
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Global Metrics */}
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-4 w-4 text-[#0ea5e9]" />
                  <h3 className="text-sm font-semibold">Global Metrics</h3>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acquisition
                  </h4>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Primary Lead Source
                    </label>
                    <input
                      type="text"
                      value={metrics.primaryLeadSource}
                      onChange={(e) =>
                        updateMetrics({ primaryLeadSource: e.target.value })
                      }
                      placeholder="e.g. Meta Ads, Organic, Referrals"
                      className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Monthly Lead Volume
                      </label>
                      <input
                        type="text"
                        value={metrics.leadVolume}
                        onChange={(e) =>
                          updateMetrics({ leadVolume: e.target.value })
                        }
                        placeholder="e.g. 500"
                        className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Cost Per Lead
                      </label>
                      <input
                        type="text"
                        value={metrics.costPerLead}
                        onChange={(e) =>
                          updateMetrics({ costPerLead: e.target.value })
                        }
                        placeholder="e.g. $15"
                        className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
                    Revenue
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Core Offer Price
                      </label>
                      <input
                        type="text"
                        value={metrics.coreOfferPrice}
                        onChange={(e) =>
                          updateMetrics({ coreOfferPrice: e.target.value })
                        }
                        placeholder="e.g. $5,000"
                        className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Client LTV
                      </label>
                      <input
                        type="text"
                        value={metrics.ltv}
                        onChange={(e) => updateMetrics({ ltv: e.target.value })}
                        placeholder="e.g. $15,000"
                        className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors text-sm"
                      />
                    </div>
                  </div>

                  {/* Upsell toggle */}
                  <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={metrics.hasUpsell}
                        onChange={(e) =>
                          updateMetrics({ hasUpsell: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Has Upsell</span>
                    </label>
                    {metrics.hasUpsell && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <input
                          type="text"
                          value={metrics.upsellDescription}
                          onChange={(e) =>
                            updateMetrics({ upsellDescription: e.target.value })
                          }
                          placeholder="Upsell description"
                          className="h-9 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-lg text-xs outline-none focus:border-[#0ea5e9]/50"
                        />
                        <input
                          type="text"
                          value={metrics.upsellPrice}
                          onChange={(e) =>
                            updateMetrics({ upsellPrice: e.target.value })
                          }
                          placeholder="Upsell price"
                          className="h-9 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-lg text-xs outline-none focus:border-[#0ea5e9]/50"
                        />
                      </div>
                    )}
                  </div>

                  {/* Continuity toggle */}
                  <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={metrics.hasContinuity}
                        onChange={(e) =>
                          updateMetrics({ hasContinuity: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Has Continuity</span>
                    </label>
                    {metrics.hasContinuity && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <input
                          type="text"
                          value={metrics.continuityDescription}
                          onChange={(e) =>
                            updateMetrics({
                              continuityDescription: e.target.value,
                            })
                          }
                          placeholder="Continuity description"
                          className="h-9 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-lg text-xs outline-none focus:border-[#0ea5e9]/50"
                        />
                        <input
                          type="text"
                          value={metrics.continuityMonthlyValue}
                          onChange={(e) =>
                            updateMetrics({
                              continuityMonthlyValue: e.target.value,
                            })
                          }
                          placeholder="Monthly value"
                          className="h-9 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-lg text-xs outline-none focus:border-[#0ea5e9]/50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Revenue calculations sidebar */}
            <div>
              <div className="sticky top-6 space-y-4">
                <div className="rounded-xl border border-[#0ea5e9]/30 bg-[#0ea5e9]/5 p-6">
                  <h3 className="text-sm font-semibold text-[#0ea5e9] mb-4">
                    Live Revenue Calculations
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-[hsl(0_0%_100%/0.06)]">
                      <span className="text-sm text-muted-foreground">
                        Closes per 100 Leads
                      </span>
                      <span className="text-lg font-bold">
                        {calc.closesPerHundred.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[hsl(0_0%_100%/0.06)]">
                      <span className="text-sm text-muted-foreground">
                        Revenue per 100 Leads
                      </span>
                      <span className="text-lg font-bold text-green-400">
                        ${calc.revPer100.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[hsl(0_0%_100%/0.06)]">
                      <span className="text-sm text-muted-foreground">
                        LTV Multiple
                      </span>
                      <span className="text-lg font-bold">
                        {calc.ltvMultiple.toFixed(1)}x
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[hsl(0_0%_100%/0.06)]">
                      <span className="text-sm text-muted-foreground">
                        Est. Monthly Revenue
                      </span>
                      <span className="text-xl font-bold text-[#0ea5e9]">
                        ${calc.monthlyRevenue.toLocaleString()}
                      </span>
                    </div>
                    {calc.monthlyCost > 0 && (
                      <>
                        <div className="flex items-center justify-between py-2 border-b border-[hsl(0_0%_100%/0.06)]">
                          <span className="text-sm text-muted-foreground">
                            Est. Monthly Ad Spend
                          </span>
                          <span className="text-lg font-bold text-red-400">
                            -${calc.monthlyCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-muted-foreground">
                            Est. Monthly Profit
                          </span>
                          <span
                            className={cn(
                              "text-xl font-bold",
                              calc.monthlyProfit >= 0 ? "text-green-400" : "text-red-400"
                            )}
                          >
                            ${calc.monthlyProfit.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Journey preview */}
                <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] p-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-3">
                    Journey Preview
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {stages.map((stage, idx) => (
                      <span key={stage.id} className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full",
                            STAGE_TYPES.find((t) => t.value === stage.type)
                              ?.color
                          )}
                        >
                          {stage.name || `Stage ${idx + 1}`}
                        </span>
                        {idx < stages.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Synthesis */}
          <div className="border-t border-[hsl(0_0%_100%/0.06)] pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-5 w-5 text-[#0ea5e9]" />
              <h2 className="text-base font-semibold">AI Mechanism Summary</h2>
            </div>

            {!mechanismSummary && !isStreaming && (
              <button
                onClick={runSynthesis}
                className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate Mechanism Summary
              </button>
            )}

            {isStreaming && (
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0ea5e9]" />
                  <span className="text-xs text-[#0ea5e9] font-medium">
                    Generating mechanism summary...
                  </span>
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-sm whitespace-pre-wrap">
                  {streamedContent || (
                    <span className="text-muted-foreground animate-pulse">
                      Analysing your journey, metrics, and data points...
                    </span>
                  )}
                </div>
              </div>
            )}

            {mechanismSummary && !isStreaming && (
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-6">
                <div className="prose prose-sm prose-invert max-w-none text-sm whitespace-pre-wrap">
                  {mechanismSummary}
                </div>
              </div>
            )}
          </div>

          {/* StrategistCTA */}
          <StrategistCTA variant="banner" context="mechanism" />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPart(0)}
              className="px-6 py-3 rounded-xl border border-[hsl(0_0%_100%/0.08)] text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
            >
              Back to Journey
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Route className="h-4 w-4" />
                  Save Mechanism
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
