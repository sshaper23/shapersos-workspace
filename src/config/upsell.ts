/**
 * StrategistCTA Configuration
 *
 * COPY TONE GUIDELINES:
 * - Always lead with what the client gets, not what Shapers offers
 * - Never use "buy", "purchase", "upgrade", or "hire"
 * - Always frame as collaborative — "let's", "together", "with your strategist"
 * - Keep to one sentence + one CTA — never more than two lines of copy
 * - The CTA label should describe the action, not the product
 *   e.g. "Book a Strategy Session" not "Get Consulting"
 */

export const STRATEGIST_BOOKING_URL =
  "https://api.leadconnectorhq.com/widget/bookings/revenue-audit";

export const ctaMessages = {
  toolOutput: {
    headline: "Want a strategist to sharpen this output with you?",
    body: "Let's turn this into something ready for deployment — together.",
    ctaLabel: "Book a Strategy Session",
  },
  playbookComplete: {
    headline: "Ready to accelerate your execution?",
    body: "A strategist can help you deploy this playbook 10x faster.",
    ctaLabel: "Book a Revenue Audit",
  },
  messagingMatrix: {
    headline: "Turn your messaging matrix into a live campaign",
    body: "Work with a strategist to deploy these angles across your funnel.",
    ctaLabel: "Book a Creative Strategy Session",
  },
  northStarComplete: {
    headline: "Your North Star is set. Let's map the growth plan.",
    body: "Pressure-test your positioning with an experienced strategist.",
    ctaLabel: "Book a North Star Refresh",
  },
  homePageReturn: {
    headline: "Ready to level up your marketing strategy?",
    body: "Let's review your progress and plan the next high-leverage move together.",
    ctaLabel: "Book a Strategy Session",
  },
  mechanism: {
    headline: "Want a strategist to optimise your sales mechanism?",
    body: "Let's find the highest-leverage fix in your buying journey — together.",
    ctaLabel: "Book a Mechanism Review",
  },
  revenueEngine: {
    headline: "All three levers mapped. Let's pull the biggest one.",
    body: "A strategist can identify the single move that unlocks your next revenue tier.",
    ctaLabel: "Book a Revenue Engine Session",
  },
} as const;

export type CTAContext = keyof typeof ctaMessages;
