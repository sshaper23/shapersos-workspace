import type { ToolField } from "./tool";

export interface FlowStep {
  stepNumber: number;
  title: string;
  description: string;
  toolSlug?: string;
  fields: ToolField[];
  systemPrompt: string;
}

export interface Flow {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  shortDescription: string;
  category: string;
  steps: FlowStep[];
  estimatedTime: string;
  popular?: boolean;
}
