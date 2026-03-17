"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type {
  AppState,
  NorthStarData,
  BrandGuidelinesData,
  MessagingMatrixState,
  SalesMechanism,
  AlignmentAnalysis,
  RecentActivityItem,
  TokenUsageRecord,
  FavoriteMessage,
  ToolChatSession,
  ConceptEntry,
} from "@/types/context";
import { aiModels } from "@/data/models";

const STORAGE_KEY = "shapers-os-state";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const defaultState: AppState = {
  hasCompletedNorthStar: false,
  northStarNotionPageId: null,
  hasCompletedBrandGuidelines: false,
  brandGuidelinesNotionPageId: null,
  northStarProfiles: [],
  activeNorthStarId: null,
  brandGuidelinesProfiles: [],
  activeBrandGuidelinesId: null,
  northStarData: null,
  brandGuidelinesData: null,
  ctaDismissedAt: null,
  messagingMatrixState: null,
  mechanisms: [],
  activeMechanismId: null,
  alignmentAnalyses: {},
  selectedModel: aiModels[0].value,
  firstVisitAt: null,
  visitCount: 0,
  toolsUsed: 0,
  playbooksCompleted: 0,
  lastActiveDate: null,
  dismissedProgressSteps: [],
  weeklyFocus: "",
  weeklyUpdate: { label: "", url: "" },
  recentActivity: [],
  tokenUsageHistory: [],
  favorites: [],
  subscriptionTier: "pro",
  aiGenerationsUsed: 0,
  mechanicMessagesThisMonth: 0,
  mechanicMessagesResetAt: null,
  toolChatSessions: [],
  conceptLibrary: [],
};

interface AppContextValue {
  state: AppState;
  hydrated: boolean;

  // North Star — multi-profile
  setNorthStarData: (data: NorthStarData, notionPageId?: string) => void;
  saveNorthStarProfile: (data: NorthStarData) => void;
  deleteNorthStarProfile: (id: string) => void;
  setActiveNorthStar: (id: string | null) => void;
  clearNorthStar: () => void;
  getNorthStarContext: () => string;

  // Brand Guidelines — multi-profile
  setBrandGuidelinesData: (data: BrandGuidelinesData, notionPageId?: string) => void;
  saveBrandGuidelinesProfile: (data: BrandGuidelinesData) => void;
  deleteBrandGuidelinesProfile: (id: string) => void;
  setActiveBrandGuidelines: (id: string | null) => void;
  clearBrandGuidelines: () => void;
  getBrandContext: () => string;

  // Combined context for AI injection
  getFullContext: () => string;

  // CTA
  dismissCTA: () => void;
  isCTAVisible: () => boolean;

  // Messaging Matrix
  updateMessagingMatrix: (update: Partial<MessagingMatrixState>) => void;
  clearMessagingMatrix: () => void;

  // Sales Mechanism
  saveMechanism: (mechanism: SalesMechanism) => void;
  deleteMechanism: (id: string) => void;
  setActiveMechanism: (id: string | null) => void;
  getActiveMechanism: () => SalesMechanism | null;
  getMechanismContext: () => string;

  // Alignment Analysis (per-mechanism)
  saveAlignmentAnalysis: (mechanismId: string, analysis: AlignmentAnalysis) => void;
  clearAlignmentAnalysis: (mechanismId: string) => void;
  getAlignmentAnalysis: (mechanismId: string) => AlignmentAnalysis | null;

  // Toolbar
  setSelectedModel: (model: string) => void;

  // Progress tracking
  incrementToolsUsed: () => void;
  incrementPlaybooksCompleted: () => void;
  dismissProgressStep: (stepId: string) => void;
  isProgressStepDismissed: (stepId: string) => boolean;

  // Home page
  setWeeklyFocus: (focus: string) => void;
  setWeeklyUpdate: (update: { label: string; url: string }) => void;
  addRecentActivity: (item: Omit<RecentActivityItem, "id" | "timestamp">) => void;

  // Token usage tracking
  addTokenUsage: (record: TokenUsageRecord) => void;
  getTokenUsageHistory: () => TokenUsageRecord[];
  clearTokenUsageHistory: () => void;

  // Favorites
  addFavorite: (msg: FavoriteMessage) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getFavorites: () => FavoriteMessage[];

  // Subscription & tier
  setSubscriptionTier: (tier: "free" | "pro") => void;
  incrementAIGenerations: () => void;
  incrementMechanicMessages: () => void;
  resetMechanicMessagesIfNeeded: () => void;

  // Tool chat history
  saveToolChatSession: (session: ToolChatSession) => void;
  getToolChatSessions: (toolSlug: string) => ToolChatSession[];
  deleteToolChatSession: (sessionId: string) => void;

  // Creative concept library
  saveConceptEntry: (entry: ConceptEntry) => void;
  deleteConceptEntry: (id: string) => void;
  getConceptLibrary: (businessId?: string) => ConceptEntry[];

  // Data management
  clearAllData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

/**
 * Migrate legacy single-profile data to multi-profile arrays.
 * Runs once during hydration if old shape detected.
 */
function migrateToMultiProfile(raw: Record<string, unknown>): Record<string, unknown> {
  const migrated = { ...raw };

  // Migrate North Star: old northStarData (single) → northStarProfiles (array)
  if (
    migrated.northStarData &&
    typeof migrated.northStarData === "object" &&
    (!Array.isArray(migrated.northStarProfiles) || (migrated.northStarProfiles as unknown[]).length === 0)
  ) {
    const legacy = migrated.northStarData as Record<string, string>;
    const id = generateId();
    const profile: NorthStarData = {
      ...legacy,
      id,
      notionPageId: (migrated.northStarNotionPageId as string) || undefined,
    } as unknown as NorthStarData;
    migrated.northStarProfiles = [profile];
    migrated.activeNorthStarId = id;
  }

  // Migrate Brand Guidelines: old brandGuidelinesData (single) → brandGuidelinesProfiles (array)
  if (
    migrated.brandGuidelinesData &&
    typeof migrated.brandGuidelinesData === "object" &&
    (!Array.isArray(migrated.brandGuidelinesProfiles) || (migrated.brandGuidelinesProfiles as unknown[]).length === 0)
  ) {
    const legacy = migrated.brandGuidelinesData as Record<string, string>;
    const id = generateId();
    const profile: BrandGuidelinesData = {
      ...legacy,
      id,
      label: (legacy.brandPurpose || "Primary Brand").slice(0, 40),
      notionPageId: (migrated.brandGuidelinesNotionPageId as string) || undefined,
    } as unknown as BrandGuidelinesData;
    migrated.brandGuidelinesProfiles = [profile];
    migrated.activeBrandGuidelinesId = id;
  }

  // Migrate old single alignmentAnalysis → per-mechanism alignmentAnalyses record
  if (
    migrated.alignmentAnalysis &&
    typeof migrated.alignmentAnalysis === "object" &&
    (!migrated.alignmentAnalyses || Object.keys(migrated.alignmentAnalyses as Record<string, unknown>).length === 0)
  ) {
    const legacy = migrated.alignmentAnalysis as Record<string, unknown>;
    const mechId = (legacy.mechanismId as string) || "unknown";
    // Ensure chatHistory exists (old shape didn't have it)
    if (!legacy.chatHistory) {
      legacy.chatHistory = [];
    }
    migrated.alignmentAnalyses = { [mechId]: legacy };
    delete migrated.alignmentAnalysis;
  } else if (migrated.alignmentAnalysis !== undefined) {
    // Clean up the old key even if null
    delete migrated.alignmentAnalysis;
  }

  // Migrate old mechanism data: remove leveragePoints, add stageMetrics to stages, clean metrics
  if (Array.isArray(migrated.mechanisms)) {
    migrated.mechanisms = (migrated.mechanisms as Record<string, unknown>[]).map((mech) => {
      // Remove legacy leveragePoints
      const { leveragePoints: _lp, ...rest } = mech;
      // Add stageMetrics to stages that don't have it
      if (Array.isArray(rest.stages)) {
        rest.stages = (rest.stages as Record<string, unknown>[]).map((stage) => ({
          ...stage,
          stageMetrics: stage.stageMetrics || [],
        }));
      }
      // Clean up old metric fields from global metrics
      if (rest.metrics && typeof rest.metrics === "object") {
        const { costPerBookedCall: _a, showRate: _b, closeRate: _c, averageSalesCycle: _d, ...cleanMetrics } =
          rest.metrics as Record<string, unknown>;
        rest.metrics = cleanMetrics;
      }
      // Ensure funnelType exists
      if (!rest.funnelType) {
        rest.funnelType = "";
      }
      return rest;
    });
  }

  // Ensure subscription tier fields exist
  if (!migrated.subscriptionTier) {
    migrated.subscriptionTier = "free";
  }
  if (typeof migrated.aiGenerationsUsed !== "number") {
    migrated.aiGenerationsUsed = 0;
  }
  if (typeof migrated.mechanicMessagesThisMonth !== "number") {
    migrated.mechanicMessagesThisMonth = 0;
  }
  if (migrated.mechanicMessagesResetAt === undefined) {
    migrated.mechanicMessagesResetAt = null;
  }

  return migrated;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount — with migration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const migrated = migrateToMultiProfile(parsed);
        setState((prev) => ({ ...prev, ...migrated }));
      }
    } catch {
      // Ignore corrupt data
    }

    // Track visits + last active
    setState((prev) => ({
      ...prev,
      firstVisitAt: prev.firstVisitAt || Date.now(),
      visitCount: (prev.visitCount || 0) + 1,
      lastActiveDate: Date.now(),
    }));

    setHydrated(true);
  }, []);

  // Derive active profiles (computed from arrays)
  const activeNorthStar = useMemo((): NorthStarData | null => {
    const profiles = state.northStarProfiles || [];
    if (profiles.length === 0) return null;
    if (state.activeNorthStarId) {
      return profiles.find((p) => p.id === state.activeNorthStarId) || profiles[0];
    }
    return profiles[0];
  }, [state.northStarProfiles, state.activeNorthStarId]);

  const activeBrandGuidelines = useMemo((): BrandGuidelinesData | null => {
    const profiles = state.brandGuidelinesProfiles || [];
    if (profiles.length === 0) return null;
    if (state.activeBrandGuidelinesId) {
      return profiles.find((p) => p.id === state.activeBrandGuidelinesId) || profiles[0];
    }
    return profiles[0];
  }, [state.brandGuidelinesProfiles, state.activeBrandGuidelinesId]);

  // Keep legacy computed fields in sync for backward compat
  useEffect(() => {
    setState((prev) => {
      const ns = prev.northStarProfiles?.length
        ? (prev.activeNorthStarId
            ? prev.northStarProfiles.find((p) => p.id === prev.activeNorthStarId) || prev.northStarProfiles[0]
            : prev.northStarProfiles[0])
        : null;
      const bg = prev.brandGuidelinesProfiles?.length
        ? (prev.activeBrandGuidelinesId
            ? prev.brandGuidelinesProfiles.find((p) => p.id === prev.activeBrandGuidelinesId) || prev.brandGuidelinesProfiles[0]
            : prev.brandGuidelinesProfiles[0])
        : null;

      // Only update if changed
      if (prev.northStarData === ns && prev.brandGuidelinesData === bg &&
          prev.hasCompletedNorthStar === !!ns && prev.hasCompletedBrandGuidelines === !!bg) {
        return prev;
      }

      return {
        ...prev,
        northStarData: ns,
        brandGuidelinesData: bg,
        hasCompletedNorthStar: !!ns,
        hasCompletedBrandGuidelines: !!bg,
        northStarNotionPageId: ns?.notionPageId || null,
        brandGuidelinesNotionPageId: bg?.notionPageId || null,
      };
    });
  }, [state.northStarProfiles, state.activeNorthStarId, state.brandGuidelinesProfiles, state.activeBrandGuidelinesId]);

  // Persist to localStorage on state change (after hydration)
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore storage errors
      }
    }
  }, [state, hydrated]);

  // ─── North Star — multi-profile ───

  /** Legacy compat: upsert profile into array */
  const setNorthStarData = useCallback(
    (data: NorthStarData, notionPageId?: string) => {
      setState((prev) => {
        const profiles = [...(prev.northStarProfiles || [])];
        const id = data.id || prev.activeNorthStarId || generateId();
        const withId: NorthStarData = { ...data, id, notionPageId: notionPageId || data.notionPageId };
        const idx = profiles.findIndex((p) => p.id === id);
        if (idx >= 0) {
          profiles[idx] = withId;
        } else {
          profiles.push(withId);
        }
        return {
          ...prev,
          northStarProfiles: profiles,
          activeNorthStarId: id,
        };
      });
    },
    []
  );

  const saveNorthStarProfile = useCallback((data: NorthStarData) => {
    setState((prev) => {
      const profiles = [...(prev.northStarProfiles || [])];
      const id = data.id || generateId();
      const withId: NorthStarData = { ...data, id };
      const idx = profiles.findIndex((p) => p.id === id);
      if (idx >= 0) {
        profiles[idx] = withId;
      } else {
        profiles.push(withId);
      }
      return {
        ...prev,
        northStarProfiles: profiles,
        activeNorthStarId: prev.activeNorthStarId || id,
      };
    });
  }, []);

  const deleteNorthStarProfile = useCallback((id: string) => {
    setState((prev) => {
      const profiles = (prev.northStarProfiles || []).filter((p) => p.id !== id);
      const activeId = prev.activeNorthStarId === id
        ? (profiles[0]?.id || null)
        : prev.activeNorthStarId;
      return {
        ...prev,
        northStarProfiles: profiles,
        activeNorthStarId: activeId,
      };
    });
  }, []);

  const setActiveNorthStar = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, activeNorthStarId: id }));
  }, []);

  const clearNorthStar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      northStarProfiles: [],
      activeNorthStarId: null,
    }));
  }, []);

  const getNorthStarContext = useCallback((): string => {
    if (!activeNorthStar) return "";
    const ns = activeNorthStar;
    const lines = [
      ns.company && `Company: ${ns.company}`,
      ns.mission && `Mission: ${ns.mission}`,
      ns.uvp && `Unique Value Proposition: ${ns.uvp}`,
      ns.icp && `Ideal Customer Profile: ${ns.icp}`,
      ns.customerValues && `Customer Values: ${ns.customerValues}`,
      ns.vocabulary && `Industry Vocabulary: ${ns.vocabulary}`,
      ns.problems && `Problems We Solve: ${ns.problems}`,
      ns.dreamState && `Customer Dream State: ${ns.dreamState}`,
      ns.offer && `Our Offer: ${ns.offer}`,
      ns.buyingJourney && `Buying Journey: ${ns.buyingJourney}`,
      ns.obstacles && `Customer Obstacles: ${ns.obstacles}`,
      ns.objections && `Common Objections: ${ns.objections}`,
      // Business model context
      ns.businessModelType && `Business Model: ${ns.businessModelType}`,
      ns.salesModel && `Sales Model: ${ns.salesModel}`,
      ns.primaryChannel && `Primary Acquisition Channel: ${ns.primaryChannel}`,
      ns.industry && `Industry: ${ns.industry}`,
      ns.avgDealSize && `Average Deal Size: ${ns.avgDealSize}`,
      ns.salesCycleLength && `Sales Cycle Length: ${ns.salesCycleLength}`,
    ];
    return lines.filter(Boolean).join("\n\n");
  }, [activeNorthStar]);

  // ─── Brand Guidelines — multi-profile ───

  /** Legacy compat: upsert profile into array */
  const setBrandGuidelinesData = useCallback(
    (data: BrandGuidelinesData, notionPageId?: string) => {
      setState((prev) => {
        const profiles = [...(prev.brandGuidelinesProfiles || [])];
        const id = data.id || prev.activeBrandGuidelinesId || generateId();
        const withId: BrandGuidelinesData = {
          ...data,
          id,
          label: data.label || data.brandPurpose?.slice(0, 40) || "Brand Guide",
          notionPageId: notionPageId || data.notionPageId,
        };
        const idx = profiles.findIndex((p) => p.id === id);
        if (idx >= 0) {
          profiles[idx] = withId;
        } else {
          profiles.push(withId);
        }
        return {
          ...prev,
          brandGuidelinesProfiles: profiles,
          activeBrandGuidelinesId: id,
        };
      });
    },
    []
  );

  const saveBrandGuidelinesProfile = useCallback((data: BrandGuidelinesData) => {
    setState((prev) => {
      const profiles = [...(prev.brandGuidelinesProfiles || [])];
      const id = data.id || generateId();
      const withId: BrandGuidelinesData = { ...data, id, label: data.label || "Brand Guide" };
      const idx = profiles.findIndex((p) => p.id === id);
      if (idx >= 0) {
        profiles[idx] = withId;
      } else {
        profiles.push(withId);
      }
      return {
        ...prev,
        brandGuidelinesProfiles: profiles,
        activeBrandGuidelinesId: prev.activeBrandGuidelinesId || id,
      };
    });
  }, []);

  const deleteBrandGuidelinesProfile = useCallback((id: string) => {
    setState((prev) => {
      const profiles = (prev.brandGuidelinesProfiles || []).filter((p) => p.id !== id);
      const activeId = prev.activeBrandGuidelinesId === id
        ? (profiles[0]?.id || null)
        : prev.activeBrandGuidelinesId;
      return {
        ...prev,
        brandGuidelinesProfiles: profiles,
        activeBrandGuidelinesId: activeId,
      };
    });
  }, []);

  const setActiveBrandGuidelines = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, activeBrandGuidelinesId: id }));
  }, []);

  const clearBrandGuidelines = useCallback(() => {
    setState((prev) => ({
      ...prev,
      brandGuidelinesProfiles: [],
      activeBrandGuidelinesId: null,
    }));
  }, []);

  const getBrandContext = useCallback((): string => {
    if (!activeBrandGuidelines) return "";
    const bg = activeBrandGuidelines;

    if (bg.synthesizedGuidelines) {
      return bg.synthesizedGuidelines;
    }

    const lines = [
      bg.brandPurpose && `Brand Purpose: ${bg.brandPurpose}`,
      bg.personalityDescription && `Brand Personality: ${bg.personalityDescription}`,
      bg.naturalLanguage && `Natural Voice: ${bg.naturalLanguage}`,
      bg.powerWords && `Power Words: ${bg.powerWords}`,
      bg.avoidWords && `Words to Avoid: ${bg.avoidWords}`,
      bg.neverDo && `Brand Red Lines: ${bg.neverDo}`,
    ];
    return lines.filter(Boolean).join("\n\n");
  }, [activeBrandGuidelines]);

  // ─── Sales Mechanism ───

  const saveMechanism = useCallback((mechanism: SalesMechanism) => {
    setState((prev) => {
      const existing = prev.mechanisms.findIndex((m) => m.id === mechanism.id);
      const updated = [...prev.mechanisms];
      if (existing >= 0) {
        updated[existing] = { ...mechanism, updatedAt: Date.now() };
      } else {
        updated.push({ ...mechanism, createdAt: Date.now(), updatedAt: Date.now() });
      }
      return {
        ...prev,
        mechanisms: updated,
        activeMechanismId: prev.activeMechanismId || mechanism.id,
      };
    });
  }, []);

  const deleteMechanism = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      mechanisms: prev.mechanisms.filter((m) => m.id !== id),
      activeMechanismId: prev.activeMechanismId === id ? null : prev.activeMechanismId,
    }));
  }, []);

  const setActiveMechanism = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, activeMechanismId: id }));
  }, []);

  const getActiveMechanism = useCallback((): SalesMechanism | null => {
    if (!state.activeMechanismId) return state.mechanisms[0] || null;
    return state.mechanisms.find((m) => m.id === state.activeMechanismId) || null;
  }, [state.mechanisms, state.activeMechanismId]);

  const getMechanismContext = useCallback((): string => {
    const mech = getActiveMechanism();
    if (!mech) return "";

    const stageLines = mech.stages.map((s) => {
      const metrics = (s.stageMetrics || [])
        .filter((m) => m.value)
        .map((m) => `${m.label}: ${m.value}`)
        .join(", ");
      return `  ${s.order}. ${s.name} (${s.type})${metrics ? ` — ${metrics}` : ""}`;
    });

    const lines = [
      `Mechanism: ${mech.name}`,
      mech.linkedOffer && `Linked Offer: ${mech.linkedOffer}`,
      mech.funnelType && `Funnel Type: ${mech.funnelType}`,
      stageLines.length > 0 &&
        `Buying Journey:\n${stageLines.join("\n")}`,
      mech.metrics.coreOfferPrice &&
        `Core Offer Price: ${mech.metrics.coreOfferPrice}`,
      mech.metrics.ltv && `LTV: ${mech.metrics.ltv}`,
      mech.metrics.leadVolume &&
        `Lead Volume: ${mech.metrics.leadVolume}`,
      mech.metrics.costPerLead &&
        `Cost Per Lead: ${mech.metrics.costPerLead}`,
      mech.metrics.hasUpsell &&
        `Upsell: ${mech.metrics.upsellDescription} ($${mech.metrics.upsellPrice})`,
      mech.metrics.hasContinuity &&
        `Continuity: ${mech.metrics.continuityDescription} ($${mech.metrics.continuityMonthlyValue}/mo)`,
    ];
    return lines.filter(Boolean).join("\n");
  }, [getActiveMechanism]);

  // ─── Combined context ───

  const getFullContext = useCallback((): string => {
    const nsContext = getNorthStarContext();
    const bgContext = getBrandContext();
    const mechContext = getMechanismContext();
    const parts = [
      nsContext && `--- BUSINESS CONTEXT (North Star) ---\n${nsContext}`,
      bgContext && `--- BRAND GUIDELINES ---\n${bgContext}`,
      mechContext && `--- SALES MECHANISM CONTEXT ---\n${mechContext}`,
    ];
    return parts.filter(Boolean).join("\n\n");
  }, [getNorthStarContext, getBrandContext, getMechanismContext]);

  // ─── CTA ───

  const dismissCTA = useCallback(() => {
    setState((prev) => ({ ...prev, ctaDismissedAt: Date.now() }));
  }, []);

  const isCTAVisible = useCallback((): boolean => {
    if (!state.ctaDismissedAt) return true;
    return Date.now() - state.ctaDismissedAt > 24 * 60 * 60 * 1000;
  }, [state.ctaDismissedAt]);

  // ─── Messaging Matrix ───

  const updateMessagingMatrix = useCallback(
    (update: Partial<MessagingMatrixState>) => {
      setState((prev) => ({
        ...prev,
        messagingMatrixState: {
          currentStep: 0,
          inputData: {},
          stepOutputs: {},
          isComplete: false,
          ...prev.messagingMatrixState,
          ...update,
        },
      }));
    },
    []
  );

  const clearMessagingMatrix = useCallback(() => {
    setState((prev) => ({ ...prev, messagingMatrixState: null }));
  }, []);

  // ─── Alignment Analysis (per-mechanism) ───

  const saveAlignmentAnalysis = useCallback(
    (mechanismId: string, analysis: AlignmentAnalysis) => {
      setState((prev) => ({
        ...prev,
        alignmentAnalyses: {
          ...(prev.alignmentAnalyses || {}),
          [mechanismId]: { ...analysis, mechanismId, updatedAt: Date.now() },
        },
      }));
    },
    []
  );

  const clearAlignmentAnalysis = useCallback((mechanismId: string) => {
    setState((prev) => {
      const updated = { ...(prev.alignmentAnalyses || {}) };
      delete updated[mechanismId];
      return { ...prev, alignmentAnalyses: updated };
    });
  }, []);

  const getAlignmentAnalysis = useCallback(
    (mechanismId: string): AlignmentAnalysis | null => {
      return (state.alignmentAnalyses || {})[mechanismId] || null;
    },
    [state.alignmentAnalyses]
  );

  // ─── Toolbar ───

  const setSelectedModel = useCallback((model: string) => {
    setState((prev) => ({ ...prev, selectedModel: model }));
  }, []);

  // ─── Progress tracking ───

  const incrementToolsUsed = useCallback(() => {
    setState((prev) => ({
      ...prev,
      toolsUsed: (prev.toolsUsed || 0) + 1,
      lastActiveDate: Date.now(),
    }));
  }, []);

  const incrementPlaybooksCompleted = useCallback(() => {
    setState((prev) => ({
      ...prev,
      playbooksCompleted: (prev.playbooksCompleted || 0) + 1,
      lastActiveDate: Date.now(),
    }));
  }, []);

  const dismissProgressStep = useCallback((stepId: string) => {
    setState((prev) => ({
      ...prev,
      dismissedProgressSteps: [
        ...(prev.dismissedProgressSteps || []).filter((s) => s !== stepId),
        stepId,
      ],
    }));
  }, []);

  const isProgressStepDismissed = useCallback(
    (stepId: string): boolean => {
      return (state.dismissedProgressSteps || []).includes(stepId);
    },
    [state.dismissedProgressSteps]
  );

  // ─── Home page ───

  const setWeeklyFocus = useCallback((focus: string) => {
    setState((prev) => ({ ...prev, weeklyFocus: focus }));
  }, []);

  const setWeeklyUpdate = useCallback(
    (update: { label: string; url: string }) => {
      setState((prev) => ({ ...prev, weeklyUpdate: update }));
    },
    []
  );

  const addRecentActivity = useCallback(
    (item: Omit<RecentActivityItem, "id" | "timestamp">) => {
      setState((prev) => ({
        ...prev,
        recentActivity: [
          {
            ...item,
            id: `${item.type}-${item.slug}-${Date.now()}`,
            timestamp: Date.now(),
          },
          ...(prev.recentActivity || []),
        ].slice(0, 20),
      }));
    },
    []
  );

  // ─── Token Usage Tracking ───

  const addTokenUsage = useCallback((record: TokenUsageRecord) => {
    setState((prev) => ({
      ...prev,
      tokenUsageHistory: [record, ...(prev.tokenUsageHistory || [])].slice(0, 500),
    }));
  }, []);

  const getTokenUsageHistory = useCallback((): TokenUsageRecord[] => {
    return state.tokenUsageHistory || [];
  }, [state.tokenUsageHistory]);

  const clearTokenUsageHistory = useCallback(() => {
    setState((prev) => ({ ...prev, tokenUsageHistory: [] }));
  }, []);

  // ─── Favorites ───

  const addFavorite = useCallback((msg: FavoriteMessage) => {
    setState((prev) => {
      const existing = (prev.favorites || []).some((f) => f.id === msg.id);
      if (existing) return prev;
      return {
        ...prev,
        favorites: [msg, ...(prev.favorites || [])].slice(0, 100),
      };
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      favorites: (prev.favorites || []).filter((f) => f.id !== id),
    }));
  }, []);

  const isFavorite = useCallback(
    (id: string): boolean => {
      return (state.favorites || []).some((f) => f.id === id);
    },
    [state.favorites]
  );

  const getFavorites = useCallback((): FavoriteMessage[] => {
    return state.favorites || [];
  }, [state.favorites]);

  // ─── Data Management ───

  // ─── Subscription & tier ───

  const setSubscriptionTier = useCallback(
    (tier: "free" | "pro") => {
      setState((prev) => ({ ...prev, subscriptionTier: tier }));
    },
    []
  );

  const incrementAIGenerations = useCallback(() => {
    setState((prev) => ({
      ...prev,
      aiGenerationsUsed: (prev.aiGenerationsUsed ?? 0) + 1,
    }));
  }, []);

  const incrementMechanicMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      mechanicMessagesThisMonth: (prev.mechanicMessagesThisMonth ?? 0) + 1,
    }));
  }, []);

  const resetMechanicMessagesIfNeeded = useCallback(() => {
    setState((prev) => {
      const resetAt = prev.mechanicMessagesResetAt;
      const now = Date.now();
      // If no reset date set, or if we're past the reset date, reset the counter
      if (!resetAt || now >= resetAt) {
        // Set next reset to the 1st of next month
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
        nextMonth.setHours(0, 0, 0, 0);
        return {
          ...prev,
          mechanicMessagesThisMonth: 0,
          mechanicMessagesResetAt: nextMonth.getTime(),
        };
      }
      return prev;
    });
  }, []);

  // ─── Tool Chat History ───

  const saveToolChatSession = useCallback((session: ToolChatSession) => {
    setState((prev) => {
      const sessions = [...(prev.toolChatSessions || [])];
      const idx = sessions.findIndex((s) => s.id === session.id);
      if (idx >= 0) {
        sessions[idx] = { ...session, updatedAt: Date.now() };
      } else {
        sessions.unshift({ ...session, createdAt: Date.now(), updatedAt: Date.now() });
      }
      // Keep max 50 sessions to avoid bloating localStorage
      return { ...prev, toolChatSessions: sessions.slice(0, 50) };
    });
  }, []);

  const getToolChatSessions = useCallback(
    (toolSlug: string): ToolChatSession[] => {
      return (state.toolChatSessions || [])
        .filter((s) => s.toolSlug === toolSlug)
        .sort((a, b) => b.updatedAt - a.updatedAt);
    },
    [state.toolChatSessions]
  );

  const deleteToolChatSession = useCallback((sessionId: string) => {
    setState((prev) => ({
      ...prev,
      toolChatSessions: (prev.toolChatSessions || []).filter((s) => s.id !== sessionId),
    }));
  }, []);

  // ─── Creative Concept Library ───

  const saveConceptEntry = useCallback((entry: ConceptEntry) => {
    setState((prev) => {
      const library = [...(prev.conceptLibrary || [])];
      const idx = library.findIndex((c) => c.id === entry.id);
      if (idx >= 0) {
        library[idx] = { ...entry, updatedAt: Date.now() };
      } else {
        library.unshift({ ...entry, createdAt: Date.now(), updatedAt: Date.now() });
      }
      return { ...prev, conceptLibrary: library.slice(0, 50) };
    });
  }, []);

  const deleteConceptEntry = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      conceptLibrary: (prev.conceptLibrary || []).filter((c) => c.id !== id),
    }));
  }, []);

  const getConceptLibrary = useCallback(
    (businessId?: string): ConceptEntry[] => {
      const all = state.conceptLibrary || [];
      if (businessId) return all.filter((c) => c.businessId === businessId);
      return all;
    },
    [state.conceptLibrary]
  );

  const clearAllData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setState({ ...defaultState, firstVisitAt: Date.now(), visitCount: 1 });
  }, []);

  // ─── Value ───

  const value: AppContextValue = {
    state,
    hydrated,
    setNorthStarData,
    saveNorthStarProfile,
    deleteNorthStarProfile,
    setActiveNorthStar,
    clearNorthStar,
    getNorthStarContext,
    setBrandGuidelinesData,
    saveBrandGuidelinesProfile,
    deleteBrandGuidelinesProfile,
    setActiveBrandGuidelines,
    clearBrandGuidelines,
    getBrandContext,
    getFullContext,
    dismissCTA,
    isCTAVisible,
    updateMessagingMatrix,
    clearMessagingMatrix,
    saveMechanism,
    deleteMechanism,
    setActiveMechanism,
    getActiveMechanism,
    getMechanismContext,
    saveAlignmentAnalysis,
    clearAlignmentAnalysis,
    getAlignmentAnalysis,
    setSelectedModel,
    incrementToolsUsed,
    incrementPlaybooksCompleted,
    dismissProgressStep,
    isProgressStepDismissed,
    setWeeklyFocus,
    setWeeklyUpdate,
    addRecentActivity,
    addTokenUsage,
    getTokenUsageHistory,
    clearTokenUsageHistory,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavorites,
    setSubscriptionTier,
    incrementAIGenerations,
    incrementMechanicMessages,
    resetMechanicMessagesIfNeeded,
    saveToolChatSession,
    getToolChatSessions,
    deleteToolChatSession,
    saveConceptEntry,
    deleteConceptEntry,
    getConceptLibrary,
    clearAllData,
  };

  // Hydration guard
  if (!hydrated) {
    return <div className="h-screen bg-background" />;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
