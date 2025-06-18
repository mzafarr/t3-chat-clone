# Story 2.6 (Corrected): Implement Full AI SDK Logic in Convex HTTP Action

## Status: Draft

## Story

-   **As a** developer,
-   **I want to** implement the complete, production-grade AI logic within the Convex HTTP endpoint using the Vercel AI SDK's `streamText` function,
-   **so that** the application can handle real user conversations, stream responses from a powerful LLM, and fully realize the core of the product.

## Acceptance Criteria (ACs)

1.  The `httpAction` handler in `convex/http.ts` must be completely refactored to remove the placeholder "echo" logic.
2.  The handler must import `streamText` from `ai` and a model provider, such as `openai` from `@ai-sdk/openai`.
3.  The handler must correctly call `streamText`, passing it the specified model (e.g., `openai('gpt-4o-mini')`) and the full `messages` history from the request.
4.  The `streamText` result must be correctly converted into a streaming `Response` object using **`result.toDataStreamResponse()`** and returned from the HTTP action.
5.  The frontend, already connected via Story 3.2, must now receive a live, streaming, AI-generated response from the selected LLM when a message is sent.
6.  The implementation must include a basic system prompt, such as "You are a helpful assistant," passed to `streamText` to guide the AI's behavior.

## Tasks / Subtasks

-   [ ] **Task 1 (AC: 2):** Modify `convex/http.ts`. Import the necessary functions and providers: `streamText` from `ai` and `openai` from `@ai-sdk/openai`.

-   [ ] **Task 2 (AC: 1, 3):** Refactor the handler logic within the `/chat` httpAction.
    -   Implement the `streamText` call.
    -   Instantiate the model: `const model = openai('gpt-4o-mini');`
    -   Call `streamText` with the `model`, `system` prompt, and the `messages` array from the request body.
    -   ```typescript
        const result = streamText({
          model: openai('gpt-4o-mini'),
          system: "You are a helpful assistant.",
          messages,
        });
        ```

-   [ ] **Task 3 (AC: 4):** Return the streaming response using the correct function. The final line of the handler **MUST** be `return result.toDataStreamResponse();`. This ensures compatibility with the `useChat` hook.

-   [ ] **Task 4 (AC: 5):** Verify the end-to-end functionality.
    -   Run the application.
    -   Send a message from the chat interface.
    -   Confirm that a real, streaming response from the GPT-4o-mini model is rendered in the UI.

## Dev Notes

*   **This is the Core Logic:** This story implements the heart of the AI interaction. The `convex/http.ts` file becomes the central point for all LLM communication.
*   **Response Function:** The use of `toDataStreamResponse()` is critical and non-negotiable. It is the function specified by the Vercel AI SDK documentation for creating the data-rich stream that the `useChat` hook expects.
*   **Environment Variable:** This implementation is critically dependent on the `OPENAI_API_KEY` being set as an environment variable in your Convex deployment settings.
*   **No Frontend Changes:** No modifications are needed on the frontend for this story.