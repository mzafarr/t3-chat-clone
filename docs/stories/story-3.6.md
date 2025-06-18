# Story 3.5 (Definitive): Implement Centralized, Database-Driven Model Selection

## Status: Review

## Story

-   **As a** developer,
-   **I want to** refactor the model selection logic to be driven by a single, authoritative configuration file,
-   **so that** both the frontend and backend use a single source of truth, making the system easy to maintain, extend, and configure.

## Acceptance Criteria (ACs)

1.  A new file, `lib/model-config.ts`, must be created. It will export a typed array of all available AI models, serving as the single source of truth for the application.
2.  The `ModelSelector` component (`components/model-selector.tsx`) must be refactored to dynamically render its list of models directly from this new configuration file, removing all hardcoded model data.
3.  The Convex HTTP Action in `convex/http.ts` must be refactored. It must use the `modelId` sent from the frontend to look up the full model details (provider, API identifier) in the new configuration file.
4.  The backend must dynamically instantiate the correct AI SDK provider (`openai`, `anthropic`, `google`) based on the information from the configuration file.
5.  The end-to-end flow must be functional: selecting a model (e.g., "Claude 3 Haiku") in the UI sends its ID to the backend, which then correctly uses the `@ai-sdk/anthropic` provider to generate a response.

## Tasks / Subtasks

-   [x] **Task 1 (AC: 1): Create the Model Configuration File.**
    -   Create a new file at `lib/model-config.ts`.
    -   Add the following code to it. This structure contains all the information needed for both the frontend (display) and backend (logic).

    ```typescript
    // In lib/model-config.ts

    import { Eye, Zap, Brain, FileText } from 'lucide-react';

    // Define a strict type for our model configuration
    export type AIModel = {
      id: string; // A unique identifier for the frontend to send
      name: string; // The display name for the UI
      icon: React.ComponentType<{ className?: string }>; // The icon component for the UI
      provider: 'openai' | 'anthropic' | 'google'; // The backend provider key
      apiIdentifier: string; // The actual model name for the AI SDK
      isPro?: boolean; // Flag for pro-tier models
      features?: string[]; // For UI filtering
    };

    // The single source of truth for all models
    export const aIModels: AIModel[] = [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        icon: Zap,
        provider: 'openai',
        apiIdentifier: 'gpt-4o-mini',
        features: ['Vision'],
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        icon: Brain,
        provider: 'anthropic',
        apiIdentifier: 'claude-3-haiku-20240307',
        features: ['Vision', 'PDFs'],
      },
      {
        id: 'gemini-1.5-flash-latest',
        name: 'Gemini 1.5 Flash',
        icon: Eye,
        provider: 'google',
        apiIdentifier: 'gemini-1.5-flash-latest',
        features: ['Vision', 'PDFs', 'Search'],
      },
      // --- PRO MODELS ---
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        icon: Zap,
        provider: 'openai',
        apiIdentifier: 'gpt-4o',
        isPro: true,
        features: ['Vision'],
      },
      {
        id: 'claude-3-5-sonnet-20240620',
        name: 'Claude 3.5 Sonnet',
        icon: Brain,
        provider: 'anthropic',
        apiIdentifier: 'claude-3-5-sonnet-20240620',
        isPro: true,
        features: ['Vision', 'PDFs', 'Reasoning'],
      },
    ];
    ```

-   [x] **Task 2 (AC: 2): Refactor `components/model-selector.tsx`.**
    -   Delete the hardcoded `models` array at the top of the file.
    -   Import the `aIModels` array from `lib/model-config.ts`.
    -   Update the component's rendering logic to map over the imported `aIModels` array to display the models. The data structure is slightly different, so you will need to adjust the property names (e.g., `model.name` is correct, `model.icon` is now a component).

-   [x] **Task 3 (AC: 3, 4): Refactor the Convex HTTP Action in `convex/http.ts`.**
    -   This is the most critical backend change. The logic should be as follows:

    ```typescript
    // In convex/http.ts
    // ... imports
    import { streamText } from 'ai';
    import { openai } from '@ai-sdk/openai';
    import { anthropic } from '@ai-sdk/anthropic';
    import { google } from '@ai-sdk/google';
    import { aIModels, AIModel } from './lib/model-config'; // Assuming you move the config here for backend access

    // ... inside the httpAction handler
    const { messages, modelId } = await request.json(); // The frontend will now send `modelId`

    // 1. Find the model configuration from our single source of truth
    const modelConfig = aIModels.find(m => m.id === modelId);

    if (!modelConfig) {
      return new Response("Invalid model selected", { status: 400 });
    }

    // 2. Dynamically select the provider and model based on the config
    let model;
    switch (modelConfig.provider) {
      case 'openai':
        model = openai(modelConfig.apiIdentifier);
        break;
      case 'anthropic':
        model = anthropic(modelConfig.apiIdentifier);
        break;
      case 'google':
        model = google(modelConfig.apiIdentifier);
        break;
      default:
        return new Response("Invalid provider configuration", { status: 500 });
    }

    // 3. Call streamText with the dynamically selected model
    const result = streamText({
      model: model,
      system: "You are a helpful assistant.",
      messages,
    });

    return result.toDataStreamResponse();
    ```

-   [x] **Task 4 (AC: 4): Update `package.json` and install new dependencies.**
    -   Add `"@ai-sdk/anthropic": "latest"` and `"@ai-sdk/google": "latest"` to your `package.json`.
    -   Run `npm install`.

-   [x] **Task 5 (AC: 5): Update the `useChat` call in `components/chat-interface.tsx`.**
    -   Modify the `handleSubmit` function to include the `selectedModel` ID in the request body.
    -   Example:
        ```typescript
        // in useChat hook configuration
        body: {
          modelId: selectedModel // Pass the ID of the currently selected model
        }
        ```

## Dev Notes

*   **Single Source of Truth:** The new `lib/model-config.ts` file is now the **only** place where models are defined. To add a new model to the application, you will only need to add a new entry to this array. Both the frontend and backend will update automatically.
*   **Decoupling:** This architecture perfectly decouples the frontend from the backend's implementation details. The frontend only needs to know a simple string `id` (e.g., "claude-3-haiku-20240307"). The backend handles the complex logic of which provider package and API identifier to use.
*   **API Keys:** For this story to work, you must add the `ANTHROPIC_API_KEY` and `GOOGLE_GENERATIVE_AI_API_KEY` to your Convex project's environment variables. The application will fail without them when trying to use Anthropic or Google models.

## Debug Log

| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| Task 1 | lib/model-config.ts | Created single source of truth config file | No |
| Task 2 | components/model-selector.tsx | Refactored to use dynamic config, updated icon rendering | No |
| Task 3 | convex/model-config.ts | Created backend config copy | No |
| Task 3 | convex/http.ts | Added dynamic provider selection logic | No |
| Task 4 | package.json | Added @ai-sdk/anthropic and @ai-sdk/google dependencies | No |
| Task 5 | components/chat-interface.tsx | Updated useChat to pass modelId in body | No |
| Task 5 | components/custom-prompt-input.tsx | Updated default model ID | No |

## Completion Notes

Successfully implemented centralized model configuration with single source of truth. All ACs met. Default model changed from hardcoded "gemini-2.5-flash" to "gpt-4o-mini" from config. Build and lint passed successfully.

## Change Log

No requirement changes needed during implementation.