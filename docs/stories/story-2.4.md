# Story 2.4: Implement Advanced Syntax Highlighting

## Status: Review

## Story

-   **As a** user,
-   **I want to** see code blocks in the chat rendered with language-appropriate syntax highlighting,
-   **so that** code snippets are easy to read, understand, and copy.

## Acceptance Criteria (ACs)

1.  Markdown code fences (e.g., ` ```typescript ... ``` `) in assistant messages must be identified and rendered as distinct code blocks.
2.  The `react-markdown` and `react-syntax-highlighter` libraries must be used to render these code blocks.
3.  The syntax highlighting theme should be aesthetically pleasing and match the application's overall dark/light mode theme. A good default theme like `atomOneDark` is recommended.
4.  The programming language specified in the markdown fence (e.g., `typescript`) must be used to apply the correct language-specific highlighting.
5.  There must be a "Copy" button on each rendered code block that copies the raw code to the user's clipboard.

## Tasks / Subtasks

-   [x] **Task 1 (AC: 2):** Add the necessary dependencies to `package.json`: `react-markdown`, `react-syntax-highlighter`, and their corresponding type definitions (`@types/react-syntax-highlighter`). Run `npm install`.

-   [x] **Task 2 (AC: 1, 3, 4):** Refactor the message rendering logic within `components/chat-interface.tsx`.
    -   Instead of rendering `message.content` directly as a string, pass it to the `<ReactMarkdown />` component.
    -   Provide a custom component renderer to the `ReactMarkdown` component for the `code` element.

-   [x] **Task 3 (AC: 1, 3, 4):** Implement the custom code block component.
    -   This component will receive props from `react-markdown`, including the `language` and the `children` (the code string).
    -   Inside this component, use the `<SyntaxHighlighter />` component from `react-syntax-highlighter`.
    -   Pass the detected `language` to the highlighter.
    -   Select and apply a suitable theme, such as `atomOneDark` from `react-syntax-highlighter/dist/esm/styles/hljs`.

-   [x] **Task 4 (AC: 5):** Add a "Copy" button to the custom code block component.
    -   Position the button in the top-right corner of the code block.
    -   Implement the `onClick` handler to use the `navigator.clipboard.api` to copy the code string to the clipboard.
    -   Provide visual feedback to the user upon a successful copy (e.g., changing the button's icon or showing a temporary "Copied!" message).

## Dev Notes

*   **Key Libraries:** This story revolves around the correct implementation of `react-markdown` and `react-syntax-highlighter`. Their documentation will be a key resource.
*   **Component Composition:** The most elegant way to solve this is by creating a new, small component (e.g., `CodeBlock.tsx`) that handles the syntax highlighting and copy logic, and then passing this component to `react-markdown`'s `components` prop.
*   **Styling:** Ensure the background color and font of the `SyntaxHighlighter` component match the overall application theme for a seamless look.

## Dev Agent Record

### Debug Log
| Task | File | Change | Reverted? |
|------|------|---------|-----------|
| Task 1 | package.json | Added react-markdown, react-syntax-highlighter dependencies | No |
| Task 3 | components/code-block.tsx | Created CodeBlock component with syntax highlighting | No |
| Task 2 | components/chat-interface.tsx | Integrated ReactMarkdown with CodeBlock component | No |

### Completion Notes
- All tasks completed successfully
- Used Prism syntax highlighter with theme switching based on dark/light mode
- Copy functionality includes visual feedback with check icon
- Applied proper TypeScript types and error handling

### Change Log
No requirement changes needed.