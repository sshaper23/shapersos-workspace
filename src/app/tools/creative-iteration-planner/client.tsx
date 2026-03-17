"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Repeat,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  OctagonIcon,
  CheckCircle2,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { useAIStream } from "@/hooks/use-ai-stream";
import { useTier } from "@/hooks/use-tier";
import { UpgradeGate } from "@/components/shared/upgrade-gate";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { CONCEPT_LEVEL_PROMPTS } from "@/data/concept-prompts";
import {
  runIterationDiagnostic,
  STOP_SIGNAL_RULES,
  ITERATION_VARIABLES,
  type DiagnosticResult,
  type DiagnosticInput,
} from "@/lib/creative-diagnostics";

type Stage = "input" | "diagnostic" | "brief";

export function CreativeIterationPlannerClient() {
  const router = useRouter();
  const { canAccessTool } = useTier();
  const { generate, isStreaming, streamedContent } = useAIStream({
    toolSlug: "creative-iteration-planner",
  });

  // Check access
  if (!canAccessTool("creative-iteration-planner")) {
    return (
      <div className="min-h-screen p-6">
        <UpgradeGate feature="tools" />
      </div>
    );
  }

  // ─── State ───
  const [stage, setStage] = useState<Stage>("input");
  const [aiError, setAiError] = useState<string | null>(null);
  const [iterationBrief, setIterationBrief] = useState("");

  // Input fields
  const [conceptName, setConceptName] = useState("");
  const [angleStatement, setAngleStatement] = useState("");
  const [winningCopy, setWinningCopy] = useState("");
  const [treatment, setTreatment] = useState("");
  const [daysInMarket, setDaysInMarket] = useState("");
  const [iterationCycles, setIterationCycles] = useState(0);
  const [hookRate, setHookRate] = useState(0);
  const [producingWinners, setProducingWinners] = useState(true);

  // Diagnostic results
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);

  // ─── Validation ───
  const canRunDiagnostic = useMemo(
    () => !!conceptName && !!angleStatement && !!daysInMarket,
    [conceptName, angleStatement, daysInMarket]
  );

  // ─── Run Diagnostic ───
  const runDiagnostic = useCallback(() => {
    const input: DiagnosticInput = {
      conceptName,
      daysInMarket,
      iterationCycles,
      hookRate,
      producingWinners,
    };
    const result = runIterationDiagnostic(input);
    setDiagnosticResult(result);
    setStage("diagnostic");
  }, [conceptName, daysInMarket, iterationCycles, hookRate, producingWinners]);

  // ─── Generate Iteration Brief ───
  const generateBrief = useCallback(async () => {
    if (!selectedVariable) return;
    setAiError(null);
    setStage("brief");

    const variable = ITERATION_VARIABLES.find((v) => v.id === selectedVariable);
    if (!variable) return;

    try {
      const prompt = `## Winning Concept
Concept Name: ${conceptName}
Angle Statement: ${angleStatement}
Winning Copy:
${winningCopy}
Treatment: ${treatment}
Days in Market: ${daysInMarket}
Previous Iteration Cycles: ${iterationCycles}
Current Hook Rate: ${hookRate}%

## Selected Iteration Variable
${variable.name}
${variable.description}
Copy Locked: ${variable.copyLocked ? "Yes — copy stays identical" : "No — copy rotates this cycle"}

## Diagnostic Summary
Recommendation: ${diagnosticResult?.recommendation || "iterate"}
Signals: ${diagnosticResult?.signals.map((s) => `[${s.flag}] ${s.message}`).join("; ") || "None"}`;

      const result = await generate(
        [{ role: "user", content: prompt }],
        CONCEPT_LEVEL_PROMPTS.iterationBrief
      );
      setIterationBrief(result);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to generate iteration brief");
    }
  }, [selectedVariable, conceptName, angleStatement, winningCopy, treatment, daysInMarket, iterationCycles, hookRate, diagnosticResult, generate]);

  // ─── Reset ───
  const startOver = useCallback(() => {
    setStage("input");
    setConceptName("");
    setAngleStatement("");
    setWinningCopy("");
    setTreatment("");
    setDaysInMarket("");
    setIterationCycles(0);
    setHookRate(0);
    setProducingWinners(true);
    setDiagnosticResult(null);
    setSelectedVariable(null);
    setIterationBrief("");
    setAiError(null);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
        <div className="max-w-4xl mx-auto px-6 py-4">
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
                <Repeat className="h-5 w-5 text-[#0ea5e9]" />
                <h1 className="text-lg font-semibold">Creative Iteration Planner</h1>
              </div>
            </div>
            {stage !== "input" && (
              <button
                onClick={startOver}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Start Over
              </button>
            )}
          </div>

          {/* Stage Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {(["input", "diagnostic", "brief"] as Stage[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    stage === s
                      ? "bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20"
                      : i < ["input", "diagnostic", "brief"].indexOf(stage)
                      ? "bg-[hsl(0_0%_100%/0.06)] text-foreground"
                      : "bg-[hsl(0_0%_100%/0.03)] text-muted-foreground"
                  }`}
                >
                  <span>{i + 1}.</span>
                  <span className="capitalize">{s}</span>
                </div>
                {i < 2 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* ─── Stage 1: Input ─── */}
        {stage === "input" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold mb-1">Winning Concept Details</h2>
              <p className="text-sm text-muted-foreground">
                Enter the concept you want to iterate on. This should be a concept that has graduated
                from Testing Ground to Winners.
              </p>
            </div>

            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-6 space-y-5">
              <div>
                <Label>Concept Name *</Label>
                <TextInput
                  value={conceptName}
                  onChange={setConceptName}
                  placeholder="e.g., 'Scaling Bottleneck Challenge'"
                />
              </div>

              <div>
                <Label hint="The locked angle from the original concept.">Angle Statement *</Label>
                <TextArea
                  value={angleStatement}
                  onChange={setAngleStatement}
                  placeholder="e.g., 'Most agencies scale ads by throwing more budget at the wall — we diagnose the mechanism first'"
                  rows={2}
                />
              </div>

              <div>
                <Label hint="The copy that is currently running and winning.">Winning Copy</Label>
                <TextArea
                  value={winningCopy}
                  onChange={setWinningCopy}
                  placeholder="Paste the full winning copy here (hook, body, CTA)..."
                  rows={5}
                />
              </div>

              <div>
                <Label hint="Current visual treatment description.">Treatment</Label>
                <TextArea
                  value={treatment}
                  onChange={setTreatment}
                  placeholder="e.g., 'Dark background, single bold stat, clean typography'"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Days in Market *</Label>
                  <SelectInput
                    value={daysInMarket}
                    onChange={setDaysInMarket}
                    options={[
                      { label: "0-30 days", value: "0-30" },
                      { label: "30-60 days", value: "30-60" },
                      { label: "60-90 days", value: "60-90" },
                      { label: "90+ days", value: "90+" },
                    ]}
                    placeholder="Select..."
                  />
                </div>
                <div>
                  <Label hint="How many times has this concept been iterated already?">
                    Previous Iteration Cycles
                  </Label>
                  <input
                    type="number"
                    min={0}
                    value={iterationCycles}
                    onChange={(e) => setIterationCycles(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm focus:border-[#0ea5e9] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label hint="Current hook rate across all executions (%).">Hook Rate (%)</Label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={hookRate || ""}
                    onChange={(e) => setHookRate(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 2.5"
                    className="w-full rounded-lg border border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm focus:border-[#0ea5e9] focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                  />
                </div>
                <div>
                  <Label hint="Are iterations still producing Winners graduates?">
                    Producing Winners?
                  </Label>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => setProducingWinners(true)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        producingWinners
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : "bg-[hsl(0_0%_100%/0.04)] text-muted-foreground border border-[hsl(0_0%_100%/0.1)]"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setProducingWinners(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !producingWinners
                          ? "bg-red-500/15 text-red-400 border border-red-500/20"
                          : "bg-[hsl(0_0%_100%/0.04)] text-muted-foreground border border-[hsl(0_0%_100%/0.1)]"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={runDiagnostic}
                disabled={!canRunDiagnostic}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  canRunDiagnostic
                    ? "bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                    : "bg-[hsl(0_0%_100%/0.06)] text-muted-foreground cursor-not-allowed"
                }`}
              >
                Run Diagnostic
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Stage 2: Diagnostic ─── */}
        {stage === "diagnostic" && diagnosticResult && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold mb-1">Stop-or-Iterate Diagnostic</h2>
              <p className="text-sm text-muted-foreground">
                Review the signals below. If the recommendation is &quot;new concept&quot;, consider starting
                fresh in the Creative Concept Builder instead.
              </p>
            </div>

            {/* Recommendation */}
            <div
              className={`rounded-xl border p-5 ${
                diagnosticResult.recommendation === "iterate"
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-amber-500/20 bg-amber-500/5"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {diagnosticResult.recommendation === "iterate" ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                )}
                <h3 className="text-base font-semibold">
                  {diagnosticResult.recommendation === "iterate"
                    ? "Iterate — This concept has more runway"
                    : "Consider a New Concept — Signals suggest diminishing returns"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground ml-9">
                {diagnosticResult.recommendation === "iterate"
                  ? `"${conceptName}" can be extended. Select an iteration variable below.`
                  : `"${conceptName}" is showing fatigue signals. You can still iterate, but consider building a fresh concept with the Creative Concept Builder.`}
              </p>
            </div>

            {/* Signals */}
            {diagnosticResult.signals.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Signals Detected</h4>
                {diagnosticResult.signals.map((signal, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 rounded-lg border p-3 ${
                      signal.flag === "stop"
                        ? "border-red-500/20 bg-red-500/5"
                        : "border-amber-500/20 bg-amber-500/5"
                    }`}
                  >
                    {signal.flag === "stop" ? (
                      <OctagonIcon className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                    )}
                    <span className="text-sm">{signal.message}</span>
                  </div>
                ))}
              </div>
            )}

            {diagnosticResult.signals.length === 0 && (
              <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-sm">No stop signals detected. This concept is healthy for iteration.</span>
              </div>
            )}

            {/* Stop Signal Reference */}
            <div className="rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Stop Signal Rules
                </h4>
              </div>
              <ul className="space-y-1">
                {STOP_SIGNAL_RULES.map((rule, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-0.5">{idx + 1}.</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Select Iteration Variable */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Select Iteration Variable</h4>
              <div className="space-y-2">
                {ITERATION_VARIABLES.map((variable) => (
                  <button
                    key={variable.id}
                    onClick={() => setSelectedVariable(variable.id)}
                    className={`w-full text-left rounded-lg border p-4 transition-all ${
                      selectedVariable === variable.id
                        ? "border-[#0ea5e9]/40 bg-[#0ea5e9]/5"
                        : "border-[hsl(0_0%_100%/0.06)] hover:border-[hsl(0_0%_100%/0.12)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-sm font-medium">{variable.name}</h5>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          variable.copyLocked
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {variable.copyLocked ? "Copy Locked" : "Copy Rotates"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{variable.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStage("input")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Input
              </button>
              <button
                onClick={generateBrief}
                disabled={!selectedVariable || isStreaming}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedVariable && !isStreaming
                    ? "bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                    : "bg-[hsl(0_0%_100%/0.06)] text-muted-foreground cursor-not-allowed"
                }`}
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Iteration Brief
              </button>
            </div>
          </div>
        )}

        {/* ─── Stage 3: Brief ─── */}
        {stage === "brief" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold mb-1">Iteration Brief</h2>
              <p className="text-sm text-muted-foreground">
                Structured iteration brief for &quot;{conceptName}&quot; — ready for production handoff.
              </p>
            </div>

            {(iterationBrief || isStreaming) && (
              <div className="rounded-xl border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 p-6">
                <MarkdownRenderer content={iterationBrief || streamedContent} />
              </div>
            )}

            {aiError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                {aiError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStage("diagnostic")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Diagnostic
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={startOver}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-[hsl(0_0%_100%/0.1)] hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                >
                  Plan Another Iteration
                </button>
                <button
                  onClick={() => router.push("/tools/creative-concept-builder")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.1)] transition-colors"
                >
                  Build New Concept
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared Form Components ───

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-sm font-medium">{children}</label>
      {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
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
