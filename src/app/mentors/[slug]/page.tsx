"use client";

import { useState, useRef, use } from "react";
import { mentors } from "@/data/mentors";
import { aiModels } from "@/data/models";
import { SendHorizontal, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function MentorChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const mentor = mentors.find((m) => m.slug === slug);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(aiModels[0].value);
  const [copied, setCopied] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!mentor) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Mentor not found</h1>
        <Link href="/mentors" className="text-sm text-[#71a474] mt-2 inline-block">
          Back to Mentors
        </Link>
      </div>
    );
  }

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `As your **${mentor.name}**, here's my advice:\n\nThis is a mock response. When connected to the Claude API, I'll use my specialized knowledge in ${mentor.speciality} to give you actionable, expert-level guidance.\n\nTry asking me specific questions about your business challenges and I'll help you work through them step by step.`,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[hsl(0_0%_100%/0.06)]">
        <Link
          href="/mentors"
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(0_0%_100%/0.06)]">
          <span className="text-xl">{mentor.emoji}</span>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-sm">{mentor.name}</h2>
          <p className="text-xs text-muted-foreground">{mentor.speciality}</p>
        </div>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="h-8 px-2 rounded-md border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] text-xs text-foreground outline-none"
        >
          {aiModels.map((m) => (
            <option key={m.value} value={m.value} className="bg-[#001144]">
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(0_0%_100%/0.06)] mb-4">
              <span className="text-3xl">{mentor.emoji}</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">{mentor.name}</h3>
            <p className="text-sm text-muted-foreground max-w-md">{mentor.description}</p>
            <p className="text-xs text-muted-foreground mt-4">
              Ask me anything about {mentor.speciality.toLowerCase()}
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="group flex items-start gap-3 max-w-3xl mx-auto w-full">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                msg.role === "user"
                  ? "bg-[hsl(0_0%_100%/0.1)] text-foreground"
                  : "bg-[hsl(0_0%_100%/0.06)]"
              }`}
            >
              {msg.role === "user" ? "Y" : <span className="text-base">{mentor.emoji}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.role === "assistant" && (
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                >
                  {copied === msg.id ? (
                    <>
                      <Check className="h-3 w-3" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-[hsl(0_0%_100%/0.06)] p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Ask ${mentor.name} anything...`}
            className="flex-1 h-11 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#71a474]/50 transition-colors"
          />
          <button
            onClick={handleSend}
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#71a474] text-white hover:bg-[#71a474]/90 transition-colors"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
