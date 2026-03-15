export type BrandFieldType =
  | "text"
  | "textarea"
  | "slider-pair"
  | "dynamic-list";

export interface BrandField {
  name: string;
  label: string;
  type: BrandFieldType;
  placeholder?: string;
  required?: boolean;
  /** For slider-pair: the two pole labels */
  poles?: [string, string];
  /** Help text shown below the field */
  helpText?: string;
}

export interface BrandGuidelinesStage {
  stageNumber: number;
  title: string;
  description: string;
  /** Conversational intro prompt (shown as a strategist speaking) */
  intro: string;
  fields: BrandField[];
}

export const NOTION_BRAND_GUIDELINES_DATA_SOURCE =
  process.env.NEXT_PUBLIC_NOTION_BRAND_GUIDELINES_DB || "";

export const brandGuidelinesStages: BrandGuidelinesStage[] = [
  {
    stageNumber: 1,
    title: "Brand Foundations",
    description:
      "The core purpose and transformation your brand exists to deliver.",
    intro:
      "Let's start with the fundamentals. Every powerful brand is built on a clear purpose and the transformation it creates in people's lives. Don't overthink this — just tell me what drives you.",
    fields: [
      {
        name: "brandPurpose",
        label: "Why does your brand exist?",
        type: "textarea",
        placeholder:
          "Beyond making money — what is the deeper reason your brand exists? What change are you trying to create in the world?",
        required: true,
        helpText: "Think about the problem that made you start this business.",
      },
      {
        name: "brandTransformation",
        label: "What transformation do you deliver?",
        type: "textarea",
        placeholder:
          "Describe the before → after. What does someone's life look like before they work with you, and after?",
        required: true,
      },
      {
        name: "brandMission",
        label: "Your brand mission (one sentence)",
        type: "text",
        placeholder:
          'e.g., "We help ambitious founders turn expertise into scalable offers."',
        required: true,
      },
    ],
  },
  {
    stageNumber: 2,
    title: "Competitive Landscape",
    description:
      "Understand where you sit in the market and what makes you different.",
    intro:
      "Now let's look at your market. Understanding who you're compared to — and why you're different — is essential for carving out a distinct brand position.",
    fields: [
      {
        name: "competitors",
        label: "Who are your top 3-5 competitors?",
        type: "dynamic-list",
        placeholder: "Competitor name or brand...",
        helpText:
          "Include both direct competitors and alternatives your customers consider.",
      },
      {
        name: "competitorStrengths",
        label: "What do your competitors do well?",
        type: "textarea",
        placeholder:
          "Be honest — what are the genuine strengths of the alternatives in your market?",
      },
      {
        name: "differentiator",
        label: "What makes you fundamentally different?",
        type: "textarea",
        placeholder:
          "Not just features — what is the core philosophical or methodological difference between you and everyone else?",
        required: true,
      },
    ],
  },
  {
    stageNumber: 3,
    title: "Brand Personality",
    description:
      "Define the character and energy of your brand across key spectrums.",
    intro:
      "If your brand walked into a room, how would people describe it? Let's map your brand personality across some key spectrums. Slide each bar to where your brand naturally sits.",
    fields: [
      {
        name: "personality_formal_casual",
        label: "Communication Style",
        type: "slider-pair",
        poles: ["Formal & Professional", "Casual & Conversational"],
      },
      {
        name: "personality_serious_playful",
        label: "Tone",
        type: "slider-pair",
        poles: ["Serious & Authoritative", "Playful & Energetic"],
      },
      {
        name: "personality_traditional_innovative",
        label: "Positioning",
        type: "slider-pair",
        poles: ["Traditional & Established", "Innovative & Disruptive"],
      },
      {
        name: "personality_exclusive_accessible",
        label: "Accessibility",
        type: "slider-pair",
        poles: ["Exclusive & Premium", "Accessible & Inclusive"],
      },
      {
        name: "personality_restrained_bold",
        label: "Expression",
        type: "slider-pair",
        poles: ["Restrained & Subtle", "Bold & Provocative"],
      },
      {
        name: "personalityDescription",
        label: "Describe your brand personality in a few sentences",
        type: "textarea",
        placeholder:
          'e.g., "We\'re the smart friend who tells it like it is — confident but never arrogant, direct but always empathetic."',
      },
    ],
  },
  {
    stageNumber: 4,
    title: "Language Patterns",
    description:
      "The words, phrases, and communication patterns that define your voice.",
    intro:
      "Voice is everything. The specific words you use (and avoid) shape how people perceive your brand. Let's define your linguistic fingerprint.",
    fields: [
      {
        name: "naturalLanguage",
        label: "How do you naturally talk to clients?",
        type: "textarea",
        placeholder:
          "Write a few sentences as if you were explaining what you do to someone at a dinner party. Use YOUR natural voice.",
        required: true,
        helpText:
          "This helps capture your authentic voice — don't try to sound polished.",
      },
      {
        name: "powerWords",
        label: "Words and phrases that feel like YOUR brand",
        type: "dynamic-list",
        placeholder: "e.g., ecosystem, leverage, precision, bold...",
        helpText: "Words you find yourself using often that feel right.",
      },
      {
        name: "avoidWords",
        label: "Words and phrases you NEVER want to use",
        type: "dynamic-list",
        placeholder: 'e.g., "guru", "hustle", "hack", "grind"...',
        helpText:
          "Words that make you cringe when you see them in your industry.",
      },
    ],
  },
  {
    stageNumber: 5,
    title: "Brand Desires",
    description:
      "How you want people to feel and what you aspire to become.",
    intro:
      "Let's think about the future. How do you want people to experience your brand — and where are you heading? Paint me a picture of your brand's aspirations.",
    fields: [
      {
        name: "firstEncounterFeel",
        label: "When someone first encounters your brand, what should they feel?",
        type: "textarea",
        placeholder:
          'e.g., "Wow, this is different. These people actually get it. I want to learn more."',
        required: true,
      },
      {
        name: "sixMonthFeel",
        label: "After 6 months as a client, what should they say about you?",
        type: "textarea",
        placeholder:
          'e.g., "They completely changed how I think about my business. I wish I found them sooner."',
      },
      {
        name: "threeYearFame",
        label: "In 3 years, what do you want to be known for?",
        type: "textarea",
        placeholder:
          'e.g., "The go-to strategic partner for B2B SaaS founders scaling from $1M to $10M."',
      },
      {
        name: "brandAdmire",
        label: "Which brands do you admire and why?",
        type: "textarea",
        placeholder:
          "List 2-3 brands (any industry) whose energy, positioning, or communication style you respect.",
      },
    ],
  },
  {
    stageNumber: 6,
    title: "Visual Identity",
    description:
      "The look, feel, and visual language of your brand.",
    intro:
      "Now let's talk visuals. Even if you already have a visual identity, let's capture the direction and feeling you want your brand to evoke visually.",
    fields: [
      {
        name: "visualAesthetic",
        label: "Describe your ideal visual aesthetic",
        type: "textarea",
        placeholder:
          'e.g., "Clean, minimal, lots of white space. Premium but not pretentious. Subtle use of colour with bold typography."',
        required: true,
      },
      {
        name: "colourDirection",
        label: "Colour direction or existing palette",
        type: "textarea",
        placeholder:
          "Describe your colour palette or the feeling you want colours to evoke. Include hex codes if you have them.",
      },
      {
        name: "visualReferences",
        label: "Visual references or inspiration",
        type: "textarea",
        placeholder:
          "List websites, brands, or design styles that capture the visual direction you want.",
      },
    ],
  },
  {
    stageNumber: 7,
    title: "Social Proof & Story",
    description:
      "The narratives and evidence that make your brand credible.",
    intro:
      "Stories sell. Let's capture the narrative elements and social proof that make your brand credible and compelling.",
    fields: [
      {
        name: "bestTestimonials",
        label: "Your best client testimonials or results",
        type: "textarea",
        placeholder:
          'Paste your strongest testimonials or describe your best client results. Direct quotes are gold. e.g., "We 3x\'d our pipeline in 60 days..."',
      },
      {
        name: "proudResult",
        label: "The result you're most proud of",
        type: "textarea",
        placeholder:
          "Describe one specific client success story in detail — what was the situation, what did you do, what was the result?",
        required: true,
      },
      {
        name: "founderStory",
        label: "Your founder / origin story (brief)",
        type: "textarea",
        placeholder:
          "How did this business start? What was the moment of insight or frustration that led to creating it?",
      },
    ],
  },
  {
    stageNumber: 8,
    title: "Red Lines",
    description:
      "Absolute boundaries — what your brand will never do or say.",
    intro:
      "Finally, the guardrails. Every strong brand has clear boundaries. What will your brand absolutely never do, say, or tolerate? These red lines protect your reputation.",
    fields: [
      {
        name: "neverDo",
        label: "Things your brand will NEVER do",
        type: "dynamic-list",
        placeholder:
          'e.g., "Use fear-based marketing", "Make income claims"...',
        required: true,
        helpText: "These are your non-negotiable brand boundaries.",
      },
      {
        name: "wrongClient",
        label: "Who is NOT your ideal client?",
        type: "textarea",
        placeholder:
          "Describe the type of person or business that is a bad fit — who should you say no to?",
      },
      {
        name: "distanceFrom",
        label: "What do you want to distance your brand from?",
        type: "textarea",
        placeholder:
          'e.g., "The \'bro marketing\' culture", "Get-rich-quick promises", "Overly salesy tactics"...',
      },
    ],
  },
];

export const BRAND_GUIDELINES_SYNTHESIS_PROMPT = `You are an expert brand strategist. Based on the following brand discovery responses, synthesize a comprehensive Brand Guidelines document.

Structure the output with these 10 sections:

1. **Brand Essence** — One paragraph capturing the soul of the brand
2. **Mission & Purpose** — Why the brand exists and what it stands for
3. **Brand Positioning** — Where the brand sits in the market and how it differs
4. **Brand Personality** — The character traits and human qualities of the brand
5. **Voice & Tone Guidelines** — How to write and speak as this brand (with examples)
6. **Power Words & Vocabulary** — Words to use and words to avoid (with rationale)
7. **Visual Identity Direction** — The visual language and aesthetic principles
8. **Messaging Framework** — Core messages, tagline suggestions, and elevator pitch
9. **Social Proof & Narrative** — Key stories and testimonials to leverage
10. **Brand Red Lines** — Absolute boundaries and things to never do

Write in a professional but accessible tone. Be specific and actionable — these guidelines should be usable by a copywriter, designer, or marketing team immediately.`;

export function getBrandStage(
  stageNumber: number
): BrandGuidelinesStage | undefined {
  return brandGuidelinesStages.find((s) => s.stageNumber === stageNumber);
}
