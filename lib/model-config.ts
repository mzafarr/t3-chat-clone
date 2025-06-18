import { Bot, Brain, Sparkles } from 'lucide-react';

// Define a strict type for our model configuration
export type AIModel = {
  id: string; // A unique identifier for the frontend to send
  name: string; // The display name for the UI
  icon: React.ComponentType<{ className?: string }>; // The icon component for the UI
  provider: 'openai' | 'anthropic' | 'google'; // The backend provider key
  apiIdentifier: string; // The actual model name for the AI SDK
  isPro?: boolean; // Flag for pro-tier models
  features?: string[]; // For UI filtering
  providerColor?: string; // Color theme for the provider
};

// The single source of truth for all models
export const aIModels: AIModel[] = [
  // --- FREE MODELS (FAVORITES) ---
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    icon: Bot,
    provider: 'openai',
    apiIdentifier: 'gpt-4o-mini',
    features: ['Vision'],
    providerColor: 'black',
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    icon: Brain,
    provider: 'anthropic',
    apiIdentifier: 'claude-3-haiku-20240307',
    features: ['Vision', 'PDFs'],
    providerColor: 'orange',
  },
  {
    id: 'gemini-1.5-flash-latest',
    name: 'Gemini 1.5 Flash',
    icon: Sparkles,
    provider: 'google',
    apiIdentifier: 'gemini-1.5-flash-latest',
    features: ['Vision', 'PDFs', 'Search'],
    providerColor: 'blue',
  },
  // --- PRO MODELS ---
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    icon: Bot,
    provider: 'openai',
    apiIdentifier: 'gpt-4o',
    isPro: true,
    features: ['Vision'],
    providerColor: 'black',
  },
  {
    id: 'claude-3-5-sonnet-20240620',
    name: 'Claude 3.5 Sonnet',
    icon: Brain,
    provider: 'anthropic',
    apiIdentifier: 'claude-3-5-sonnet-20240620',
    isPro: true,
    features: ['Vision', 'PDFs', 'Reasoning'],
    providerColor: 'orange',
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    icon: Sparkles,
    provider: 'google',
    apiIdentifier: 'gemini-2.0-flash-exp',
    isPro: true,
    features: ['Vision', 'Search', 'PDFs'],
    providerColor: 'blue',
  },
]; 