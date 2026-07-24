# API Dependency Map

## Frontend to Backend Mapping
- **Package Management:** `apps/web-next/src/api/admin/auth.api.ts` -> Express Backend `/api/packages`
- **Blog Management:** `apps/web-next/src/api/admin/blog.api.ts` -> Express Backend `/api/blogs`
- **Authentication:** `loginAPI` -> Express Backend `/api/auth/login`
- **Reviews:** `apps/web-next/src/api/admin/review.api.ts` -> Express Backend `/api/reviews`
- **Destinations:** `apps/web-next/src/api/admin/destination.api.ts` -> Express Backend `/api/destinations`

*Note: All data mutations use `FormData` encoding. The backend handles Multer/Cloudinary uploads directly. The Next.js API route layer will be bypassed in favor of direct backend communication via Server Actions or client `axios`.*
