export interface NorthStarData {
  id: string;
  name: string;
  email: string;
  company: string;
  website: string;
  mission: string;
  values: string;
  uvp: string;
  icp: string;
  customerValues: string;
  vocabulary: string;
  problems: string;
  dreamState: string;
  offer: string;
  buyingJourney: string;
  testimonials: string;
  obstacles: string;
  objections: string;
  qualifies: string;
  disqualifies: string;
  buyingDecision: string;
  triedBefore: string;
  preSalesInfo: string;
  additional: string;
  // Business Model
  businessModelType: string;
  salesModel: string;
  primaryChannel: string;
  industry: string;
  avgDealSize: string;
  salesCycleLength: string;
  notionPageId?: string;
  [key: string]: string | undefined;
}

export interface BrandGuidelinesData {
  id: string;
  label: string; // friendly name, e.g. "Primary Brand" or company name
  // Stage 1: Brand Foundations
  brandPurpose: string;
  brandTransformation: string;
  brandMission: string;
  // Stage 2: Competitive Landscape
  competitors: string;
  competitorStrengths: string;
  differentiator: string;
  // Stage 3: Brand Personality
  personalitySliders: string;
  personalityDescription: string;
  // Stage 4: Language Patterns
  naturalLanguage: string;
  avoidWords: string;
  powerWords: string;
  // Stage 5: Brand Desires
  firstEncounterFeel: string;
  sixMonthFeel: string;
  threeYearFame: string;
  brandAdmire: string;
  // Stage 6: Visual Identity
  visualAesthetic: string;
  colourDirection: string;
  visualReferences: string;
  // Stage 7: Social Proof & Story
  bestTestimonials: string;
  proudResult: string;
  founderStory: string;
  // Stage 8: Red Lines
  neverDo: string;
  wrongClient: string;
  distanceFrom: string;
  // Synthesized output
  synthesizedGuidelines: string;
  notionPageId?: string;
  [key: string]: string | undefined;
}

export interface MessagingMatrixState {
  currentStep: number;
  inputData: Record<string, string>;
  stepOutputs: Record<number, string>;
  isComplete: boolean;
}

// --- Sales Mechanism Types ---

export type MechanismStageType =
  | "entry"
  | "nurture"
  | "conversion"
  | "onboarding"
  | "ascension";

export type DropOffRisk = "low" | "medium" | "high";

export interface StageMetric {
  id: string;
  label: string; // e.g. "CTR", "Show Rate", "Close Rate"
  value: string; // user-entered actual value
  benchmark: string; // AI-suggested benchmark e.g. "2-5%"
  suggestedByAI: boolean;
  notes: string;
}

export interface MechanismStage {
  id: string;
  order: number;
  name: string;
  type: MechanismStageType;
  description: string;
  action: string;
  tool: string;
  dropOffRisk: DropOffRisk;
  notes: string;
  // Conversion tracking per stage
  conversionRate: string;
  volumeIn: string;
  // Per-stage metrics (AI-suggested + user-edited)
  stageMetrics: StageMetric[];
}

export interface MechanismMetrics {
  // Acquisition (global)
  primaryLeadSource: string;
  leadVolume: string;
  costPerLead: string;
  // Revenue (global)
  coreOfferPrice: string;
  ltv: string;
  // Ascension
  hasUpsell: boolean;
  upsellDescription: string;
  upsellPrice: string;
  hasContinuity: boolean;
  continuityDescription: string;
  continuityMonthlyValue: string;
}

export interface SalesMechanism {
  id: string;
  businessName: string;
  name: string;
  linkedOffer: string;
  funnelType: string;
  stages: MechanismStage[];
  metrics: MechanismMetrics;
  journeyNotes: string;
  mechanismSummary: string;
  status: "Draft" | "Partial" | "Complete";
  notionPageId: string | null;
  createdAt: number;
  updatedAt: number;
}

// --- Alignment Analysis Types ---

export interface AlignmentChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface AlignmentAnalysis {
  id: string;
  mechanismId: string;
  overallScore: number; // 0-100
  revenueLeak: string; // e.g. "$12,400/mo"
  rawAnalysis: string; // full AI markdown output
  chatHistory: AlignmentChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  // Onboarding (legacy compat — derived from arrays)
  hasCompletedNorthStar: boolean;
  northStarNotionPageId: string | null;
  hasCompletedBrandGuidelines: boolean;
  brandGuidelinesNotionPageId: string | null;

  // Multi-profile data
  northStarProfiles: NorthStarData[];
  activeNorthStarId: string | null;
  brandGuidelinesProfiles: BrandGuidelinesData[];
  activeBrandGuidelinesId: string | null;

  // Legacy single-object accessors (kept for backward compat — computed from arrays)
  northStarData: NorthStarData | null;
  brandGuidelinesData: BrandGuidelinesData | null;

  // Session state
  ctaDismissedAt: number | null;
  messagingMatrixState: MessagingMatrixState | null;

  // Sales Mechanism
  mechanisms: SalesMechanism[];
  activeMechanismId: string | null;

  // Alignment Analyses (keyed by mechanismId)
  alignmentAnalyses: Record<string, AlignmentAnalysis>;

  // Toolbar selections
  selectedModel: string;

  // Tracking
  firstVisitAt: number | null;
  visitCount: number;

  // Progress tracking
  toolsUsed: number;
  playbooksCompleted: number;
  lastActiveDate: number | null;

  // Adaptive progress bar
  dismissedProgressSteps: string[];

  // Home page
  weeklyFocus: string;
  weeklyUpdate: { label: string; url: string };
  recentActivity: RecentActivityItem[];

  // Token usage history
  tokenUsageHistory: TokenUsageRecord[];

  // Favorites
  favorites: FavoriteMessage[];

  // Subscription
  subscriptionTier: "free" | "pro";
  aiGenerationsUsed: number;
  mechanicMessagesThisMonth: number;
  mechanicMessagesResetAt: number | null;
}

export interface RecentActivityItem {
  id: string;
  type: "tool" | "playbook";
  name: string;
  slug: string;
  action: string;
  timestamp: number;
  /** Optional override href — used for features with non-standard routes (e.g. /mechanic) */
  href?: string;
}

export interface TokenUsageRecord {
  id: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  toolSlug?: string;
  playbookSlug?: string;
  timestamp: number;
}

export interface FavoriteMessage {
  id: string;
  content: string;
  toolSlug?: string;
  playbookSlug?: string;
  toolName?: string;
  playbookName?: string;
  timestamp: number;
}
