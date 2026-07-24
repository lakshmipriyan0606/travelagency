# Blog Management - Performance Audit

## Assessment
- **Bundle Size Optimization**: The legacy architecture imported `react-dropzone` and `react-hook-form` eagerly inside the list view (due to monolithic Context rendering). By segregating the routes into Next.js App Router, the `/admin/blogs` route now incurs virtually **zero client JS payload** for the list UI.
- **Hydration Impact**: Native DOM Table rendering eliminates heavy virtual DOM reconciliations on load.
- **Dynamic Imports**: Future optimization should wrap the `RichTextEditor` inside `next/dynamic` with `ssr: false` to prevent window/document undefined issues and lower the `new/page.tsx` payload.
