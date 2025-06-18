# T3.chat Superior - Official Coding Standards

This document contains the mandatory coding standards for the T3.chat Superior project. All code, whether written by humans or AI agents, MUST adhere to these rules. These standards are derived from the master architecture document and are non-negotiable.

## 1. General Principles

*   **Language:** The entire codebase (frontend and backend) will be written in **TypeScript**.
*   **Linter/Formatter:** The project will use the existing **ESLint** and **Prettier** configurations. All code must pass linting and formatting checks before being committed.
*   **Immutability:** State must never be mutated directly. Always use the appropriate state-setting functions or create new objects/arrays.

## 2. Frontend (Next.js / React)

*   **Component Definition:** All React components MUST be functional components using Hooks. Class components are forbidden.
*   **State Management:**
    *   For local UI state, use `useState` or `useReducer`.
    *   For all server-side state and chat interactions, the **`useChat` hook from `@ai-sdk/react` is the single source of truth.** Direct calls to `useQuery` or `useMutation` for chat functionality are disallowed.
*   **Styling:** All styling must be done using **Tailwind CSS** and the components from the **ShadCN/UI** library. Do not introduce custom CSS files unless absolutely necessary for a complex, unique component.
*   **File Naming:**
    *   Components: `PascalCase.tsx` (e.g., `ChatSidebar.tsx`)
    *   Pages/Routes: `page.tsx` within a folder (e.g., `app/chat/page.tsx`)

## 3. Backend (Convex)

*   **Security Model (Zero-Trust):** All business logic, authorization, credit checks, and external API calls **MUST** reside within Convex `actions` or `internalMutations`. The frontend is considered an untrusted client.
*   **API Layer:** The public-facing API for the frontend will be exposed exclusively through **Convex HTTP Actions** defined in `convex/http.ts`.
*   **Function Definitions:**
    *   Use `internalQuery`, `internalMutation`, and `internalAction` for all functions that should not be exposed to the public API.
    *   All functions MUST have explicit argument and return type validators using `v from "convex/values"`. If a function does not return a value, it must be typed as `returns: v.null()`.
*   **Database Access:** Do not use `ctx.db` directly within an `action`. Actions must call queries or mutations to interact with the database.

## 4. AI SDK Integration

*   **Primary Hook:** The `useChat` hook is the designated method for all frontend-to-backend chat communication.
*   **Backend Entrypoint:** The `useChat` hook will be configured to call our main Convex HTTP Action.
*   **Middleware:** The Language Model Middleware feature of the Vercel AI SDK should be used within the core Convex `action` to handle logic like model selection, RAG, or logging.