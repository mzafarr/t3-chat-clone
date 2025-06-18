# Story 2.2: Display Live Messages for Selected Chat

## Status: Complete

## Story

-   **As a** user,
-   **I want to** see the message history for a selected conversation when I click on it in the sidebar,
-   **so that** I can read and continue my past discussions.

## Acceptance Criteria (ACs)

1.  When a conversation is selected in the `ChatSidebar`, the `ChatInterface` component must display all messages associated with that `activeThreadId`.
2.  The messages must be fetched from the Convex backend using the `useQuery(api.chat.listMessages, { conversationId: activeThreadId })` hook.
3.  The `ChatInterface` must correctly handle the case where `activeThreadId` is `undefined` (no chat selected), displaying the initial welcome screen.
4.  The displayed messages must be rendered correctly, distinguishing between the 'user' and 'assistant' roles using the data from the database.
5.  While messages are loading for a newly selected chat, an appropriate loading state (e.g., skeletons) should be displayed within the `ChatInterface`.

## Tasks / Subtasks

-   [x] **Task 1 (AC: 1):** Modify the parent component, `app/chat/page.tsx`, to pass the `activeThreadId` state down to the `<ChatInterface />` component as a prop.

-   [x] **Task 2 (AC: 2, 5):** Refactor `components/chat-interface.tsx` to fetch its own data.
    -   It should now accept an `activeThreadId?: string` prop.
    -   Remove the `messages` prop.
    -   Import `useQuery` from `convex/react` and `api` from `convex/_generated/api`.
    -   Use the `useQuery` hook to fetch messages: `const messages = useQuery(api.chat.listMessages, activeThreadId ? { conversationId: activeThreadId } : "skip");`. The `"skip"` parameter prevents the query from running if no `activeThreadId` is provided.
    -   Handle the loading state when `messages` is `undefined`.

-   [x] **Task 3 (AC: 3, 4):** Update the rendering logic in `components/chat-interface.tsx`.
    -   If `activeThreadId` is not present, render the initial welcome screen (the "How can I help you, Muhammad?" view).
    -   If `activeThreadId` is present but `messages` are still loading, render a loading indicator.
    -   Once `messages` are loaded, map over them and render each message, ensuring the `role` and `content` are correctly displayed from the database record.

-   [x] **Task 4 (Cleanup):** In `app/chat/page.tsx`, remove the logic that was previously passing the mock `messages` array to `<ChatInterface />`. The parent component's main responsibility is now just to manage and pass down the `activeThreadId`.

## Dev Notes

*   **Architectural Shift:** This story makes the `ChatInterface` component "smart." Instead of just receiving messages as a prop, it is now responsible for fetching its own data based on the ID it receives.
*   **Conditional Query:** Using `"skip"` in the `useQuery` hook is the standard Convex pattern for disabling a query until its arguments are ready. This is crucial for preventing errors when no chat is selected.
*   **Existing Backend Function:** The `listMessages` query is already defined in `convex/chat.ts` and is ready for use.

## Dev Agent Record

### Debug Log
| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| N/A | N/A | N/A | N/A |

### Completion Notes
All tasks completed successfully. Message structure adapted from `role/content/id` to `author/text/_id` to match Convex schema.

### Change Log
No requirement changes needed - implementation followed story exactly.