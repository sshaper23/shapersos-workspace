"use client";

import Link from "next/link";
import { ArrowRight, Palette, FileText, RotateCcw, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/utils";
import { useTier } from "@/hooks/use-tier";
import { UpgradeGate } from "@/components/shared/upgrade-gate";
import { VideoWalkthroughBanner } from "@/components/shared/video-walkthrough-banner";

export default function BrandGuidelinesPage() {
  const {
    state,
    clearBrandGuidelines,
    setActiveBrandGuidelines,
    deleteBrandGuidelinesProfile,
  } = useApp();
  const { canAccessFeature } = useTier();

  if (!canAccessFeature("brandGuidelines")) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <PageHeader
          title="Brand Guidelines"
          subtitle="Define your brand identity through guided discovery — then let AI synthesise your strategic brand guidelines."
        />
        <UpgradeGate feature="brandGuidelines" />
      </div>
    );
  }

  const profiles = state.brandGuidelinesProfiles || [];
  const activeId = state.activeBrandGuidelinesId || profiles[0]?.id || null;
  const activeProfile = profiles.find((p) => p.id === activeId) || null;
  const hasGuidelines = profiles.length > 0 && !!activeProfile;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Brand Guidelines"
        subtitle="Define your brand identity through guided discovery — then let AI synthesise your strategic brand guidelines."
      />

      <VideoWalkthroughBanner section="brand-guidelines" />

      {!hasGuidelines ? (
        /* No guidelines yet */
        <div className="max-w-2xl mx-auto mt-8">
          <div className="rounded-xl border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0ea5e9]/20 mx-auto mb-4">
              <Palette className="h-7 w-7 text-[#0ea5e9]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Build Your Brand Guidelines
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Answer 8 stages of guided questions about your brand — from
              purpose and personality to voice and visual identity. AI will then
              synthesise your responses into a complete brand guidelines
              document.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Link
                href="/brand-guidelines/build"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors"
              >
                Start Brand Discovery
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-xs text-muted-foreground">
                Takes approximately 15-20 minutes
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-8 space-y-3">
            <h3 className="text-sm font-semibold">How it works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { step: "1", title: "Brand Foundations", desc: "Define your purpose, transformation, and mission" },
                { step: "2", title: "Competitive Landscape", desc: "Map your market position and differentiators" },
                { step: "3", title: "Brand Personality", desc: "Define character traits across key spectrums" },
                { step: "4", title: "Language Patterns", desc: "Capture your voice, power words, and red-line words" },
                { step: "5", title: "Brand Desires", desc: "How you want people to feel and experience your brand" },
                { step: "6", title: "Visual Identity", desc: "Aesthetic direction, colour palette, and references" },
                { step: "7", title: "Social Proof & Story", desc: "Testimonials, results, and your origin story" },
                { step: "8", title: "Red Lines", desc: "Absolute boundaries for your brand" },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-3 rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0ea5e9]/15 text-[#0ea5e9] text-xs font-bold">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Guidelines completed — with multi-profile support */
        <div className="space-y-6">
          {/* Profile selector */}
          {profiles.length > 1 && (
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Brand Guide:
              </label>
              <div className="flex items-center gap-1.5">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveBrandGuidelines(p.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                      p.id === activeId
                        ? "border-[#0ea5e9]/30 bg-[#0ea5e9]/10 text-[#0ea5e9]"
                        : "border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p.label || "Untitled Guide"}
                  </button>
                ))}
                <Link
                  href="/brand-guidelines/build?new=true"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-dashed border-[hsl(0_0%_100%/0.15)] text-muted-foreground hover:text-[#0ea5e9] hover:border-[#0ea5e9]/30 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add
                </Link>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/15">
                <FileText className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-green-400 mb-1">
                  {activeProfile?.label || "Brand Guidelines"} Complete
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Your brand guidelines have been synthesised and saved. They
                  are automatically injected into all AI-powered tools for
                  on-brand outputs.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Link
                    href="/brand-guidelines/view"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0ea5e9] text-white text-sm font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                  >
                    View Guidelines <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    href="/brand-guidelines/build"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(0_0%_100%/0.08)] text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Edit Answers
                  </Link>
                  <Link
                    href="/brand-guidelines/build?new=true"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(0_0%_100%/0.08)] text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add New Brand Guide
                  </Link>
                  {profiles.length > 1 && (
                    <button
                      onClick={() => {
                        if (activeId && confirm("Delete this brand guide? This cannot be undone.")) {
                          deleteBrandGuidelinesProfile(activeId);
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick preview of synthesized guidelines */}
          {activeProfile?.synthesizedGuidelines && (
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-6">
              <h3 className="text-sm font-semibold mb-3">Quick Preview</h3>
              <div className="prose prose-sm prose-invert max-w-none text-sm whitespace-pre-wrap line-clamp-[12]">
                {activeProfile.synthesizedGuidelines}
              </div>
              <Link
                href="/brand-guidelines/view"
                className="inline-flex items-center gap-1 mt-3 text-xs text-[#0ea5e9] hover:underline"
              >
                Read full document <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
