export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface TokenUsageRecord {
  id: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  toolSlug?: string;
  playbookSlug?: string;
  timestamp: number;
}

export interface FavoriteMessage {
  id: string;
  content: string;
  toolSlug?: string;
  playbookSlug?: string;
  toolName?: string;
  playbookName?: string;
  timestamp: number;
}
