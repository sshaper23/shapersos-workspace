"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { useApp } from "@/context/app-context";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function SalesResultsPage() {
  const { state } = useApp();
  const businessName = state.northStarData?.company || "";

  const [week, setWeek] = useState("");
  const [bookedCalls, setBookedCalls] = useState("");
  const [showedUp, setShowedUp] = useState("");
  const [closed, setClosed] = useState("");
  const [cashCollected, setCashCollected] = useState("");
  const [cashContracted, setCashContracted] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/notion/sales-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          week,
          bookedCalls,
          showedUp,
          closed,
          cashCollected: cashCollected ? Number(cashCollected) : null,
          cashContracted: cashContracted ? Number(cashContracted) : null,
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
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Submitted</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your sales results have been recorded.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setWeek("");
              setBookedCalls("");
              setShowedUp("");
              setClosed("");
              setCashCollected("");
              setCashContracted("");
              setNotes("");
            }}
            className="text-sm text-[#0ea5e9] hover:underline"
          >
            Submit another week
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <PageHeader
        title="Sales Results"
        subtitle="Report your weekly sales activity and results"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Name (auto-filled, read-only) */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Business Name
          </label>
          <input
            type="text"
            value={businessName}
            readOnly
            className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] px-4 py-2.5 text-sm text-muted-foreground focus:outline-none"
          />
          {!businessName && (
            <p className="text-xs text-muted-foreground mt-1">
              Complete your North Star to auto-fill this field.
            </p>
          )}
        </div>

        {/* Week */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Week <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            required
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
          />
        </div>

        {/* Booked Calls */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Booked Calls
          </label>
          <textarea
            rows={3}
            placeholder="List all calls booked this week with name and date"
            value={bookedCalls}
            onChange={(e) => setBookedCalls(e.target.value)}
            className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] resize-none"
          />
        </div>

        {/* Showed Up */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Calls That Showed Up
          </label>
          <textarea
            rows={3}
            placeholder="Which calls showed up? Include dates"
            value={showedUp}
            onChange={(e) => setShowedUp(e.target.value)}
            className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] resize-none"
          />
        </div>

        {/* Closed */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Calls That Closed
          </label>
          <textarea
            rows={3}
            placeholder="Which calls closed? Include cash collected and contracted for each"
            value={closed}
            onChange={(e) => setClosed(e.target.value)}
            className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] resize-none"
          />
        </div>

        {/* Cash Collected */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Cash Collected
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={cashCollected}
              onChange={(e) => setCashCollected(e.target.value)}
              className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] pl-8 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
            />
          </div>
        </div>

        {/* Cash Contracted */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Cash Contracted
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={cashContracted}
              onChange={(e) => setCashContracted(e.target.value)}
              className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] pl-8 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Notes</label>
          <textarea
            rows={3}
            placeholder="Any additional notes for this week"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !week}
          className="w-full rounded-xl bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white font-medium py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Sales Results"
          )}
        </button>
      </form>
    </div>
  );
}
