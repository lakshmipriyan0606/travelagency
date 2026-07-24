# Technical Debt Report

## Overview
This document tracks known technical debt remaining after the B2C App Router migration.

### Suppressions (ts-nocheck & ts-ignore)
- **`apps/web-next/src/components/layout/Admin/Blog/BlogForm.tsx:1`** - `// @ts-nocheck`
- **`apps/web-next/src/components/layout/Admin/Blog/BlogAdminList.tsx:1`** - `// @ts-nocheck`
- **`apps/web-next/src/components/layout/Admin/AdminUploadPackage/AdminUploadPackageForm.tsx:1`** - `// @ts-nocheck`
  - *Context*: Added during Sprint 3.5 to bypass legacy Admin module build failures. Must be resolved during the Admin Migration phase.
- **`apps/web-next/src/components/layout/suggestedProducts/SuggestedProducts.tsx:131,133`** - `// @ts-ignore` for slider refs.
- **`apps/web-next/src/components/layout/bestPackage/carousel/OuterCarousel.tsx:26,82,84`** - `// @ts-ignore` for slider methods.
- **`apps/web-next/src/components/layout/BestActivities/carousel/ActivitiesCarousel.tsx:24,73,75`** - `// @ts-ignore` for slider methods.

### Component Debt
- **`SuggestedProducts.tsx`**: Uses `use client` and React Query fetching inside a component that could be server-rendered. Deferred from Sprint 4.
- **`FilterPackage.tsx`**: Requires heavy client-side state. Long-term, URL state could be pushed entirely to Server Components via query params.

### Action Items
- Priority: **High** - Refactor Admin Components to strict TypeScript before Admin phase deployment.
- Priority: **Low** - Remove Swiper `@ts-ignore` warnings by declaring correct Swiper types.
