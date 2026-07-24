# Security Audit Report

## 1. NEXT_PUBLIC Usage
- No secrets exposed. Only `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SITE_URL` are used.

## 2. API Routes
- B2C API calls run via Server Components, completely hiding the internal backend endpoints and preventing client-side scraping of endpoints except where interactive forms are used.

## 3. Vulnerabilities
- XSS: Next.js automatically sanitizes React children. However, `dangerouslySetInnerHTML` is used in `BlogDetailPage` to render CMS markdown. 
- **Risk:** High if the CMS does not sanitize HTML.
- **Fix:** Ensure backend strips malformed HTML or implement DOMPurify on the Next.js server before rendering.

## Score
**90/100**
