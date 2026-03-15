export const toolCategories = [
  { slug: "all", label: "All" },
  { slug: "demand-intelligence", label: "Demand Intelligence" },
  { slug: "message-engineering", label: "Message Engineering" },
  { slug: "offer-architecture", label: "Offer Architecture" },
  { slug: "sales-enablement", label: "Sales Enablement" },
  { slug: "demand-creation", label: "Demand Creation" },
  { slug: "sales", label: "Sales" },
  { slug: "funnels", label: "Funnels" },
  { slug: "emails", label: "Emails" },
  { slug: "content", label: "Content" },
  { slug: "webinar", label: "Webinar" },
  { slug: "course", label: "Course" },
  { slug: "website", label: "Website" },
  { slug: "legal", label: "Legal" },
  { slug: "miscellaneous", label: "Miscellaneous" },
] as const;

/** Super-categories group granular tool categories into broader sections for the UI */
export const toolSuperCategories = [
  {
    slug: "research-intelligence",
    label: "Research & Intelligence",
    icon: "search",
    description: "Understand your market, audience, and competition",
    categories: ["demand-intelligence"],
  },
  {
    slug: "message-copy",
    label: "Message & Copy",
    icon: "pen-tool",
    description: "Craft headlines, hooks, and conversion copy",
    categories: ["message-engineering"],
  },
  {
    slug: "offer-strategy",
    label: "Offer & Strategy",
    icon: "lightbulb",
    description: "Build offers, lead magnets, and campaign concepts",
    categories: ["offer-architecture"],
  },
  {
    slug: "advertising",
    label: "Advertising",
    icon: "megaphone",
    description: "Create ad copy and creative briefs",
    categories: ["demand-creation"],
  },
  {
    slug: "sales",
    label: "Sales",
    icon: "phone",
    description: "Scripts, objection handling, outreach, and presentations",
    categories: ["sales", "sales-enablement"],
  },
  {
    slug: "content-email",
    label: "Content & Email",
    icon: "mail",
    description: "Blog posts, social content, newsletters, and email sequences",
    categories: ["content", "emails"],
  },
  {
    slug: "operations",
    label: "Operations",
    icon: "globe",
    description: "Website copy, legal docs, and brand assets",
    categories: ["website", "legal", "miscellaneous"],
  },
] as const;

/** Icon + description metadata for playbook categories */
export const flowCategoryMeta: Record<string, { icon: string; description: string }> = {
  "paid-growth": { icon: "megaphone", description: "Meta ads campaigns, creative testing, and scaling frameworks" },
  launch: { icon: "radio", description: "Product and event launch execution" },
  sales: { icon: "phone", description: "Sales presentations and closing frameworks" },
  strategy: { icon: "brain", description: "Strategic planning and positioning" },
};

export const flowCategories = [
  { slug: "all", label: "All" },
  { slug: "paid-growth", label: "Paid Growth" },
  { slug: "launch", label: "Launch" },
  { slug: "sales", label: "Sales" },
  { slug: "strategy", label: "Strategy" },
] as const;
