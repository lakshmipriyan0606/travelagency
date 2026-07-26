# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Next.js 15 App Router scaffolded in `apps/web-next`.
- `app/(b2c)` and `app/(admin)` Route Groups to enforce layout boundaries.
- `app/providers.tsx` Client Component wrapping Redux Toolkit and React Query Contexts.

### Changed
- Refactored `react-router-dom` usage in structural UI components (`Navbar`, `Footer`) to utilize `next/link` and `next/navigation`.
- Refactored Vite environment variable syntax (`import.meta.env`) to Next.js syntax (`process.env`).
- Migrated legacy `index.html` structure to `app/layout.tsx` Server Component.

### Removed
- Removed `react-helmet-async` in favor of Next.js Metadata API.
