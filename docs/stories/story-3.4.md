# Story 3.4: Implement Dynamic Routing, Auto-Scrolling, and New Chat Flow

## Status: Review

## Story

-   **As a** user,
-   **I want** each chat to have a unique, shareable URL, for the chat to automatically scroll to the latest message, and for my first message in a new chat to appear correctly,
-   **so that** the application feels modern, intuitive, and bug-free.

## Acceptance Criteria (ACs)

1.  **Dynamic Routing:** The chat page URL must now include the conversation ID, following the pattern `/chat/[conversationId]`.
2.  **URL Navigation:** Navigating directly to a `/chat/[conversationId]` URL must load that specific conversation.
3.  **New Chat Flow:** When the "New Chat" button is clicked, a new conversation must be created, and the user must be redirected to the new URL (e.g., `/chat/newly-created-id`).
4.  **First Message Fix:** When sending the first message in a newly created chat, the UI must update correctly to show the user's message and the subsequent AI response.
5.  **Auto-Scrolling:** The message container in `ChatInterface` must automatically scroll to the bottom whenever new messages are added.
6.  **Auto-Scroll on Chat Switch:** When switching between different conversations in the sidebar, the message view must scroll to the bottom to show the latest messages of that thread.

## Tasks / Subtasks

-   [x] **Task 1 (AC: 1):** Restructure the `app/chat` directory to support dynamic routing.
    -   Rename `app/chat/page.tsx` to `app/chat/[conversationId]/page.tsx`.
    -   Create a new `app/chat/page.tsx` that will handle the case where no conversation is selected. This page should simply redirect to the first available chat or prompt the user to start a new one.

-   [x] **Task 2 (AC: 2, 3):** Update the `ChatSidebar` component (`components/chat-sidebar.tsx`).
    -   Import `useRouter` from `next/navigation`.
    -   Modify the `onThreadSelect` handler to use `router.push(`/chat/${threadId}`)` instead of just setting local state.
    -   Modify the `handleNewChat` function to first await the `createConversation` mutation, get the new `conversationId`, and then immediately call `router.push(`/chat/${conversationId}`)`.

-   [x] **Task 3 (AC: 4):** Refactor the main chat page (`app/chat/[conversationId]/page.tsx`).
    -   This component will now receive `params: { conversationId: string }` as a prop from Next.js.
    -   The `activeThreadId` will now be derived directly from `params.conversationId`.
    -   Pass this `activeThreadId` to both the `ChatSidebar` (so it can highlight the correct item) and the `ChatInterface`. This centralizes the state management and fixes the bug where the `ChatInterface` didn't know which conversation to update.

-   [x] **Task 4 (AC: 5, 6):** Implement auto-scrolling in `components/chat-interface.tsx`.
    -   Create a `ref` for the message container div (e.g., `messagesEndRef = useRef<null | HTMLDivElement>(null)`).
    -   Create a `useEffect` hook that triggers whenever the `messages` array changes.
    -   Inside the `useEffect`, call `messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })`.
    -   Place an empty `div` with this `ref` at the very end of the messages list to act as the scroll target.

## Dev Notes

*   **State Unification:** The core of this fix is unifying the "active chat" state. By driving it from the URL (`params.conversationId`), all components (`ChatSidebar`, `ChatInterface`) will now be in sync, which resolves the "first message" bug.
*   **Next.js Routing:** This task leverages standard Next.js dynamic routing. The file system change is the key to enabling this feature.
*   **Scrolling Implementation:** The `useEffect` hook combined with a `ref` at the bottom of the list is a standard and reliable pattern for implementing auto-scroll in React applications.

## Debug Log

| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| Task 1 | app/chat/page.tsx | Fixed empty file - implemented proper fallback page with redirect logic | No |

## Completion Notes

All tasks completed successfully. Dynamic routing implemented with proper URL-based state management.

## Change Log

No requirement changes needed.