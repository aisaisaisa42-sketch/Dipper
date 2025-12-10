// The structure we expect from Gemini
export interface AppSchema {
  appName: string;
  description: string;
  code: string; // Full functional HTML/JS code
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean; // To mark a message as currently generating
  streamContent?: string; // The raw content being streamed
}