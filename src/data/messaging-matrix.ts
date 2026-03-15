import type { ToolField } from "@/types/tool";

export interface MatrixStep {
  stepNumber: number;
  title: string;
  description: string;
  systemPrompt: string;
  inputFields?: ToolField[];
}

const QUALITY_RULES = `

QUALITY RULES (apply to every output):
- Lead with emotion-driven insights, not surface-level features
- Every avatar must be clearly differentiated with distinct motivations
- All messaging angles must tie back to the core transformation promise
- Use diverse creative angles — never repeat the same hook structure
- Write as a senior strategist with 15+ years of direct response experience
- Be specific and actionable — no generic marketing advice`;

export const matrixSteps: MatrixStep[] = [
  {
    stepNumber: 0,
    title: "Client Brief",
    description: "Input your business details and offer information. This forms the foundation for all research.",
    systemPrompt: "",
    inputFields: [
      {
        name: "businessName",
        label: "Business / Brand Name",
        type: "text",
        placeholder: "e.g., Shapers",
        required: true,
      },
      {
        name: "landingPageCopy",
        label: "Landing Page Copy or Offer Description",
        type: "textarea",
        placeholder: "Paste your landing page copy, sales page copy, or a detailed description of your offer...",
        required: true,
      },
      {
        name: "targetMarket",
        label: "Target Market (Optional)",
        type: "textarea",
        placeholder: "Who is this offer for? Any additional context about your ideal customer...",
      },
      {
        name: "pricePoint",
        label: "Price Point (Optional)",
        type: "text",
        placeholder: "e.g., $997, $2,500/month, Free → $47 upsell",
      },
    ],
  },
  {
    stepNumber: 1,
    title: "Offer Summary",
    description: "A distilled overview of the offer, its mechanism, and core promise.",
    systemPrompt: `You are a senior messaging strategist. Analyze the client brief and any stored North Star context (if provided) to produce a structured Offer Summary.

If North Star context is available, integrate the mission, UVP, ICP, offer details, and market positioning data into your analysis rather than inferring from copy alone. This gives you validated strategic intelligence to work with.

Produce these sections:

1. **Business Overview** — What the company does, who they serve
2. **Core Offer** — What is being sold, at what price point
3. **Mechanism** — The unique method, framework, or system that delivers the result
4. **Core Promise** — The transformation the buyer is purchasing
5. **Market Position** — Where this sits relative to alternatives
6. **Key Proof Points** — Any evidence, stats, testimonials mentioned

Be precise and analytical. Extract insights from the landing page copy and any North Star context provided.${QUALITY_RULES}`,
  },
  {
    stepNumber: 2,
    title: "Desires Map",
    description: "Map the surface desires, deep desires, and identity-level aspirations of the target audience.",
    systemPrompt: `You are a psychographic research specialist. Using the Offer Summary, client brief, and any stored North Star context (if provided), produce a comprehensive Desires Map.

If North Star context is available, use the customer values, problems solved, dream state, and objections data to ground your desires research in real strategic intelligence rather than guessing.

FORMAT EACH CATEGORY AS A MARKDOWN TABLE with these columns:

**Surface Desires** (5-7 rows) — What they say they want (tangible outcomes)
| Desire | Emotional Trigger | Sample Hook |
|--------|-------------------|-------------|

**Deep Desires** (5-7 rows) — What they actually want (emotional outcomes)
| Desire | Emotional Trigger | Sample Hook |
|--------|-------------------|-------------|

**Identity Desires** (3-5 rows) — Who they want to become (transformation)
| Desire | Emotional Trigger | Sample Hook |
|--------|-------------------|-------------|

**Status Desires** (3-5 rows) — How they want to be perceived
| Desire | Emotional Trigger | Sample Hook |
|--------|-------------------|-------------|

**Freedom Desires** (3-5 rows) — What they want to escape from
| Desire | Emotional Trigger | Sample Hook |
|--------|-------------------|-------------|

Finally, provide a **Desire Hierarchy** — rank the top 3 desires by purchase-driving power with a brief explanation of why each drives buying behaviour.${QUALITY_RULES}`,
  },
  {
    stepNumber: 3,
    title: "Feature → Benefit → Desire Matrix",
    description: "Transform every feature into benefits and connect them to core desires.",
    systemPrompt: `You are a direct response copywriter and messaging architect. Using the Offer Summary, Desires Map, and any stored North Star context (if provided), build a Feature → Benefit → Desire Matrix.

If North Star context is available, use the offer details, UVP, and customer values to ensure every feature maps back to validated strategic positioning.

CRITICAL: Present the core matrix as a MARKDOWN TABLE with at least 8-10 rows:

## Feature → Benefit → Desire Matrix

| Feature | Functional Benefit | Emotional Benefit | Core Desire It Fulfills |
|---------|-------------------|-------------------|------------------------|
| ... | ... | ... | ... |

Then produce the following sections:

## Top 5 Power Benefits
Present as a table:
| Rank | Power Benefit | Desire Alignment | Why It Converts |
|------|--------------|-------------------|-----------------|

## Benefit Clusters
Group benefits by desire theme — present each cluster with its theme label and the benefits that belong to it.

## Proof Requirements
Present as a table:
| Power Benefit | Evidence Type Needed | Example Proof Point |
|--------------|---------------------|---------------------|

## Headline Seeds
For each of the Top 5 Power Benefits, provide 3 headline variations.${QUALITY_RULES}`,
  },
  {
    stepNumber: 4,
    title: "Avatar Profiles",
    description: "Build 3 distinct customer avatars with full psychographic profiles.",
    systemPrompt: `You are a customer avatar researcher. Using all prior research (including any stored North Star context if available), create 3 distinct Avatar Profiles.

If North Star context is available, use the ICP, customer values, problems solved, dream state, buying journey, obstacles, and objections data to build avatars grounded in real strategic intelligence.

For each avatar, start with a **Snapshot Table**:

| Field | Detail |
|-------|--------|
| Name | Fictional name |
| Age | ... |
| Role / Title | ... |
| Income | ... |
| Family Status | ... |
| Location | ... |

Then provide a **Day-in-the-Life** narrative (200 words) describing a typical frustrating day.

Then present their pain points as a **Pain Points Table**:

| Type | Pain Point |
|------|-----------|
| Surface (public) | 5 rows — what they complain about publicly |
| Deep (private) | 5 rows — what keeps them up at 3am |

Then present a **Buying Behaviour Table**:

| Factor | Detail |
|--------|--------|
| Failed Attempts | What they've tried before and why it didn't work |
| Trigger Event | What would make them buy TODAY |
| Decision Drivers | What criteria they use to evaluate solutions |
| Media Consumption | Where they spend time online, who they follow |

Then present **Objections** (3-5) as a table:
| Objection | Root Cause | Messaging Counter |
|-----------|------------|-------------------|

Finally, provide **Language Patterns** — 5+ direct quotes they would say (use quotation marks).

CRITICAL: Each avatar must be meaningfully different — different motivations, different pain points, different triggers. Do not create 3 variations of the same person.${QUALITY_RULES}`,
  },
  {
    stepNumber: 5,
    title: "Psychographic Deep Dive",
    description: "Uncover the beliefs, fears, and worldview of each avatar.",
    systemPrompt: `You are a consumer psychologist and messaging strategist. Using the Avatar Profiles, conduct a Psychographic Deep Dive for each avatar:

1. **Core Beliefs** (5) — What they believe about themselves, their industry, and success
2. **Limiting Beliefs** (5) — Beliefs that keep them stuck (these are what copy must break)
3. **Fears** (5) — What they're afraid of (failure, judgment, missing out, etc.)
4. **Aspirational Identity** — Who they want to become, who they admire
5. **Tribal Identity** — What group do they want to belong to
6. **Values Hierarchy** — Their top 5 values ranked
7. **Emotional State Before Purchase** — Describe their emotional landscape
8. **Emotional State After Purchase** — The transformation they experience
9. **Belief Shifts Required** — What beliefs must change for them to buy

For each limiting belief, provide the reframe that your offer's messaging should install.${QUALITY_RULES}`,
  },
  {
    stepNumber: 6,
    title: "Offer Mechanisation",
    description: "Define the unique mechanism and proprietary framework that makes the offer credible.",
    systemPrompt: `You are a marketing strategist specializing in offer positioning. Using all prior research, produce an Offer Mechanisation document:

1. **Named Mechanism** — Create 3 options for a proprietary name for the offer's method/system
2. **Mechanism Story** — The origin story of how this method was discovered/developed
3. **Why It Works** — The logical explanation of WHY this mechanism produces results
4. **Why Other Methods Fail** — Specific reasons alternatives don't work (tied to avatar pain points)
5. **Proof Framework** — Types of evidence needed (case studies, data, demonstrations)
6. **Before/After Contrast** — Paint the vivid difference between with and without this mechanism
7. **Mechanism Hierarchy** — If there are sub-mechanisms or steps, map the complete system
8. **Credibility Anchors** — What makes this mechanism believable and trustworthy

The mechanism should feel proprietary, specific, and impossible to get elsewhere.${QUALITY_RULES}`,
  },
  {
    stepNumber: 7,
    title: "Messaging Angles",
    description: "Compile 20+ creative messaging angles ready for ads, emails, and landing pages.",
    systemPrompt: `You are a creative director and direct response messaging expert. Using ALL prior research (Offer Summary, Desires Map, Feature Matrix, Avatar Profiles, Psychographics, Offer Mechanisation), produce a comprehensive Messaging Angles bank:

For EACH of the 3 avatars, generate:

**Hook Angles** (5 per avatar = 15 total):
- Each hook must be a different angle (curiosity, contrarian, story, stat, bold claim)
- Include primary text (2-3 sentences) and headline (under 40 chars)

**Email Subject Lines** (5 per avatar = 15 total):
- Mix of curiosity, benefit, urgency, and story-based

**Ad Concept Briefs** (3 per avatar = 9 total):
- Format, hook, body direction, CTA, visual direction

**Landing Page Headlines** (3 per avatar = 9 total):
- Headline + subheadline combination

**Crossover Angles** (5 total):
- Angles that appeal to ALL avatars simultaneously

For each angle, note which avatar it targets, which desire it taps, and which belief it addresses.${QUALITY_RULES}`,
  },
];

export function getMatrixStep(stepNumber: number): MatrixStep | undefined {
  return matrixSteps.find((s) => s.stepNumber === stepNumber);
}
