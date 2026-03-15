"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { northStarSections } from "@/data/north-star";
import { cn } from "@/lib/utils";
import {
  Check as CheckIcon,
  Sparkles,
  Send,
  Loader2,
  ChevronRight,
  Plus,
  Trash2,
  ChevronDown,
  ArrowRight,
  Home,
} from "lucide-react";
import { getIcon } from "@/lib/icons";
import { useApp } from "@/context/app-context";
import { StrategistCTA } from "@/components/shared/strategist-cta";
import type { NorthStarData } from "@/types/context";

function SectionIcon({ name, className }: { name: string; className?: string }) {
  const Icon = getIcon(name);
  return <Icon className={className} />;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function NorthStarPage() {
  const {
    state,
    setNorthStarData,
    saveNorthStarProfile,
    deleteNorthStarProfile,
    setActiveNorthStar,
  } = useApp();

  const profiles = state.northStarProfiles || [];
  const activeProfileId = state.activeNorthStarId || profiles[0]?.id || null;
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || null;

  const [currentSection, setCurrentSection] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );
  const [draftRestored, setDraftRestored] = useState(false);

  // Draft auto-save key scoped to profile
  const draftKey = activeProfileId
    ? `shapers-northstar-draft-${activeProfileId}`
    : "shapers-northstar-draft-new";

  // Restore draft from localStorage on mount / profile change
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.formValues && Object.keys(draft.formValues).length > 0) {
          setFormValues(draft.formValues);
          setCurrentSection(draft.currentSection ?? 0);
          setCompletedSections(new Set(draft.completedSections ?? []));
          setEditingProfileId(draft.editingProfileId ?? activeProfileId);
          setDraftRestored(true);
          return; // Skip the normal profile hydration below
        }
      }
    } catch { /* ignore corrupt drafts */ }

    // Normal hydration from the saved profile
    if (activeProfile) {
      const existing: Record<string, string> = {};
      for (const [key, value] of Object.entries(activeProfile)) {
        if (typeof value === "string" && value.trim() && key !== "id" && key !== "notionPageId") {
          existing[key] = value;
        }
      }
      setFormValues(existing);
      setEditingProfileId(activeProfile.id);

      const filledSections = new Set<number>();
      northStarSections.forEach((s, idx) => {
        if (s.fields.some((f) => existing[f.key]?.trim())) filledSections.add(idx);
      });
      setCompletedSections(filledSections);
      setSubmitted(false);
    } else {
      setFormValues({});
      setEditingProfileId(null);
      setCompletedSections(new Set());
    }
    setCurrentSection(0);
    setDraftRestored(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileId]);

  // Auto-save draft to localStorage on every change
  useEffect(() => {
    if (submitted) return; // Don't save after successful submission
    const hasContent = Object.values(formValues).some((v) => v.trim().length > 0);
    if (!hasContent) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          formValues,
          currentSection,
          completedSections: Array.from(completedSections),
          editingProfileId,
        })
      );
    } catch { /* storage full — silently fail */ }
  }, [formValues, currentSection, completedSections, editingProfileId, draftKey, submitted]);

  // Clear draft after successful submission
  const clearDraft = () => {
    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
    setDraftRestored(false);
  };

  // Try loading from Notion on mount
  useEffect(() => {
    fetch("/api/notion/north-star")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && profiles.length === 0) {
          // No local profiles yet — import from Notion
          const data = json.data as Record<string, string>;
          const id = generateId();
          const profile: NorthStarData = {
            ...data,
            id,
            notionPageId: json.notionPageId || undefined,
          } as unknown as NorthStarData;
          saveNorthStarProfile(profile);
          setActiveNorthStar(id);
        }
      })
      .catch(() => { /* Notion unavailable */ })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine the suggested next step based on current progress
  const nextStep = useMemo(() => {
    const hasBrand = (state.brandGuidelinesProfiles?.length ?? 0) > 0;
    const hasMechanism = (state.mechanisms?.length ?? 0) > 0;
    const hasMatrix = !!state.messagingMatrixState && Object.keys(state.messagingMatrixState.stepOutputs || {}).length > 0;

    if (!hasMechanism) {
      return {
        label: "Map Your Sales Mechanism",
        description: "Define your buying journey stages and track the metrics that matter for your business.",
        href: "/sales-mechanism/new",
      };
    }
    if (!hasBrand) {
      return {
        label: "Build Brand Guidelines",
        description: "Create a strategic brand identity through guided AI discovery.",
        href: "/brand-guidelines",
      };
    }
    if (!hasMatrix) {
      return {
        label: "Build Your Messaging Matrix",
        description: "Map your audience psychology and messaging angles into a strategic document.",
        href: "/messaging-matrix",
      };
    }
    return {
      label: "Explore Your Tools",
      description: "Use AI-powered tools with your business context to create high-converting assets.",
      href: "/tools",
    };
  }, [state.brandGuidelinesProfiles, state.mechanisms, state.messagingMatrixState]);

  const section = northStarSections[currentSection];
  const totalFields = northStarSections.reduce(
    (sum, s) => sum + s.fields.length,
    0
  );
  const filledFields = Object.values(formValues).filter(
    (v) => v.trim().length > 0
  ).length;
  const progress = Math.round((filledFields / totalFields) * 100);

  const isSectionComplete = (sectionIndex: number) => {
    const s = northStarSections[sectionIndex];
    const requiredFields = s.fields.filter((f) => f.required);
    if (requiredFields.length === 0) {
      return s.fields.some(
        (f) => formValues[f.key] && formValues[f.key].trim().length > 0
      );
    }
    return requiredFields.every(
      (f) => formValues[f.key] && formValues[f.key].trim().length > 0
    );
  };

  const handleAiAssist = async (fieldKey: string, aiPrompt: string) => {
    setAiLoading(fieldKey);

    const context = Object.entries(formValues)
      .filter(([, v]) => v.trim().length > 0)
      .map(([k, v]) => {
        const field = northStarSections
          .flatMap((s) => s.fields)
          .find((f) => f.key === k);
        return `${field?.label || k}: ${v}`;
      })
      .join("\n\n");

    const targetField = northStarSections
      .flatMap((s) => s.fields)
      .find((f) => f.key === fieldKey);

    const systemPrompt = `You are a senior brand strategist helping a business owner complete their North Star business profile. Write a thoughtful, specific draft for the "${targetField?.label || fieldKey}" field. Be direct and actionable — write as if you are the business owner. Do not use generic filler. If prior context is provided, tailor your response to their specific business.`;

    const userMessage = context
      ? `Here is what I've filled in so far:\n\n${context}\n\nPlease draft a response for: ${targetField?.label || fieldKey}${aiPrompt ? `\n\nGuidance: ${aiPrompt}` : ""}`
      : `Please draft a response for: ${targetField?.label || fieldKey}${aiPrompt ? `\n\nGuidance: ${aiPrompt}` : ""}\n\nI haven't filled in other fields yet, so give me a strong starting point I can customise.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage }],
          systemPrompt,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let result = "";
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split("\n")) {
              if (line.startsWith("data: ")) {
                const payload = line.slice(6);
                if (payload === "[DONE]") break;
                try {
                  const parsed = JSON.parse(payload);
                  if (parsed.text) result += parsed.text;
                } catch { /* skip */ }
              }
            }
          }
        }
        setFormValues((prev) => ({ ...prev, [fieldKey]: result.trim() }));
      } else {
        const data = await res.json();
        setFormValues((prev) => ({
          ...prev,
          [fieldKey]: data.content || data.text || "AI Assist could not generate a response. Please try again.",
        }));
      }
    } catch {
      setFormValues((prev) => ({
        ...prev,
        [fieldKey]: "AI Assist encountered an error. Please try again.",
      }));
    } finally {
      setAiLoading(null);
    }
  };

  const markSectionComplete = () => {
    setCompletedSections((prev) => new Set([...prev, currentSection]));
    if (currentSection < northStarSections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  /** Create a new blank profile */
  const handleNewProfile = () => {
    const id = generateId();
    const blank: NorthStarData = {
      id,
      name: "", email: "", company: "", website: "", mission: "", values: "",
      uvp: "", icp: "", customerValues: "", vocabulary: "", problems: "",
      dreamState: "", offer: "", buyingJourney: "", testimonials: "",
      obstacles: "", objections: "", qualifies: "", disqualifies: "",
      buyingDecision: "", triedBefore: "", preSalesInfo: "", additional: "",
      businessModelType: "", salesModel: "", primaryChannel: "",
      industry: "", avgDealSize: "", salesCycleLength: "",
    };
    saveNorthStarProfile(blank);
    setActiveNorthStar(id);
    setSubmitted(false);
  };

  /** Submit active profile to Notion */
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/notion/north-star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: formValues }),
      });
      if (res.ok) {
        const data = await res.json();
        const id = editingProfileId || generateId();
        const profile: NorthStarData = {
          ...(formValues as unknown as NorthStarData),
          id,
          notionPageId: data.notionPageId || undefined,
        };
        saveNorthStarProfile(profile);
        setActiveNorthStar(id);
        setSubmitted(true);
        clearDraft();
      }
    } catch {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-lg">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mx-auto mb-4">
              <CheckIcon className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              North Star Document Submitted
            </h2>
            <p className="text-muted-foreground mb-8">
              Your responses have been saved and synced. This information will be
              used to power all AI tools with your business context.
            </p>

            {/* Suggested Next Step */}
            <Link
              href={nextStep.href}
              className="block rounded-xl border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 p-5 mb-6 text-left hover:bg-[#0ea5e9]/10 hover:border-[#0ea5e9]/30 transition-colors group"
            >
              <p className="text-[10px] font-semibold text-[#0ea5e9] uppercase tracking-wider mb-1.5">
                Suggested Next Step
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-white transition-colors">
                    {nextStep.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {nextStep.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#0ea5e9] shrink-0 ml-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <div className="flex items-center gap-3 justify-center">
              <Link
                href="/"
                className="px-5 py-2 rounded-xl bg-[hsl(0_0%_100%/0.08)] text-foreground hover:bg-[hsl(0_0%_100%/0.12)] transition-colors text-sm flex items-center gap-2"
              >
                <Home className="h-3.5 w-3.5" />
                Return to Dashboard
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2 rounded-xl bg-[hsl(0_0%_100%/0.08)] text-foreground hover:bg-[hsl(0_0%_100%/0.12)] transition-colors text-sm"
              >
                Edit This Profile
              </button>
              <button
                onClick={handleNewProfile}
                className="px-5 py-2 rounded-xl bg-[hsl(0_0%_100%/0.08)] text-foreground hover:bg-[hsl(0_0%_100%/0.12)] transition-colors text-sm flex items-center gap-2"
              >
                <Plus className="h-3 w-3" /> Add Another Business
              </button>
            </div>
            <div className="mt-6">
              <StrategistCTA variant="inline" context="northStarComplete" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Panel — Sections */}
      <div className="hidden md:flex w-72 bg-[hsl(0_0%_100%/0.02)] border-r border-[hsl(0_0%_100%/0.06)] flex-col">
        {/* Profile Selector */}
        {profiles.length > 0 && (
          <div className="p-3 border-b border-[hsl(0_0%_100%/0.06)]">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">
              Business Profile
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={activeProfileId || ""}
                onChange={(e) => setActiveNorthStar(e.target.value || null)}
                className="flex-1 h-8 rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-2.5 text-xs text-foreground outline-none focus:border-[#0ea5e9]/50"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#060918]">
                    {p.company || "Untitled Business"}
                  </option>
                ))}
              </select>
              <button
                onClick={handleNewProfile}
                title="Add new business"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] text-muted-foreground hover:text-[#0ea5e9] hover:border-[#0ea5e9]/30 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              {profiles.length > 1 && (
                <button
                  onClick={() => {
                    if (activeProfileId && confirm("Delete this business profile? This cannot be undone.")) {
                      deleteNorthStarProfile(activeProfileId);
                    }
                  }}
                  title="Delete this profile"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="p-4 border-b border-[hsl(0_0%_100%/0.06)]">
          <h3 className="font-semibold text-sm">North Star Document</h3>
          <p className="text-xs text-muted-foreground mt-1">
            AI-assisted business profile
          </p>
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{progress}% complete</span>
              <span>
                {filledFields}/{totalFields} fields
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[hsl(0_0%_100%/0.08)]">
              <div
                className="h-full rounded-full bg-[#0ea5e9] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {northStarSections.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSection(idx)}
              className={cn(
                "w-full text-left px-3 py-3 rounded-lg mb-1 flex items-center gap-3 transition-all",
                currentSection === idx
                  ? "bg-[#0ea5e9]/15 text-[#0ea5e9]"
                  : completedSections.has(idx)
                    ? "text-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
                    : "text-muted-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm",
                  currentSection === idx
                    ? "bg-[#0ea5e9] text-white"
                    : completedSections.has(idx)
                      ? "bg-green-500/20 text-green-400"
                      : "bg-[hsl(0_0%_100%/0.08)] text-muted-foreground"
                )}
              >
                {completedSections.has(idx) ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <SectionIcon name={s.icon} className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium truncate block">
                  {s.title}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {s.fields.length} fields
                </span>
              </div>
            </button>
          ))}
        </nav>

        {/* Submit Button */}
        <div className="p-3 border-t border-[hsl(0_0%_100%/0.06)]">
          <button
            onClick={handleSubmit}
            disabled={submitting || filledFields === 0}
            className={cn(
              "w-full py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2",
              filledFields > 0
                ? "bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                : "bg-[hsl(0_0%_100%/0.08)] text-muted-foreground cursor-not-allowed"
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit to Notion
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* New business CTA if no profiles */}
            {profiles.length === 0 && (
              <div className="mb-6 rounded-xl border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 p-6 text-center">
                <h2 className="text-lg font-semibold mb-2">Start Your First Business Profile</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete your North Star to unlock personalised AI outputs across all tools.
                </p>
                <button
                  onClick={handleNewProfile}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Create Business Profile
                </button>
              </div>
            )}

            {/* Draft restored banner */}
            {draftRestored && (
              <div className="mb-4 flex items-center justify-between rounded-lg border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 px-4 py-2.5">
                <span className="text-xs text-[#0ea5e9]">
                  ✓ Draft restored — your in-progress work was saved automatically
                </span>
                <button
                  onClick={() => setDraftRestored(false)}
                  className="text-xs text-[#0ea5e9]/60 hover:text-[#0ea5e9] transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Section Header */}
            {(profiles.length > 0 || formValues.company) && (
              <>
                <div className="mb-8">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    Section {currentSection + 1} of {northStarSections.length}
                  </div>
                  <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                    <SectionIcon name={section.icon} className="h-5 w-5 text-[#0ea5e9]" />
                    {section.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>

                {/* Fields */}
                <div className="space-y-6">
                  {section.fields.map((field) => (
                    <div key={field.key}>
                      <div className="flex items-start justify-between mb-2">
                        <label className="block text-sm font-medium">
                          {field.label}
                          {field.required && (
                            <span className="text-[#0ea5e9] ml-1">*</span>
                          )}
                        </label>
                        {field.aiAssistable && (
                          <button
                            onClick={() =>
                              handleAiAssist(field.key, field.aiPrompt || "")
                            }
                            disabled={aiLoading === field.key}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-medium hover:bg-[#0ea5e9]/20 transition-colors shrink-0 ml-3"
                          >
                            {aiLoading === field.key ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3 w-3" />
                                AI Assist
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      {field.type === "select" && field.options ? (
                        <select
                          value={formValues[field.key] || ""}
                          onChange={(e) =>
                            setFormValues((p) => ({
                              ...p,
                              [field.key]: e.target.value,
                            }))
                          }
                          className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors text-sm appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#0c1220] text-muted-foreground">
                            {field.placeholder}
                          </option>
                          {field.options.map((opt) => (
                            <option
                              key={opt.value}
                              value={opt.value}
                              className="bg-[#0c1220] text-foreground"
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          value={formValues[field.key] || ""}
                          onChange={(e) =>
                            setFormValues((p) => ({
                              ...p,
                              [field.key]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          rows={4}
                          className="w-full px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors resize-y text-sm"
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={formValues[field.key] || ""}
                          onChange={(e) =>
                            setFormValues((p) => ({
                              ...p,
                              [field.key]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Section Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[hsl(0_0%_100%/0.06)]">
                  <button
                    onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                    disabled={currentSection === 0}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm transition-colors",
                      currentSection === 0
                        ? "text-muted-foreground/50 cursor-not-allowed"
                        : "text-foreground hover:bg-[hsl(0_0%_100%/0.08)]"
                    )}
                  >
                    Previous
                  </button>
                  {currentSection < northStarSections.length - 1 ? (
                    <button
                      onClick={markSectionComplete}
                      className="px-6 py-2 rounded-xl bg-[#0ea5e9] text-white font-medium text-sm hover:bg-[#0ea5e9]/90 transition-colors flex items-center gap-2"
                    >
                      Continue <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || filledFields === 0}
                      className="px-6 py-2 rounded-xl bg-[#0ea5e9] text-white font-medium text-sm hover:bg-[#0ea5e9]/90 transition-colors flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Submit to Notion
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
