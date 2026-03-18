/**
 * Walkthrough video links for each major section.
 *
 * How to add a video:
 *   1. Record a Loom / YouTube walkthrough.
 *   2. Paste the share URL into the `url` field below.
 *   3. The banner auto-appears on the matching page.
 *
 * Set `url` to "" (empty string) to hide the banner for that section
 * until a video is recorded.
 */

export interface WalkthroughVideo {
  /** Unique section key — matches the page where the banner renders */
  section: string;
  /** Short title shown on the banner */
  title: string;
  /** One-line description */
  description: string;
  /** Estimated duration label, e.g. "2 min" */
  duration: string;
  /** Video URL (Loom, YouTube, etc). Empty string = banner hidden. */
  url: string;
}

export const walkthroughVideos: WalkthroughVideo[] = [
  {
    section: "home",
    title: "Platform Overview",
    description: "A quick tour of the dashboard, quick links, and how everything connects.",
    duration: "2 min",
    url: "https://youtu.be/a0ue-BliK-E",
  },
  {
    section: "revenue-engine",
    title: "Revenue Engine Walkthrough",
    description: "How to use the Revenue Engine to track your strategic foundation progress.",
    duration: "2 min",
    url: "#",
  },
  {
    section: "north-star",
    title: "North Star Setup",
    description: "How to complete your North Star profile — the foundation every AI tool pulls from.",
    duration: "3 min",
    url: "#",
  },
  {
    section: "brand-guidelines",
    title: "Brand Guidelines Builder",
    description: "Walk through the guided brand discovery flow and generate your brand document.",
    duration: "2 min",
    url: "#",
  },
  {
    section: "sales-mechanism",
    title: "Sales Mechanism Builder",
    description: "How to map your sales stages and build a structured mechanism.",
    duration: "2 min",
    url: "#",
  },
  {
    section: "tools",
    title: "Tools Library",
    description: "How to use AI-powered tools — from ad copy to creative concept building.",
    duration: "2 min",
    url: "#",
  },
  {
    section: "messaging-matrix",
    title: "Messaging Matrix",
    description: "How the 7-step AI research flow builds your complete messaging strategy.",
    duration: "3 min",
    url: "#",
  },
  {
    section: "playbooks",
    title: "Playbooks",
    description: "How to run multi-step campaign playbooks with AI context continuity.",
    duration: "2 min",
    url: "#",
  },
  {
    section: "mechanic",
    title: "The Mechanic",
    description: "How to use the AI strategist for open-ended marketing questions.",
    duration: "1 min",
    url: "#",
  },
];

/**
 * Get the walkthrough video config for a given section.
 * Returns undefined if section not found or URL is empty.
 */
export function getWalkthroughVideo(section: string): WalkthroughVideo | undefined {
  const video = walkthroughVideos.find((v) => v.section === section);
  if (!video || !video.url) return undefined;
  return video;
}
