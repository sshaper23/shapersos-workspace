"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle, Compass, Package, Palette, ChevronDown, Plus, Trash2 } from "lucide-react";
import { SafeUserButton } from "@/components/shared/auth-provider";
import { useApp } from "@/context/app-context";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Toolbar() {
  const { state, setActiveNorthStar, setActiveBrandGuidelines } = useApp();

  const activeNS = state.northStarProfiles?.find((p) => p.id === state.activeNorthStarId)
    || state.northStarProfiles?.[0]
    || null;

  const activeBG = state.brandGuidelinesProfiles?.find((p) => p.id === state.activeBrandGuidelinesId)
    || state.brandGuidelinesProfiles?.[0]
    || null;

  const businessName = activeNS?.company || null;
  const offerName = activeNS?.offer
    ? activeNS.offer.split("\n")[0].slice(0, 40)
    : null;
  const hasStyle = !!activeBG;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* Business Context — with multi-profile dropdown */}
        <ProfilePill
          icon={<Compass className="h-3 w-3" />}
          label={businessName || "No Business Context"}
          active={!!businessName}
          href="/north-star"
          profiles={state.northStarProfiles?.map((p) => ({
            id: p.id,
            label: p.company || "Untitled Business",
          })) || []}
          activeId={state.activeNorthStarId}
          onSelect={setActiveNorthStar}
          addLabel="Add Business"
        />

        {/* Offer — shows active North Star's offer */}
        <ToolbarPill
          icon={<Package className="h-3 w-3" />}
          label={offerName || "No Offer"}
          active={!!offerName}
          href="/north-star"
        />

        {/* Style — with multi-profile dropdown */}
        <ProfilePill
          icon={<Palette className="h-3 w-3" />}
          label={activeBG?.label || (hasStyle ? "Brand Guide Active" : "No Style Guide")}
          active={hasStyle}
          href="/brand-guidelines"
          profiles={state.brandGuidelinesProfiles?.map((p) => ({
            id: p.id,
            label: p.label || "Untitled Guide",
          })) || []}
          activeId={state.activeBrandGuidelinesId}
          onSelect={setActiveBrandGuidelines}
          addLabel="Add Brand Guide"
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(0_0%_100%/0.4)] transition-colors hover:bg-[hsl(0_0%_100%/0.08)] hover:text-[hsl(0_0%_100%/0.8)]">
          <HelpCircle className="h-4 w-4" />
        </button>
        <SafeUserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  );
}

/** Simple pill that links to a page (no dropdown) */
function ToolbarPill({
  icon,
  label,
  active,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={
        "hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors " +
        (active
          ? "border-[#0ea5e9]/20 bg-[#0ea5e9]/5 text-[#0ea5e9] hover:bg-[#0ea5e9]/10"
          : "border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.7)] hover:border-[hsl(0_0%_100%/0.15)]")
      }
    >
      {icon}
      <span className="max-w-[120px] truncate">{label}</span>
    </Link>
  );
}

/** Pill with dropdown for switching between multiple profiles */
function ProfilePill({
  icon,
  label,
  active,
  href,
  profiles,
  activeId,
  onSelect,
  addLabel,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  href: string;
  profiles: { id: string; label: string }[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  addLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const hasMultiple = profiles.length > 1;

  // If no profiles, just show a link to the setup page
  if (profiles.length === 0) {
    return (
      <Link
        href={href}
        className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.7)] hover:border-[hsl(0_0%_100%/0.15)]"
      >
        {icon}
        <span className="max-w-[120px] truncate">{label}</span>
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors",
          active
            ? "border-[#0ea5e9]/20 bg-[#0ea5e9]/5 text-[#0ea5e9] hover:bg-[#0ea5e9]/10"
            : "border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.7)] hover:border-[hsl(0_0%_100%/0.15)]"
        )}
      >
        {icon}
        <span className="max-w-[120px] truncate">{label}</span>
        {hasMultiple && <ChevronDown className={cn("h-2.5 w-2.5 transition-transform", open && "rotate-180")} />}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[#0a0d1f] shadow-xl z-50 overflow-hidden">
          <div className="p-1">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-left",
                  p.id === activeId
                    ? "bg-[#0ea5e9]/10 text-[#0ea5e9]"
                    : "text-[hsl(0_0%_100%/0.7)] hover:bg-[hsl(0_0%_100%/0.06)]"
                )}
              >
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full shrink-0",
                  p.id === activeId ? "bg-[#0ea5e9]" : "bg-[hsl(0_0%_100%/0.15)]"
                )} />
                <span className="truncate flex-1">{p.label}</span>
                {p.id === activeId && (
                  <span className="text-[10px] text-[#0ea5e9]/60 shrink-0">Active</span>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-[hsl(0_0%_100%/0.06)] p-1">
            <Link
              href={href}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[hsl(0_0%_100%/0.5)] hover:text-[hsl(0_0%_100%/0.8)] hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
            >
              <Plus className="h-3 w-3" />
              {addLabel}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
