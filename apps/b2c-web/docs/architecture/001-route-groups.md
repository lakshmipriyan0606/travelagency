# ADR 001: Next.js Route Groups for Layout Management

## Problem
In the legacy `b2c-web` React application, layout logic was handled via programmatic conditional rendering inside `AppRoutes.tsx` using `window.location.pathname.startsWith('/admin')` to determine whether the `Navbar` and `Footer` should be rendered. This pattern is fundamentally incompatible with React Server Components (RSCs) and Next.js SSR, as `window` is undefined on the server, leading to hydration mismatches and layout flashing.

## Decision
We will utilize Next.js **Route Groups** (`app/(b2c)` and `app/(admin)`) to natively segregate layouts.
- `(b2c)/layout.tsx` will include the consumer `Navbar` and `Footer`.
- `(admin)/layout.tsx` will omit consumer navigation elements.

## Alternatives Considered
- **Client-Side Layout Controller:** Wrapping the root layout in a `"use client"` directive and checking `usePathname()`. 
  - *Trade-off:* Forces the root layout to be client-side rendered, severely degrading the initial Time to First Byte (TTFB) and reducing SEO performance for consumer pages.

## Trade-offs & Consequences
- **Pros:** Preserves RSC compatibility for the root layout; eliminates hydration errors; cleanly separates concerns in the file system.
- **Cons:** Slightly alters the file-system routing structure by introducing `(b2c)` and `(admin)` folders. URLs remain unaffected (e.g., `(b2c)/about/page.tsx` maps to `/about`).
