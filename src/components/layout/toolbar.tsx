"use client";

import { useState } from "react";
import { HelpCircle, Sun, Moon, User } from "lucide-react";
import { aiModels } from "@/data/models";
import { defaultBusinessContexts, defaultOffers, defaultStyleGuides } from "@/data/contexts";

export function Toolbar() {
  const [model, setModel] = useState(aiModels[0].value);
  const [context, setContext] = useState("none");
  const [offer, setOffer] = useState("none");
  const [style, setStyle] = useState("none");
  const [isDark, setIsDark] = useState(true);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <ToolbarSelect
          value={model}
          onChange={setModel}
          options={aiModels.map((m) => ({ label: m.label, value: m.value }))}
        />
        <ToolbarSelect
          value={context}
          onChange={setContext}
          options={defaultBusinessContexts.map((c) => ({ label: c.name, value: c.id }))}
        />
        <ToolbarSelect
          value={offer}
          onChange={setOffer}
          options={defaultOffers.map((o) => ({ label: o.name, value: o.id }))}
        />
        <ToolbarSelect
          value={style}
          onChange={setStyle}
          options={defaultStyleGuides.map((s) => ({ label: s.name, value: s.id }))}
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(0_0%_100%/0.4)] transition-colors hover:bg-[hsl(0_0%_100%/0.08)] hover:text-[hsl(0_0%_100%/0.8)]">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(0_0%_100%/0.4)] transition-colors hover:bg-[hsl(0_0%_100%/0.08)] hover:text-[hsl(0_0%_100%/0.8)]"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(0_0%_100%/0.1)] text-[hsl(0_0%_100%/0.6)]">
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

function ToolbarSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 text-xs text-[hsl(0_0%_100%/0.7)] outline-none transition-colors hover:border-[hsl(0_0%_100%/0.15)] focus:border-[#71a474]/50"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#001144]">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
