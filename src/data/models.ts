/**
 * Locked model — all platform AI calls use this model.
 * To re-enable model switching: restore the selector in toolbar.tsx
 * and settings/page.tsx, and remove the override in api/chat/route.ts.
 */
export const LOCKED_MODEL = "claude-sonnet-4-5-20250514";
export const LOCKED_MODEL_LABEL = "Claude 4.5 Sonnet";

/** Full list kept for easy revert — not currently exposed in the UI. */
export const aiModels = [
  { label: "Claude 4.5 Sonnet", value: "claude-sonnet-4-5-20250514" },
  { label: "Claude 4 Opus", value: "claude-opus-4-20250514" },
  { label: "Claude 4 Sonnet", value: "claude-sonnet-4-20250514" },
  { label: "Claude 3.7 Sonnet", value: "claude-3-7-sonnet-20250219" },
] as const;
