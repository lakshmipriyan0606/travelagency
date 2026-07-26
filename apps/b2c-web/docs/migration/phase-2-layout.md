# Migration Tracker: Phase 2 - Layout & UI Primitives

## Current Status: Completed

### Milestones Achieved
1. Copied structural UI folders (`components/layout`, `components/ui`, `components/companyLogo`) to `web-next`.
2. Extracted monolithic conditional layout rendering from `AppRoutes.tsx` into Route Groups `(b2c)` and `(admin)`.
3. Eradicated `react-router-dom` from all UI shell components (`Navbar`, `Footer`, `MobileStickyBottomBar`), migrating to `next/link` and `next/navigation`.
4. Fixed Vite-specific environment variable references (`import.meta.env`) to Next.js patterns (`process.env`).
5. Adapted static image imports (`StaticImageData`) to conform to Next.js strict typing.

### Known Issues & Follow-ups
- Images within the components are still utilizing standard `<img>` tags. As per the performance guidelines, Phase 3 or an optimization phase should systematically replace these with `next/image`.
