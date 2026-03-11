export interface NorthStarField {
  key: string;
  label: string;
  notionProperty: string;
  type: "text" | "textarea" | "url" | "email";
  placeholder: string;
  required?: boolean;
  aiAssistable?: boolean;
  aiPrompt?: string;
}

export interface NorthStarSection {
  title: string;
  description: string;
  emoji: string;
  fields: NorthStarField[];
}

export const northStarSections: NorthStarSection[] = [
  {
    title: "About You",
    description: "Basic information about you and your company",
    emoji: "👤",
    fields: [
      {
        key: "name",
        label: "What's your name?",
        notionProperty: "What's your name?",
        type: "text",
        placeholder: "Your full name",
        required: true,
      },
      {
        key: "email",
        label: "What is your email address?",
        notionProperty: "What is your email address? ",
        type: "email",
        placeholder: "you@company.com",
        required: true,
      },
      {
        key: "company",
        label: "What's the name of your company?",
        notionProperty: "What's the name of your company?",
        type: "text",
        placeholder: "Your company name",
        required: true,
      },
      {
        key: "website",
        label: "What's your website URL?",
        notionProperty: "What's your website URL?",
        type: "url",
        placeholder: "https://yourcompany.com",
      },
    ],
  },
  {
    title: "Business Foundation",
    description: "Your mission, values, and what makes you different",
    emoji: "🏗️",
    fields: [
      {
        key: "mission",
        label: "What is the purpose / mission of the business?",
        notionProperty: "What is the purpose/ mission of the business?",
        type: "textarea",
        placeholder: "Describe the core purpose and mission driving your business...",
        required: true,
        aiAssistable: true,
        aiPrompt: "Based on what you know about the company so far, help draft a clear, compelling business mission statement. Focus on the transformation they provide and who they serve.",
      },
      {
        key: "values",
        label: "What are your company values?",
        notionProperty: "What are your company values?",
        type: "textarea",
        placeholder: "List your core company values...",
        aiAssistable: true,
        aiPrompt: "Based on the business mission, suggest 4-6 strong company values that align with their purpose. Make them specific and actionable, not generic.",
      },
      {
        key: "uvp",
        label: "What is your unique value proposition?",
        notionProperty: "What is your unique value proposition?",
        type: "textarea",
        placeholder: "What makes your offer different from everyone else?",
        aiAssistable: true,
        aiPrompt: "Based on the business mission and values provided, draft a compelling unique value proposition. Focus on what differentiates them from competitors and the specific outcome they deliver.",
      },
    ],
  },
  {
    title: "Your Customer",
    description: "Deep understanding of who you serve",
    emoji: "🎯",
    fields: [
      {
        key: "icp",
        label: "Give a detailed description of your ideal customer profile",
        notionProperty: "Give a detailed description of your ideal customer profile (age, gender, profession, all relevant information)",
        type: "textarea",
        placeholder: "Age, gender, profession, income level, lifestyle, all relevant details...",
        aiAssistable: true,
        aiPrompt: "Based on the business described above, create a detailed ideal customer profile. Include demographics, psychographics, professional background, and behavioral traits.",
      },
      {
        key: "customerValues",
        label: "What are their values that you commonly hear communicated?",
        notionProperty: "What are their values that you commonly hear communicated?",
        type: "textarea",
        placeholder: "The values your customers express most often...",
        aiAssistable: true,
        aiPrompt: "Based on the ideal customer profile, identify the core values this audience typically holds. Think about what drives their decisions and what they care about most.",
      },
      {
        key: "vocabulary",
        label: "Are there any words or specialised vocabulary for this audience?",
        notionProperty: "Are there any words or specialised vocabulary for this audience?",
        type: "textarea",
        placeholder: "Industry jargon, phrases they use, terminology...",
        aiAssistable: true,
        aiPrompt: "Based on the customer profile and industry, list the specialized vocabulary, jargon, and phrases this audience commonly uses. Include both professional terms and colloquial language.",
      },
      {
        key: "problems",
        label: "What major problems are you solving for them?",
        notionProperty: "What major problems are you solving for them?",
        type: "textarea",
        placeholder: "The core problems your business addresses...",
        aiAssistable: true,
        aiPrompt: "Based on everything provided so far, identify the major problems this audience faces that the business solves. Include surface-level problems and deeper emotional pain points.",
      },
      {
        key: "dreamState",
        label: "What is their dream state outcome?",
        notionProperty: "What is their dream state outcome?",
        type: "textarea",
        placeholder: "What does success look like for your customer after working with you?",
        aiAssistable: true,
        aiPrompt: "Based on the customer profile and problems identified, describe the dream state outcome — the ideal situation they want to achieve. Make it vivid and specific.",
      },
    ],
  },
  {
    title: "Your Offer",
    description: "How you deliver value and the journey customers take",
    emoji: "💎",
    fields: [
      {
        key: "offer",
        label: "Provide a detailed outline of your offer",
        notionProperty: "Provide a detailed outline of your offer and how you help them get there including price points, ascension models and stages - give us the full breakdown:",
        type: "textarea",
        placeholder: "Include price points, ascension models, stages, deliverables — the full breakdown...",
        aiAssistable: true,
        aiPrompt: "Based on the business and customer profile, help structure a clear offer outline. Include the core offer, any ascension model, pricing tiers, and what's delivered at each stage.",
      },
      {
        key: "buyingJourney",
        label: "Describe the current buying journey",
        notionProperty: "Link Or Describe The Current Buying Journey Buyers Go Through (all the way from how they find you to how they purchase, please be detailed as this helps identify your companies strengths)",
        type: "textarea",
        placeholder: "From how they find you to how they purchase — be detailed...",
        aiAssistable: true,
        aiPrompt: "Based on the business and offer described, map out a typical buying journey from first touchpoint to purchase. Include awareness, consideration, and decision stages.",
      },
      {
        key: "testimonials",
        label: "Share links to your best testimonials and social proof",
        notionProperty: "Share links to your best testimonials and social proof",
        type: "textarea",
        placeholder: "Links to testimonials, case studies, reviews, social proof...",
      },
    ],
  },
  {
    title: "Sales Intelligence",
    description: "Key insights that shape how you sell",
    emoji: "🧠",
    fields: [
      {
        key: "obstacles",
        label: "What obstacles do they typically face and how do you help them overcome those obstacles?",
        notionProperty: "What obstacles do they typically face and how do you help them overcome those obstacles?",
        type: "textarea",
        placeholder: "Common obstacles and how you address them...",
        aiAssistable: true,
        aiPrompt: "Based on the customer profile and problems identified, list the typical obstacles they face and how the business helps overcome each one.",
      },
      {
        key: "objections",
        label: "What objections do they most commonly have?",
        notionProperty: "What objections do they most commonly have?",
        type: "textarea",
        placeholder: "Price objections, timing, trust, spouse/partner — all common objections...",
        aiAssistable: true,
        aiPrompt: "Based on the offer and customer profile, identify the most common sales objections this audience would have. Include price, timing, trust, and any industry-specific objections.",
      },
      {
        key: "qualifies",
        label: "What qualifies a prospect?",
        notionProperty: "What qualifies a prospect?",
        type: "textarea",
        placeholder: "What makes someone a good fit for your offer?",
        aiAssistable: true,
        aiPrompt: "Based on the ideal customer profile and offer, define what qualifies someone as a good prospect. Include both demographic and behavioral qualifiers.",
      },
      {
        key: "disqualifies",
        label: "What disqualifies a prospect?",
        notionProperty: "What disqualifies a prospect?",
        type: "textarea",
        placeholder: "Red flags that indicate someone is not a good fit...",
        aiAssistable: true,
        aiPrompt: "Based on the business and offer, identify disqualifiers — signs that someone is NOT a good fit. Think about mindset, budget, stage of business, and commitment level.",
      },
      {
        key: "buyingDecision",
        label: "Who is typically involved in their buying decision?",
        notionProperty: "Who is typically involved in their buying decision?",
        type: "textarea",
        placeholder: "Just them? Spouse? Business partner? Board?",
      },
      {
        key: "triedBefore",
        label: "What have they tried before?",
        notionProperty: "What have they tried before?",
        type: "textarea",
        placeholder: "Previous solutions, competitors, DIY attempts...",
        aiAssistable: true,
        aiPrompt: "Based on the market and customer profile, identify what this audience has typically tried before finding this business. Include competitors, DIY approaches, and alternative solutions.",
      },
      {
        key: "preSalesInfo",
        label: "What information do they need to know before entering a sales conversation?",
        notionProperty: "What information do they need to know before entering a sales conversation?",
        type: "textarea",
        placeholder: "Key things prospects should understand before getting on a call...",
        aiAssistable: true,
        aiPrompt: "Based on the offer and buying journey, identify the critical information prospects need before entering a sales conversation. What beliefs need to be in place?",
      },
      {
        key: "additional",
        label: "Anything else that could help us communicate your message more effectively?",
        notionProperty: "Add any other information you think could help us with communicating your message and offer more effectively: ",
        type: "textarea",
        placeholder: "Brand voice notes, competitor positioning, market insights, anything else...",
      },
    ],
  },
];

// Notion database data source ID for syncing
export const NOTION_NORTH_STAR_DATA_SOURCE = "2c936faa-779e-81b3-a8f2-000b8d89f3ce";
