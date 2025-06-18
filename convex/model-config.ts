// Backend version of model configuration for Convex functions
export type AIModel = {
  id: string; // A unique identifier for the frontend to send
  name: string; // The display name for the UI
  provider: 'openai' | 'anthropic' | 'google'; // The backend provider key
  apiIdentifier: string; // The actual model name for the AI SDK
  isPro?: boolean; // Flag for pro-tier models
  features?: string[]; // For UI filtering
};

// The single source of truth for all models (backend version)
export const aIModels: AIModel[] = [
  // --- FREE MODELS (FAVORITES) ---
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    apiIdentifier: 'gpt-4o-mini',
    features: ['Vision'],
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    apiIdentifier: 'claude-3-haiku-20240307',
    features: ['Vision', 'PDFs'],
  },
  {
    id: 'gemini-1.5-flash-latest',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    apiIdentifier: 'gemini-1.5-flash-latest',
    features: ['Vision', 'PDFs', 'Search'],
  },
  // --- PRO MODELS ---
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    apiIdentifier: 'gpt-4o',
    isPro: true,
    features: ['Vision'],
  },
  {
    id: 'claude-3-5-sonnet-20240620',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    apiIdentifier: 'claude-3-5-sonnet-20240620',
    isPro: true,
    features: ['Vision', 'PDFs', 'Reasoning'],
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    apiIdentifier: 'gemini-2.0-flash-exp',
    isPro: true,
    features: ['Vision', 'Search', 'PDFs'],
  },
]; 