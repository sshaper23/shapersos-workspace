// ─── Freemium Tier Configuration ───
// Single source of truth for all tier rules, limits, and upgrade copy.

export type ProFeature =
  | "brandGuidelines"
  | "messagingMatrix"
  | "playbooks"
  | "alignmentAnalysis"
  | "notionSync";

// ─── Free Tool Slugs ───
// These 8 tools are available on the free tier.
export const FREE_TOOL_SLUGS: string[] = [
  "ideal-customer-profile",
  "competitor-analysis",
  "headline-generator",
  "hook-generator",
  "offer-builder",
  "elevator-pitch",
  "big-idea-generator",
  "meta-ad-copy",
];

// ─── Tier Limits ───
export const TIER_LIMITS = {
  maxMechanisms: 1,
  maxAIGenerationsPerMechanism: 1,
  maxMechanicMessagesPerMonth: 5,
} as const;

// ─── Pro-Only Nav Hrefs ───
// Nav items at these paths show a lock icon for free users.
export const PRO_NAV_HREFS: string[] = [
  "/brand-guidelines",
  "/messaging-matrix",
  "/playbooks",
];

// ─── Pro-Only Quick Link Keys ───
// Quick link cards on the home page that require Pro.
export const PRO_QUICK_LINK_KEYS: string[] = [
  "TASK_REQUEST_URL",
  "CAMPAIGN_BRIEF_URL",
  "CREATIVE_BRIEF_URL",
];

// ─── Upgrade Copy ───
// Contextual copy for each gate point so the upgrade modal feels tailored.
export const UPGRADE_COPY: Record<
  string,
  { title: string; description: string; features: string[] }
> = {
  tools: {
    title: "Unlock All 42 Tools",
    description:
      "Get access to the full suite of AI-powered marketing, sales, and strategy tools — from VSL scripts and email sequences to ad creative briefs and sales call frameworks.",
    features: [
      "42 AI-powered tools across 7 categories",
      "Sales scripts, email sequences, ad copy",
      "Landing pages, proposals, webinar scripts",
      "Legal templates, brand guides, content tools",
    ],
  },
  playbooks: {
    title: "Unlock All Playbooks",
    description:
      "Step-by-step multi-tool workflows that chain AI outputs together — from campaign launches to scaling strategies.",
    features: [
      "9 guided multi-step playbooks",
      "Paid growth campaign builders",
      "Launch & sales presentation workflows",
      "Strategy & positioning frameworks",
    ],
  },
  mechanic: {
    title: "Unlimited Access to The Mechanic",
    description:
      "Your always-on AI revenue strategist. Get unlimited access to diagnostic conversations, strategic advice, and framework-driven analysis.",
    features: [
      "Unlimited monthly messages",
      "Full access to platform knowledge base",
      "Revenue strategy frameworks",
      "Ongoing strategic conversations",
    ],
  },
  alignmentAnalysis: {
    title: "Revenue Alignment Analysis",
    description:
      "Get a detailed diagnostic of your sales mechanism with a scored alignment analysis and estimated revenue leak calculation.",
    features: [
      "Conversational diagnostic chat",
      "Alignment Score (0-100)",
      "Estimated Revenue Leak calculation",
      "Offer-message-mechanism gap analysis",
      "Prioritised recovery roadmap",
    ],
  },
  brandGuidelines: {
    title: "Brand Guidelines Builder",
    description:
      "Build comprehensive brand guidelines through an AI-guided discovery process — from brand foundations to voice and messaging standards.",
    features: [
      "8-stage guided brand discovery",
      "AI-synthesised brand guidelines",
      "Multiple brand profile support",
      "Exportable brand documentation",
    ],
  },
  messagingMatrix: {
    title: "Messaging Matrix",
    description:
      "Build a complete messaging matrix through a 7-step AI research process — the strategic foundation for all your ads, landing pages, and emails.",
    features: [
      "7-step sequential AI research",
      "Audience & avatar deep-dive",
      "Psychographic insights",
      "Complete creative brief foundation",
    ],
  },
  quickLinks: {
    title: "Unlock Team Submissions",
    description:
      "Submit task requests, creative briefs, campaign briefs, and creative assets directly to the Shapers team for execution.",
    features: [
      "Task request submissions",
      "Campaign brief submissions",
      "Creative brief submissions",
      "Direct team communication",
    ],
  },
  mechanisms: {
    title: "Unlimited Sales Mechanisms",
    description:
      "Map multiple buying journeys for different offers, funnels, and client types — each with AI-calibrated metrics and synthesis.",
    features: [
      "Unlimited mechanism creation",
      "Unlimited AI metric generation",
      "Per-mechanism alignment analysis",
      "Full mechanism summaries",
    ],
  },
};
