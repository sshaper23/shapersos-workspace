"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Check as CheckIcon,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Loader2,
  Square,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/app-context";
import { useAIStream } from "@/hooks/use-ai-stream";
import { NorthStarCTABanner } from "@/components/shared/north-star-cta-banner";
import { StrategistCTA } from "@/components/shared/strategist-cta";
import { SliderPair } from "@/components/brand-guidelines/slider-pair";
import { DynamicList } from "@/components/brand-guidelines/dynamic-list";
import { StageIntro } from "@/components/brand-guidelines/stage-intro";
import {
  brandGuidelinesStages,
  BRAND_GUIDELINES_SYNTHESIS_PROMPT,
} from "@/data/brand-guidelines";
import type { BrandGuidelinesData } from "@/types/context";

const STORAGE_KEY = "shapers-brand-answers";

// Stages 1-8 + synthesis = index 0-8
const TOTAL_STAGES = brandGuidelinesStages.length;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function BrandGuidelinesBuildClient() {
  const { state, setBrandGuidelinesData, saveBrandGuidelinesProfile, setActiveBrandGuidelines } = useApp();
  const [currentStage, setCurrentStage] = useState(0); // 0-indexed into stages array
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [dynamicLists, setDynamicLists] = useState<
    Record<string, string[]>
  >({});
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [completedStages, setCompletedStages] = useState<Set<number>>(
    new Set()
  );
  const [showSynthesis, setShowSynthesis] = useState(false);
  const [synthesizedOutput, setSynthesizedOutput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const { generate, abort, isStreaming, streamedContent, reset: resetStream } =
    useAIStream({
      onComplete: (content) => {
        setSynthesizedOutput(content);
      },
    });

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.dynamicLists) setDynamicLists(parsed.dynamicLists);
        if (parsed.sliderValues) setSliderValues(parsed.sliderValues);
        if (parsed.completedStages)
          setCompletedStages(new Set(parsed.completedStages));
        if (parsed.currentStage !== undefined)
          setCurrentStage(parsed.currentStage);
        if (parsed.synthesizedOutput)
          setSynthesizedOutput(parsed.synthesizedOutput);
        if (parsed.showSynthesis) setShowSynthesis(parsed.showSynthesis);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Persist to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          answers,
          dynamicLists,
          sliderValues,
          completedStages: Array.from(completedStages),
          currentStage,
          synthesizedOutput,
          showSynthesis,
        })
      );
    } catch {
      // Ignore
    }
  }, [
    answers,
    dynamicLists,
    sliderValues,
    completedStages,
    currentStage,
    synthesizedOutput,
    showSynthesis,
  ]);

  // Pre-fill stage 1 from North Star if available
  useEffect(() => {
    if (state.northStarData && !answers.brandPurpose) {
      const ns = state.northStarData;
      setAnswers((prev) => ({
        ...prev,
        brandMission: prev.brandMission || ns.mission || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.northStarData]);

  // Auto-scroll during synthesis streaming
  useEffect(() => {
    if (streamedContent) {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [streamedContent]);

  const stage = brandGuidelinesStages[currentStage];
  const isLastStage = currentStage === TOTAL_STAGES - 1;

  // Collect all answers into flat data structure for saving
  const collectAllData = useCallback((): BrandGuidelinesData => {
    const data: Record<string, string> = { ...answers };

    // Serialize dynamic lists
    Object.entries(dynamicLists).forEach(([key, items]) => {
      data[key] = items.filter(Boolean).join(", ");
    });

    // Serialize slider values
    Object.entries(sliderValues).forEach(([key, val]) => {
      data[key] = String(val);
    });

    // Combine personality sliders into description
    const sliderSummary = Object.entries(sliderValues)
      .map(([key, val]) => {
        const stageData = brandGuidelinesStages[2]; // personality stage
        const field = stageData.fields.find((f) => f.name === key);
        if (!field?.poles) return "";
        const position = val <= 33 ? field.poles[0] : val >= 67 ? field.poles[1] : `balanced between ${field.poles[0]} and ${field.poles[1]}`;
        return `${field.label}: ${position}`;
      })
      .filter(Boolean)
      .join("; ");

    if (sliderSummary && !data.personalitySliders) {
      data.personalitySliders = sliderSummary;
    }

    data.synthesizedGuidelines = synthesizedOutput;

    return data as unknown as BrandGuidelinesData;
  }, [answers, dynamicLists, sliderValues, synthesizedOutput]);

  // Mark current stage complete and advance
  const handleNextStage = () => {
    setCompletedStages((prev) => new Set([...prev, currentStage]));

    if (isLastStage) {
      // Show synthesis
      setShowSynthesis(true);
    } else {
      setCurrentStage(currentStage + 1);
    }
  };

  // Navigate back
  const handlePrevStage = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1);
    }
  };

  // Run AI synthesis
  const handleSynthesize = async () => {
    const allData = collectAllData();
    const discoveryDump = Object.entries(allData)
      .filter(([key, val]) => val && key !== "synthesizedGuidelines")
      .map(([key, val]) => {
        // Find the label for this field
        for (const s of brandGuidelinesStages) {
          const field = s.fields.find((f) => f.name === key);
          if (field) return `**${field.label}:** ${val}`;
        }
        return `**${key}:** ${val}`;
      })
      .join("\n\n");

    const messages = [
      {
        role: "user",
        content: `Here are the brand discovery responses:\n\n${discoveryDump}\n\nPlease synthesise these into a comprehensive Brand Guidelines document.`,
      },
    ];

    resetStream();
    setSynthesizedOutput("");

    try {
      await generate(messages, BRAND_GUIDELINES_SYNTHESIS_PROMPT);
    } catch {
      // handled by hook
    }
  };

  // Save to Notion + as multi-profile
  const handleSave = async () => {
    setIsSaving(true);
    const allData = collectAllData();

    // Determine the profile ID: use active if editing, or generate new
    const isNewGuide = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("new") === "true";
    const profileId = isNewGuide ? generateId() : (state.activeBrandGuidelinesId || generateId());
    const labelName = allData.brandPurpose?.slice(0, 40) || state.northStarData?.company || "Brand Guide";

    try {
      const res = await fetch("/api/notion/brand-guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allData),
      });

      if (res.ok) {
        const data = await res.json();
        const profileData: BrandGuidelinesData = {
          ...allData,
          id: profileId,
          label: labelName,
          notionPageId: data.notionPageId || undefined,
        };
        saveBrandGuidelinesProfile(profileData);
        setActiveBrandGuidelines(profileId);
        setSavedSuccessfully(true);
      }
    } catch (err) {
      console.error("Failed to save brand guidelines:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Render a field based on type
  const renderField = (field: typeof stage.fields[number]) => {
    if (field.type === "slider-pair" && field.poles) {
      return (
        <SliderPair
          key={field.name}
          name={field.name}
          label={field.label}
          poles={field.poles}
          value={sliderValues[field.name] ?? 50}
          onChange={(val) =>
            setSliderValues((prev) => ({ ...prev, [field.name]: val }))
          }
        />
      );
    }

    if (field.type === "dynamic-list") {
      return (
        <DynamicList
          key={field.name}
          name={field.name}
          label={field.label}
          placeholder={field.placeholder}
          helpText={field.helpText}
          required={field.required}
          items={dynamicLists[field.name] || [""]}
          onChange={(items) =>
            setDynamicLists((prev) => ({ ...prev, [field.name]: items }))
          }
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.name} className="space-y-2">
          <label className="block text-sm font-medium">
            {field.label}
            {field.required && (
              <span className="text-[#0ea5e9] ml-1">*</span>
            )}
          </label>
          {field.helpText && (
            <p className="text-xs text-muted-foreground">{field.helpText}</p>
          )}
          <textarea
            value={answers[field.name] || ""}
            onChange={(e) =>
              setAnswers((prev) => ({
                ...prev,
                [field.name]: e.target.value,
              }))
            }
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors resize-y"
          />
        </div>
      );
    }

    // text
    return (
      <div key={field.name} className="space-y-2">
        <label className="block text-sm font-medium">
          {field.label}
          {field.required && (
            <span className="text-[#0ea5e9] ml-1">*</span>
          )}
        </label>
        {field.helpText && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
        <input
          type="text"
          value={answers[field.name] || ""}
          onChange={(e) =>
            setAnswers((prev) => ({
              ...prev,
              [field.name]: e.target.value,
            }))
          }
          placeholder={field.placeholder}
          className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors"
        />
      </div>
    );
  };

  // Check if current stage has required fields filled
  const canProceed = () => {
    if (!stage) return false;
    return stage.fields
      .filter((f) => f.required)
      .every((f) => {
        if (f.type === "dynamic-list") {
          return (dynamicLists[f.name] || []).some((item) => item.trim());
        }
        return !!answers[f.name]?.trim();
      });
  };

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="hidden md:flex w-64 bg-[hsl(0_0%_100%/0.02)] border-r border-[hsl(0_0%_100%/0.06)] flex-col">
        <div className="p-4 border-b border-[hsl(0_0%_100%/0.06)]">
          <Link
            href="/brand-guidelines"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Link>
          <h3 className="font-semibold text-sm">Brand Discovery</h3>
          <p className="text-xs text-muted-foreground mt-1">8 stages</p>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {brandGuidelinesStages.map((s, idx) => {
            const isCurrent = currentStage === idx;
            const isComplete = completedStages.has(idx);

            return (
              <button
                key={idx}
                onClick={() => setCurrentStage(idx)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-lg mb-1 flex items-center gap-3 transition-all",
                  isCurrent
                    ? "bg-[#0ea5e9]/15 text-[#0ea5e9]"
                    : isComplete
                      ? "text-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
                      : "text-muted-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    isCurrent
                      ? "bg-[#0ea5e9] text-white"
                      : isComplete
                        ? "bg-green-500/20 text-green-400"
                        : "bg-[hsl(0_0%_100%/0.08)] text-muted-foreground"
                  )}
                >
                  {isComplete && !isCurrent ? (
                    <CheckIcon className="w-3 h-3" />
                  ) : (
                    s.stageNumber
                  )}
                </div>
                <span className="text-sm truncate">{s.title}</span>
              </button>
            );
          })}

          {/* Synthesis step */}
          <button
            onClick={() => {
              if (completedStages.size >= TOTAL_STAGES) setShowSynthesis(true);
            }}
            disabled={completedStages.size < TOTAL_STAGES}
            className={cn(
              "w-full text-left px-3 py-3 rounded-lg mb-1 flex items-center gap-3 transition-all",
              showSynthesis
                ? "bg-[#0ea5e9]/15 text-[#0ea5e9]"
                : completedStages.size >= TOTAL_STAGES
                  ? "text-muted-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
                  : "text-muted-foreground opacity-50 cursor-not-allowed"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                showSynthesis
                  ? "bg-[#0ea5e9] text-white"
                  : synthesizedOutput
                    ? "bg-green-500/20 text-green-400"
                    : "bg-[hsl(0_0%_100%/0.08)] text-muted-foreground"
              )}
            >
              {synthesizedOutput && !showSynthesis ? (
                <CheckIcon className="w-3 h-3" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
            </div>
            <span className="text-sm truncate">AI Synthesis</span>
          </button>
        </nav>

        <div className="p-3 text-xs text-muted-foreground border-t border-[hsl(0_0%_100%/0.06)]">
          {completedStages.size} / {TOTAL_STAGES} stages complete
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-[hsl(0_0%_100%/0.06)] px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            {showSynthesis ? (
              <span className="font-medium">AI Synthesis</span>
            ) : (
              <>
                <span className="text-muted-foreground">
                  Stage {stage?.stageNumber}
                </span>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{stage?.title}</span>
              </>
            )}
          </div>

          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-1.5 bg-[hsl(0_0%_100%/0.08)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0ea5e9] rounded-full transition-all duration-500"
                style={{
                  width: `${(completedStages.size / TOTAL_STAGES) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round((completedStages.size / TOTAL_STAGES) * 100)}%
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* North Star CTA */}
            {!state.hasCompletedNorthStar && !showSynthesis && (
              <NorthStarCTABanner />
            )}

            {/* Synthesis View */}
            {showSynthesis && (
              <div className="space-y-4">
                {!synthesizedOutput && !isStreaming && (
                  <div className="text-center py-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0ea5e9]/10 mx-auto mb-4">
                      <Sparkles className="h-7 w-7 text-[#0ea5e9]" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                      Generate Your Brand Guidelines
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                      AI will synthesise all your discovery responses into a
                      comprehensive 10-section brand guidelines document.
                    </p>
                    <button
                      onClick={handleSynthesize}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate Brand Guidelines
                    </button>
                    <button
                      onClick={() => setShowSynthesis(false)}
                      className="block mx-auto mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Go back to edit answers
                    </button>
                  </div>
                )}

                {/* Streaming */}
                {isStreaming && (
                  <div className="space-y-4" ref={outputRef}>
                    <div className="bg-[hsl(0_0%_100%/0.04)] rounded-xl p-6 border border-[hsl(0_0%_100%/0.06)]">
                      <div className="flex items-center gap-2 mb-3">
                        <Loader2 className="w-4 h-4 animate-spin text-[#0ea5e9]" />
                        <span className="text-xs text-[#0ea5e9] font-medium">
                          Synthesising brand guidelines...
                        </span>
                      </div>
                      <div className="prose prose-sm prose-invert max-w-none text-sm whitespace-pre-wrap">
                        {streamedContent || (
                          <span className="text-muted-foreground animate-pulse">
                            Analysing your brand discovery responses...
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

                {/* Completed synthesis */}
                {!isStreaming && synthesizedOutput && (
                  <div className="space-y-4">
                    <div className="bg-[hsl(0_0%_100%/0.04)] rounded-xl p-6 border border-[hsl(0_0%_100%/0.06)]">
                      <div className="prose prose-sm prose-invert max-w-none text-sm whitespace-pre-wrap">
                        {synthesizedOutput}
                      </div>
                    </div>

                    {/* Actions */}
                    {!savedSuccessfully ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors disabled:opacity-50"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Brand Guidelines"
                          )}
                        </button>
                        <button
                          onClick={handleSynthesize}
                          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[hsl(0_0%_100%/0.08)] text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                        >
                          Regenerate
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5 text-center">
                          <p className="text-base font-semibold text-green-400 mb-1">
                            Brand Guidelines Saved
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Your guidelines are now saved and will be
                            automatically injected into all AI outputs.
                          </p>
                          <Link
                            href="/brand-guidelines/view"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0ea5e9] text-white text-sm font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                          >
                            View Full Guidelines{" "}
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                        <StrategistCTA
                          variant="inline"
                          context="northStarComplete"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Stage Fields */}
            {!showSynthesis && stage && (
              <div className="space-y-6">
                <StageIntro intro={stage.intro} />

                <div className="space-y-6">
                  {stage.fields.map(renderField)}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-[hsl(0_0%_100%/0.06)]">
                  <button
                    onClick={handlePrevStage}
                    disabled={currentStage === 0}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
                      currentStage === 0
                        ? "text-muted-foreground opacity-50 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
                    )}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <button
                    onClick={handleNextStage}
                    disabled={!canProceed()}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-colors",
                      canProceed()
                        ? "bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                        : "bg-[hsl(0_0%_100%/0.06)] text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {isLastStage ? (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Guidelines
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
