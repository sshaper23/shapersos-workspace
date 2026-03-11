"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { northStarSections } from "@/data/north-star";
import { cn } from "@/lib/utils";
import {
  Check as CheckIcon,
  Sparkles,
  Send,
  Loader2,
  ChevronRight,
} from "lucide-react";

export default function NorthStarPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );

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

    // Build context from all filled fields
    const context = Object.entries(formValues)
      .filter(([, v]) => v.trim().length > 0)
      .map(([k, v]) => {
        const field = northStarSections
          .flatMap((s) => s.fields)
          .find((f) => f.key === k);
        return `${field?.label || k}: ${v}`;
      })
      .join("\n\n");

    // Mock AI response for now — will use real API when connected
    await new Promise((r) => setTimeout(r, 1500));
    const mockResponses: Record<string, string> = {
      mission:
        "Our mission is to empower entrepreneurs with the strategies, systems, and support they need to build scalable businesses that create lasting impact — transforming not just their revenue, but their freedom and fulfillment.",
      values:
        "1. Radical Ownership — We take full responsibility for our results\n2. Speed of Implementation — Action over perfection\n3. Authentic Leadership — Lead with integrity and transparency\n4. Community First — We rise by lifting others\n5. Relentless Growth — Never stop learning, never stop improving",
      uvp: "We combine battle-tested marketing frameworks with hands-on AI implementation to help entrepreneurs scale faster — without hiring a full marketing team.",
      icp: "Our ideal customer is a 30-50 year old entrepreneur or business owner generating $10K-$100K/month. They're driven, coachable, and willing to invest in growth. They're typically overwhelmed by marketing complexity and looking for a systematic approach to scaling.",
      customerValues:
        "Freedom, independence, legacy, impact, growth, efficiency, family time, financial security, being their own boss, making a difference.",
      vocabulary:
        "Funnel, offer stack, lead magnet, VSL, high-ticket, scaling, automation, conversion rate, ROAS, ad spend, creative fatigue, hook rate.",
      problems:
        "1. Inconsistent lead flow — feast or famine months\n2. No systematic marketing process\n3. Spending on ads without clear ROI\n4. Overwhelmed by all the marketing channels\n5. Can't afford a full marketing team\n6. Don't know how to communicate their value effectively",
      dreamState:
        "Predictable, scalable revenue with a marketing system that runs without them being involved in every detail. They want to be the CEO, not the marketing department. Freedom to focus on their zone of genius while leads and sales come in systematically.",
      offer:
        "Core Offer: Done-with-you marketing implementation program ($X,XXX/month)\n- Weekly strategy calls\n- AI tools platform access\n- Campaign frameworks and templates\n- Creative review and feedback\n- Community access",
      buyingJourney:
        "1. See ad or organic content → 2. Watch VSL or attend webinar → 3. Book strategy call → 4. Discovery call with sales team → 5. Enrollment and onboarding",
      obstacles:
        "1. Time — they're already stretched thin → We provide done-for-you templates and AI tools to 10x speed\n2. Technical skills — they're not marketers → Our frameworks remove the guesswork\n3. Past failures — burned by agencies or courses → We show proof and offer guarantees",
      objections:
        "1. \"I don't have time\" — Our system is built for busy entrepreneurs\n2. \"I've been burned before\" — We have proof of results and a guarantee\n3. \"Can I do this myself?\" — You could, but our system gets you there 10x faster\n4. \"I need to think about it\" — What specifically do you need to think through?\n5. \"It's too expensive\" — What's the cost of staying where you are?",
      qualifies:
        "- Currently generating revenue (not pre-revenue)\n- Willing to invest in growth\n- Coachable and open to new strategies\n- Has a proven offer that delivers results\n- Ready to take action, not just learn",
      disqualifies:
        "- Looking for get-rich-quick solutions\n- Not willing to invest time or money\n- No proven offer or product-market fit\n- Blames others for their results\n- Wants someone else to do everything for them",
      triedBefore:
        "- Hired marketing agencies with poor results\n- Bought online courses they never finished\n- Tried running their own Facebook ads\n- Attempted organic social media with inconsistent posting\n- Worked with freelancers on Fiverr/Upwork",
      preSalesInfo:
        "They need to understand:\n1. The framework and methodology (not just another course)\n2. What makes this different from what they've tried\n3. The time commitment required\n4. Expected timeline to results\n5. What support looks like day-to-day",
    };

    const response =
      mockResponses[fieldKey] ||
      `AI-generated draft based on your business context:\n\n${context ? "Based on what you've shared, here's a suggested response for this field. Edit and refine this to match your specific situation." : "Please fill in earlier sections first so the AI can provide better suggestions."}`;

    setFormValues((prev) => ({ ...prev, [fieldKey]: response }));
    setAiLoading(null);
  };

  const markSectionComplete = () => {
    setCompletedSections((prev) => new Set([...prev, currentSection]));
    if (currentSection < northStarSections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/notion/north-star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: formValues }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mx-auto mb-4">
              <CheckIcon className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              North Star Document Submitted
            </h2>
            <p className="text-muted-foreground mb-6">
              Your responses have been saved and synced. This information will be
              used to power all AI tools with your business context.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormValues({});
                setCompletedSections(new Set());
                setCurrentSection(0);
              }}
              className="px-6 py-2 rounded-xl bg-[hsl(0_0%_100%/0.08)] text-foreground hover:bg-[hsl(0_0%_100%/0.12)] transition-colors text-sm"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Panel — Sections */}
      <div className="hidden md:flex w-72 bg-[hsl(0_0%_100%/0.02)] border-r border-[hsl(0_0%_100%/0.06)] flex-col">
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
                className="h-full rounded-full bg-[#71a474] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2">
          {northStarSections.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSection(idx)}
              className={cn(
                "w-full text-left px-3 py-3 rounded-lg mb-1 flex items-center gap-3 transition-all",
                currentSection === idx
                  ? "bg-[#71a474]/15 text-[#71a474]"
                  : completedSections.has(idx)
                    ? "text-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
                    : "text-muted-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm",
                  currentSection === idx
                    ? "bg-[#71a474] text-white"
                    : completedSections.has(idx)
                      ? "bg-green-500/20 text-green-400"
                      : "bg-[hsl(0_0%_100%/0.08)] text-muted-foreground"
                )}
              >
                {completedSections.has(idx) ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <span>{s.emoji}</span>
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
                ? "bg-[#71a474] text-white hover:bg-[#71a474]/90"
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
            {/* Section Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                Section {currentSection + 1} of {northStarSections.length}
              </div>
              <h2 className="text-xl font-semibold mb-1">
                {section.emoji} {section.title}
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
                        <span className="text-[#71a474] ml-1">*</span>
                      )}
                    </label>
                    {field.aiAssistable && (
                      <button
                        onClick={() =>
                          handleAiAssist(field.key, field.aiPrompt || "")
                        }
                        disabled={aiLoading === field.key}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#71a474]/10 text-[#71a474] text-xs font-medium hover:bg-[#71a474]/20 transition-colors shrink-0 ml-3"
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
                  {field.type === "textarea" ? (
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
                      className="w-full px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#71a474]/50 transition-colors resize-y text-sm"
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
                      className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#71a474]/50 transition-colors text-sm"
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
                  className="px-6 py-2 rounded-xl bg-[#71a474] text-white font-medium text-sm hover:bg-[#71a474]/90 transition-colors flex items-center gap-2"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || filledFields === 0}
                  className="px-6 py-2 rounded-xl bg-[#71a474] text-white font-medium text-sm hover:bg-[#71a474]/90 transition-colors flex items-center gap-2"
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
          </div>
        </div>
      </div>
    </div>
  );
}
