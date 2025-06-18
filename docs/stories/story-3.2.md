# Story 3.1: Implement Convex HTTP Endpoint for AI SDK

## Status: Accepted

## Story

-   **As a** developer,
-   **I want to** create a secure Convex HTTP endpoint that can receive chat requests directly from the Vercel AI SDK on the frontend,
-   **so that** we have a direct, efficient, and secure communication channel between the client and our backend logic.

## Acceptance Criteria (ACs)

1.  A new file, `convex/http.ts`, must be created to handle incoming HTTP requests.
2.  An `httpRouter` must be initialized in this file.
3.  A new route must be defined to handle `POST` requests at the path `/chat`.
4.  This route must be handled by a new `httpAction`.
5.  The `httpAction` must securely authenticate the user making the request.
6.  For this initial setup, the `httpAction` will simply take the last user message from the request body and stream back a confirmation message (e.g., "Message received: [user's message]") using the `streamText` function from the `ai` package.
7.  The response must be a standard `Response` object that is compatible with the Vercel AI SDK's streaming protocol.

## Tasks / Subtasks

-   [ ] **Task 1 (AC: 1, 2):** Create the `convex/http.ts` file. Initialize the `httpRouter`: `const http = httpRouter();`.

-   [ ] **Task 2 (AC: 3, 4):** Define the `/chat` route within `convex/http.ts`.
    ```typescript
    http.route({
      path: "/chat",
      method: "POST",
      handler: httpAction(async (ctx, request) => {
        // ... handler logic
      }),
    });
    ```
    -   Finally, export the router: `export default http;`.

-   [ ] **Task 3 (AC: 5):** Implement the authentication logic inside the `httpAction` handler.
    -   Use `const identity = await ctx.auth.getUserIdentity();` to get the user's identity.
    -   If `identity` is null, throw an error or return a 401 Unauthorized response.

-   [ ] **Task 4 (AC: 6):** Implement the temporary echo logic.
    -   Parse the request body to get the messages array: `const { messages } = await request.json();`.
    -   Extract the content of the last message.
    -   Use `streamText` from the `ai` package to create a simple streaming response. The `prompt` can be the confirmation message.
    -   Return the result using `result.toAIStreamResponse()`.

## Dev Notes

*   **This is the Backend Entry Point:** This HTTP Action is now the *only* door into our backend from the frontend. It replaces the need for any API routes in the Next.js application.
*   **Authentication is Key:** The `ctx.auth.getUserIdentity()` call is critical. It ensures that only logged-in users can interact with our chat endpoint.
*   **Vercel AI SDK on the Backend:** Note that we are using `streamText` and `toAIStreamResponse` from the `ai` package *inside our Convex action*. This is how we ensure the response format is perfectly compatible with the `useChat` hook on the frontend.
*   **Next Steps:** In the following stories, we will replace the simple "echo" logic in this `httpAction` with the full LLM interaction logic, and we will refactor the frontend to call this new endpoint.