"use client";

import Link from "next/link";
import { ArrowRight, Grid3X3, FileText, Trash2, ExternalLink, Sheet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useApp } from "@/context/app-context";
import { matrixSteps } from "@/data/messaging-matrix";
import { useTier } from "@/hooks/use-tier";
import { UpgradeGate } from "@/components/shared/upgrade-gate";
import { VideoWalkthroughBanner } from "@/components/shared/video-walkthrough-banner";

export default function MessagingMatrixPage() {
  const { state, clearMessagingMatrix } = useApp();
  const { canAccessFeature } = useTier();

  if (!canAccessFeature("messagingMatrix")) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <PageHeader
          title="Messaging Matrix"
          subtitle="A 7-step AI research flow that maps your offer, audience psychology, and messaging angles into a single strategic document."
        />
        <UpgradeGate feature="messagingMatrix" />
      </div>
    );
  }

  const matrix = state.messagingMatrixState;

  const completedSteps = matrix
    ? Object.keys(matrix.stepOutputs).length
    : 0;
  const totalSteps = matrixSteps.length - 1; // exclude step 0 (input form)

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Messaging Matrix"
        subtitle="A 7-step AI research flow that maps your offer, audience psychology, and messaging angles into a single strategic document."
      />

      <VideoWalkthroughBanner section="messaging-matrix" />

      {/* Explanation */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0ea5e9]/10">
            <Grid3X3 className="h-5 w-5 text-[#0ea5e9]" />
          </div>
          <div>
            <h2 className="text-base font-semibold mb-2">
              How the Messaging Matrix Works
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                The Messaging Matrix is a sequential 7-step AI research process
                that builds on itself. Each step feeds context into the next,
                producing progressively deeper strategic insights.
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                {matrixSteps.slice(1).map((step) => (
                  <li key={step.stepNumber}>
                    <span className="font-medium text-foreground">
                      {step.title}
                    </span>{" "}
                    &mdash; {step.description}
                  </li>
                ))}
              </ol>
              <p>
                Once all 7 steps are complete, you can compile the entire
                research into a downloadable .docx document.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messaging Matrix Template */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <Sheet className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Messaging Matrix Template</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download the Google Sheets template to fill out alongside your AI research. Map your answers into a structured document your team can use.
              </p>
            </div>
          </div>
          <a
            href="https://docs.google.com/spreadsheets/d/1PuQwCTlKwYw37H7q0SqEZfc8iKspi9K4jLeGKggje-o/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open Template
          </a>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start New / Continue */}
        <Link
          href="/messaging-matrix/build"
          className="group relative overflow-hidden rounded-xl border border-[#0ea5e9]/30 bg-[#0ea5e9]/5 p-6 transition-all hover:border-[#0ea5e9]/50 hover:bg-[#0ea5e9]/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/10 to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0ea5e9]/20">
                {matrix && !matrix.isComplete ? (
                  <FileText className="h-5 w-5 text-[#0ea5e9]" />
                ) : (
                  <Grid3X3 className="h-5 w-5 text-[#0ea5e9]" />
                )}
              </div>
              <h2 className="text-lg font-semibold text-[#0ea5e9]">
                {matrix && !matrix.isComplete
                  ? "Continue Matrix"
                  : "Start New Matrix"}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {matrix && !matrix.isComplete
                ? `You have ${completedSteps} of ${totalSteps} steps complete. Pick up where you left off.`
                : "Input your business details and let AI build a comprehensive messaging strategy document."}
            </p>
            <div className="flex items-center gap-1 text-xs font-medium text-[#0ea5e9]">
              {matrix && !matrix.isComplete ? "Continue" : "Get Started"}{" "}
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </Link>

        {/* Previous Matrix / Placeholder */}
        {matrix && matrix.isComplete ? (
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <FileText className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-green-400">
                  Matrix Complete
                </h2>
                <p className="text-xs text-muted-foreground">
                  {matrix.inputData?.businessName || "Your Business"}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              All {totalSteps} steps are finished. You can view and download
              your compiled document.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/messaging-matrix/build"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#0ea5e9]/30 text-[#0ea5e9] text-xs font-medium hover:bg-[#0ea5e9]/10 transition-colors"
              >
                View &amp; Download <ArrowRight className="h-3 w-3" />
              </Link>
              <button
                onClick={clearMessagingMatrix}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[hsl(0_0%_100%/0.08)] text-muted-foreground text-xs font-medium hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Start Fresh
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.01)] p-6 flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center">
              Completed matrices will appear here.
              <br />
              <span className="text-xs">
                Your progress is saved automatically.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
