export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string;
  version: string;
  status: "active" | "draft" | "deprecated";
  systemPrompt: string;
  contextRules: string;
  keyConcepts: string[];
  appliesTo: string[];
  linkedPlaybooks: string[];
  linkedTools: string[];
  lastUpdated: string;
}

export interface SkillPayload {
  skill_name: string;
  skill_slug: string;
  category: string;
  version: string;
  status: string;
  system_prompt: string;
  context_rules: string;
  key_concepts: string;
  applies_to: string[];
  linked_playbooks: string;
  linked_tools: string;
}
