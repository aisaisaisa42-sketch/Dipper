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
  isStreaming?: boolean;
  streamContent?: string;
}

// --- NEW TYPES FOR APP BUILDER ---

export interface GeneratedImage {
  id: string;
  prompt: string;
  url: string; // Base64 data URL
  createdAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number; // Credits bought
  cost: number; // Cost in USD
  type: 'purchase' | 'daily_reset' | 'bonus';
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string; 
  
  // Credit System
  freeCredits: number;     // Resets daily
  purchasedCredits: number; // Bought via payment
  lastDailyReset: number;   // Timestamp of last reset
  
  isBanned?: boolean; 
  createdAt: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  code: string;
  messages: ChatMessage[]; 
  images: GeneratedImage[]; 
  createdAt: number;
  updatedAt: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type ViewState = 'landing' | 'login' | 'signup' | 'dashboard' | 'editor' | 'admin' | 'pricing';
