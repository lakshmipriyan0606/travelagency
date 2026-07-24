# Admin Security Plan

## 1. Authentication Layer
- Middleware validation of JWT cookies on all `/admin/*` routes.
- Prevent privilege escalation by validating the `role` enum in the JWT signature.

## 2. XSS & CSRF Prevention
- Strict DOMPurify sanitization before rendering CMS fields.
- Admin forms must implement CSRF tokens if Server Actions are utilized, though Next.js 15 Server Actions carry inherent CSRF protections.

## 3. Data Leakage
- `NEXT_PUBLIC` variables must strictly exclude backend credentials.
- Ensure API error boundaries suppress stack traces in production (already verified via `error.tsx`).
