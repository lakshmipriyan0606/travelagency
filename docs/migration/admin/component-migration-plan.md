# Component Migration Analysis

## Heavy Forms & Formats
Components like `AdminUploadPackageForm` utilize massive `FormData` payloads covering arrays of `slots`, `images`, and `highlights`.
- **Classification:** Client Component (`"use client"`) due to heavy `useForm` (react-hook-form) and `onChange` requirements.
- **Optimization:** Dynamic imports should be utilized for Rich Text Editors inside Blog uploads to avoid massive bundle blocking on initial render.

## Tables and Data Grids
- **Classification:** Server Components + Client Wrappers.
- The table fetching (e.g., `DestinationAdminList`, `BlogAdminList`) currently uses React Query. This should be migrated to Server Actions or Server-side `fetch()` with `Suspense` streaming to populate tables instantly.

## TypeScript Technical Debt
- **CRITICAL:** `BlogForm.tsx`, `BlogAdminList.tsx`, and `AdminUploadPackageForm.tsx` currently bypass TS checks using `// @ts-nocheck`.
- **Plan:** Remove `// @ts-nocheck`, define strict `zod` schemas, and repair explicit `any` types before mounting in Next.js.
