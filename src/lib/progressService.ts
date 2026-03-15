import type { AppState } from "@/types/context";
import type { ProgressState, NextStep, ProgressBarState } from "@/types/progress";

export function computeProgressState(state: AppState): ProgressState {
  const northStarComplete = state.hasCompletedNorthStar;
  const brandGuidelinesComplete = state.hasCompletedBrandGuidelines;
  const messagingMatrixComplete = state.messagingMatrixState?.isComplete ?? false;

  const offerComplete = northStarComplete;
  const messageComplete = brandGuidelinesComplete && messagingMatrixComplete;
  const mechanismComplete = state.mechanisms.length > 0;

  const toolsUsed = state.toolsUsed ?? 0;
  const playbooksCompleted = state.playbooksCompleted ?? 0;

  const nextSteps = computeNextSteps({
    northStarComplete,
    brandGuidelinesComplete,
    messagingMatrixComplete,
    offerComplete,
    messageComplete,
    mechanismComplete,
    toolsUsed,
    playbooksCompleted,
  });

  const progressScore = computeProgressScore({
    northStarComplete,
    brandGuidelinesComplete,
    offerComplete,
    mechanismComplete,
    messageComplete,
    messagingMatrixComplete,
    toolsUsed,
    playbooksCompleted,
    lastActiveDate: state.lastActiveDate ?? null,
    nextSteps,
    progressScore: 0,
  });

  return {
    offerComplete,
    messageComplete,
    mechanismComplete,
    northStarComplete,
    brandGuidelinesComplete,
    messagingMatrixComplete,
    toolsUsed,
    playbooksCompleted,
    lastActiveDate: state.lastActiveDate ?? null,
    nextSteps,
    progressScore,
  };
}

function computeNextSteps(ctx: {
  northStarComplete: boolean;
  brandGuidelinesComplete: boolean;
  messagingMatrixComplete: boolean;
  offerComplete: boolean;
  messageComplete: boolean;
  mechanismComplete: boolean;
  toolsUsed: number;
  playbooksCompleted: number;
}): NextStep[] {
  const steps: NextStep[] = [];

  if (!ctx.northStarComplete) {
    steps.push({
      id: "north-star",
      priority: 1,
      label: "Complete your North Star",
      description:
        "Your business profile powers every AI tool. Complete it once and every output becomes personalised.",
      cta: "Complete North Star",
      route: "/north-star",
      lever: "foundation",
      estimatedTime: "10 mins",
      isBlocking: true,
    });
  }

  if (!ctx.brandGuidelinesComplete) {
    steps.push({
      id: "brand-guidelines",
      priority: ctx.northStarComplete ? 2 : 5,
      label: "Build your Brand Guidelines",
      description:
        "Define your voice, personality, and language patterns so all AI outputs match your brand.",
      cta: "Build Guidelines",
      route: "/brand-guidelines",
      lever: "message",
      estimatedTime: "15 mins",
      isBlocking: ctx.northStarComplete,
    });
  }

  if (ctx.northStarComplete && !ctx.mechanismComplete) {
    steps.push({
      id: "sales-mechanism",
      priority: ctx.brandGuidelinesComplete ? 3 : 4,
      label: "Map your Sales Mechanism",
      description:
        "Map your buying journey, key metrics, and highest-leverage fixes to complete your Revenue Engine.",
      cta: "Map Mechanism",
      route: "/sales-mechanism/new",
      lever: "mechanism",
      estimatedTime: "20 mins",
      isBlocking: false,
    });
  }

  if (ctx.brandGuidelinesComplete && !ctx.messagingMatrixComplete) {
    steps.push({
      id: "messaging-matrix",
      priority: ctx.mechanismComplete ? 3 : 5,
      label: "Build your Messaging Matrix",
      description:
        "7-step AI research flow that maps your audience psychology and messaging angles.",
      cta: "Build Matrix",
      route: "/messaging-matrix",
      lever: "message",
      estimatedTime: "30 mins",
      isBlocking: false,
    });
  }

  if (
    ctx.offerComplete &&
    ctx.messageComplete &&
    ctx.mechanismComplete &&
    ctx.playbooksCompleted === 0
  ) {
    steps.push({
      id: "first-playbook",
      priority: 4,
      label: "Run the HIRO Campaign Launch playbook",
      description:
        "Your Revenue Engine is complete. Deploy it with the HIRO Campaign Launch playbook.",
      cta: "Launch Playbook",
      route: "/playbooks/hiro-campaign",
      lever: "growth",
      estimatedTime: "45 mins",
      isBlocking: false,
    });
  }

  if (
    ctx.offerComplete &&
    ctx.mechanismComplete &&
    ctx.toolsUsed < 3
  ) {
    steps.push({
      id: "explore-tools",
      priority: 6,
      label: "Explore AI Tools",
      description:
        "Demand intelligence, message engineering, offer architecture and more — all powered by your context.",
      cta: "Browse Tools",
      route: "/tools",
      lever: "growth",
      estimatedTime: "5 mins",
      isBlocking: false,
    });
  }

  return steps.sort((a, b) => a.priority - b.priority);
}

export function computeProgressScore(state: ProgressState): number {
  let score = 0;

  // Foundation layer — 40 points total
  if (state.northStarComplete) score += 10;
  if (state.brandGuidelinesComplete) score += 10;
  if (state.offerComplete) score += 10;
  if (state.mechanismComplete) score += 10;

  // Message layer — 20 points
  if (state.messagingMatrixComplete) score += 20;

  // Engagement depth — 20 points
  score += Math.min(state.toolsUsed * 2, 10); // up to 10 pts
  score += Math.min(state.playbooksCompleted * 5, 10); // up to 10 pts

  // All three levers complete bonus — 20 points
  if (state.offerComplete && state.messageComplete && state.mechanismComplete) {
    score += 20;
  }

  return Math.min(score, 100);
}

export function getProgressBarState(state: AppState): ProgressBarState {
  const northStar = state.hasCompletedNorthStar;
  const brandGuidelines = state.hasCompletedBrandGuidelines;
  const mechanism = state.mechanisms.length > 0;
  const messagingMatrix = state.messagingMatrixState?.isComplete ?? false;

  if (!northStar) return "north-star";
  if (!brandGuidelines) return "brand-guidelines";
  if (!mechanism) return "mechanism";
  if (!messagingMatrix) return "messaging-matrix";

  const allLeversComplete =
    northStar && brandGuidelines && messagingMatrix && mechanism;
  const playbooksCompleted = state.playbooksCompleted ?? 0;

  if (allLeversComplete && playbooksCompleted === 0) return "playbook-recommendation";
  if (allLeversComplete) return "all-complete";

  return "all-complete";
}
