# Sprint 5.2 Auth Audit

## Frontend Analysis
- **Legacy Components:** Login form hits `/api/admin/auth/login`. Response `data.user` is dispatched to Redux `authSlice`.
- **State:** Redux stores `{ user, role, isLoggedIn }`.
- **Tokens:** `axiosClient.ts` expects `localStorage.getItem("userId")` to attach to headers, but standard JWTs are tracked via cookies (`withCredentials: true`).

## Backend Analysis
- **Token Generation:** `apps/backend/src/modules/auth/auth.controller.js` explicitly calls `setAuthCookies()` which issues `access_token` and `refresh_token` as HttpOnly cookies.
- **Roles:** The backend returns user role in the session response.

## Existing Security Risks
- The frontend blindly relies on Redux state (`isAdmin: true`) rather than validating the cryptographic integrity of the cookie on initial page load. 
- If a user modifies their local Redux state, the client UI might falsely grant access (though backend API calls would still correctly fail 401/403).

## Migration Strategy
- Strip Redux of all authentication logic.
- Utilize Next.js `middleware.ts` to inspect the `access_token` cookie and enforce edge-level redirects.
- Provide a `requireAdmin()` wrapper for Server Components.
