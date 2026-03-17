"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Check as CheckIcon,
  Square,
  Loader2,
  ArrowLeft,
  Download,
  RotateCcw,
  ChevronRight,
  ExternalLink,
  Sheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/app-context";
import { useAIStream } from "@/hooks/use-ai-stream";
import { NorthStarCTABanner } from "@/components/shared/north-star-cta-banner";
import { StrategistCTA } from "@/components/shared/strategist-cta";
import { matrixSteps } from "@/data/messaging-matrix";
import { generateMatrixDocx } from "@/lib/generate-matrix-doc";

export default function MatrixBuildClient() {
  const { state, updateMessagingMatrix, clearMessagingMatrix, getNorthStarContext } = useApp();
  const matrix = state.messagingMatrixState;

  // Local state derived from persisted matrix state
  const [currentStep, setCurrentStep] = useState(matrix?.currentStep ?? 0);
  const [inputData, setInputData] = useState<Record<string, string>>(
    matrix?.inputData ?? {}
  );
  const [stepOutputs, setStepOutputs] = useState<Record<number, string>>(
    matrix?.stepOutputs ?? {}
  );
  const [isComplete, setIsComplete] = useState(matrix?.isComplete ?? false);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const { generate, abort, isStreaming, streamedContent, reset: resetStream } =
    useAIStream({
      onComplete: (content) => {
        setStepOutputs((prev) => {
          const next = { ...prev, [currentStep]: content };
          // Persist to context
          const stepIsLast = currentStep === matrixSteps.length - 1;
          updateMessagingMatrix({
            stepOutputs: next,
            isComplete: stepIsLast,
          });
          if (stepIsLast) setIsComplete(true);
          return next;
        });
      },
    });

  // Persist state changes to context
  useEffect(() => {
    updateMessagingMatrix({
      currentStep,
      inputData,
    });
  }, [currentStep, inputData, updateMessagingMatrix]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (streamedContent) {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [streamedContent]);

  const step = matrixSteps[currentStep];
  const isInputStep = currentStep === 0;
  const isLastStep = currentStep === matrixSteps.length - 1;
  const completedStepNumbers = Object.keys(stepOutputs).map(Number);

  // Build context from all prior step outputs for AI continuity
  const buildPriorContext = useCallback(() => {
    return Object.entries(stepOutputs)
      .filter(([idx]) => Number(idx) > 0 && Number(idx) < currentStep)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([idx, output]) => {
        const s = matrixSteps[Number(idx)];
        return `--- Step ${s.stepNumber}: ${s.title} ---\n${output}`;
      })
      .join("\n\n");
  }, [stepOutputs, currentStep]);

  // Build input brief context from step 0 data
  const buildInputBrief = useCallback(() => {
    const parts: string[] = [];
    if (inputData.businessName)
      parts.push(`Business Name: ${inputData.businessName}`);
    if (inputData.landingPageCopy)
      parts.push(`Landing Page / Offer Copy:\n${inputData.landingPageCopy}`);
    if (inputData.targetMarket)
      parts.push(`Target Market: ${inputData.targetMarket}`);
    if (inputData.pricePoint)
      parts.push(`Price Point: ${inputData.pricePoint}`);
    return parts.join("\n\n");
  }, [inputData]);

  // Build North Star context from stored profiles
  const buildNorthStarContext = useCallback(() => {
    const nsContext = getNorthStarContext();
    if (!nsContext) return "";
    return `--- STORED BUSINESS CONTEXT (from North Star Profile) ---\n${nsContext}`;
  }, [getNorthStarContext]);

  // Run AI for the current step
  const runStep = useCallback(async () => {
    if (!step || isInputStep) return;

    const inputBrief = buildInputBrief();
    const priorContext = buildPriorContext();
    const northStarContext = buildNorthStarContext();

    const messages: { role: string; content: string }[] = [];

    // Inject stored North Star context first (if available)
    if (northStarContext) {
      messages.push({
        role: "user",
        content: `The following is pre-existing strategic context from the client's completed North Star document. Use this to enrich your analysis — it contains their mission, UVP, ICP, customer values, problems solved, dream state, offer details, buying journey, obstacles, and objections.\n\n${northStarContext}`,
      });
      messages.push({
        role: "assistant",
        content:
          "I have the North Star business context. I'll weave these strategic insights into my analysis alongside the client brief.",
      });
    }

    // Always provide the client brief
    messages.push({
      role: "user",
      content: `CLIENT BRIEF:\n${inputBrief}`,
    });
    messages.push({
      role: "assistant",
      content:
        "I have the client brief. I'm ready to proceed with the analysis.",
    });

    // Provide prior step outputs as context
    if (priorContext) {
      messages.push({
        role: "user",
        content: `Here is the completed research from prior steps:\n\n${priorContext}`,
      });
      messages.push({
        role: "assistant",
        content:
          "I have all the prior research context. I'll build on it for this step.",
      });
    }

    // Current step instruction
    messages.push({
      role: "user",
      content: `Now execute Step ${step.stepNumber}: ${step.title}.\n\n${step.description}`,
    });

    resetStream();
    try {
      await generate(messages, step.systemPrompt);
    } catch {
      // Error handled by hook
    }
  }, [
    step,
    isInputStep,
    buildInputBrief,
    buildPriorContext,
    buildNorthStarContext,
    resetStream,
    generate,
  ]);

  // Auto-run AI step when navigating to a new step (steps 1-7) if no output
  useEffect(() => {
    if (
      !isInputStep &&
      !stepOutputs[currentStep] &&
      !isStreaming &&
      !isAutoRunning &&
      inputData.landingPageCopy // only if we have input data
    ) {
      setIsAutoRunning(true);
      runStep().finally(() => setIsAutoRunning(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Handle Step 0 form submission
  const handleSubmitBrief = () => {
    if (!inputData.businessName || !inputData.landingPageCopy) return;

    // Mark step 0 as "complete" (it's an input step)
    setStepOutputs((prev) => {
      const next = { ...prev, [0]: "Client Brief Submitted" };
      updateMessagingMatrix({ stepOutputs: next });
      return next;
    });

    // Move to step 1
    setCurrentStep(1);
    resetStream();
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep < matrixSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      resetStream();
    }
  };

  // Regenerate current step
  const regenerateStep = () => {
    setStepOutputs((prev) => {
      const next = { ...prev };
      delete next[currentStep];
      updateMessagingMatrix({ stepOutputs: next });
      return next;
    });
    resetStream();
    // Auto-run will pick it up
    setTimeout(() => {
      runStep();
    }, 100);
  };

  // Download .docx
  const handleDownload = async () => {
    try {
      await generateMatrixDocx(
        inputData.businessName || "Business",
        stepOutputs
      );
    } catch (err) {
      console.error("Failed to generate document:", err);
    }
  };

  // Start fresh
  const handleStartFresh = () => {
    clearMessagingMatrix();
    setCurrentStep(0);
    setInputData({});
    setStepOutputs({});
    setIsComplete(false);
    resetStream();
  };

  return (
    <div className="flex h-full">
      {/* Left Panel — Steps */}
      <div className="hidden md:flex w-64 bg-[hsl(0_0%_100%/0.02)] border-r border-[hsl(0_0%_100%/0.06)] flex-col">
        <div className="p-4 border-b border-[hsl(0_0%_100%/0.06)]">
          <Link
            href="/messaging-matrix"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Matrix
          </Link>
          <h3 className="font-semibold text-sm">Messaging Matrix</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {inputData.businessName || "New Research"}
          </p>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {matrixSteps.map((s, idx) => {
            const isCurrentStep = currentStep === idx;
            const isStepComplete = !!stepOutputs[idx];

            return (
              <button
                key={idx}
                onClick={() => {
                  if (!isStreaming && (idx === 0 || stepOutputs[0])) {
                    setCurrentStep(idx);
                    resetStream();
                  }
                }}
                disabled={isStreaming || (idx > 0 && !stepOutputs[0])}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-lg mb-1 flex items-center gap-3 transition-all",
                  isCurrentStep
                    ? "bg-[#0ea5e9]/15 text-[#0ea5e9]"
                    : isStepComplete
                      ? "text-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
                      : "text-muted-foreground hover:bg-[hsl(0_0%_100%/0.06)]",
                  (isStreaming || (idx > 0 && !stepOutputs[0])) &&
                    "opacity-50 cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    isCurrentStep
                      ? "bg-[#0ea5e9] text-white"
                      : isStepComplete
                        ? "bg-green-500/20 text-green-400"
                        : "bg-[hsl(0_0%_100%/0.08)] text-muted-foreground"
                  )}
                >
                  {isStepComplete && !isCurrentStep ? (
                    <CheckIcon className="w-3 h-3" />
                  ) : (
                    s.stepNumber
                  )}
                </div>
                <span className="text-sm truncate">{s.title}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[hsl(0_0%_100%/0.06)]">
          <div className="text-xs text-muted-foreground mb-2">
            {Math.max(0, completedStepNumbers.filter((n) => n > 0).length)} /{" "}
            {matrixSteps.length - 1} steps complete
          </div>
          {isComplete && (
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#0ea5e9] text-white text-xs font-medium hover:bg-[#0ea5e9]/90 transition-colors"
            >
              <Download className="h-3 w-3" />
              Download .docx
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-[hsl(0_0%_100%/0.06)] px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Step {step.stepNumber}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{step.title}</span>
          </div>
          {!isInputStep && stepOutputs[currentStep] && !isStreaming && (
            <button
              onClick={regenerateStep}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Regenerate
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* North Star CTA */}
            {!state.hasCompletedNorthStar && <NorthStarCTABanner />}

            {/* Step Description */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>

            {/* North Star context indicator */}
            {isInputStep && !stepOutputs[0] && state.hasCompletedNorthStar && (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-2.5">
                <CheckIcon className="h-3.5 w-3.5 text-green-400 shrink-0" />
                <span className="text-xs text-green-400">
                  North Star profile detected — your business context (mission, UVP, ICP, problems, dream state, objections) will be automatically injected into every research step.
                </span>
              </div>
            )}

            {/* Step 0: Input Form */}
            {isInputStep && !stepOutputs[0] && (
              <div className="space-y-5">
                {step.inputFields?.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium mb-2">
                      {field.label}
                      {field.required && (
                        <span className="text-[#0ea5e9] ml-1">*</span>
                      )}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={inputData[field.name] || ""}
                        onChange={(e) =>
                          setInputData((prev) => ({
                            ...prev,
                            [field.name]: e.target.value,
                          }))
                        }
                        placeholder={field.placeholder}
                        rows={field.name === "landingPageCopy" ? 12 : 4}
                        className="w-full px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors resize-y"
                      />
                    ) : (
                      <input
                        type="text"
                        value={inputData[field.name] || ""}
                        onChange={(e) =>
                          setInputData((prev) => ({
                            ...prev,
                            [field.name]: e.target.value,
                          }))
                        }
                        placeholder={field.placeholder}
                        className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors"
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={handleSubmitBrief}
                  disabled={
                    !inputData.businessName || !inputData.landingPageCopy
                  }
                  className={cn(
                    "w-full py-3 rounded-xl font-medium transition-colors",
                    inputData.businessName && inputData.landingPageCopy
                      ? "bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                      : "bg-[hsl(0_0%_100%/0.06)] text-muted-foreground cursor-not-allowed"
                  )}
                >
                  Start Research
                </button>
              </div>
            )}

            {/* Step 0: Already submitted */}
            {isInputStep && stepOutputs[0] && (
              <div className="space-y-4">
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                  <p className="text-sm text-green-400 font-medium mb-2">
                    Client Brief Submitted
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium text-foreground">
                        Business:
                      </span>{" "}
                      {inputData.businessName}
                    </p>
                    {inputData.targetMarket && (
                      <p>
                        <span className="font-medium text-foreground">
                          Market:
                        </span>{" "}
                        {inputData.targetMarket}
                      </p>
                    )}
                    {inputData.pricePoint && (
                      <p>
                        <span className="font-medium text-foreground">
                          Price:
                        </span>{" "}
                        {inputData.pricePoint}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    resetStream();
                  }}
                  className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                >
                  Continue to Step 1: Offer Summary
                </button>
              </div>
            )}

            {/* Steps 1-7: AI Output */}
            {!isInputStep && (
              <>
                {/* Streaming State */}
                {isStreaming && (
                  <div className="space-y-4" ref={outputRef}>
                    <div className="bg-[hsl(0_0%_100%/0.04)] rounded-xl p-6 border border-[hsl(0_0%_100%/0.06)]">
                      <div className="flex items-center gap-2 mb-3">
                        <Loader2 className="w-4 h-4 animate-spin text-[#0ea5e9]" />
                        <span className="text-xs text-[#0ea5e9] font-medium">
                          Running Step {step.stepNumber}: {step.title}...
                        </span>
                      </div>
                      <div className="prose prose-sm prose-invert max-w-none text-sm whitespace-pre-wrap">
                        {streamedContent || (
                          <span className="text-muted-foreground animate-pulse">
                            Analysing prior research and generating insights...
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={abort}
                      className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-background border border-[hsl(0_0%_100%/0.1)] text-sm font-medium hover:bg-[hsl(0_0%_100%/0.05)] transition-colors"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      Stop
                    </button>
                  </div>
                )}

                {/* Completed Output */}
                {!isStreaming && stepOutputs[currentStep] && (
                  <div className="space-y-4">
                    <div className="bg-[hsl(0_0%_100%/0.04)] rounded-xl p-6 border border-[hsl(0_0%_100%/0.06)]">
                      <div className="prose prose-sm prose-invert max-w-none text-sm whitespace-pre-wrap">
                        {stepOutputs[currentStep]}
                      </div>
                    </div>

                    {/* Navigation */}
                    {!isLastStep && (
                      <button
                        onClick={goToNextStep}
                        className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors flex items-center justify-center gap-2"
                      >
                        Next: {matrixSteps[currentStep + 1].title}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}

                    {/* Completion State */}
                    {isLastStep && stepOutputs[currentStep] && (
                      <div className="space-y-4">
                        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5 text-center">
                          <p className="text-base font-semibold text-green-400 mb-1">
                            Messaging Matrix Complete
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            All 7 research steps have been executed. Your
                            strategic messaging document is ready.
                          </p>
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={handleDownload}
                              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0ea5e9] text-white text-sm font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              Download .docx
                            </button>
                            <button
                              onClick={handleStartFresh}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[hsl(0_0%_100%/0.08)] text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Start New
                            </button>
                          </div>
                        </div>

                        {/* Google Sheets Template */}
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                          <div className="flex items-center gap-3 mb-2">
                            <Sheet className="h-5 w-5 text-emerald-400" />
                            <h4 className="text-sm font-semibold text-emerald-400">
                              Fill Out Your Messaging Matrix
                            </h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            Use the Google Sheets template to compile your research into a structured document your team can reference for ads, emails, and landing pages.
                          </p>
                          <a
                            href="https://docs.google.com/spreadsheets/d/1PuQwCTlKwYw37H7q0SqEZfc8iKspi9K4jLeGKggje-o/edit?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open Google Sheets Template
                          </a>
                        </div>

                        {/* Strategist CTA */}
                        <StrategistCTA
                          variant="banner"
                          context="messagingMatrix"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Waiting to start (shouldn't normally show due to auto-run) */}
                {!isStreaming &&
                  !stepOutputs[currentStep] &&
                  !isAutoRunning && (
                    <button
                      onClick={runStep}
                      className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                    >
                      Run Step {step.stepNumber}: {step.title}
                    </button>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
