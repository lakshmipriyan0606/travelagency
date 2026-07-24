# Production Go-Live Checklist

- [ ] Merge `migration-sprint-3.5-approved` and `sprint-4-completed` features into `main`.
- [ ] Ensure `NEXT_PUBLIC_API_BASE_URL` is set to the production backend in Vercel.
- [ ] Migrate all `<img>` tags in standard Layouts to `next/image` to reduce LCP.
- [ ] Apply DOMPurify to `dangerouslySetInnerHTML` inputs.
- [ ] Resolve TypeScript ignore comments in the Admin Module.
- [ ] Execute `pnpm run build` and ensure `0` errors.
- [ ] Deploy to Staging.
- [ ] Perform manual end-to-end booking flow tests.
