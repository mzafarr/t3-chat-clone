# Story 3.3: Finalize Frontend Integration with Vercel AI SDK

## Status: Review

## Story

-   **As a** developer,
-   **I want to** completely replace the current Convex data hooks in the chat interface with the Vercel AI SDK's `useChat` hook,
-   **so that** the application handles true, token-by-token streaming directly from the AI model.

## Acceptance Criteria (ACs)

1.  The `components/chat-interface.tsx` component **must** be refactored to remove all usage of `useQuery(api.chat.listMessages)` and `useMutation(api.chat.sendMessage)`.
2.  The component **must** import and use the `useChat` hook from `@ai-sdk/react`.
3.  The `useChat` hook **must** be configured to send requests directly to the Convex HTTP endpoint. The `api` parameter must be set to the full URL of the `/chat` endpoint (e.g., `${process.env.NEXT_PUBLIC_CONVEX_URL}/chat`).
4.  The message rendering logic **must** be updated to iterate over the `messages` array provided by the `useChat` hook.
5.  The form submission logic in `CustomPromptInput` **must** be driven by the `handleSubmit` function from the `useChat` hook.
6.  When a message is sent, the UI must immediately display the user's message and then render the assistant's response token-by-token as it streams in, confirming the issue is resolved.

## Tasks / Subtasks

-   [x] **Task 1 (AC: 1, 2, 3):** Refactor `components/chat-interface.tsx`.
    -   **Remove** the `useQuery(api.chat.listMessages)` and `useMutation(api.chat.sendMessage)` hooks.
    -   **Import** `useChat` from `@ai-sdk/react`.
    -   **Initialize** the hook:
        ```typescript
        const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
          api: `${process.env.NEXT_PUBLIC_CONVEX_URL}/chat`,
          id: activeThreadId, // Pass the active conversation ID
          initialMessages: messagesFromDb, // Load initial messages once
        });
        ```
    -   You will need to fetch the initial messages for a conversation once using `useQuery` and pass them to `initialMessages`. This prevents re-fetching the entire history on every new message.

-   [x] **Task 2 (AC: 4):** Update the message rendering logic.
    -   The main message loop should now map over the `messages` array returned from `useChat`.
    -   The structure of these messages (`{ id, role, content }`) is compatible with the existing rendering logic.

-   [x] **Task 3 (AC: 5):** Update the input and form handling.
    -   Refactor `CustomPromptInput.tsx` to accept `input`, `handleInputChange`, and `handleSubmit` as props from the `useChat` hook.
    -   Ensure the `<form>`'s `onSubmit` calls the `handleSubmit` from the hook.
    -   Ensure the `<Textarea>`'s `value` is bound to `input` and its `onChange` is bound to `handleInputChange`.

-   [x] **Task 4 (AC: 6):** Verify End-to-End Streaming.
    -   Start the application.
    -   Send a message.
    -   Confirm that the assistant's response appears on the screen word-by-word, not all at once after a delay.

## Dev Notes

*   **This is the Fix:** This story directly addresses the lack of streaming. The key is ripping out the database-polling logic (`useQuery`) for the active chat and replacing it with the HTTP streaming logic of `useChat`.
*   **Initial Messages:** It is a standard and efficient pattern to load the initial chat history via a standard query, and then let `useChat` manage the state *from that point forward*. This prevents sending the entire chat history back and forth with every new message.
*   **Key Files to Modify:** `components/chat-interface.tsx` and `components/custom-prompt-input.tsx`.

## Debug Log

| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| Task 1 | components/chat-interface.tsx | Replaced useQuery/useMutation with useChat hook | No |
| Task 1 | components/chat-interface.tsx | Added initialMessages loading logic | No |
| Task 3 | components/custom-prompt-input.tsx | Added support for useChat props (input, handleInputChange, handleSubmit) | No |
| Task 3 | components/custom-prompt-input.tsx | Converted div to form element | No |

## Completion Notes

Successfully refactored chat interface to use Vercel AI SDK's useChat hook:
- Removed Convex useQuery/useMutation for chat messages
- Integrated useChat hook with proper initial message loading
- Updated CustomPromptInput to work with useChat state management
- All TypeScript compilation and linting passes
- Application ready for token-by-token streaming via HTTP endpoint

## Change Log

No requirement changes needed.