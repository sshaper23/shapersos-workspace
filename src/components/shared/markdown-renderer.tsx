"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div
      className={cn(
        "prose prose-sm prose-invert max-w-none",
        // Headings
        "prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2",
        "prose-h1:text-lg prose-h2:text-base prose-h3:text-sm",
        // Paragraphs
        "prose-p:text-sm prose-p:text-[hsl(0_0%_100%/0.8)] prose-p:leading-relaxed prose-p:my-2",
        // Lists
        "prose-ul:my-2 prose-ol:my-2 prose-li:text-sm prose-li:text-[hsl(0_0%_100%/0.8)] prose-li:my-0.5",
        // Bold / Italic
        "prose-strong:text-foreground prose-em:text-[hsl(0_0%_100%/0.9)]",
        // Code
        "prose-code:text-[#0ea5e9] prose-code:bg-[hsl(0_0%_100%/0.06)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono",
        "prose-pre:bg-[hsl(0_0%_100%/0.04)] prose-pre:border prose-pre:border-[hsl(0_0%_100%/0.08)] prose-pre:rounded-lg prose-pre:my-3",
        // Links
        "prose-a:text-[#0ea5e9] prose-a:no-underline hover:prose-a:underline",
        // Blockquotes
        "prose-blockquote:border-l-[#0ea5e9] prose-blockquote:text-[hsl(0_0%_100%/0.7)] prose-blockquote:my-3",
        // Tables
        "prose-table:text-sm prose-th:text-foreground prose-th:border-[hsl(0_0%_100%/0.1)] prose-td:border-[hsl(0_0%_100%/0.06)]",
        // Horizontal rules
        "prose-hr:border-[hsl(0_0%_100%/0.08)]",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
