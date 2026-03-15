"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  SendHorizontal,
  Copy,
  Check,
  BarChart3,
  Trash2,
  Download,
  Square,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingDown,
  Target,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/app-context";
import { useAIStream } from "@/hooks/use-ai-stream";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { useTier } from "@/hooks/use-tier";
import { UpgradeGate } from "@/components/shared/upgrade-gate";
import type { SalesMechanism, AlignmentAnalysis, AlignmentChatMessage } from "@/types/context";

// ─── System Prompt ───

function buildAlignmentPrompt(mechanism: SalesMechanism): string {
  const stagesSummary = mechanism.stages
    .map((s) => {
      const metrics = (s.stageMetrics || [])
        .map((m) => `${m.label}: ${m.value || "not tracked"} (benchmark: ${m.benchmark || "N/A"})`)
        .join(", ");
      return `  ${s.order + 1}. "${s.name}" (${s.type}) — ${s.description || "No description"} | Action: ${s.action || "N/A"} | Tool: ${s.tool || "N/A"} | Drop-off: ${s.dropOffRisk} | Conv Rate: ${s.conversionRate || "N/A"} | Volume: ${s.volumeIn || "N/A"}${metrics ? ` | Metrics: ${metrics}` : ""}`;
    })
    .join("\n");

  return `You are a Revenue Alignment Analyst operating inside ShapersOS. You're conducting a diagnostic alignment analysis for a specific sales mechanism.

## YOUR ROLE
You are NOT generating a report immediately. Instead, you will lead a conversational diagnostic — asking questions ONE AT A TIME to understand the real situation before delivering your assessment.

## THE MECHANISM BEING ANALYSED
Name: ${mechanism.name}
Linked Offer: ${mechanism.linkedOffer || "Not specified"}
Status: ${mechanism.status}

Buying Journey Stages:
${stagesSummary}

Global Metrics:
- Lead Source: ${mechanism.metrics.primaryLeadSource || "Not specified"}
- Monthly Lead Volume: ${mechanism.metrics.leadVolume || "N/A"}
- Cost Per Lead: ${mechanism.metrics.costPerLead || "N/A"}
- Core Offer Price: ${mechanism.metrics.coreOfferPrice || "N/A"}
- Client LTV: ${mechanism.metrics.ltv || "N/A"}
- Upsell: ${mechanism.metrics.hasUpsell ? `${mechanism.metrics.upsellDescription} ($${mechanism.metrics.upsellPrice})` : "None"}
- Continuity: ${mechanism.metrics.hasContinuity ? `${mechanism.metrics.continuityDescription} ($${mechanism.metrics.continuityMonthlyValue}/mo)` : "None"}

Journey Notes: ${mechanism.journeyNotes || "None"}

## CONVERSATION FLOW
1. Start by acknowledging the mechanism and what you can see from the data.
2. Ask 3-5 diagnostic questions ONE AT A TIME (wait for each answer before the next). Focus on:
   - Where they feel the biggest friction point is right now
   - Whether their actual numbers match their expected/target numbers
   - How well their messaging aligns with buyer awareness stages at each stage
   - What they've already tried to fix any gaps
   - How confident they feel their offer-message-mechanism alignment is (the 3 pillars)
3. After gathering enough context (3-5 exchanges), deliver a FULL ALIGNMENT ANALYSIS.

## ANALYSIS FORMAT (delivered after conversation)
When you have enough information, deliver the analysis in this exact format:

**ALIGNMENT SCORE: [X]/100**

**ESTIMATED REVENUE LEAK: $[X,XXX]/mo**

Then provide these sections:
1. **Offer-Message Alignment** — How well does the messaging match the offer value and buyer awareness?
2. **Message-Mechanism Alignment** — Is the right message being delivered at the right stage?
3. **Mechanism Efficiency** — Where are the drop-offs vs benchmarks? Which stages are underperforming?
4. **The Big Lever** — The ONE highest-leverage fix that would produce the biggest impact
5. **Revenue Recovery Roadmap** — 3-5 prioritised actions with expected impact
6. **Warning Signs** — Any red flags or structural issues

Ground everything in the 3-Pillar Framework (offer/message/mechanism), Ecosystem Economics (GPT, PSM, MER, LTV:CAC), and the Big Lever Principle.

## RULES
- Be direct and specific — reference actual stage names, actual numbers, actual gaps
- Never give generic advice — make it specific to THIS mechanism
- Use the strategic frameworks to justify your recommendations
- If data is missing, flag it as a gap and explain why it matters
- Be encouraging but honest — call out problems clearly`;
}

// ─── Types ───

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  timestamp: number;
}

interface AlignmentChatProps {
  mechanism: SalesMechanism;
  defaultExpanded?: boolean;
}

// ─── Score parsing ───

function parseScore(content: string): { score: number; revenueLeak: string } | null {
  const scoreMatch = content.match(/ALIGNMENT SCORE:\s*(\d+)\s*\/\s*100/i);
  const leakMatch = content.match(/ESTIMATED REVENUE LEAK:\s*\$?([\d,]+(?:\/mo)?)/i);

  if (scoreMatch) {
    return {
      score: parseInt(scoreMatch[1], 10),
      revenueLeak: leakMatch ? `$${leakMatch[1]}${leakMatch[1].includes("/mo") ? "" : "/mo"}` : "Unknown",
    };
  }
  return null;
}

// ─── Component ───

export function AlignmentChat({ mechanism, defaultExpanded = false }: AlignmentChatProps) {
  const { saveAlignmentAnalysis, clearAlignmentAnalysis, getAlignmentAnalysis, addRecentActivity } = useApp();
  const { canAccessFeature } = useTier();

  if (!canAccessFeature("alignmentAnalysis")) {
    return (
      <div className="mt-8">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#0ea5e9]" />
          Revenue Alignment Analysis
        </h2>
        <UpgradeGate feature="alignmentAnalysis" inline />
      </div>
    );
  }
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ score: number; revenueLeak: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initializedRef = useRef(false);

  const { generate, abort, isStreaming, streamedContent, reset: resetStream } =
    useAIStream({ toolSlug: "alignment-analysis" });

  // Load existing analysis on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const existing = getAlignmentAnalysis(mechanism.id);
    if (existing?.chatHistory?.length) {
      setMessages(
        existing.chatHistory.map((m) => ({
          ...m,
          isStreaming: false,
        }))
      );
      if (existing.overallScore > 0) {
        setAnalysisResult({
          score: existing.overallScore,
          revenueLeak: existing.revenueLeak,
        });
      }
    }
  }, [mechanism.id, getAlignmentAnalysis]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamedContent, isExpanded]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Save analysis to context whenever messages change (after initial load)
  const saveToContext = useCallback(
    (msgs: ChatMessage[], scoreData?: { score: number; revenueLeak: string } | null) => {
      const chatHistory: AlignmentChatMessage[] = msgs
        .filter((m) => !m.isStreaming)
        .map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }));

      const analysis: AlignmentAnalysis = {
        id: `analysis-${mechanism.id}`,
        mechanismId: mechanism.id,
        overallScore: scoreData?.score || analysisResult?.score || 0,
        revenueLeak: scoreData?.revenueLeak || analysisResult?.revenueLeak || "",
        rawAnalysis: msgs
          .filter((m) => m.role === "assistant" && !m.isStreaming)
          .map((m) => m.content)
          .join("\n\n---\n\n"),
        chatHistory,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveAlignmentAnalysis(mechanism.id, analysis);
    },
    [mechanism.id, saveAlignmentAnalysis, analysisResult]
  );

  const handleSend = useCallback(
    async (text?: string) => {
      const userText = (text || input).trim();
      if (!userText || isStreaming) return;

      setInput("");

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userText,
        timestamp: Date.now(),
      };

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        isStreaming: true,
        timestamp: Date.now(),
      };

      const newMessages = [...messages, userMsg, assistantMsg];
      setMessages(newMessages);

      const conversationHistory = [
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user" as const, content: userText },
      ];

      addRecentActivity({
        type: "tool",
        name: "Alignment Analysis",
        slug: "alignment-analysis",
        action: "Analysed",
      });

      resetStream();

      try {
        const result = await generate(
          conversationHistory,
          buildAlignmentPrompt(mechanism)
        );

        const updatedMessages = newMessages.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: result, isStreaming: false }
            : m
        );
        setMessages(updatedMessages);

        // Check if this response contains the final analysis
        const scoreData = parseScore(result);
        if (scoreData) {
          setAnalysisResult(scoreData);
          saveToContext(updatedMessages, scoreData);
        } else {
          saveToContext(updatedMessages);
        }
      } catch {
        const errorMessages = newMessages.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content: "Sorry, something went wrong. Please try again.",
                isStreaming: false,
              }
            : m
        );
        setMessages(errorMessages);
      }
    },
    [input, isStreaming, messages, generate, resetStream, mechanism, addRecentActivity, saveToContext]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const allContent = messages
      .filter((m) => !m.isStreaming)
      .map((m) => `**${m.role === "user" ? "You" : "Analyst"}:**\n${m.content}`)
      .join("\n\n---\n\n");

    const blob = new Blob([allContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alignment-analysis-${mechanism.name.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setMessages([]);
    setAnalysisResult(null);
    clearAlignmentAnalysis(mechanism.id);
    resetStream();
  };

  // Start analysis automatically when expanded and no messages
  const startAnalysis = useCallback(() => {
    if (messages.length === 0) {
      handleSend("Please analyse this sales mechanism and help me identify alignment issues and revenue leaks.");
    }
  }, [messages.length, handleSend]);

  const hasMessages = messages.length > 0;

  // ─── Score Color ───

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/30";
    if (score >= 60) return "bg-amber-500/10 border-amber-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  return (
    <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[hsl(0_0%_100%/0.02)] hover:bg-[hsl(0_0%_100%/0.04)] transition-colors text-left"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0ea5e9]/10">
          <BarChart3 className="h-4 w-4 text-[#0ea5e9]" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Alignment Analysis</h3>
          <p className="text-[10px] text-muted-foreground">
            Conversational diagnostic to identify revenue leaks and alignment gaps
          </p>
        </div>

        {/* Score badge (if exists) */}
        {analysisResult && (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold",
                getScoreBg(analysisResult.score)
              )}
            >
              <Target className="h-3 w-3" />
              <span className={getScoreColor(analysisResult.score)}>
                {analysisResult.score}/100
              </span>
            </div>
            {analysisResult.revenueLeak && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-400">
                <TrendingDown className="h-3 w-3" />
                {analysisResult.revenueLeak}
              </div>
            )}
          </div>
        )}

        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded chat area */}
      {isExpanded && (
        <div className="border-t border-[hsl(0_0%_100%/0.06)]">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
            <span className="text-[10px] text-muted-foreground">
              {hasMessages
                ? `${messages.filter((m) => m.role === "user").length} messages`
                : "Start the analysis to identify alignment issues"}
            </span>
            <div className="flex items-center gap-1">
              {hasMessages && (
                <>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </button>
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="max-h-[500px] overflow-y-auto px-4 py-4 space-y-4">
            {!hasMessages && (
              <div className="text-center py-8">
                <BarChart3 className="h-10 w-10 text-[#0ea5e9]/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Start a conversational analysis of your &ldquo;{mechanism.name}&rdquo; mechanism
                </p>
                <button
                  onClick={startAnalysis}
                  disabled={isStreaming}
                  className="px-6 py-2.5 rounded-xl bg-[#0ea5e9] text-white text-sm font-medium hover:bg-[#0ea5e9]/90 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="h-4 w-4" />
                  Run Alignment Analysis
                </button>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0ea5e9]/10 mt-1">
                    <BarChart3 className="h-3.5 w-3.5 text-[#0ea5e9]" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-4 py-3",
                    msg.role === "user"
                      ? "bg-[#0ea5e9]/10 border border-[#0ea5e9]/20"
                      : "bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)]"
                  )}
                >
                  {msg.isStreaming && !streamedContent ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0ea5e9]" />
                      <span className="text-xs text-muted-foreground animate-pulse">
                        Analysing...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="prose prose-sm prose-invert max-w-none text-sm">
                        <MarkdownRenderer
                          content={msg.isStreaming ? streamedContent : msg.content}
                        />
                      </div>
                      {!msg.isStreaming && msg.role === "assistant" && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[hsl(0_0%_100%/0.06)]">
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <Check className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            {copiedId === msg.id ? "Copied" : "Copy"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {hasMessages && (
            <div className="border-t border-[hsl(0_0%_100%/0.06)] px-4 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Answer the question or ask for clarification..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors resize-none"
                />
                {isStreaming ? (
                  <button
                    onClick={abort}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <Square className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                      input.trim()
                        ? "bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                        : "bg-[hsl(0_0%_100%/0.06)] text-muted-foreground"
                    )}
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
