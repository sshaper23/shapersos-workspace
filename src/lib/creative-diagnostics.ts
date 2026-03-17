/**
 * Client-side diagnostic logic for the Creative Iteration Planner.
 * No API call needed — runs entirely in the browser.
 */

export interface DiagnosticSignal {
  flag: "warning" | "stop";
  message: string;
}

export interface DiagnosticResult {
  signals: DiagnosticSignal[];
  recommendation: "iterate" | "new_concept";
}

export interface DiagnosticInput {
  conceptName: string;
  daysInMarket: string;
  iterationCycles: number;
  hookRate: number;
  producingWinners: boolean;
}

export function runIterationDiagnostic(input: DiagnosticInput): DiagnosticResult {
  const signals: DiagnosticSignal[] = [];
  let recommendation: "iterate" | "new_concept" = "iterate";

  if (input.iterationCycles >= 3) {
    signals.push({
      flag: "warning",
      message: "3+ iteration cycles completed — monitor closely for diminishing returns",
    });
  }

  if (!input.producingWinners) {
    signals.push({
      flag: "stop",
      message: "Iterations no longer producing Winners graduates — angle may be exhausted",
    });
    recommendation = "new_concept";
  }

  if (input.daysInMarket === "90+") {
    signals.push({
      flag: "warning",
      message: "Concept has been in market 90+ days — watch for audience fatigue across all executions",
    });
  }

  if (input.hookRate > 0 && input.hookRate < 1.5) {
    signals.push({
      flag: "stop",
      message: "Hook rate declining below 1.5% — angle is fatiguing across all executions",
    });
    recommendation = "new_concept";
  }

  // If multiple stop signals, definitely recommend new concept
  const stopCount = signals.filter((s) => s.flag === "stop").length;
  if (stopCount >= 2) {
    recommendation = "new_concept";
  }

  return { signals, recommendation };
}

/** The four stop signal rules displayed as reference */
export const STOP_SIGNAL_RULES = [
  "3+ iteration cycles with no new Winners graduates",
  "Angle in market 90+ days with consistent fatigue",
  "Hook rate declining across ALL executions (below 1.5%)",
  "Market adopted similar messaging at scale",
];

/** Iteration variables with descriptions */
export const ITERATION_VARIABLES = [
  {
    id: "visual-treatment",
    name: "Variable 01 — Visual Treatment",
    description: "New image executions of the same idea. Copy stays locked. Change what the creative shows, not what it says.",
    copyLocked: true,
  },
  {
    id: "copy-variations",
    name: "Variable 02 — Copy Variations",
    description: "On-image text and headline angles only. Creatives stay locked. Rotate the hook or headline while the visual stays identical.",
    copyLocked: false,
  },
  {
    id: "emotional-entry",
    name: "Variable 03 — Emotional Entry",
    description: "Change the emotional door the concept opens with. Options: proof-led, challenge-led, aspiration-led, curiosity-led. Copy structure stays, emotional angle shifts.",
    copyLocked: true,
  },
  {
    id: "format-shift",
    name: "Variable 04 — Format Shift",
    description: "Move the concept across formats. Static to carousel, carousel to video, video to story. Same angle and copy, new format execution.",
    copyLocked: true,
  },
  {
    id: "proof-swap",
    name: "Variable 05 — Proof / Evidence Swap",
    description: "Rotate the social proof element. Swap case studies, change data points, introduce new client stories. Core message stays locked.",
    copyLocked: true,
  },
] as const;
