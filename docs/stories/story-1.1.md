# Story 1.1: Finalize Monorepo Setup & Integrate Auth Provider

## Status: Review

## Story

-   **As a** developer,
-   **I want to** finalize the project setup by merging dependencies and integrating the Convex Auth Provider into the Next.js application,
-   **so that** the frontend can securely connect to the Convex backend and a user can successfully sign in.

## Acceptance Criteria (ACs)

1.  The root `package.json` must be updated to include all necessary dependencies from both the original `t3-chat-dashboard` and `convex-chef-main` projects, specifically `convex` and `@convex-dev/auth`.
2.  The `app/layout.tsx` file must be wrapped with the `ConvexClientProvider` to make the Convex client available to the entire application.
3.  When a user navigates to the `/sign-in` page, the `SignInForm` should render correctly and allow them to sign in or sign up using the Convex backend.
4.  Upon successful sign-in, the user must be redirected to the main dashboard page (`/`).
5.  On the main dashboard page, the user's actual email address (fetched from the authenticated Convex session) must be displayed in the sidebar, replacing the hardcoded "mzafar611@gmail.com".

## Tasks / Subtasks

-   [x] **Task 1 (AC: 1):** Modify the root `/package.json` file. Add the `"convex": "1.12.0"` and `"@convex-dev/auth": "^0.0.87"` dependencies.
-   [x] **Task 2 (AC: 1):** Run `npm install` to install the newly added dependencies.
-   [x] **Task 3 (AC: 2):** Create a new file `app/ConvexClientProvider.tsx` to encapsulate the Convex client setup and provider logic, keeping the root layout clean.
-   [x] **Task 4 (AC: 2):** Modify `app/layout.tsx` to import and use the new `ConvexClientProvider` to wrap its children.
-   [x] **Task 5 (AC: 5):** Modify the sidebar component in `app/page.tsx` to use the `useQuery(api.auth.loggedInUser)` hook to fetch and display the currently authenticated user's email and name.

## Dev Notes

*   **Environment Variable:** The `ConvexClientProvider` will require the Convex deployment URL. Ensure the `.env.local` file contains the `NEXT_PUBLIC_CONVEX_URL` variable pointing to your Convex project.
*   **Key Files to Modify:**
    *   `/package.json`
    *   `/app/layout.tsx`
    *   `/app/page.tsx` (specifically the `renderSidebar` function)
*   **Reference:** The `convex/auth.ts` file already exports the `loggedInUser` query needed for Task 5.

## Dev Agent Record

### Debug Log
| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| 5 | app/page.tsx | Fixed sign-in page missing default export | No |

### Completion Notes
- Dependencies were already present in package.json (✅)
- ConvexClientProvider successfully created with proper client and auth setup
- Layout.tsx properly wrapped with providers in correct order  
- Sidebar now uses authenticated user data from Convex Auth
- Fixed sign-in page missing default export causing build errors
- All builds pass successfully

### Change Log
None - all requirements implemented as specified.