"use client";

import { useCallback, useMemo } from "react";
import { useApp } from "@/context/app-context";
import {
  FREE_TOOL_SLUGS,
  TIER_LIMITS,
  UPGRADE_COPY,
  type ProFeature,
} from "@/data/tier-config";

export function useTier() {
  const { state } = useApp();

  const tier = state.subscriptionTier || "free";
  const isPro = tier === "pro";

  const canAccessTool = useCallback(
    (slug: string): boolean => {
      if (isPro) return true;
      return FREE_TOOL_SLUGS.includes(slug);
    },
    [isPro]
  );

  const canAccessPlaybook = useCallback((): boolean => isPro, [isPro]);

  const canCreateMechanism = useCallback((): boolean => {
    if (isPro) return true;
    return (state.mechanisms?.length ?? 0) < TIER_LIMITS.maxMechanisms;
  }, [isPro, state.mechanisms]);

  const canUseAIGeneration = useCallback((): boolean => {
    if (isPro) return true;
    return (state.aiGenerationsUsed ?? 0) < TIER_LIMITS.maxAIGenerationsPerMechanism;
  }, [isPro, state.aiGenerationsUsed]);

  const canUseMechanic = useCallback((): boolean => {
    if (isPro) return true;
    return (state.mechanicMessagesThisMonth ?? 0) < TIER_LIMITS.maxMechanicMessagesPerMonth;
  }, [isPro, state.mechanicMessagesThisMonth]);

  const canAccessFeature = useCallback(
    (feature: ProFeature): boolean => isPro,
    [isPro]
  );

  const remainingMechanicMessages = useMemo(() => {
    if (isPro) return Infinity;
    return Math.max(
      0,
      TIER_LIMITS.maxMechanicMessagesPerMonth - (state.mechanicMessagesThisMonth ?? 0)
    );
  }, [isPro, state.mechanicMessagesThisMonth]);

  const getUpgradeCopy = useCallback(
    (feature: string) => {
      return UPGRADE_COPY[feature] || UPGRADE_COPY.tools;
    },
    []
  );

  return {
    tier,
    isPro,
    canAccessTool,
    canAccessPlaybook,
    canCreateMechanism,
    canUseAIGeneration,
    canUseMechanic,
    canAccessFeature,
    remainingMechanicMessages,
    getUpgradeCopy,
  };
}
