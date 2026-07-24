# Implementation Roadmap

## 1. Quality & Types (Sprint 5.1)
- Remove `// @ts-nocheck` from `BlogForm.tsx`, `BlogAdminList.tsx`, `AdminUploadPackageForm.tsx`.
- Define strict Zod validation schemas for all Admin mutations.

## 2. Authentication & Middleware (Sprint 5.2)
- Implement `middleware.ts` for `/admin/*` route protection.
- Deprecate Redux `authSlice` in favor of Server-Session state.

## 3. Layouts & Dashboards (Sprint 5.3)
- Construct `app/(admin)/layout.tsx`.
- Migrate `Dashboard`, `MetricsDashboard`.

## 4. Forms & Data Grids (Sprint 5.4)
- Port over `AdminUploadPackageForm`, `DestinationAdminList`, `ReviewAdminList`, `StoryAdminList`.
- Switch tables to Server-Side rendering with suspense boundaries.
