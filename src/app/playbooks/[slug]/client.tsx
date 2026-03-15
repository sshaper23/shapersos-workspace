"use client";

import { useState, use, useEffect, useRef } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { getFlowBySlug } from "@/data/flows";
import { cn } from "@/lib/utils";
import { Check as CheckIcon, Square, Loader2, Copy, Download } from "lucide-react";
import { saveAs } from "file-saver";
import { useApp } from "@/context/app-context";
import { useAIStream } from "@/hooks/use-ai-stream";
import { NorthStarCTABanner } from "@/components/shared/north-star-cta-banner";
import { StrategistCTA } from "@/components/shared/strategist-cta";
import { useTier } from "@/hooks/use-tier";
import { UpgradeGate } from "@/components/shared/upgrade-gate";

export default function PlaybookPageClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const flow = getFlowBySlug(slug);
  const { state, incrementPlaybooksCompleted, addRecentActivity } = useApp();
  const { canAccessPlaybook } = useTier();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [stepOutputs, setStepOutputs] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<"execute" | "about">("execute");
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const totalSteps = flow?.steps.length ?? 0;

  const { generate, abort, isStreaming, streamedContent, reset: resetStream } = useAIStream({
    onComplete: (content) => {
      setStepOutputs((prev) => ({ ...prev, [currentStep]: content }));
      setCompletedSteps((prev) => {
        const next = new Set([...prev, currentStep]);
        if (next.size === totalSteps) {
          incrementPlaybooksCompleted();
          if (flow) {
            addRecentActivity({ type: "playbook", name: flow.name, slug: flow.slug, action: "Completed" });
          }
        }
        return next;
      });
    },
    playbookSlug: slug,
  });

  // Auto-scroll during streaming
  useEffect(() => {
    if (streamedContent) {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [streamedContent]);

  if (!flow) {
    return (
      <div className="p-6">
        <PageHeader title="Playbook Not Found" subtitle="This playbook doesn't exist." />
      </div>
    );
  }

  if (!canAccessPlaybook()) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <PageHeader title={flow.name} subtitle={flow.shortDescription} />
        <UpgradeGate feature="playbooks" />
      </div>
    );
  }

  const step = flow.steps[currentStep];
  const isLastStep = currentStep === flow.steps.length - 1;
  const allStepsComplete = completedSteps.size === flow.steps.length;

  const handleGenerate = async () => {
    if (!step) return;

    // Build user message from form values
    const parts: string[] = [];
    step.fields.forEach((field) => {
      const val = formValues[field.name];
      if (val) parts.push(`${field.label}: ${val}`);
    });
    const userContent = parts.join("\n") || `Execute step ${step.stepNumber}: ${step.title}`;

    // Build prior step context for continuity
    const priorContext = Object.entries(stepOutputs)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([idx, output]) => {
        const priorStep = flow.steps[Number(idx)];
        return `--- Step ${priorStep.stepNumber}: ${priorStep.title} ---\n${output}`;
      })
      .join("\n\n");

    const messages = [];
    if (priorContext) {
      messages.push({
        role: "user",
        content: `Here is the context from prior steps:\n\n${priorContext}`,
      });
      messages.push({
        role: "assistant",
        content: "I have the context from the previous steps. I'll build on that work now.",
      });
    }
    messages.push({ role: "user", content: userContent });

    resetStream();

    try {
      await generate(messages, step.systemPrompt);
    } catch {
      // Error handled by the hook
    }
  };

  const goToNextStep = () => {
    if (currentStep < flow.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setFormValues({});
      resetStream();
    }
  };

  const handleExport = (text: string, stepNum: number) => {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const timestamp = new Date().toISOString().slice(0, 10);
    saveAs(blob, `${slug}-step-${stepNum}-${timestamp}.md`);
  };

  const handleCopy = (text: string, stepIdx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIdx);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="flex h-full">
      {/* Left Panel — Steps */}
      <div className="hidden md:flex w-64 bg-[hsl(0_0%_100%/0.02)] border-r border-[hsl(0_0%_100%/0.06)] flex-col">
        <div className="p-4 border-b border-[hsl(0_0%_100%/0.06)]">
          <h3 className="font-semibold text-sm">{flow.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            ~{flow.estimatedTime}
          </p>
        </div>
        <nav className="flex-1 p-2">
          {flow.steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!isStreaming) {
                  setCurrentStep(idx);
                  setFormValues({});
                  resetStream();
                }
              }}
              disabled={isStreaming}
              className={cn(
                "w-full text-left px-3 py-3 rounded-lg mb-1 flex items-center gap-3 transition-all",
                currentStep === idx
                  ? "bg-[#0ea5e9]/15 text-[#0ea5e9]"
                  : completedSteps.has(idx)
                    ? "text-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
                    : "text-muted-foreground hover:bg-[hsl(0_0%_100%/0.06)]",
                isStreaming && "opacity-50 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  currentStep === idx
                    ? "bg-[#0ea5e9] text-white"
                    : completedSteps.has(idx)
                      ? "bg-green-500/20 text-green-400"
                      : "bg-[hsl(0_0%_100%/0.08)] text-muted-foreground"
                )}
              >
                {completedSteps.has(idx) ? (
                  <CheckIcon className="w-3 h-3" />
                ) : (
                  s.stepNumber
                )}
              </div>
              <span className="text-sm truncate">{s.title}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 text-xs text-muted-foreground border-t border-[hsl(0_0%_100%/0.06)]">
          {completedSteps.size} / {flow.steps.length} steps complete
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[hsl(0_0%_100%/0.06)] px-4">
          <button
            onClick={() => setActiveTab("execute")}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "execute"
                ? "text-[#0ea5e9] border-b-2 border-[#0ea5e9]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Execute Playbook
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "about"
                ? "text-[#0ea5e9] border-b-2 border-[#0ea5e9]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            About this Playbook
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">

            {/* ── About Tab ── */}
            {activeTab === "about" && (
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">{flow.name}</h2>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#0ea5e9]/15 text-[#0ea5e9] capitalize">
                      {flow.category.replace("-", " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">~{flow.estimatedTime}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{flow.description}</p>
                </div>

                {/* Campaign Configuration Table */}
                {flow.campaignConfig && (
                  <div className="bg-[hsl(0_0%_100%/0.04)] rounded-xl border border-[hsl(0_0%_100%/0.06)] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[hsl(0_0%_100%/0.06)]">
                      <h3 className="text-sm font-semibold">Campaign Configuration</h3>
                    </div>
                    <div className="divide-y divide-[hsl(0_0%_100%/0.06)]">
                      {[
                        { label: "Purpose", value: flow.campaignConfig.purpose },
                        { label: "Objective", value: flow.campaignConfig.objective },
                        { label: "Budget Structure", value: flow.campaignConfig.budgetStructure },
                        { label: "Targeting", value: flow.campaignConfig.targeting },
                        { label: "Placements", value: flow.campaignConfig.placements },
                        { label: "Creatives", value: flow.campaignConfig.creatives },
                        { label: "Key Metric", value: flow.campaignConfig.keyMetric },
                      ].map((row) => (
                        <div key={row.label} className="flex px-4 py-3">
                          <span className="w-36 shrink-0 text-xs font-medium text-muted-foreground">
                            {row.label}
                          </span>
                          <span className="text-sm">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Steps Overview */}
                <div className="bg-[hsl(0_0%_100%/0.04)] rounded-xl border border-[hsl(0_0%_100%/0.06)] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[hsl(0_0%_100%/0.06)]">
                    <h3 className="text-sm font-semibold">Steps ({flow.steps.length})</h3>
                  </div>
                  <div className="divide-y divide-[hsl(0_0%_100%/0.06)]">
                    {flow.steps.map((s) => (
                      <div key={s.stepNumber} className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(0_0%_100%/0.08)] text-[10px] font-medium text-muted-foreground">
                            {s.stepNumber}
                          </span>
                          <span className="text-sm font-medium">{s.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-7">{s.description}</p>
                        {s.fields.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 ml-7">
                            {s.fields.map((f) => (
                              <span
                                key={f.name}
                                className="px-2 py-0.5 rounded-md text-[10px] bg-[hsl(0_0%_100%/0.06)] text-muted-foreground"
                              >
                                {f.label}
                                {f.required && <span className="text-[#0ea5e9] ml-0.5">*</span>}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start CTA */}
                <button
                  onClick={() => setActiveTab("execute")}
                  className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                >
                  Start Executing
                </button>
              </div>
            )}

            {/* ── Execute Tab ── */}
            {activeTab === "execute" && (
              <>
                {/* North Star CTA Banner */}
                {!state.hasCompletedNorthStar && <NorthStarCTABanner />}

                <div className="mb-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    Step {step.stepNumber} of {flow.steps.length}
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>

                {/* Step Form Fields */}
                {!stepOutputs[currentStep] && !isStreaming && (
                  <div className="space-y-4 mb-6">
                    {step.fields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium mb-2">
                          {field.label}
                          {field.required && <span className="text-[#0ea5e9] ml-1">*</span>}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            value={formValues[field.name] || ""}
                            onChange={(e) =>
                              setFormValues((p) => ({ ...p, [field.name]: e.target.value }))
                            }
                            placeholder={field.placeholder}
                            className="w-full min-h-[80px] px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors resize-y"
                          />
                        ) : field.type === "select" ? (
                          <select
                            value={formValues[field.name] || ""}
                            onChange={(e) =>
                              setFormValues((p) => ({ ...p, [field.name]: e.target.value }))
                            }
                            className="w-full h-10 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors"
                          >
                            <option value="">Select...</option>
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value} className="bg-[#060918]">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type === "number" ? "number" : "text"}
                            value={formValues[field.name] || ""}
                            onChange={(e) =>
                              setFormValues((p) => ({ ...p, [field.name]: e.target.value }))
                            }
                            placeholder={field.placeholder}
                            className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Generate / Streaming / Output */}
                {isStreaming ? (
                  <div className="space-y-4" ref={outputRef}>
                    <div className="bg-[hsl(0_0%_100%/0.04)] rounded-xl p-6 border border-[hsl(0_0%_100%/0.06)]">
                      <div className="flex items-center gap-2 mb-3">
                        <Loader2 className="w-4 h-4 animate-spin text-[#0ea5e9]" />
                        <span className="text-xs text-[#0ea5e9] font-medium">Generating...</span>
                      </div>
                      {streamedContent ? (
                        <MarkdownRenderer content={streamedContent} />
                      ) : (
                        <span className="text-sm text-muted-foreground animate-pulse">Thinking...</span>
                      )}
                    </div>
                    <button
                      onClick={abort}
                      className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-background border border-[hsl(0_0%_100%/0.1)] text-sm font-medium hover:bg-[hsl(0_0%_100%/0.05)] transition-colors"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      Stop
                    </button>
                  </div>
                ) : !stepOutputs[currentStep] ? (
                  <button
                    onClick={handleGenerate}
                    className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                  >
                    Execute Step {step.stepNumber}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-[hsl(0_0%_100%/0.04)] rounded-xl p-6 border border-[hsl(0_0%_100%/0.06)]">
                      <MarkdownRenderer content={stepOutputs[currentStep]} />
                    </div>
                    {/* Copy / Export Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(stepOutputs[currentStep], currentStep)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedStep === currentStep ? (
                          <CheckIcon className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedStep === currentStep ? "Copied" : "Copy"}
                      </button>
                      <button
                        onClick={() => handleExport(stepOutputs[currentStep], step.stepNumber)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                        title="Export as Markdown"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export
                      </button>
                    </div>
                    {!isLastStep && (
                      <button
                        onClick={goToNextStep}
                        className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                      >
                        Next Step: {flow.steps[currentStep + 1].title}
                      </button>
                    )}
                    {isLastStep && completedSteps.has(currentStep) && (
                      <div className="space-y-4">
                        <div className="text-center py-4">
                          <p className="text-sm text-green-400 font-medium">
                            Playbook Complete! All steps have been executed.
                          </p>
                        </div>
                        {/* Strategist CTA after playbook completion */}
                        <StrategistCTA variant="inline" context="playbookComplete" />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
