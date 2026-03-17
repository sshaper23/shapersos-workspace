export type ToolCategory =
  | "demand-intelligence"
  | "message-engineering"
  | "offer-architecture"
  | "sales-enablement"
  | "demand-creation"
  | "sales"
  | "funnels"
  | "emails"
  | "content"
  | "webinar"
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
  icon: string;
  description: string;
  shortDescription: string;
  category: ToolCategory;
  fields: ToolField[];
  systemPrompt: string;
  popular?: boolean;
  isNew?: boolean;
  customRoute?: boolean;
}
