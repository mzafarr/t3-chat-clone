# Story 2.5: Implement Automatic Conversation Naming

## Status: InProgress

## Story

-   **As a** user,
-   **I want** my new conversations to be automatically named based on my first message,
-   **so that** I don't have to manually name every chat and can easily find them later.

## Acceptance Criteria (ACs)

1.  When a user sends the *first* message in a new conversation (a conversation currently named "New Chat"), a backend process must be triggered to rename it.
2.  The `sendMessage` mutation in Convex must be modified to detect if it's the first message in a conversation.
3.  If it is the first message, `sendMessage` must schedule a new internal action, `chat:renameConversation`, to run immediately.
4.  The `renameConversation` action will take the user's first message, send it to the LLM with a prompt asking for a short, descriptive title (e.g., "Summarize this in 5 words or less"), and use the LLM's response to update the conversation's `name` field in the database.
5.  The sidebar UI must update automatically to show the new title once the database is updated.

## Tasks / Subtasks

-   [x] **Task 1 (AC: 2):** Modify the `sendMessage` mutation in `convex/chat.ts`.
    -   Add logic to fetch the conversation document.
    -   Check if the conversation's `name` is still the default "New Chat".
    -   If it is, schedule the new internal action `internal.chat.renameConversation` to run, passing the `conversationId` and the user's message `text` as arguments.

-   [x] **Task 2 (AC: 3, 4):** Create a new `internalAction` named `renameConversation` in `convex/chat.ts`.
    -   This action will accept `conversationId` and `firstMessage` as arguments.
    -   It will call the OpenAI API with a system prompt like: "You are an expert at creating concise conversation titles. Based on the following user message, generate a title that is 5 words or less."
    -   It will then call an internal mutation to update the conversation's name.

-   [x] **Task 3 (AC: 4):** Create a new `internalMutation` named `updateConversationName` in `convex/chat.ts`.
    -   This mutation will accept `conversationId` and `newName` as arguments.
    -   It will use `ctx.db.patch()` to update the `name` field of the specified conversation document.

-   [x] **Task 4 (AC: 5):** Verify the UI updates.
    -   Since the `ChatSidebar`'s `useQuery(api.chat.listConversations)` is already subscribed to the data, no frontend code changes should be necessary. The title should update automatically when the database record changes.

## Dev Notes

*   **Separation of Concerns:** The renaming logic is intentionally placed in a separate `internalAction` so it doesn't slow down the `sendMessage` mutation. The user's message appears instantly, and the title update happens in the background a moment later.
*   **API Usage:** The `renameConversation` action will need to make a separate, non-streaming call to the OpenAI API.
*   **Concise Prompting:** The key to a good result is a very specific system prompt for the title generation, as described in Task 2.

## Dev Agent Record

### Completion Notes
- All tasks completed successfully with no deviations from requirements
- Used gpt-4o-mini model for title generation for cost efficiency  
- Added error handling to silently fail if title generation fails
- Functions compiled and deployed successfully to Convex

### Change Log  
None required - implementation followed story requirements exactly

### Debug Log
| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| - | - | - | - |