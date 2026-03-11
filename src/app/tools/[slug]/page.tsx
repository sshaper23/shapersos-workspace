"use client";

import { useState, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  RefreshCw,
  Copy,
  Heart,
  SendHorizontal,
  Mic,
  Square,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { tools, getToolBySlug } from "@/data/tools";
import { aiModels } from "@/data/models";
import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

export default function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const tool = getToolBySlug(slug);
  const router = useRouter();

  const [sidebarSearch, setSidebarSearch] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [selectedModel, setSelectedModel] = useState(aiModels[0].value);
  const [customInstructions, setCustomInstructions] = useState("");
  const [followUpInput, setFollowUpInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isFormState = messages.length === 0;

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  const handleGenerate = useCallback(async () => {
    if (!tool) return;

    const userContent = customInstructions || Object.values(formValues).filter(Boolean).join("\n");
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
    setIsStreaming(true);
    setStreamingContent("");

    // Simulate streaming for now (Phase 3 will wire to real API)
    const mockResponse = `# ${tool.name} Output\n\nHere's your generated content based on your instructions:\n\n${userContent}\n\n---\n\n## Key Points\n\n1. **First insight** — This is a placeholder response. When the API is connected, you'll get real AI-generated content here.\n\n2. **Second insight** — The output will be tailored to your business context and style guide selections.\n\n3. **Third insight** — You can follow up with additional questions or instructions below.\n\n---\n\n*Generated with ${aiModels.find(m => m.value === selectedModel)?.label || "Claude"}*`;

    let current = "";
    for (let i = 0; i < mockResponse.length; i += 3) {
      await new Promise((r) => setTimeout(r, 10));
      current = mockResponse.slice(0, i + 3);
      setStreamingContent(current);
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantMsg.id
          ? { ...m, content: mockResponse, isStreaming: false }
          : m
      )
    );
    setIsStreaming(false);
    setStreamingContent("");
  }, [tool, customInstructions, formValues, selectedModel]);

  const handleFollowUp = useCallback(async () => {
    if (!followUpInput.trim() || isStreaming) return;

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

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setFollowUpInput("");
    setIsStreaming(true);

    const mockResponse = `Great follow-up! Here's my response to: "${followUpInput}"\n\nThis is a placeholder response. The real AI integration will maintain the full conversation context and provide relevant follow-up answers.`;

    let current = "";
    for (let i = 0; i < mockResponse.length; i += 3) {
      await new Promise((r) => setTimeout(r, 10));
      current = mockResponse.slice(0, i + 3);
      setStreamingContent(current);
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantMsg.id
          ? { ...m, content: mockResponse, isStreaming: false }
          : m
      )
    );
    setIsStreaming(false);
    setStreamingContent("");
  }, [followUpInput, isStreaming]);

  const resetChat = () => {
    setMessages([]);
    setStreamingContent("");
    setIsStreaming(false);
    setCustomInstructions("");
    setFormValues({});
    setFollowUpInput("");
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!tool) {
    return (
      <div className="p-6">
        <PageHeader title="Tool Not Found" subtitle="This tool doesn't exist." />
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
                  ? "bg-[#71a474]/15"
                  : "hover:bg-[hsl(0_0%_100%/0.06)]"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0">{t.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs truncate">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {t.shortDescription}
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(0_0%_100%/0.06)] mt-1 inline-block capitalize">
                    {t.category.replace("-", " ")}
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
          <div className="flex items-center gap-2 bg-[#71a474]/15 text-[#71a474] px-3 py-1.5 rounded-lg text-sm font-medium shrink-0">
            <span>{tool.emoji}</span>
            <span>{tool.name}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">1 tool</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[hsl(0_0%_100%/0.06)] px-4">
          <button className="px-4 py-3 text-sm font-medium text-[#71a474] border-b-2 border-[#71a474]">
            Start Tool
          </button>
          <button className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
            About this Tool
          </button>
        </div>

        {/* Tool Card */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="flex h-full min-w-full flex-col bg-[hsl(0_0%_100%/0.04)] rounded-xl border border-[hsl(0_0%_100%/0.06)]">
            {/* Card Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(0_0%_100%/0.06)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-[hsl(0_0%_100%/0.06)]">
                  <span className="text-2xl">{tool.emoji}</span>
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
                  {/* Custom Instructions */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Custom Instructions
                    </label>
                    <div className="relative">
                      <textarea
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="Enter custom instructions for this tool"
                        className="w-full min-h-[120px] px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#71a474]/50 transition-colors resize-y"
                      />
                      <button className="absolute right-3 bottom-3 p-2 rounded-lg bg-[hsl(0_0%_100%/0.06)] text-muted-foreground hover:text-foreground">
                        <Mic className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tool-specific fields */}
                  {tool.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium mb-2">
                        {field.label}
                        {field.required && <span className="text-[#71a474] ml-1">*</span>}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={formValues[field.name] || ""}
                          onChange={(e) =>
                            setFormValues((p) => ({ ...p, [field.name]: e.target.value }))
                          }
                          placeholder={field.placeholder}
                          className="w-full min-h-[80px] px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#71a474]/50 transition-colors resize-y"
                        />
                      ) : field.type === "select" ? (
                        <select
                          value={formValues[field.name] || ""}
                          onChange={(e) =>
                            setFormValues((p) => ({ ...p, [field.name]: e.target.value }))
                          }
                          className="w-full h-10 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground outline-none focus:border-[#71a474]/50 transition-colors"
                        >
                          <option value="">Select...</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[#001144]">
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
                          className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#71a474]/50 transition-colors"
                        />
                      )}
                    </div>
                  ))}

                  {/* AI Model Selector */}
                  <div>
                    <label className="block text-sm font-medium mb-2">AI Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full h-10 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground outline-none focus:border-[#71a474]/50 transition-colors"
                    >
                      {aiModels.map((m) => (
                        <option key={m.value} value={m.value} className="bg-[#001144]">
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    className="w-full py-3 rounded-xl bg-[#71a474] text-white font-medium hover:bg-[#71a474]/90 transition-colors"
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
                      msg.isStreaming && streamingContent
                        ? streamingContent
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
                            <div className="ml-auto bg-[#71a474]/20 px-4 py-3 rounded-xl w-fit max-w-[90%]">
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
                          {msg.isStreaming && streamingContent ? (
                            <div
                              className="w-8 h-8 rounded-full animate-spin"
                              style={{
                                background:
                                  "conic-gradient(from 0deg, #ff0080, #ff8c00, #40e0d0, #7b2fff, #ff0080)",
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[hsl(0_0%_100%/0.08)]">
                              <span className="text-base">{tool.emoji}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="bg-[hsl(0_0%_100%/0.05)] mr-auto px-4 py-3 rounded-xl w-fit max-w-[90%]">
                            <div className="prose prose-sm prose-invert max-w-none text-sm whitespace-pre-wrap">
                              {content || (
                                <span className="text-muted-foreground animate-pulse">
                                  Thinking...
                                </span>
                              )}
                            </div>
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
                              <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors">
                                <Heart className="w-3 h-3" /> Favorite
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
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
                        className="w-full px-4 py-3 bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground disabled:opacity-50 placeholder:text-muted-foreground focus:outline-none focus:border-[#71a474]/50 transition-all resize-none min-h-[44px] max-h-[100px]"
                        spellCheck={false}
                      />
                      <div className="absolute right-2 top-2">
                        <button
                          type="button"
                          className="p-2 rounded-lg bg-[hsl(0_0%_100%/0.06)] text-muted-foreground hover:text-foreground"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      </div>
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

        {/* Stop Button */}
        {isStreaming && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <button
              onClick={() => {
                abortControllerRef.current?.abort();
                setIsStreaming(false);
              }}
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
