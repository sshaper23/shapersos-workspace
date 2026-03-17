"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Lightbulb,
  PenTool,
  Palette,
  MessageSquare,
  Users,
  Video,
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { useAIStream } from "@/hooks/use-ai-stream";
import { useTier } from "@/hooks/use-tier";
import { UpgradeGate } from "@/components/shared/upgrade-gate";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { CONCEPT_LEVEL_PROMPTS } from "@/data/concept-prompts";
import type { ConceptEntry, ConceptLevelData } from "@/types/context";

// ─── Level Definitions ───

const LEVELS = [
  {
    number: 1,
    name: "Angle",
    icon: Lightbulb,
    description: "The thesis. Every other level serves this.",
  },
  {
    number: 2,
    name: "Copy",
    icon: PenTool,
    description: "Hook, body, CTA — written to serve the angle.",
  },
  {
    number: 3,
    name: "Treatment",
    icon: Palette,
    description: "How this concept looks and feels in production.",
  },
  {
    number: 4,
    name: "Message",
    icon: MessageSquare,
    description: "Desire + awareness + sophistication = message direction.",
  },
  {
    number: 5,
    name: "Persona",
    icon: Users,
    description: "Who this speaks to, their frustrations, and their wins.",
  },
  {
    number: 6,
    name: "Format",
    icon: Video,
    description: "Static, video, or both — with specific executions.",
  },
];

// ─── Empty Level Data ───

function emptyLevels(): ConceptLevelData {
  return {
    angleDescription: "",
    angleDifferentiator: "",
    angleType: "",
    copyAudience: "",
    copyCoreMesage: "",
    copyTone: "",
    copyVariations: "",
    selectedCopy: "",
    treatmentPrimary: "",
    treatmentSecondary: "",
    messageDesire: "",
    messageAwareness: "",
    messageSophistication: "",
    messageSynthesis: "",
    personaAvatar: "",
    personaFrustration: "",
    personaWinning: "",
    personaTriedBefore: "",
    formatType: "",
    imageExecutions: [{ description: "" }, { description: "" }, { description: "" }],
    videoExecutions: [
      { description: "", length: "" },
      { description: "", length: "" },
      { description: "", length: "" },
    ],
  };
}

// ─── Main Component ───

export function CreativeConceptBuilderClient() {
  const router = useRouter();
  const { state, saveConceptEntry, getConceptLibrary, deleteConceptEntry } = useApp();
  const { canAccessTool } = useTier();
  const { generate, isStreaming, streamedContent, reset } = useAIStream({
    toolSlug: "creative-concept-builder",
  });

  // Check access
  if (!canAccessTool("creative-concept-builder")) {
    return (
      <div className="min-h-screen p-6">
        <UpgradeGate feature="tools" />
      </div>
    );
  }

  // State
  const [activeLevel, setActiveLevel] = useState(1);
  const [levels, setLevels] = useState<ConceptLevelData>(emptyLevels());
  const [conceptName, setConceptName] = useState("");
  const [conceptBrief, setConceptBrief] = useState("");
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const businessId = state.activeNorthStarId || "default";
  const library = getConceptLibrary(businessId);

  // Level lock: each level only accessible if prior level has data
  const isLevelAccessible = useCallback(
    (level: number): boolean => {
      if (level === 1) return true;
      // Check prior level has minimum required fields filled
      switch (level) {
        case 2:
          return !!levels.angleDescription && !!levels.angleType;
        case 3:
          return !!levels.selectedCopy;
        case 4:
          return !!levels.treatmentPrimary;
        case 5:
          return !!levels.messageDesire && !!levels.messageAwareness && !!levels.messageSophistication;
        case 6:
          return !!levels.personaAvatar && !!levels.personaFrustration;
        default:
          return false;
      }
    },
    [levels]
  );

  // All levels complete?
  const allComplete = useMemo(() => {
    return (
      !!levels.angleDescription &&
      !!levels.angleType &&
      !!levels.selectedCopy &&
      !!levels.treatmentPrimary &&
      !!levels.messageDesire &&
      !!levels.messageAwareness &&
      !!levels.messageSophistication &&
      !!levels.personaAvatar &&
      !!levels.personaFrustration &&
      !!levels.formatType
    );
  }, [levels]);

  // Update field helper
  const updateField = useCallback((field: keyof ConceptLevelData, value: unknown) => {
    setLevels((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Save concept to library
  const saveConcept = useCallback(() => {
    const entry: ConceptEntry = {
      id: activeEntryId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      businessId,
      name: conceptName || `Concept ${library.length + 1}`,
      currentLevel: activeLevel,
      levels,
      conceptBrief,
      status: allComplete && conceptBrief ? "complete" : "draft",
      createdAt: activeEntryId
        ? library.find((c) => c.id === activeEntryId)?.createdAt || Date.now()
        : Date.now(),
      updatedAt: Date.now(),
    };
    saveConceptEntry(entry);
    setActiveEntryId(entry.id);
  }, [activeEntryId, businessId, conceptName, library, activeLevel, levels, conceptBrief, allComplete, saveConceptEntry]);

  // Load concept from library
  const loadConcept = useCallback((entry: ConceptEntry) => {
    setLevels(entry.levels);
    setConceptName(entry.name);
    setConceptBrief(entry.conceptBrief);
    setActiveEntryId(entry.id);
    setActiveLevel(entry.currentLevel);
    setShowLibrary(false);
  }, []);

  // New concept
  const startNew = useCallback(() => {
    setLevels(emptyLevels());
    setConceptName("");
    setConceptBrief("");
    setActiveEntryId(null);
    setActiveLevel(1);
    reset();
  }, [reset]);

  // ─── AI Generation ───

  const generateCopyVariations = useCallback(async () => {
    setAiError(null);
    try {
      const prompt = `Angle: ${levels.angleDescription}
Angle Type: ${levels.angleType}
Differentiator: ${levels.angleDifferentiator}
Target Audience: ${levels.copyAudience}
Core Message: ${levels.copyCoreMesage}
Tone: ${levels.copyTone}`;

      const result = await generate(
        [{ role: "user", content: prompt }],
        CONCEPT_LEVEL_PROMPTS.copyGeneration
      );
      updateField("copyVariations", result);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to generate copy");
    }
  }, [levels, generate, updateField]);

  const generateMessageSynthesis = useCallback(async () => {
    setAiError(null);
    try {
      const prompt = `Desire: ${levels.messageDesire}
Awareness Level: ${levels.messageAwareness}
Sophistication Level: ${levels.messageSophistication}
Concept Angle: ${levels.angleDescription}
Target Persona: ${levels.personaAvatar || "Not yet defined"}`;

      const result = await generate(
        [{ role: "user", content: prompt }],
        CONCEPT_LEVEL_PROMPTS.messageSynthesis
      );
      updateField("messageSynthesis", result);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to generate message synthesis");
    }
  }, [levels, generate, updateField]);

  const generateConceptBrief = useCallback(async () => {
    setAiError(null);
    try {
      const prompt = `## Level 1: Angle
Description: ${levels.angleDescription}
Type: ${levels.angleType}
Differentiator: ${levels.angleDifferentiator}

## Level 2: Copy
Selected Copy:
${levels.selectedCopy}

## Level 3: Treatment
Primary Direction: ${levels.treatmentPrimary}
Secondary Notes: ${levels.treatmentSecondary}

## Level 4: Message
Desire: ${levels.messageDesire}
Awareness: ${levels.messageAwareness}
Sophistication: ${levels.messageSophistication}
Synthesis: ${levels.messageSynthesis}

## Level 5: Persona
Avatar: ${levels.personaAvatar}
Core Frustration: ${levels.personaFrustration}
What Winning Looks Like: ${levels.personaWinning}
What They've Tried Before: ${levels.personaTriedBefore}

## Level 6: Format
Format Type: ${levels.formatType}
Image Executions:
${levels.imageExecutions.map((e, i) => `  ${i + 1}. ${e.description}`).join("\n")}
Video Executions:
${levels.videoExecutions.map((e, i) => `  ${i + 1}. ${e.description} (${e.length})`).join("\n")}`;

      const result = await generate(
        [{ role: "user", content: prompt }],
        CONCEPT_LEVEL_PROMPTS.conceptBrief
      );
      setConceptBrief(result);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to generate concept brief");
    }
  }, [levels, generate]);

  // ─── Navigation ───

  const goNext = useCallback(() => {
    if (activeLevel < 6 && isLevelAccessible(activeLevel + 1)) {
      setActiveLevel(activeLevel + 1);
    }
  }, [activeLevel, isLevelAccessible]);

  const goPrev = useCallback(() => {
    if (activeLevel > 1) setActiveLevel(activeLevel - 1);
  }, [activeLevel]);

  // ─── Render Level Content ───

  const renderLevelContent = () => {
    switch (activeLevel) {
      case 1:
        return <Level1Angle levels={levels} updateField={updateField} />;
      case 2:
        return (
          <Level2Copy
            levels={levels}
            updateField={updateField}
            onGenerateCopy={generateCopyVariations}
            isStreaming={isStreaming}
            streamedContent={streamedContent}
            aiError={aiError}
          />
        );
      case 3:
        return <Level3Treatment levels={levels} updateField={updateField} />;
      case 4:
        return (
          <Level4Message
            levels={levels}
            updateField={updateField}
            onGenerateSynthesis={generateMessageSynthesis}
            isStreaming={isStreaming}
            streamedContent={streamedContent}
            aiError={aiError}
          />
        );
      case 5:
        return <Level5Persona levels={levels} updateField={updateField} />;
      case 6:
        return <Level6Format levels={levels} updateField={updateField} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/tools")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Tools
              </button>
              <span className="text-muted-foreground">/</span>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-[#0ea5e9]" />
                <h1 className="text-lg font-semibold">Creative Concept Builder</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLibrary(!showLibrary)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[hsl(0_0%_100%/0.1)] hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
              >
                {showLibrary ? "Hide Library" : "Concept Library"}{" "}
                {library.length > 0 && (
                  <span className="ml-1 text-[#0ea5e9]">({library.length})</span>
                )}
              </button>
              <button
                onClick={startNew}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9]/20 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New Concept
              </button>
            </div>
          </div>

          {/* Concept Name Input */}
          <div className="mt-3">
            <input
              type="text"
              value={conceptName}
              onChange={(e) => setConceptName(e.target.value)}
              placeholder="Concept name (e.g., 'Scaling Bottleneck Challenge')"
              className="w-full max-w-md bg-transparent border-b border-[hsl(0_0%_100%/0.1)] text-sm py-1 focus:border-[#0ea5e9] focus:outline-none transition-colors placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
      </div>

      {/* Library Panel */}
      {showLibrary && (
        <div className="border-b border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
          <div className="max-w-6xl mx-auto px-6 py-4">
            {library.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No saved concepts yet. Build your first concept and it will appear here.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {library.map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-lg border p-3 cursor-pointer transition-all ${
                      activeEntryId === entry.id
                        ? "border-[#0ea5e9]/40 bg-[#0ea5e9]/5"
                        : "border-[hsl(0_0%_100%/0.06)] hover:border-[hsl(0_0%_100%/0.12)]"
                    }`}
                    onClick={() => loadConcept(entry)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">{entry.name}</h4>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          entry.status === "complete"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {entry.status === "complete" ? "Complete" : "Draft"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Level {entry.currentLevel}/6
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(entry.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeEntryId === entry.id) startNew();
                          deleteConceptEntry(entry.id);
                        }}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Level Sidebar */}
          <div className="w-56 shrink-0">
            <div className="sticky top-6 space-y-1">
              {LEVELS.map((level) => {
                const accessible = isLevelAccessible(level.number);
                const isActive = activeLevel === level.number;
                const Icon = level.icon;
                return (
                  <button
                    key={level.number}
                    onClick={() => accessible && setActiveLevel(level.number)}
                    disabled={!accessible}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      isActive
                        ? "bg-[#0ea5e9]/10 border border-[#0ea5e9]/20"
                        : accessible
                        ? "hover:bg-[hsl(0_0%_100%/0.04)] border border-transparent"
                        : "opacity-40 cursor-not-allowed border border-transparent"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-[#0ea5e9]/20"
                          : "bg-[hsl(0_0%_100%/0.06)]"
                      }`}
                    >
                      {accessible ? (
                        <Icon
                          className={`h-4 w-4 ${
                            isActive ? "text-[#0ea5e9]" : "text-muted-foreground"
                          }`}
                        />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-medium ${
                          isActive ? "text-[#0ea5e9]" : "text-foreground"
                        }`}
                      >
                        L{level.number}: {level.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {level.description}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Generate Brief Button */}
              <div className="pt-4 border-t border-[hsl(0_0%_100%/0.06)] mt-4">
                <button
                  onClick={generateConceptBrief}
                  disabled={!allComplete || isStreaming}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    allComplete && !isStreaming
                      ? "bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                      : "bg-[hsl(0_0%_100%/0.06)] text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {isStreaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate Brief
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={saveConcept}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-[hsl(0_0%_100%/0.1)] hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Progress
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Progress Bar */}
            <div className="flex items-center gap-1 mb-6">
              {LEVELS.map((level) => (
                <div
                  key={level.number}
                  className={`flex-1 h-1 rounded-full ${
                    level.number <= activeLevel
                      ? "bg-[#0ea5e9]"
                      : isLevelAccessible(level.number)
                      ? "bg-[#0ea5e9]/30"
                      : "bg-[hsl(0_0%_100%/0.06)]"
                  }`}
                />
              ))}
            </div>

            {/* Level Content */}
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-6">
              {renderLevelContent()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={goPrev}
                disabled={activeLevel === 1}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeLevel > 1
                    ? "hover:bg-[hsl(0_0%_100%/0.06)] text-foreground"
                    : "text-muted-foreground cursor-not-allowed"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Level {activeLevel} of 6
              </span>
              <button
                onClick={goNext}
                disabled={activeLevel === 6 || !isLevelAccessible(activeLevel + 1)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeLevel < 6 && isLevelAccessible(activeLevel + 1)
                    ? "bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9]/20"
                    : "text-muted-foreground cursor-not-allowed"
                }`}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Concept Brief Output */}
            {(conceptBrief || (isStreaming && streamedContent)) && (
              <div className="mt-6 rounded-xl border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-[#0ea5e9]" />
                  <h3 className="text-base font-semibold">Concept Brief</h3>
                </div>
                <MarkdownRenderer content={conceptBrief || streamedContent} />
              </div>
            )}

            {aiError && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                {aiError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Level Sub-Components
// ════════════════════════════════════════════════════════════════

interface LevelProps {
  levels: ConceptLevelData;
  updateField: (field: keyof ConceptLevelData, value: unknown) => void;
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-sm font-medium">{children}</label>
      {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm focus:border-[#0ea5e9] focus:outline-none transition-colors resize-none placeholder:text-muted-foreground/50"
    />
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm focus:border-[#0ea5e9] focus:outline-none transition-colors placeholder:text-muted-foreground/50"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm focus:border-[#0ea5e9] focus:outline-none transition-colors text-foreground"
    >
      <option value="">{placeholder || "Select..."}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ─── Level 1: Angle ───

function Level1Angle({ levels, updateField }: LevelProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold mb-1">Level 1: Angle</h2>
        <p className="text-sm text-muted-foreground">
          The angle is the thesis of your ad concept. Everything else serves this. Lock it before moving forward.
        </p>
      </div>

      <div>
        <FieldLabel hint="One sentence that captures the core idea of this ad concept.">
          Angle Description *
        </FieldLabel>
        <TextArea
          value={levels.angleDescription}
          onChange={(v) => updateField("angleDescription", v)}
          placeholder="e.g., 'Most agencies scale ads by throwing more budget at the wall — we diagnose the mechanism first'"
          rows={3}
        />
      </div>

      <div>
        <FieldLabel hint="What makes this angle different from what's currently in market?">
          Differentiator
        </FieldLabel>
        <TextArea
          value={levels.angleDifferentiator}
          onChange={(v) => updateField("angleDifferentiator", v)}
          placeholder="e.g., 'Competitors lead with features/pricing — we lead with a diagnostic framework'"
          rows={2}
        />
      </div>

      <div>
        <FieldLabel hint="How is this angle approaching the audience?">Angle Type *</FieldLabel>
        <SelectInput
          value={levels.angleType}
          onChange={(v) => updateField("angleType", v)}
          options={[
            { label: "Problem-Aware (pain-led)", value: "problem-aware" },
            { label: "Solution-Aware (mechanism-led)", value: "solution-aware" },
            { label: "Desire-Led (aspiration-led)", value: "desire-led" },
            { label: "Proof-Led (results-led)", value: "proof-led" },
            { label: "Curiosity-Led (pattern interrupt)", value: "curiosity-led" },
            { label: "Challenge-Led (contrarian)", value: "challenge-led" },
          ]}
          placeholder="Select angle type..."
        />
      </div>

      <div className="rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)] p-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Rule:</strong> Once you move past Level 1, the
          angle is locked. Copy, treatment, message, persona, and format all serve this angle.
          If the angle needs to change, start a new concept.
        </p>
      </div>
    </div>
  );
}

// ─── Level 2: Copy ───

interface Level2Props extends LevelProps {
  onGenerateCopy: () => void;
  isStreaming: boolean;
  streamedContent: string;
  aiError: string | null;
}

function Level2Copy({ levels, updateField, onGenerateCopy, isStreaming, streamedContent, aiError }: Level2Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold mb-1">Level 2: Copy</h2>
        <p className="text-sm text-muted-foreground">
          Write or generate copy that serves the locked angle. AI generates 3 variations — select and refine your winner.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel hint="Who is this copy speaking to?">Target Audience</FieldLabel>
          <TextInput
            value={levels.copyAudience}
            onChange={(v) => updateField("copyAudience", v)}
            placeholder="e.g., 'B2B SaaS founders spending $20k+/mo on ads'"
          />
        </div>
        <div>
          <FieldLabel hint="What tone should the copy take?">Tone</FieldLabel>
          <SelectInput
            value={levels.copyTone}
            onChange={(v) => updateField("copyTone", v)}
            options={[
              { label: "Direct & Authoritative", value: "direct" },
              { label: "Conversational & Relatable", value: "conversational" },
              { label: "Provocative & Challenging", value: "provocative" },
              { label: "Aspirational & Empowering", value: "aspirational" },
              { label: "Data-Driven & Analytical", value: "analytical" },
            ]}
          />
        </div>
      </div>

      <div>
        <FieldLabel hint="The one thing this copy must communicate.">Core Message</FieldLabel>
        <TextArea
          value={levels.copyCoreMesage}
          onChange={(v) => updateField("copyCoreMesage", v)}
          placeholder="e.g., 'Your CPL isn't rising because of creative fatigue — it's rising because your mechanism is misaligned'"
          rows={2}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerateCopy}
        disabled={isStreaming || !levels.copyAudience}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          !isStreaming
            ? "bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9]/20"
            : "bg-[hsl(0_0%_100%/0.06)] text-muted-foreground cursor-not-allowed"
        }`}
      >
        {isStreaming ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Generate 3 Copy Variations
      </button>

      {/* AI Output */}
      {(levels.copyVariations || (isStreaming && streamedContent)) && (
        <div className="rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)] p-4">
          <h4 className="text-sm font-medium mb-3">AI-Generated Variations</h4>
          <MarkdownRenderer content={levels.copyVariations || streamedContent} />
        </div>
      )}

      {/* Selected Copy */}
      <div>
        <FieldLabel hint="Paste or write the winning copy here. This is what goes into the brief. *">
          Selected / Final Copy *
        </FieldLabel>
        <TextArea
          value={levels.selectedCopy}
          onChange={(v) => updateField("selectedCopy", v)}
          placeholder="Paste the winning variation here and refine it..."
          rows={6}
        />
      </div>
    </div>
  );
}

// ─── Level 3: Treatment ───

function Level3Treatment({ levels, updateField }: LevelProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold mb-1">Level 3: Treatment</h2>
        <p className="text-sm text-muted-foreground">
          How this concept should look and feel in production. Be specific enough that a designer could execute without questions.
        </p>
      </div>

      <div>
        <FieldLabel hint="Describe the primary visual direction — colour, tone, style, mood. *">
          Primary Treatment Direction *
        </FieldLabel>
        <TextArea
          value={levels.treatmentPrimary}
          onChange={(v) => updateField("treatmentPrimary", v)}
          placeholder="e.g., 'Dark background, clean typography, single bold stat as focal point. Think data dashboard aesthetic, not stock photo lifestyle.'"
          rows={4}
        />
      </div>

      <div>
        <FieldLabel hint="Additional treatment notes — what to avoid, reference images, production details.">
          Secondary Notes
        </FieldLabel>
        <TextArea
          value={levels.treatmentSecondary}
          onChange={(v) => updateField("treatmentSecondary", v)}
          placeholder="e.g., 'Avoid: generic blue corporate look, smiling headshots. Reference: Apple product pages, Stripe marketing.'"
          rows={3}
        />
      </div>

      <div className="rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)] p-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Treatment is often the first
          iteration variable. Describe it precisely enough that you can later change the visual
          without losing the angle or copy.
        </p>
      </div>
    </div>
  );
}

// ─── Level 4: Message ───

interface Level4Props extends LevelProps {
  onGenerateSynthesis: () => void;
  isStreaming: boolean;
  streamedContent: string;
  aiError: string | null;
}

function Level4Message({ levels, updateField, onGenerateSynthesis, isStreaming, streamedContent, aiError }: Level4Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold mb-1">Level 4: Message</h2>
        <p className="text-sm text-muted-foreground">
          Three variables that determine how the message must land. AI synthesises these into a direction statement.
        </p>
      </div>

      <div>
        <FieldLabel hint="What does this audience want? What's the primary desire driving their attention? *">
          Core Desire *
        </FieldLabel>
        <TextArea
          value={levels.messageDesire}
          onChange={(v) => updateField("messageDesire", v)}
          placeholder="e.g., 'Scale ad spend profitably without the agency guessing game'"
          rows={2}
        />
      </div>

      <div>
        <FieldLabel hint="Where is this audience on the awareness spectrum? *">
          Awareness Level *
        </FieldLabel>
        <SelectInput
          value={levels.messageAwareness}
          onChange={(v) => updateField("messageAwareness", v)}
          options={[
            { label: "Unaware — doesn't know they have a problem", value: "unaware" },
            { label: "Problem Aware — knows the pain, not the solution", value: "problem-aware" },
            { label: "Solution Aware — knows solutions exist, comparing", value: "solution-aware" },
            { label: "Product Aware — knows your product, needs convincing", value: "product-aware" },
            { label: "Most Aware — ready to buy, needs the right offer", value: "most-aware" },
          ]}
          placeholder="Select awareness level..."
        />
      </div>

      <div>
        <FieldLabel hint="How sophisticated is the market? How many similar messages have they seen? *">
          Market Sophistication *
        </FieldLabel>
        <SelectInput
          value={levels.messageSophistication}
          onChange={(v) => updateField("messageSophistication", v)}
          options={[
            { label: "Stage 1 — First to market, simple claim works", value: "stage-1" },
            { label: "Stage 2 — Competition emerging, enlarge the claim", value: "stage-2" },
            { label: "Stage 3 — Crowded, use mechanism/process", value: "stage-3" },
            { label: "Stage 4 — Skeptical, stack proof and specificity", value: "stage-4" },
            { label: "Stage 5 — Saturated, identification-based messaging", value: "stage-5" },
          ]}
          placeholder="Select sophistication stage..."
        />
      </div>

      {/* Generate Synthesis Button */}
      <button
        onClick={onGenerateSynthesis}
        disabled={isStreaming || !levels.messageDesire || !levels.messageAwareness || !levels.messageSophistication}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          !isStreaming
            ? "bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9]/20"
            : "bg-[hsl(0_0%_100%/0.06)] text-muted-foreground cursor-not-allowed"
        }`}
      >
        {isStreaming ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Synthesise Message Direction
      </button>

      {/* Synthesis Output */}
      {(levels.messageSynthesis || (isStreaming && streamedContent)) && (
        <div className="rounded-lg border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 p-4">
          <h4 className="text-sm font-medium mb-2 text-[#0ea5e9]">Message Direction</h4>
          <MarkdownRenderer content={levels.messageSynthesis || streamedContent} />
        </div>
      )}
    </div>
  );
}

// ─── Level 5: Persona ───

function Level5Persona({ levels, updateField }: LevelProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold mb-1">Level 5: Persona</h2>
        <p className="text-sm text-muted-foreground">
          Who this concept speaks to. Not a demographic — a specific person with a specific frustration.
        </p>
      </div>

      <div>
        <FieldLabel hint="Describe the specific person this concept is for. Name, role, situation. *">
          Avatar *
        </FieldLabel>
        <TextArea
          value={levels.personaAvatar}
          onChange={(v) => updateField("personaAvatar", v)}
          placeholder="e.g., 'Sarah, CMO at a $5M SaaS company, 18 months in role, feels the pressure of rising CAC and can't explain it to the board'"
          rows={3}
        />
      </div>

      <div>
        <FieldLabel hint="What is the core emotional frustration? Not the business problem — the feeling. *">
          Core Frustration *
        </FieldLabel>
        <TextArea
          value={levels.personaFrustration}
          onChange={(v) => updateField("personaFrustration", v)}
          placeholder="e.g., Tired of agencies saying 'we need more creative' when she knows the problem is deeper"
          rows={3}
        />
      </div>

      <div>
        <FieldLabel hint="What does winning look like for this person?">What Winning Looks Like</FieldLabel>
        <TextArea
          value={levels.personaWinning}
          onChange={(v) => updateField("personaWinning", v)}
          placeholder="e.g., 'Walking into the board meeting with a clear revenue engine diagram and a declining CAC trend'"
          rows={2}
        />
      </div>

      <div>
        <FieldLabel hint="What solutions have they already tried and been let down by?">
          What They&apos;ve Tried Before
        </FieldLabel>
        <TextArea
          value={levels.personaTriedBefore}
          onChange={(v) => updateField("personaTriedBefore", v)}
          placeholder="e.g., 'Hired 2 agencies, tried in-house media buying, tested 50+ creatives without a clear framework'"
          rows={2}
        />
      </div>
    </div>
  );
}

// ─── Level 6: Format ───

function Level6Format({ levels, updateField }: LevelProps) {
  const updateImageExecution = useCallback(
    (idx: number, desc: string) => {
      const updated = [...levels.imageExecutions];
      updated[idx] = { description: desc };
      updateField("imageExecutions", updated);
    },
    [levels.imageExecutions, updateField]
  );

  const updateVideoExecution = useCallback(
    (idx: number, field: "description" | "length", value: string) => {
      const updated = [...levels.videoExecutions];
      updated[idx] = { ...updated[idx], [field]: value };
      updateField("videoExecutions", updated);
    },
    [levels.videoExecutions, updateField]
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold mb-1">Level 6: Format</h2>
        <p className="text-sm text-muted-foreground">
          Define the production spec. Minimum 3 executions per branch. Ad sets are labelled: images 001 / videos 001.
        </p>
      </div>

      <div>
        <FieldLabel hint="What formats will this concept be produced in?">Format Type *</FieldLabel>
        <SelectInput
          value={levels.formatType}
          onChange={(v) => updateField("formatType", v)}
          options={[
            { label: "Image only", value: "image" },
            { label: "Video only", value: "video" },
            { label: "Both image + video", value: "both" },
          ]}
          placeholder="Select format type..."
        />
      </div>

      {/* Image Executions */}
      {(levels.formatType === "image" || levels.formatType === "both") && (
        <div>
          <h4 className="text-sm font-medium mb-3">
            Image Executions{" "}
            <span className="text-muted-foreground font-normal">(Ad set: images 001)</span>
          </h4>
          <div className="space-y-3">
            {levels.imageExecutions.map((exec, idx) => (
              <div key={idx}>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Static {idx + 1}
                </label>
                <TextArea
                  value={exec.description}
                  onChange={(v) => updateImageExecution(idx, v)}
                  placeholder={`Describe image execution ${idx + 1}...`}
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Executions */}
      {(levels.formatType === "video" || levels.formatType === "both") && (
        <div>
          <h4 className="text-sm font-medium mb-3">
            Video Executions{" "}
            <span className="text-muted-foreground font-normal">(Ad set: videos 001)</span>
          </h4>
          <div className="space-y-3">
            {levels.videoExecutions.map((exec, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_120px] gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Video {idx + 1}
                  </label>
                  <TextArea
                    value={exec.description}
                    onChange={(v) => updateVideoExecution(idx, "description", v)}
                    placeholder={`Describe video execution ${idx + 1}...`}
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Length</label>
                  <TextInput
                    value={exec.length}
                    onChange={(v) => updateVideoExecution(idx, "length", v)}
                    placeholder="e.g., 30s"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)] p-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">BEAR System:</strong> These executions enter the
          Testing Ground ad set. Graduate winners to the Winners ad set. Build the Control
          campaign from your best performers.
        </p>
      </div>
    </div>
  );
}
