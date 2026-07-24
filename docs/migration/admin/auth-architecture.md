# Authentication & Authorization Architecture

## Current Flow
- **JWT Handling:** Token is generated via backend and managed either as an HTTP-only cookie (implied by `withCredentials: true`) and a `userId` in `localStorage`.
- **State:** Redux stores `isAdmin` and `role`.
- **Route Protection:** Handled strictly via client-side wrapper components guarding React Router paths.

## Next.js 15 Target Recommendation

### **Option C: Backend Session Validation (Recommended)**
**Why?** 
1. The backend is an existing Express Modular Monolith. `NextAuth` (Option A) enforces its own database schema adapters which conflict with the established Express API JWT logic.
2. We can implement a clean Next.js `middleware.ts` that intercepts `/admin/*` routes. It will read the session cookie (`next/headers` -> `cookies()`) and make a lightweight server-to-server fetch to the Express API (`/api/auth/validate`) to verify the JWT *before* routing.
3. This completely removes the need for Redux auth slices on the frontend.
