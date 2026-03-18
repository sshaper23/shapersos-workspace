/**
 * Mapping helpers between camelCase (AppState) and snake_case (Supabase).
 *
 * Design principle: explicit maps for each data type rather than generic
 * camelCase↔snake_case conversion, so we catch mismatches at compile time.
 */

import type {
  NorthStarData,
  BrandGuidelinesData,
  SalesMechanism,
  AlignmentAnalysis,
  ToolChatSession,
  ConceptEntry,
  FavoriteMessage,
  RecentActivityItem,
  TokenUsageRecord,
} from "@/types/context";

// ─── Generic snake_case converter ───

function toSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapKeys(obj: Record<string, any>, fn: (k: string) => string): Record<string, any> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[fn(k)] = v;
  }
  return result;
}

// ─── North Star ───

export function toDbNorthStar(
  p: NorthStarData,
  userId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  return {
    id: p.id,
    user_id: userId,
    name: p.name || "",
    email: p.email || "",
    company: p.company || "",
    website: p.website || "",
    mission: p.mission || "",
    values: p.values || "",
    uvp: p.uvp || "",
    icp: p.icp || "",
    customer_values: p.customerValues || "",
    vocabulary: p.vocabulary || "",
    problems: p.problems || "",
    dream_state: p.dreamState || "",
    offer: p.offer || "",
    buying_journey: p.buyingJourney || "",
    testimonials: p.testimonials || "",
    obstacles: p.obstacles || "",
    objections: p.objections || "",
    qualifies: p.qualifies || "",
    disqualifies: p.disqualifies || "",
    buying_decision: p.buyingDecision || "",
    tried_before: p.triedBefore || "",
    pre_sales_info: p.preSalesInfo || "",
    additional: p.additional || "",
    business_model_type: p.businessModelType || "",
    sales_model: p.salesModel || "",
    primary_channel: p.primaryChannel || "",
    industry: p.industry || "",
    avg_deal_size: p.avgDealSize || "",
    sales_cycle_length: p.salesCycleLength || "",
    notion_page_id: p.notionPageId || null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDbNorthStar(row: Record<string, any>): NorthStarData {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    company: row.company || "",
    website: row.website || "",
    mission: row.mission || "",
    values: row.values || "",
    uvp: row.uvp || "",
    icp: row.icp || "",
    customerValues: row.customer_values || "",
    vocabulary: row.vocabulary || "",
    problems: row.problems || "",
    dreamState: row.dream_state || "",
    offer: row.offer || "",
    buyingJourney: row.buying_journey || "",
    testimonials: row.testimonials || "",
    obstacles: row.obstacles || "",
    objections: row.objections || "",
    qualifies: row.qualifies || "",
    disqualifies: row.disqualifies || "",
    buyingDecision: row.buying_decision || "",
    triedBefore: row.tried_before || "",
    preSalesInfo: row.pre_sales_info || "",
    additional: row.additional || "",
    businessModelType: row.business_model_type || "",
    salesModel: row.sales_model || "",
    primaryChannel: row.primary_channel || "",
    industry: row.industry || "",
    avgDealSize: row.avg_deal_size || "",
    salesCycleLength: row.sales_cycle_length || "",
    notionPageId: row.notion_page_id || undefined,
  };
}

// ─── Brand Guidelines ───

export function toDbBrandGuidelines(
  p: BrandGuidelinesData,
  userId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  // Use generic snake_case conversion for the many fields
  const base = mapKeys(
    {
      id: p.id,
      label: p.label || "",
      brandPurpose: p.brandPurpose || "",
      brandTransformation: p.brandTransformation || "",
      brandMission: p.brandMission || "",
      competitors: p.competitors || "",
      competitorStrengths: p.competitorStrengths || "",
      differentiator: p.differentiator || "",
      personalitySliders: p.personalitySliders || "",
      personalityDescription: p.personalityDescription || "",
      naturalLanguage: p.naturalLanguage || "",
      avoidWords: p.avoidWords || "",
      powerWords: p.powerWords || "",
      firstEncounterFeel: p.firstEncounterFeel || "",
      sixMonthFeel: p.sixMonthFeel || "",
      threeYearFame: p.threeYearFame || "",
      brandAdmire: p.brandAdmire || "",
      visualAesthetic: p.visualAesthetic || "",
      colourDirection: p.colourDirection || "",
      visualReferences: p.visualReferences || "",
      bestTestimonials: p.bestTestimonials || "",
      proudResult: p.proudResult || "",
      founderStory: p.founderStory || "",
      neverDo: p.neverDo || "",
      wrongClient: p.wrongClient || "",
      distanceFrom: p.distanceFrom || "",
      synthesizedGuidelines: p.synthesizedGuidelines || "",
      notionPageId: p.notionPageId || null,
    },
    toSnake
  );
  base.user_id = userId;
  return base;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDbBrandGuidelines(row: Record<string, any>): BrandGuidelinesData {
  const camel = mapKeys(row, toCamel) as unknown as BrandGuidelinesData;
  // Remove DB-only fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (camel as any).userId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (camel as any).createdAt;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (camel as any).updatedAt;
  return camel;
}

// ─── Sales Mechanism (stages & metrics as JSONB) ───

export function toDbMechanism(
  m: SalesMechanism,
  userId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  return {
    id: m.id,
    user_id: userId,
    business_name: m.businessName || "",
    name: m.name || "",
    linked_offer: m.linkedOffer || "",
    funnel_type: m.funnelType || "",
    stages: JSON.stringify(m.stages || []),
    metrics: JSON.stringify(m.metrics || {}),
    journey_notes: m.journeyNotes || "",
    mechanism_summary: m.mechanismSummary || "",
    status: m.status || "Draft",
    notion_page_id: m.notionPageId || null,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDbMechanism(row: Record<string, any>): SalesMechanism {
  return {
    id: row.id,
    businessName: row.business_name || "",
    name: row.name || "",
    linkedOffer: row.linked_offer || "",
    funnelType: row.funnel_type || "",
    stages: typeof row.stages === "string" ? JSON.parse(row.stages) : row.stages || [],
    metrics: typeof row.metrics === "string" ? JSON.parse(row.metrics) : row.metrics || {},
    journeyNotes: row.journey_notes || "",
    mechanismSummary: row.mechanism_summary || "",
    status: row.status || "Draft",
    notionPageId: row.notion_page_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Alignment Analysis ───

export function toDbAlignment(
  a: AlignmentAnalysis,
  userId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  return {
    id: a.id,
    user_id: userId,
    mechanism_id: a.mechanismId,
    overall_score: a.overallScore,
    revenue_leak: a.revenueLeak || "",
    raw_analysis: a.rawAnalysis || "",
    chat_history: JSON.stringify(a.chatHistory || []),
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDbAlignment(row: Record<string, any>): AlignmentAnalysis {
  return {
    id: row.id,
    mechanismId: row.mechanism_id,
    overallScore: row.overall_score || 0,
    revenueLeak: row.revenue_leak || "",
    rawAnalysis: row.raw_analysis || "",
    chatHistory:
      typeof row.chat_history === "string"
        ? JSON.parse(row.chat_history)
        : row.chat_history || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Simple record types (tool chats, concepts, favorites, activity, tokens) ───
// These use generic snake↔camel since they have straightforward field maps.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toDbToolChat(s: ToolChatSession, userId: string): Record<string, any> {
  return {
    id: s.id,
    user_id: userId,
    tool_slug: s.toolSlug,
    tool_name: s.toolName || "",
    title: s.title || "",
    messages: JSON.stringify(s.messages || []),
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDbToolChat(row: Record<string, any>): ToolChatSession {
  return {
    id: row.id,
    toolSlug: row.tool_slug,
    toolName: row.tool_name || "",
    title: row.title || "",
    messages:
      typeof row.messages === "string" ? JSON.parse(row.messages) : row.messages || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toDbConcept(c: ConceptEntry, userId: string): Record<string, any> {
  return {
    id: c.id,
    user_id: userId,
    business_id: c.businessId,
    name: c.name || "",
    current_level: c.currentLevel,
    levels: JSON.stringify(c.levels || {}),
    concept_brief: c.conceptBrief || "",
    status: c.status || "draft",
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDbConcept(row: Record<string, any>): ConceptEntry {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name || "",
    currentLevel: row.current_level || 1,
    levels: typeof row.levels === "string" ? JSON.parse(row.levels) : row.levels || {},
    conceptBrief: row.concept_brief || "",
    status: row.status || "draft",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toDbFavorite(f: FavoriteMessage, userId: string): Record<string, any> {
  return {
    id: f.id,
    user_id: userId,
    content: f.content || "",
    tool_slug: f.toolSlug || null,
    playbook_slug: f.playbookSlug || null,
    tool_name: f.toolName || null,
    playbook_name: f.playbookName || null,
    timestamp: f.timestamp,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDbFavorite(row: Record<string, any>): FavoriteMessage {
  return {
    id: row.id,
    content: row.content || "",
    toolSlug: row.tool_slug || undefined,
    playbookSlug: row.playbook_slug || undefined,
    toolName: row.tool_name || undefined,
    playbookName: row.playbook_name || undefined,
    timestamp: row.timestamp,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toDbActivity(a: RecentActivityItem, userId: string): Record<string, any> {
  return {
    id: a.id,
    user_id: userId,
    type: a.type,
    name: a.name || "",
    slug: a.slug || "",
    action: a.action || "",
    href: a.href || null,
    timestamp: a.timestamp,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDbActivity(row: Record<string, any>): RecentActivityItem {
  return {
    id: row.id,
    type: row.type,
    name: row.name || "",
    slug: row.slug || "",
    action: row.action || "",
    href: row.href || undefined,
    timestamp: row.timestamp,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toDbTokenUsage(t: TokenUsageRecord, userId: string): Record<string, any> {
  return {
    id: t.id,
    user_id: userId,
    model: t.model || "",
    prompt_tokens: t.promptTokens || 0,
    completion_tokens: t.completionTokens || 0,
    total_tokens: t.totalTokens || 0,
    tool_slug: t.toolSlug || null,
    playbook_slug: t.playbookSlug || null,
    timestamp: t.timestamp,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDbTokenUsage(row: Record<string, any>): TokenUsageRecord {
  return {
    id: row.id,
    model: row.model || "",
    promptTokens: row.prompt_tokens || 0,
    completionTokens: row.completion_tokens || 0,
    totalTokens: row.total_tokens || 0,
    toolSlug: row.tool_slug || undefined,
    playbookSlug: row.playbook_slug || undefined,
    timestamp: row.timestamp,
  };
}
