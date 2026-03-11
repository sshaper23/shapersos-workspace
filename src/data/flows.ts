import type { Flow } from "@/types/flow";

export const flows: Flow[] = [
  {
    slug: "perfect-vsl",
    name: "Perfect VSL Flow",
    emoji: "🎬",
    description: "Create a complete, high-converting Video Sales Letter from scratch. Walk through research, scripting, and optimization in a guided flow.",
    shortDescription: "Build a complete VSL step by step",
    category: "funnel",
    estimatedTime: "30-45 min",
    popular: true,
    steps: [
      {
        stepNumber: 1,
        title: "Define Your Avatar",
        description: "Identify your ideal customer's pain points, desires, and language.",
        fields: [
          { name: "product", label: "Product/Service", type: "textarea", placeholder: "Describe your offer...", required: true },
          { name: "audience", label: "Target Audience", type: "text", placeholder: "Who is this VSL for?" },
        ],
        systemPrompt: "You are a market research expert. Build a detailed customer avatar for this VSL including demographics, psychographics, pain points, and desires.",
      },
      {
        stepNumber: 2,
        title: "Craft the Hook",
        description: "Write an attention-grabbing opening that stops viewers from clicking away.",
        fields: [
          { name: "hook", label: "Additional Hook Context", type: "textarea", placeholder: "Any specific hooks or angles you want to explore?" },
        ],
        systemPrompt: "You are a VSL copywriter. Using the avatar from the previous step, generate 5 powerful VSL hooks that immediately capture attention.",
      },
      {
        stepNumber: 3,
        title: "Build the Story",
        description: "Create the origin story and proof narrative that builds trust.",
        fields: [
          { name: "story", label: "Your Story/Background", type: "textarea", placeholder: "Share your relevant story or background..." },
        ],
        systemPrompt: "You are a storytelling expert. Craft a compelling origin story section for the VSL that builds credibility and emotional connection.",
      },
      {
        stepNumber: 4,
        title: "Present the Offer",
        description: "Structure the offer stack with bonuses, guarantee, and pricing.",
        fields: [
          { name: "price", label: "Price Point", type: "text", placeholder: "e.g., $997" },
          { name: "bonuses", label: "Bonuses (Optional)", type: "textarea", placeholder: "List any bonuses you want to include..." },
        ],
        systemPrompt: "You are an offer strategist. Build a compelling offer stack with value anchoring, bonuses, guarantee, and pricing for the VSL.",
      },
      {
        stepNumber: 5,
        title: "Write the Close",
        description: "Create urgency and drive immediate action with a powerful close.",
        fields: [
          { name: "cta", label: "Call to Action", type: "text", placeholder: "What should they do? e.g., Book a call" },
        ],
        systemPrompt: "You are a closing expert. Write a powerful VSL close with urgency, scarcity, and a clear call to action.",
      },
    ],
  },
  {
    slug: "skool-launch",
    name: "Skool Community Launch",
    emoji: "🏫",
    description: "Launch a thriving Skool community from zero. Set up your group, create content, and build engagement.",
    shortDescription: "Launch a Skool community step by step",
    category: "skool",
    estimatedTime: "45-60 min",
    steps: [
      {
        stepNumber: 1,
        title: "Community Strategy",
        description: "Define your community's purpose, positioning, and target members.",
        fields: [
          { name: "niche", label: "Community Niche", type: "text", placeholder: "What is your community about?", required: true },
          { name: "audience", label: "Ideal Members", type: "text", placeholder: "Who are your ideal members?" },
        ],
        systemPrompt: "You are a community strategist. Define the positioning, value proposition, and member avatar for this Skool community.",
      },
      {
        stepNumber: 2,
        title: "Group Setup",
        description: "Create your group description, rules, and welcome content.",
        fields: [],
        systemPrompt: "You are a Skool expert. Generate the group description, community rules, and welcome post for this Skool community.",
      },
      {
        stepNumber: 3,
        title: "Classroom Structure",
        description: "Design your classroom modules and lesson structure.",
        fields: [
          { name: "modules", label: "Key Topics to Cover", type: "textarea", placeholder: "What main topics will you teach?" },
        ],
        systemPrompt: "You are an instructional designer. Create a Skool classroom structure with modules and lessons that deliver transformation.",
      },
      {
        stepNumber: 4,
        title: "Content Calendar",
        description: "Plan your first month of community posts and engagement.",
        fields: [],
        systemPrompt: "You are a content strategist. Generate a 30-day Skool content calendar with daily posts, engagement prompts, and community activities.",
      },
      {
        stepNumber: 5,
        title: "Launch Plan",
        description: "Create your launch strategy to get your first 100 members.",
        fields: [
          { name: "channels", label: "Your Existing Channels", type: "text", placeholder: "e.g., Instagram, email list, YouTube" },
        ],
        systemPrompt: "You are a launch strategist. Create a step-by-step launch plan to get the first 100 members into this Skool community.",
      },
    ],
  },
  {
    slug: "content-machine",
    name: "Content Machine Flow",
    emoji: "⚙️",
    description: "Build a complete content strategy and production system. From pillar content to distribution across all platforms.",
    shortDescription: "Build a content production system",
    category: "content",
    estimatedTime: "30-40 min",
    popular: true,
    steps: [
      {
        stepNumber: 1,
        title: "Content Pillars",
        description: "Define your core content themes and messaging pillars.",
        fields: [
          { name: "niche", label: "Your Niche", type: "text", placeholder: "What is your area of expertise?", required: true },
          { name: "audience", label: "Target Audience", type: "text", placeholder: "Who are you creating content for?" },
        ],
        systemPrompt: "You are a content strategist. Define 4-5 content pillars with themes, angles, and content types for each pillar.",
      },
      {
        stepNumber: 2,
        title: "Pillar Content",
        description: "Create your main long-form content pieces.",
        fields: [
          { name: "format", label: "Primary Format", type: "select", options: [{ label: "YouTube Videos", value: "youtube" }, { label: "Blog Posts", value: "blog" }, { label: "Podcast Episodes", value: "podcast" }] },
        ],
        systemPrompt: "You are a content creator. Generate 10 pillar content ideas with titles, outlines, and hooks for the primary format.",
      },
      {
        stepNumber: 3,
        title: "Repurposing Plan",
        description: "Map how each pillar piece becomes 10+ micro-content pieces.",
        fields: [],
        systemPrompt: "You are a content repurposing expert. Create a repurposing workflow that turns each pillar piece into social posts, clips, emails, and threads.",
      },
      {
        stepNumber: 4,
        title: "Distribution Strategy",
        description: "Plan your content distribution across all channels.",
        fields: [
          { name: "platforms", label: "Your Platforms", type: "text", placeholder: "e.g., Instagram, LinkedIn, YouTube, Email" },
        ],
        systemPrompt: "You are a distribution strategist. Create a content distribution plan with posting schedules, platform-specific optimization, and engagement tactics.",
      },
    ],
  },
  {
    slug: "webinar-builder",
    name: "Webinar Builder Flow",
    emoji: "🎤",
    description: "Build a complete webinar from registration page to follow-up sequence. Everything you need to fill a room and close deals.",
    shortDescription: "Build a complete webinar system",
    category: "webinar",
    estimatedTime: "45-60 min",
    steps: [
      {
        stepNumber: 1,
        title: "Webinar Strategy",
        description: "Define your webinar topic, angle, and offer.",
        fields: [
          { name: "topic", label: "Webinar Topic", type: "text", placeholder: "What will you teach?", required: true },
          { name: "offer", label: "Backend Offer", type: "textarea", placeholder: "What will you sell at the end?" },
        ],
        systemPrompt: "You are a webinar strategist. Define the webinar strategy including topic positioning, teaching framework, and offer integration.",
      },
      {
        stepNumber: 2,
        title: "Registration Page",
        description: "Create compelling registration page copy.",
        fields: [],
        systemPrompt: "You are a webinar funnel expert. Generate high-converting registration page copy with headline, bullet points, and urgency elements.",
      },
      {
        stepNumber: 3,
        title: "Webinar Script",
        description: "Write the complete webinar presentation script.",
        fields: [
          { name: "duration", label: "Duration", type: "select", options: [{ label: "45 minutes", value: "45" }, { label: "60 minutes", value: "60" }, { label: "90 minutes", value: "90" }] },
        ],
        systemPrompt: "You are a webinar scriptwriter. Generate a complete webinar script with opening, teaching sections, transition to offer, and close.",
      },
      {
        stepNumber: 4,
        title: "Email Sequence",
        description: "Create the full email sequence from confirmation to replay.",
        fields: [],
        systemPrompt: "You are an email marketing expert. Generate the complete webinar email sequence: confirmation, reminders, replay, and sales follow-up.",
      },
    ],
  },
  {
    slug: "funnel-copy-suite",
    name: "Funnel Copy Suite",
    emoji: "🔄",
    description: "Generate all the copy for a complete sales funnel. From opt-in to sales page to thank you page — every word, done.",
    shortDescription: "Write all funnel copy in one flow",
    category: "funnel",
    estimatedTime: "40-50 min",
    popular: true,
    steps: [
      {
        stepNumber: 1,
        title: "Offer Clarity",
        description: "Define your offer, audience, and core messaging.",
        fields: [
          { name: "product", label: "Product/Service", type: "textarea", placeholder: "Describe your offer in detail...", required: true },
          { name: "audience", label: "Target Audience", type: "text", placeholder: "Who is this funnel for?" },
          { name: "price", label: "Price", type: "text", placeholder: "e.g., $997" },
        ],
        systemPrompt: "You are a funnel strategist. Clarify the offer, unique mechanism, and core messaging angles for this funnel.",
      },
      {
        stepNumber: 2,
        title: "Opt-in Page",
        description: "Create the lead magnet opt-in page copy.",
        fields: [
          { name: "leadMagnet", label: "Lead Magnet", type: "text", placeholder: "What free resource are you offering?" },
        ],
        systemPrompt: "You are a funnel copywriter. Generate high-converting opt-in page copy with headline, bullet points, and form copy.",
      },
      {
        stepNumber: 3,
        title: "Sales Page",
        description: "Write the complete sales page copy.",
        fields: [],
        systemPrompt: "You are a sales page copywriter. Generate complete long-form sales page copy with all standard sections.",
      },
      {
        stepNumber: 4,
        title: "Thank You + Upsell",
        description: "Create thank you page copy with upsell opportunity.",
        fields: [],
        systemPrompt: "You are a conversion expert. Generate thank you page copy with next steps, upsell offer, and engagement hooks.",
      },
      {
        stepNumber: 5,
        title: "Follow-up Emails",
        description: "Write the post-purchase nurture sequence.",
        fields: [
          { name: "emailCount", label: "Number of Emails", type: "number", placeholder: "5" },
        ],
        systemPrompt: "You are an email copywriter. Generate a complete post-funnel email sequence with welcome, value delivery, and upsell emails.",
      },
    ],
  },
];

export function getFlowBySlug(slug: string): Flow | undefined {
  return flows.find((f) => f.slug === slug);
}

export function getFlowsByCategory(category: string): Flow[] {
  if (category === "all") return flows;
  return flows.filter((f) => f.category === category);
}
