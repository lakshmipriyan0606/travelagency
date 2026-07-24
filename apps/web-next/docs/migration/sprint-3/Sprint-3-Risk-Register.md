# Sprint 3 Risk Register

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Legacy Axios instances breaking RSC rules | High | High | Enforce strict Server Component data fetching using `fetch()` and isolate Axios to Client Components only. |
| React-Slick / Carousels failing to mount in Server context | Medium | High | Wrap carousel dependencies in `"use client"` explicit wrapper components before utilizing them on the Home Page. |
| Missing metadata degrading SEO | High | Low | Create a strict Definition of Done (DoD) requiring `generateMetadata()` on every migrated page route. |
