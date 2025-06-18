# Story 2.3: Implement Send Message Functionality

## Status: Review

## Story

-   **As a** user,
-   **I want to** type a message into the input box and click send,
-   **so that** my new message is saved to the current conversation and appears in the chat history.

## Acceptance Criteria (ACs)

1.  When the user types in the `PromptInputBox` and clicks the send button (or presses Enter), the `sendMessage` mutation must be called on the Convex backend.
2.  The mutation must be called with the correct `conversationId` (from the `activeThreadId` prop) and the `text` content from the input box.
3.  After the message is successfully sent to the backend, the text in the input box must be cleared automatically.
4.  The newly sent message must appear in the chat window almost instantly. (This should happen automatically due to Convex's real-time updates from the `useQuery` hook).
5.  The send button in the `PromptInputBox` should be disabled if the input field is empty.

## Tasks / Subtasks

-   [x] **Task 1 (AC: 1, 2):** In `components/chat-interface.tsx`, import `useMutation` from `convex/react` and initialize the `sendMessage` mutation handler: `const sendMessage = useMutation(api.chat.sendMessage);`.

-   [x] **Task 2 (AC: 1, 2):** Implement the `handleSendMessage` function that is passed as the `onSendMessage` prop to the `<PromptInputBox />`. This function will receive the `content` (text) from the input.

-   [x] **Task 3 (AC: 2):** Inside `handleSendMessage`, call the `sendMessage` mutation with the required arguments. The `conversationId` will come from the `activeThreadId` prop.

-   [x] **Task 4 (AC: 3):** The `PromptInputBox` component already clears its own input after sending. Ensure the state logic in `ChatInterface` supports this. (No code change may be needed here, just verification).

-   [x] **Task 5 (AC: 5):** Verify that the `PromptInputBox` correctly disables the send button when the input is empty. This is part of the existing component's logic (`hasContent` variable).

## Dev Notes

*   **Backend is Ready:** The `sendMessage` mutation is already defined in `convex/chat.ts`. No backend code changes are required for this story.
*   **Real-Time Magic:** Remember that you do **not** need to manually add the new message to the local `messages` state. The `useQuery` hook for `listMessages` will automatically update when the new message is inserted into the database, causing the UI to re-render with the new message. The primary task is to simply call the mutation.
*   **Key File to Modify:** The vast majority of the work will be done within `components/chat-interface.tsx`.

---

## Dev Agent Record

### Debug Log
| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| No temporary changes required | - | - | - |

### Completion Notes
Implementation completed as specified. No deviations from requirements.

### Change Log
No requirement changes during implementation.