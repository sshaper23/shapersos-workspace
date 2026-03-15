import type { ToolField } from "./tool";

export interface FlowStep {
  stepNumber: number;
  title: string;
  description: string;
  toolSlug?: string;
  fields: ToolField[];
  systemPrompt: string;
}

export interface CampaignConfig {
  purpose: string;
  objective: string;
  budgetStructure: string;
  targeting: string;
  placements: string;
  creatives: string;
  keyMetric: string;
}

export interface Flow {
  slug: string;
  name: string;
  icon: string;
  description: string;
  shortDescription: string;
  category: string;
  steps: FlowStep[];
  estimatedTime: string;
  popular?: boolean;
  campaignConfig?: CampaignConfig;
}
