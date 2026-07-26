# Sprint 3 Planning & Readiness Review

## Phase 1: Project Health Audit
- **Folder Structure:** Validated. Strict separation of Next.js routing (`app/(b2c)`) and components (`src/components`).
- **Dependencies:** Redux Toolkit and React Query successfully integrated. Routing layer relies purely on Next.js native APIs.
- **Config:** `.eslintrc.json` currently contains suppressions for legacy migration components to avoid blocking CI/CD.

## Phase 2: Technical Debt Review
1. **ESLint Suppressions (`@typescript-eslint/no-explicit-any`):**
   - *Priority:* Medium | *Risk:* Low | *Recommended Sprint:* Sprint 5 (Polishing) | *Effort:* 2 Days
2. **`<img>` Tag Usage vs `next/image`:**
   - *Priority:* High | *Risk:* Medium (LCP impacts) | *Recommended Sprint:* Sprint 4 (Performance) | *Effort:* 1 Day

## Phase 3: Dependency Audit
- **Unused/Deprecated:** `react-helmet-async` (Removed). `react-router-dom` (Removed).
- **Optimization:** Radix UI components imported modularly to preserve tree-shaking.

## Phase 4: Shared Component Audit
- **Reusable Components:** `Navbar`, `Footer`, Buttons, Cards.
- **Matrix Classification:** 
  - *Needs Client Component:* Forms, interactive carousels, Navbars.
  - *Needs Server Component:* Static cards, typography, layout shells.

## Phase 5: API Layer Audit
- **Axios Wrappers (`axiosClient.ts`):** Preserved for client-side queries.
- **Migration Strategy:** For SEO-critical routes (e.g., `PackageDetail`), we must abandon Axios in `page.tsx` and utilize native Next.js `fetch()` inside the RSCs to leverage aggressive caching and ISR.

## Phase 6: State Management Review
- **Redux:** Preserved exclusively for strictly client-side UI states and auth persistence.
- **React Query:** Kept for deeply interactive data grids. Avoid utilizing React Query for initial page loads on SEO routes (prefer RSC data fetching).

## Phase 7: Static Page Readiness
- **Migration Order:** 
  1. `Home` (High SEO impact)
  2. `About`
  3. `TermsAndConditions`
  4. `Contact`
  5. `Blog List`
- **Blockers:** Minimal. Primarily entails moving legacy JSX into Server Components and converting fetching patterns.

## Phase 8: Dynamic Page Readiness
- **Critical Paths:** `PackageDetail`, `BlogDetail`.
- **Strategy:** Must implement `generateMetadata()` for dynamic title/social tags, and leverage `generateStaticParams()` where applicable for static rendering of popular packages.

## Phase 9: Performance Review
- **Hydration:** Clean root shell. Next step requires chunking heavy libraries if utilized dynamically.

## Phase 10: SEO Review
- **Metadata API:** Verified root layout implementation. Next step is injecting granular `<title>` and OpenGraph tags per page during Sprint 3.
