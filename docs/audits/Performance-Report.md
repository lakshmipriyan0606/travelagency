# Performance Report

## 1. Server Responses
- Static pages (Home, About) are compiled at build time. TTFB is expected to be <50ms on edge networks.
- Dynamic pages fetch concurrently with `Promise.all` and utilize Next.js `revalidate: 3600` cache, functioning identically to Static Site Generation for 1-hour windows.

## 2. Client Rendering
- Interactivity is restricted to islands.
- Images rely on native `<img>` tags.
- **Action Item**: Migrate large `<img>` tags to `next/image` to allow Next.js server optimization (WebP, resizing).

## Score
**85/100**
