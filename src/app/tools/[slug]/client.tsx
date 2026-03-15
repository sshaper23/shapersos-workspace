"use client";

import { useState, useRef, useCallback, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  RefreshCw,
  Copy,
  Heart,
  SendHorizontal,
  Download,
  Square,
  Check,
} from "lucide-react";
import { saveAs } from "file-saver";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { tools, getToolBySlug } from "@/data/tools";
import { aiModels } from "@/data/models";
import { getIcon } from "@/lib/icons";
import { useApp } from "@/context/app-context";
import { useAIStream } from "@/hooks/use-ai-stream";
import { NorthStarCTABanner } from "@/components/shared/north-star-cta-banner";
import { StrategistCTA } from "@/components/shared/strategist-cta";
import { useTier } from "@/hooks/use-tier";
import { UpgradeGate, ProBadge } from "@/components/shared/upgrade-gate";
import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = getIcon(name);
  return <Icon className={className} />;
}

export default function ToolPageClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const tool = getToolBySlug(slug);
  const router = useRouter();
  const { state, incrementToolsUsed, addRecentActivity, addFavorite, removeFavorite, isFavorite } = useApp();
  const { canAccessTool } = useTier();

  const [sidebarSearch, setSidebarSearch] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [customInstructions, setCustomInstructions] = useState("");
  const [followUpInput, setFollowUpInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [activeTab, setActiveTab] = useState<"start" | "about">("start");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { generate, abort, isStreaming, streamedContent, lastUsage } = useAIStream({
    onComplete: () => setHasGeneratedOnce(true),
    toolSlug: slug,
  });

  const isFormState = messages.length === 0;

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  // Auto-scroll on new streaming content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamedContent, messages]);

  const handleGenerate = useCallback(async () => {
    if (!tool) return;

    // Build user message from form values
    const parts: string[] = [];
    if (customInstructions) parts.push(customInstructions);
    tool.fields.forEach((field) => {
      const val = formValues[field.name];
      if (val) parts.push(`${field.label}: ${val}`);
    });
    const userContent = parts.join("\n");
    if (!userContent.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userContent,
      timestamp: new Date(),
    };

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages([userMsg, assistantMsg]);

    try {
      const result = await generate(
        [{ role: "user", content: userContent }],
        tool.systemPrompt
      );

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: result, isStreaming: false }
            : m
        )
      );
      incrementToolsUsed();
      if (tool) {
        addRecentActivity({ type: "tool", name: tool.name, slug: tool.slug, action: "Generated" });
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: "An error occurred. Please try again.", isStreaming: false }
            : m
        )
      );
    }
  }, [tool, customInstructions, formValues, generate]);

  const handleFollowUp = useCallback(async () => {
    if (!followUpInput.trim() || isStreaming || !tool) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: followUpInput,
      timestamp: new Date(),
    };

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    const updatedMessages = [...messages, userMsg, assistantMsg];
    setMessages(updatedMessages);
    setFollowUpInput("");

    // Build conversation history for API
    const conversationHistory = updatedMessages
      .filter((m) => !m.isStreaming && m.content)
      .map((m) => ({ role: m.role, content: m.content }));
    conversationHistory.push({ role: "user", content: followUpInput });

    try {
      const result = await generate(conversationHistory, tool.systemPrompt);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: result, isStreaming: false }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: "An error occurred. Please try again.", isStreaming: false }
            : m
        )
      );
    }
  }, [followUpInput, isStreaming, messages, tool, generate]);

  const resetChat = () => {
    abort();
    setMessages([]);
    setCustomInstructions("");
    setFormValues({});
    setFollowUpInput("");
    setHasGeneratedOnce(false);
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = (text: string) => {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const timestamp = new Date().toISOString().slice(0, 10);
    saveAs(blob, `${slug}-output-${timestamp}.md`);
  };

  if (!tool) {
    return (
      <div className="p-6">
        <PageHeader title="Tool Not Found" subtitle="This tool doesn't exist." />
      </div>
    );
  }

  const toolIsLocked = !canAccessTool(slug);

  if (toolIsLocked) {
    return (
      <div className="flex h-full">
        {/* Left Sidebar — still browsable */}
        <div className="hidden md:flex w-72 bg-[hsl(0_0%_100%/0.02)] backdrop-blur-xl border-r border-[hsl(0_0%_100%/0.06)] flex-col overflow-hidden">
          <div className="p-3 border-b border-[hsl(0_0%_100%/0.06)]">
            <h3 className="font-semibold text-sm mb-2">All Tools</h3>
            <SearchBar
              value={sidebarSearch}
              onChange={setSidebarSearch}
              placeholder="Search tools..."
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredTools.map((t) => (
              <button
                key={t.slug}
                onClick={() => router.push(`/tools/${t.slug}`)}
                className={cn(
                  "w-full text-left p-3 transition-all",
                  t.slug === slug
                    ? "bg-[#0ea5e9]/15"
                    : "hover:bg-[hsl(0_0%_100%/0.06)]"
                )}
              >
                <div className="flex items-start gap-3">
                  <ToolIcon name={t.icon} className="h-4 w-4 shrink-0 text-[#0ea5e9] mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-xs truncate">{t.name}</p>
                      {!canAccessTool(t.slug) && <ProBadge />}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* Main area — upgrade gate */}
        <div className="flex-1 p-6">
          <PageHeader title={tool.name} subtitle={tool.shortDescription} />
          <UpgradeGate feature="tools" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar — All Tools */}
      <div className="hidden md:flex w-72 bg-[hsl(0_0%_100%/0.02)] backdrop-blur-xl border-r border-[hsl(0_0%_100%/0.06)] flex-col overflow-hidden">
        <div className="p-3 border-b border-[hsl(0_0%_100%/0.06)]">
          <h3 className="font-semibold text-sm mb-2">All Tools</h3>
          <SearchBar
            value={sidebarSearch}
            onChange={setSidebarSearch}
            placeholder="Search tools..."
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredTools.map((t) => (
            <button
              key={t.slug}
              onClick={() => {
                resetChat();
                router.push(`/tools/${t.slug}`);
              }}
              className={cn(
                "w-full text-left p-3 transition-all",
                t.slug === slug
                  ? "bg-[#0ea5e9]/15"
                  : "hover:bg-[hsl(0_0%_100%/0.06)]"
              )}
            >
              <div className="flex items-start gap-3">
                <ToolIcon name={t.icon} className="h-4 w-4 shrink-0 text-[#0ea5e9] mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs truncate">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {t.shortDescription}
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(0_0%_100%/0.06)] mt-1 inline-block capitalize">
                    {t.category.replace(/-/g, " ")}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="p-3 text-xs text-muted-foreground border-t border-[hsl(0_0%_100%/0.06)]">
          {filteredTools.length} tools
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Pipeline Bar */}
        <div className="flex items-center gap-3 py-2 px-4 border-b border-[hsl(0_0%_100%/0.06)]">
          <div className="flex items-center gap-2 bg-[#0ea5e9]/15 text-[#0ea5e9] px-3 py-1.5 rounded-lg text-sm font-medium shrink-0">
            <ToolIcon name={tool.icon} className="h-4 w-4" />
            <span>{tool.name}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">1 tool</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[hsl(0_0%_100%/0.06)] px-4">
          <button
            onClick={() => setActiveTab("start")}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "start"
                ? "text-[#0ea5e9] border-b-2 border-[#0ea5e9]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Start Tool
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "about"
                ? "text-[#0ea5e9] border-b-2 border-[#0ea5e9]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            About this Tool
          </button>
        </div>

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center bg-[hsl(0_0%_100%/0.06)]">
                  <ToolIcon name={tool.icon} className="h-7 w-7 text-[#0ea5e9]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{tool.name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-[hsl(0_0%_100%/0.06)] capitalize">
                    {tool.category.replace(/-/g, " ")}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5">
                <h3 className="text-sm font-semibold mb-2">Description</h3>
                <p className="text-sm text-[hsl(0_0%_100%/0.7)] leading-relaxed">{tool.description}</p>
              </div>

              {tool.fields.length > 0 && (
                <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5">
                  <h3 className="text-sm font-semibold mb-3">Input Fields</h3>
                  <div className="space-y-2">
                    {tool.fields.map((field) => (
                      <div
                        key={field.name}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-[hsl(0_0%_100%/0.03)]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{field.label}</span>
                          {field.required && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0ea5e9]/20 text-[#0ea5e9]">
                              Required
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">{field.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveTab("start")}
                className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors"
              >
                Start Using {tool.name}
              </button>
            </div>
          </div>
        )}

        {/* Tool Card */}
        {activeTab === "start" && (
        <div className="flex-1 overflow-hidden p-4">
          <div className="flex h-full min-w-full flex-col bg-[hsl(0_0%_100%/0.04)] rounded-xl border border-[hsl(0_0%_100%/0.06)]">
            {/* Card Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(0_0%_100%/0.06)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-[hsl(0_0%_100%/0.06)]">
                  <ToolIcon name={tool.icon} className="h-6 w-6 text-[#0ea5e9]" />
                </div>
                <h2 className="text-lg font-semibold">{tool.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.08)] transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={resetChat}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.08)] transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isFormState ? (
              /* FORM STATE */
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-lg mx-auto space-y-4">
                  {/* North Star CTA Banner */}
                  {!state.hasCompletedNorthStar && <NorthStarCTABanner />}

                  {/* Custom Instructions */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Custom Instructions
                    </label>
                    <textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="Enter custom instructions for this tool"
                      className="w-full min-h-[120px] px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors resize-y"
                    />
                  </div>

                  {/* Tool-specific fields */}
                  {tool.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium mb-2">
                        {field.label}
                        {field.required && <span className="text-[#0ea5e9] ml-1">*</span>}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={formValues[field.name] || ""}
                          onChange={(e) =>
                            setFormValues((p) => ({ ...p, [field.name]: e.target.value }))
                          }
                          placeholder={field.placeholder}
                          className="w-full min-h-[80px] px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors resize-y"
                        />
                      ) : field.type === "select" ? (
                        <select
                          value={formValues[field.name] || ""}
                          onChange={(e) =>
                            setFormValues((p) => ({ ...p, [field.name]: e.target.value }))
                          }
                          className="w-full h-10 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors"
                        >
                          <option value="">Select...</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[#060918]">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type === "number" ? "number" : "text"}
                          value={formValues[field.name] || ""}
                          onChange={(e) =>
                            setFormValues((p) => ({ ...p, [field.name]: e.target.value }))
                          }
                          placeholder={field.placeholder}
                          className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors"
                        />
                      )}
                    </div>
                  ))}

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                  >
                    Generate {tool.name}
                  </button>
                </div>
              </div>
            ) : (
              /* CHAT STATE */
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const content =
                      msg.isStreaming && streamedContent
                        ? streamedContent
                        : msg.content;

                    if (msg.role === "user") {
                      return (
                        <div key={msg.id} className="flex items-start gap-3 flex-row-reverse p-4 rounded-xl">
                          <div className="shrink-0">
                            <div className="w-8 h-8 rounded-full bg-[hsl(0_0%_100%/0.1)] flex items-center justify-center">
                              <span className="text-xs">You</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="ml-auto bg-[#0ea5e9]/20 px-4 py-3 rounded-xl w-fit max-w-[90%]">
                              <p className="text-sm whitespace-pre-wrap">{content}</p>
                            </div>
                            <div className="flex justify-end mt-2 mr-4">
                              <button
                                onClick={() => handleCopy(content, msg.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {copiedId === msg.id ? (
                                  <><Check className="w-3 h-3" /> Copied</>
                                ) : (
                                  <><Copy className="w-3 h-3" /> Copy</>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className="flex items-start gap-3 p-4 rounded-xl">
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
                              <ToolIcon name={tool.icon} className="h-4 w-4 text-[#0ea5e9]" />
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
                                  <><Check className="w-3 h-3" /> Copied</>
                                ) : (
                                  <><Copy className="w-3 h-3" /> Copy</>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  if (isFavorite(msg.id)) {
                                    removeFavorite(msg.id);
                                  } else {
                                    addFavorite({
                                      id: msg.id,
                                      content,
                                      toolSlug: slug,
                                      toolName: tool.name,
                                      timestamp: Date.now(),
                                    });
                                  }
                                }}
                                className={cn(
                                  "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                                  isFavorite(msg.id)
                                    ? "text-red-400"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                <Heart className={cn("w-3 h-3", isFavorite(msg.id) && "fill-current")} />
                                {isFavorite(msg.id) ? "Saved" : "Favorite"}
                              </button>
                              <button
                                onClick={() => handleExport(content)}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Download className="w-3 h-3" />
                                Export
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />

                  {/* Strategist CTA — show after first output, only when not streaming */}
                  {hasGeneratedOnce && !isStreaming && (
                    <StrategistCTA variant="inline" context="toolOutput" />
                  )}
                </div>

                {/* Follow-up Input */}
                <div className="p-3 border-t border-[hsl(0_0%_100%/0.06)]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleFollowUp();
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 relative">
                      <textarea
                        value={followUpInput}
                        onChange={(e) => setFollowUpInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleFollowUp();
                          }
                        }}
                        placeholder="Questions or instructions..."
                        rows={1}
                        disabled={isStreaming}
                        className="w-full px-4 py-3 bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground disabled:opacity-50 placeholder:text-muted-foreground focus:outline-none focus:border-[#0ea5e9]/50 transition-all resize-none min-h-[44px] max-h-[100px]"
                        spellCheck={false}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!followUpInput.trim() || isStreaming}
                      className="p-3 rounded-xl text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    >
                      <SendHorizontal className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
        )}

        {/* Stop Button */}
        {isStreaming && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <button
              onClick={abort}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-[hsl(0_0%_100%/0.1)] shadow-lg text-sm font-medium hover:bg-[hsl(0_0%_100%/0.05)] transition-colors"
            >
              <Square className="w-4 h-4 fill-current" />
              Stop Claude
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
