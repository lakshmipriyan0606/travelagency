# Risk Register

| Risk | Impact | Mitigation | Rollback Strategy |
|------|--------|------------|-------------------|
| TypeScript compilation fails due to `// @ts-nocheck` removals | High (Breaks CI/CD) | Isolate Admin migration into its own branch. Resolve TS types incrementally before merging. | Revert branch merge. Legacy B2C Admin remains active. |
| JWT Cookie mismatch across subdomains | High (Auth lockout) | Ensure backend cookie domain config covers Next.js frontend during local dev and production. | Temporarily revert Next.js middleware and fallback to client-only redirects. |
| Large FormData payloads timeout | Medium | Ensure Vercel / Nginx timeout limits are raised for `/api/packages` mutations. | None needed if timeout handled gracefully in UI. |
