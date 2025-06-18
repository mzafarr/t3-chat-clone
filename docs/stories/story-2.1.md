# Story 2.1: Implement Live Chat History Sidebar

## Status: Review

## Story

-   **As a** user,
-   **I want to** see my list of previous chat conversations, create new ones, and delete them from the sidebar,
-   **so that** I can effectively manage and navigate my chat history.

## Acceptance Criteria (ACs)

1.  The chat sidebar must fetch and display the list of conversations for the currently logged-in user from the Convex database.
2.  The "New Chat" button, when clicked, must trigger the `createConversation` mutation in Convex, and the new chat must immediately appear at the top of the list.
3.  The list of conversations must be sorted with the most recent ones appearing first.
4.  The "Delete" option in the dropdown menu for a thread must trigger the `deleteConversation` mutation and remove the thread from the UI upon success.
5.  If the user has no conversations, the sidebar should display a "No threads found" message instead of an empty list.
6.  While the initial list of conversations is loading, the sidebar should display a loading state (e.g., skeletons).

## Tasks / Subtasks

-   [x] **Task 1 (AC: 1, 6):** Refactor the `ChatSidebar` component in `components/chat-sidebar.tsx`.
    -   Remove the hardcoded `threads` state that is currently being passed in as a prop from `app/chat/page.tsx`.
    -   Inside `ChatSidebar`, import `useQuery` from `convex/react` and `api` from `convex/_generated/api`.
    -   Use the `useQuery(api.chat.listConversations)` hook to fetch the user's conversations. Handle the initial loading state where the query result is `undefined`.

-   [x] **Task 2 (AC: 2):** Wire up the "New Chat" functionality.
    -   Inside `ChatSidebar`, import `useMutation` from `convex/react`.
    -   Create a mutation handler using `const createConversation = useMutation(api.chat.createConversation);`.
    -   Update the `onNewChat` button's `onClick` handler to call `createConversation()`.

-   [x] **Task 3 (AC: 4):** Wire up the "Delete" functionality.
    -   Create a mutation handler for deleting conversations: `const deleteConversation = useMutation(api.chat.deleteConversation);`.
    -   In the `ThreadItem`'s dropdown menu, call `deleteConversation({ conversationId: thread._id })` when the "Delete" item is clicked.

-   [x] **Task 4 (AC: 1, 5):** Refactor the main chat page (`app/chat/page.tsx`).
    -   Remove the `threads` state and the `handleThreadAction` logic, as this is now managed within the `ChatSidebar` component itself.
    -   The `ChatSidebar` component will now be self-sufficient for managing the conversation list.

## Dev Notes

*   **Existing Backend Functions:** The necessary Convex functions (`listConversations`, `createConversation`, `deleteConversation`) are already defined in `convex/chat.ts` and are ready to be used.
*   **Component Refactoring:** The primary work in this story is to move state management *out* of `app/chat/page.tsx` and *into* `components/chat-sidebar.tsx`, replacing the mock `useState` with live data hooks from Convex.
*   **Data Flow:** The sidebar will now manage its own data fetching. The main page (`ChatInterface`) will receive the `activeThreadId` from the sidebar to know which conversation's messages to display (which we will implement in the next story).

## Debug Log

| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| Schema Update | convex/schema.ts | Added conversations table and updated messages table | No |
| Package Install | package.json | Added openai dependency | No |

## Completion Notes

Successfully implemented live chat history sidebar with:
- ✅ Convex query integration for fetching conversations
- ✅ Loading states with skeleton components
- ✅ Create new conversation functionality
- ✅ Delete conversation functionality
- ✅ Proper error handling
- ✅ Schema updates to support conversations table
- ✅ Removed hardcoded state from main chat page

## Change Log

No requirement changes during implementation.