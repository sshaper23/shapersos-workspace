"use client";

import { Plus, X } from "lucide-react";

interface DynamicListProps {
  name: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  items: string[];
  onChange: (items: string[]) => void;
}

export function DynamicList({
  label,
  placeholder,
  helpText,
  required,
  items,
  onChange,
}: DynamicListProps) {
  const addItem = () => {
    onChange([...items, ""]);
  };

  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="text-[#0ea5e9] ml-1">*</span>}
      </label>
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[hsl(0_0%_100%/0.08)] text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition-colors"
      >
        <Plus className="h-3 w-3" />
        Add Item
      </button>
    </div>
  );
}
