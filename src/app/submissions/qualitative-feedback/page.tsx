"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { useApp } from "@/context/app-context";
import { Loader2, CheckCircle2, Home } from "lucide-react";

export default function QualitativeFeedbackPage() {
  const { state } = useApp();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [recurringProblems, setRecurringProblems] = useState("");
  const [mostAppealingSolutions, setMostAppealingSolutions] = useState("");
  const [attractionFactors, setAttractionFactors] = useState("");
  const [unqualifiedProspectsNotes, setUnqualifiedProspectsNotes] =
    useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const now = new Date();
    const date = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const title = `Feedback — ${firstName} ${lastName} — ${date}`;

    try {
      const res = await fetch("/api/notion/qualitative-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          firstName,
          lastName,
          email,
          recurringProblems,
          mostAppealingSolutions,
          attractionFactors,
          unqualifiedProspectsNotes,
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
          <h2 className="text-2xl font-semibold">Feedback Submitted</h2>
          <p className="text-sm text-muted-foreground">
            Your qualitative feedback has been recorded successfully.
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

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Qualitative Feedback"
        subtitle="Share client insights and market feedback"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] p-6 space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm outline-none focus:border-[#0ea5e9] transition-colors"
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm outline-none focus:border-[#0ea5e9] transition-colors"
                placeholder="Last name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm outline-none focus:border-[#0ea5e9] transition-colors"
              placeholder="email@example.com"
            />
          </div>

          {/* Recurring Problems */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Recurring Problems / Pain Points
            </label>
            <textarea
              value={recurringProblems}
              onChange={(e) => setRecurringProblems(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm outline-none focus:border-[#0ea5e9] transition-colors resize-none"
              placeholder="What recurring problems or pain points are clients experiencing?"
            />
          </div>

          {/* Most Appealing Solutions */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Most Appealing Solutions / Products / Features
            </label>
            <textarea
              value={mostAppealingSolutions}
              onChange={(e) => setMostAppealingSolutions(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm outline-none focus:border-[#0ea5e9] transition-colors resize-none"
              placeholder="What solutions, products, or features are most appealing?"
            />
          </div>

          {/* Attraction Factors */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Attraction Factors
            </label>
            <textarea
              value={attractionFactors}
              onChange={(e) => setAttractionFactors(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm outline-none focus:border-[#0ea5e9] transition-colors resize-none"
              placeholder="What factors are attracting prospects?"
            />
          </div>

          {/* Unqualified Prospects */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Unqualified Prospects Notes
            </label>
            <textarea
              value={unqualifiedProspectsNotes}
              onChange={(e) => setUnqualifiedProspectsNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm outline-none focus:border-[#0ea5e9] transition-colors resize-none"
              placeholder="For unqualified prospects, what is making them unqualified? What are they attracted to?"
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
            "Submit Feedback"
          )}
        </button>
      </form>
    </div>
  );
}
