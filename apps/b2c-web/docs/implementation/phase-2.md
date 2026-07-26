# Implementation Plan: Phase 2 - Layout & UI Primitives

## Summary
Ported the core consumer layout shell (`Navbar`, `Footer`) to Next.js 15, removing `react-router-dom` in favor of `next/link` and `next/navigation`. Introduced Next.js Route Groups `(b2c)` and `(admin)` to cleanly separate the layout rendering logic previously entangled in `AppRoutes.tsx`.

## Architecture Decisions
- Implemented Route Groups (`app/(b2c)`) to avoid client-side conditional layout rendering. (See `docs/architecture/001-route-groups.md`).

## Performance Impact
- **Bundle impact:** Reduced by removing `react-router-dom`.
- **Rendering strategy:** The shell layout (`Navbar` & `Footer`) now renders exclusively on the server (with small isolated `"use client"` directives for Framer Motion interactions), drastically improving Time to First Byte.
- **Hydration:** Replaced programmatic `window.location` checks for layout visibility with static route-group folders.

## Migration Status
- `react-router-dom` dependencies in `Navbar` and `Footer` have been fully migrated.
- Radix UI primitives have been correctly marked with `"use client"` directives if necessary (handled natively in most cases).
- Image import paradigms shifted from Vite strings to Next.js `StaticImageData` (requiring `.src` access).
