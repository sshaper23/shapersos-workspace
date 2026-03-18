"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { useApp } from "@/context/app-context";
import { Loader2, CheckCircle2, Home } from "lucide-react";

const PLATFORM_OPTIONS = ["Meta", "Google", "LinkedIn"];
const BUDGET_SETTING_OPTIONS = ["ABO", "CBO"];

export default function CampaignBriefPage() {
  const { state } = useApp();

  const [launchPlan, setLaunchPlan] = useState("");
  const [clientName, setClientName] = useState("");
  const [platform, setPlatform] = useState("");
  const [campaignObjective, setCampaignObjective] = useState("");
  const [campaignStrategy, setCampaignStrategy] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [campaignDuration, setCampaignDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetSetting, setBudgetSetting] = useState<string[]>([]);
  const [adAccountName, setAdAccountName] = useState("");
  const [trafficDestination, setTrafficDestination] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [audienceContext, setAudienceContext] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const company = state.northStarData?.company;
    if (company) setClientName(company);
  }, [state.northStarData?.company]);

  function toggleBudgetSetting(value: string) {
    setBudgetSetting((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/notion/campaign-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          launchPlan,
          clientName,
          platform,
          campaignObjective,
          campaignStrategy,
          campaignType,
          campaignDuration,
          budget,
          budgetSetting,
          adAccountName,
          trafficDestination,
          websiteLink,
          audienceContext,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Submission failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
          <h2 className="text-2xl font-semibold">Campaign Brief Submitted</h2>
          <p className="text-sm text-muted-foreground">
            Your campaign brief has been sent to the Shapers team.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.1)] text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm outline-none focus:border-[#0ea5e9] transition-colors";
  const textareaClass = `${inputClass} resize-none`;
  const labelClass = "text-sm font-medium text-muted-foreground";

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Campaign Brief"
        subtitle="Brief a new campaign for the Shapers team to build"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] p-6 space-y-5">
          {/* Campaign Name (title) */}
          <div className="space-y-2">
            <label className={labelClass}>Campaign Name</label>
            <input
              type="text"
              required
              value={launchPlan}
              onChange={(e) => setLaunchPlan(e.target.value)}
              className={inputClass}
              placeholder="e.g. Spring Launch — Meta Conversions"
            />
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <label className={labelClass}>Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className={inputClass}
              placeholder="Auto-filled from North Star"
            />
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <label className={labelClass}>Platform</label>
            <select
              required
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className={inputClass}
            >
              <option value="">Select platform</option>
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Objective */}
          <div className="space-y-2">
            <label className={labelClass}>Campaign Objective</label>
            <textarea
              value={campaignObjective}
              onChange={(e) => setCampaignObjective(e.target.value)}
              rows={3}
              className={textareaClass}
              placeholder="What is the primary objective of this campaign?"
            />
          </div>

          {/* Campaign Strategy */}
          <div className="space-y-2">
            <label className={labelClass}>Campaign Strategy</label>
            <textarea
              value={campaignStrategy}
              onChange={(e) => setCampaignStrategy(e.target.value)}
              rows={3}
              className={textareaClass}
              placeholder="Describe the campaign strategy"
            />
          </div>

          {/* Campaign Type */}
          <div className="space-y-2">
            <label className={labelClass}>Campaign Type</label>
            <input
              type="text"
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className={inputClass}
              placeholder="e.g. Lead Gen, Conversions, Traffic"
            />
          </div>

          {/* Duration & Budget row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}>Duration</label>
              <input
                type="text"
                value={campaignDuration}
                onChange={(e) => setCampaignDuration(e.target.value)}
                className={inputClass}
                placeholder="e.g. 30 days"
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Budget</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className={inputClass}
                placeholder="e.g. $5,000"
              />
            </div>
          </div>

          {/* Budget Setting */}
          <div className="space-y-2">
            <label className={labelClass}>Budget Setting</label>
            <div className="flex gap-3">
              {BUDGET_SETTING_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleBudgetSetting(opt)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    budgetSetting.includes(opt)
                      ? "border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9]"
                      : "border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] text-muted-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Ad Account Name */}
          <div className="space-y-2">
            <label className={labelClass}>Ad Account Name</label>
            <input
              type="text"
              value={adAccountName}
              onChange={(e) => setAdAccountName(e.target.value)}
              className={inputClass}
              placeholder="Ad account name"
            />
          </div>

          {/* Traffic Destination */}
          <div className="space-y-2">
            <label className={labelClass}>Traffic Destination</label>
            <textarea
              value={trafficDestination}
              onChange={(e) => setTrafficDestination(e.target.value)}
              rows={2}
              className={textareaClass}
              placeholder="Where should the traffic be sent?"
            />
          </div>

          {/* Website Link */}
          <div className="space-y-2">
            <label className={labelClass}>Website Link (if applicable)</label>
            <input
              type="url"
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </div>

          {/* Target Audience Context */}
          <div className="space-y-2">
            <label className={labelClass}>Target Audience Context</label>
            <textarea
              value={audienceContext}
              onChange={(e) => setAudienceContext(e.target.value)}
              rows={4}
              className={textareaClass}
              placeholder="Desires, benefits, awareness level, sophistication and persona"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className={labelClass}>Notes / Clarifications</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={textareaClass}
              placeholder="Any additional notes or clarifications"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white font-medium py-3 text-sm transition-colors disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Campaign Brief"
          )}
        </button>
      </form>
    </div>
  );
}
