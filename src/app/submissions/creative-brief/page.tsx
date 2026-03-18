"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { useApp } from "@/context/app-context";
import { Loader2, CheckCircle2, Home } from "lucide-react";

const PLATFORM_OPTIONS = ["Meta", "Google", "LinkedIn"];

export default function CreativeBriefPage() {
  const { state } = useApp();

  const [launchPlan, setLaunchPlan] = useState("");
  const [clientName, setClientName] = useState("");
  const [platform, setPlatform] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [adAccountName, setAdAccountName] = useState("");
  const [audienceContext, setAudienceContext] = useState("");
  const [creativeAssetsLink, setCreativeAssetsLink] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const company = state.northStarData?.company;
    if (company) setClientName(company);
  }, [state.northStarData?.company]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/notion/creative-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          launchPlan,
          clientName,
          platform,
          campaignName,
          adAccountName,
          audienceContext,
          creativeAssetsLink,
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
          <h2 className="text-2xl font-semibold">Creative Brief Submitted</h2>
          <p className="text-sm text-muted-foreground">
            Your creative brief has been sent to the production team.
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
        title="Creative Brief"
        subtitle="Brief new creative assets for production"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] p-6 space-y-5">
          {/* Brief Name (title) */}
          <div className="space-y-2">
            <label className={labelClass}>Brief Name</label>
            <input
              type="text"
              required
              value={launchPlan}
              onChange={(e) => setLaunchPlan(e.target.value)}
              className={inputClass}
              placeholder="e.g. Spring Creative — Meta Video Ads"
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

          {/* Campaign Name */}
          <div className="space-y-2">
            <label className={labelClass}>Campaign Name</label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className={inputClass}
              placeholder="Name of the associated campaign"
            />
          </div>

          {/* Ad Account */}
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

          {/* Creative Strategy / Audience Context */}
          <div className="space-y-2">
            <label className={labelClass}>
              Creative Strategy / Audience Context
            </label>
            <textarea
              value={audienceContext}
              onChange={(e) => setAudienceContext(e.target.value)}
              rows={4}
              className={textareaClass}
              placeholder="Desires, benefits, awareness level, sophistication and persona"
            />
          </div>

          {/* Creative Assets Link */}
          <div className="space-y-2">
            <label className={labelClass}>Creative Assets Link</label>
            <input
              type="url"
              value={creativeAssetsLink}
              onChange={(e) => setCreativeAssetsLink(e.target.value)}
              className={inputClass}
              placeholder="https://..."
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
            "Submit Creative Brief"
          )}
        </button>
      </form>
    </div>
  );
}
