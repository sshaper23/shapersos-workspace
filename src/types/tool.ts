export type ToolCategory =
  | "market-research"
  | "copywriting"
  | "concept-creation"
  | "sales-collateral"
  | "ads"
  | "sales"
  | "funnels"
  | "emails"
  | "content"
  | "webinar"
  | "skool"
  | "course"
  | "website"
  | "legal"
  | "miscellaneous";

export interface ToolField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number";
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}

export interface Tool {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  shortDescription: string;
  category: ToolCategory;
  fields: ToolField[];
  systemPrompt: string;
  popular?: boolean;
  isNew?: boolean;
}
