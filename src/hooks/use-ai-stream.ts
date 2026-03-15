"use client";

import { useState, useRef, useCallback } from "react";
import { useApp } from "@/context/app-context";

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

interface UseAIStreamOptions {
  onComplete?: (content: string) => void;
  toolSlug?: string;
  playbookSlug?: string;
}

export function useAIStream(options?: UseAIStreamOptions) {
  const { state, getNorthStarContext, getBrandContext, getMechanismContext, addTokenUsage } = useApp();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [lastUsage, setLastUsage] = useState<TokenUsage | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (
      messages: { role: string; content: string }[],
      systemPrompt: string
    ): Promise<string> => {
      abortRef.current = new AbortController();
      setIsStreaming(true);
      setStreamedContent("");
      setLastUsage(null);
      let fullContent = "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            model: state.selectedModel,
            systemPrompt,
            northStarContext: getNorthStarContext(),
            brandContext: getBrandContext(),
            mechanismContext: getMechanismContext(),
            toolSlug: options?.toolSlug,
            playbookSlug: options?.playbookSlug,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("text/event-stream")) {
          // SSE streaming response
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

              for (const line of lines) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") break;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    fullContent += parsed.text;
                    setStreamedContent(fullContent);
                  }
                  if (parsed.usage) {
                    setLastUsage(parsed.usage);
                    // Persist to app context for history tracking
                    addTokenUsage({
                      id: crypto.randomUUID(),
                      model: parsed.usage.model || state.selectedModel,
                      promptTokens: parsed.usage.promptTokens,
                      completionTokens: parsed.usage.completionTokens,
                      totalTokens: parsed.usage.totalTokens,
                      toolSlug: options?.toolSlug,
                      playbookSlug: options?.playbookSlug,
                      timestamp: Date.now(),
                    });
                  }
                } catch {
                  // Skip malformed chunks
                }
              }
            }
          }
        } else {
          // JSON fallback (mock mode)
          const json = await res.json();
          fullContent = json.content || json.text || "";
          // Simulate streaming for mock responses
          const words = fullContent.split(" ");
          let accumulated = "";
          for (let i = 0; i < words.length; i++) {
            accumulated += (i === 0 ? "" : " ") + words[i];
            setStreamedContent(accumulated);
            await new Promise((r) => setTimeout(r, 20));
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // User cancelled — keep what we have
          return fullContent;
        }
        throw err;
      } finally {
        setIsStreaming(false);
        if (fullContent && options?.onComplete) {
          options.onComplete(fullContent);
        }
      }

      return fullContent;
    },
    [state.selectedModel, getNorthStarContext, getBrandContext, getMechanismContext, addTokenUsage, options]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setStreamedContent("");
    setIsStreaming(false);
    setLastUsage(null);
  }, []);

  return { generate, abort, reset, isStreaming, streamedContent, lastUsage };
}
