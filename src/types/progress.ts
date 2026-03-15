export interface ProgressState {
  // Lever completion
  offerComplete: boolean;
  messageComplete: boolean;
  mechanismComplete: boolean;

  // Foundation completion
  northStarComplete: boolean;
  brandGuidelinesComplete: boolean;
  messagingMatrixComplete: boolean;

  // Engagement depth
  toolsUsed: number;
  playbooksCompleted: number;
  lastActiveDate: number | null;

  // Recommended actions (ordered by priority)
  nextSteps: NextStep[];

  // Overall progress score 0-100
  progressScore: number;
}

export interface NextStep {
  id: string;
  priority: number;
  label: string;
  description: string;
  cta: string;
  route: string;
  lever: "offer" | "message" | "mechanism" | "foundation" | "growth";
  estimatedTime: string;
  isBlocking: boolean;
}

export type ProgressBarState =
  | "north-star"
  | "brand-guidelines"
  | "offer"
  | "mechanism"
  | "messaging-matrix"
  | "playbook-recommendation"
  | "all-complete";
