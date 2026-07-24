# Blog Migration - Technical Debt Report

## Current Status
- **Resolved**: The tightly coupled `BlogForm.tsx` has been extracted from the Redux state tree and completely rewritten into `BlogFormClient.tsx`. All `// @ts-nocheck` directives have been eliminated.
- **Resolved**: Zod schemas have been centralized in `validation/blog.schema.ts`.
- **Resolved**: Replaced the monolithic client-fetching `BlogAdminList.tsx` with a native Server Component in `app/(admin)/blogs/page.tsx`.

## Remaining Debt
1. **RichTextEditor Reusability**: The `RichTextEditor` component imported from `@/components/common/RichTextEditor` still exists in the legacy directory structure. While it functions securely within the Client Component, it should ideally be audited for bundle size (draft-js / quill) and potentially replaced with a more modern Next.js 15 compatible rich text block editor (like BlockNote or Plate) in future sprints.
2. **TanStack Query Mutations**: The interim `mutations.ts` layer uses Axios calls via `api/admin/blog.api.ts`. These can be refactored into native Server Actions to completely eliminate the Axios client-side bundle dependency.
3. **Optimistic Updates**: The mutations currently rely on `router.refresh()` which forces a server roundtrip. True optimistic UI could be implemented for status toggling.
