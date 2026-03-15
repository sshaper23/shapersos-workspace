"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  SendHorizontal,
  Copy,
  Check,
  Wrench,
  Square,
  Trash2,
  Download,
} from "lucide-react";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/app-context";
import { useAIStream } from "@/hooks/use-ai-stream";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { useTier } from "@/hooks/use-tier";
import { UpgradeGate } from "@/components/shared/upgrade-gate";
import { TIER_LIMITS } from "@/data/tier-config";

// ─── System Prompt ───

const MECHANIC_SYSTEM_PROMPT = `You are The Mechanic — a senior revenue strategist, ecosystem economist, and problem-solving advisor for business owners and marketers. You operate inside ShapersOS, a strategic operating system for building and optimising revenue engines.

You have the full Platform Knowledge Base available (injected separately). Use ALL frameworks — marketing strategy, paid growth, copywriting, sales, creative research, offer architecture — to answer questions with depth and precision.

## HOW YOU OPERATE

1. **Listen first.** Understand the full context before jumping to solutions.
2. **Diagnose before prescribing.** Ask clarifying questions if the problem isn't clear. Identify which pillar (offer/message/mechanism) is the bottleneck.
3. **Be specific and actionable.** Never give generic advice. Reference their actual situation, their data, their numbers.
4. **Show your reasoning.** Explain WHY something works, not just WHAT to do. Reference the framework that supports your recommendation.
5. **Prioritise ruthlessly.** If there are multiple issues, identify the highest-leverage fix first (Big Lever Principle). Give them the ONE thing, then the sequence.
6. **Use frameworks.** Ground every answer in the platform's proven models — Schwartz awareness stages, buyer's pyramid, BEAR system, Three Brain Stages, ecosystem economics, etc.
7. **Be direct.** No fluff, no filler. Say what needs to be said.

## CONTEXT AWARENESS

You have access to the user's stored business context (North Star profile), brand guidelines, and sales mechanism data. Use this to personalise your answers to their specific business situation. If context is available, reference it. If it's not, suggest they complete those sections for better advice.

## TONE

Professional but conversational. Like talking to a trusted advisor who's done this hundreds of times. Confident without being arrogant. Direct without being cold. You're here to solve problems and build revenue, not to impress with jargon.`;

// ─── Types ───

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  timestamp: number;
}

// ─── Suggested prompts ───

const SUGGESTED_PROMPTS = [
  "My cost per lead keeps rising — what should I look at first?",
  "How do I know if my offer is priced correctly?",
  "What's the best way to structure a self-liquidating funnel?",
  "My close rate dropped — help me diagnose why",
  "How should I split budget between testing and scaling?",
  "Walk me through setting up the BEAR creative testing system",
];

// ─── Component ───

export default function MechanicClient() {
  const { addRecentActivity, incrementMechanicMessages, resetMechanicMessagesIfNeeded } = useApp();
  const { canUseMechanic, remainingMechanicMessages, isPro } = useTier();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { generate, abort, isStreaming, streamedContent, reset: resetStream } =
    useAIStream({ toolSlug: "mechanic" });

  // Reset mechanic message count if month has rolled over
  useEffect(() => {
    resetMechanicMessagesIfNeeded();
  }, [resetMechanicMessagesIfNeeded]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = useCallback(
    async (text?: string) => {
      const userText = (text || input).trim();
      if (!userText || isStreaming) return;

      setInput("");

      // Add user message
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userText,
        timestamp: Date.now(),
      };

      // Add placeholder assistant message
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        isStreaming: true,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Track message usage for free tier
      if (!isPro) {
        incrementMechanicMessages();
      }

      // Build conversation history for the API
      const conversationHistory = [
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user" as const, content: userText },
      ];

      // Track activity
      addRecentActivity({
        type: "tool",
        name: "Mechanic",
        slug: "mechanic",
        action: "Asked",
        href: "/mechanic",
      });

      resetStream();

      try {
        const result = await generate(conversationHistory, MECHANIC_SYSTEM_PROMPT);

        // Update the assistant message with final content
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  content:
                    result ||
                    "No response received — check your API key at /api/health",
                  isStreaming: false,
                }
              : m
          )
        );
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Something went wrong";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  content: `Error: ${errorMsg}`,
                  isStreaming: false,
                }
              : m
          )
        );
      }
    },
    [input, isStreaming, messages, generate, resetStream, addRecentActivity]
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

  const handleExport = (content: string) => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, `mechanic-response-${Date.now()}.md`);
  };

  const handleClear = () => {
    setMessages([]);
    resetStream();
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(0_0%_100%/0.06)] px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0ea5e9]/10">
            <Wrench className="h-4 w-4 text-[#0ea5e9]" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Mechanic</h1>
            <p className="text-[10px] text-muted-foreground">
              Your problem-solving strategist — ask anything about marketing,
              sales, offers, or growth
            </p>
          </div>
        </div>
        {hasMessages && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0ea5e9]/10 mb-4">
              <Wrench className="h-8 w-8 text-[#0ea5e9]" />
            </div>
            <h2 className="text-lg font-semibold mb-1">
              What can I help you fix?
            </h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
              I pull from your stored business context, sales frameworks,
              copywriting systems, and media buying playbooks to give you
              specific, actionable answers.
            </p>

            {/* Suggested Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="text-left px-4 py-3 rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] text-xs text-muted-foreground hover:text-foreground hover:border-[hsl(0_0%_100%/0.15)] hover:bg-[hsl(0_0%_100%/0.04)] transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="p-4 space-y-4">
            {messages.map((msg) => {
              const content =
                msg.isStreaming && streamedContent
                  ? streamedContent
                  : msg.content;

              if (msg.role === "user") {
                return (
                  <div
                    key={msg.id}
                    className="flex items-start gap-3 flex-row-reverse p-4 rounded-xl"
                  >
                    <div className="shrink-0">
                      <div className="w-8 h-8 rounded-full bg-[hsl(0_0%_100%/0.1)] flex items-center justify-center">
                        <span className="text-xs">You</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="ml-auto bg-[#0ea5e9]/20 px-4 py-3 rounded-xl w-fit max-w-[90%]">
                        <p className="text-sm whitespace-pre-wrap">{content}</p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 p-4 rounded-xl"
                >
                  <div className="shrink-0">
                    {msg.isStreaming && streamedContent ? (
                      <div
                        className="w-8 h-8 rounded-full animate-spin"
                        style={{
                          background:
                            "conic-gradient(from 0deg, #ff0080, #ff8c00, #40e0d0, #7b2fff, #ff0080)",
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[hsl(0_0%_100%/0.08)]">
                        <Wrench className="h-4 w-4 text-[#0ea5e9]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-[hsl(0_0%_100%/0.05)] mr-auto px-4 py-3 rounded-xl w-fit max-w-[90%]">
                      {content ? (
                        <MarkdownRenderer content={content} />
                      ) : (
                        <span className="text-sm text-muted-foreground animate-pulse">
                          Thinking...
                        </span>
                      )}
                    </div>
                    {!msg.isStreaming && content && (
                      <div className="flex gap-2 mt-2 ml-4">
                        <button
                          onClick={() => handleCopy(content, msg.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleExport(content)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Download className="w-3 h-3" /> Export
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="border-t border-[hsl(0_0%_100%/0.06)] px-4 py-3">
        {!canUseMechanic() ? (
          <div className="max-w-3xl mx-auto">
            <UpgradeGate feature="mechanic" inline />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {!isPro && (
              <div className="flex items-center justify-end mb-1.5">
                <span className="text-[10px] text-muted-foreground">
                  {remainingMechanicMessages} of {TIER_LIMITS.maxMechanicMessagesPerMonth} messages remaining this month
                </span>
              </div>
            )}
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the Mechanic anything..."
                  rows={1}
                  className="w-full px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors resize-none"
                />
              </div>
              {isStreaming ? (
                <button
                  onClick={abort}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(0_0%_100%/0.08)] text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.12)] transition-colors"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              ) : (
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                    input.trim()
                      ? "bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                      : "bg-[hsl(0_0%_100%/0.06)] text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <SendHorizontal className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
