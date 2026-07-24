# Admin Route Migration Map

## B2C Admin Routes

| Legacy Route (react-router-dom) | Next.js App Router (app/(admin)/) | Description |
|---------------------------------|-----------------------------------|-------------|
| `/admin/login` | `app/(admin)/login/page.tsx` | Admin auth entry |
| `/admin/adminpanel` | `app/(admin)/dashboard/page.tsx` | Metrics Dashboard |
| `/admin/adminpanel/packages` | `app/(admin)/packages/page.tsx` | Manage Packages |
| `/admin/adminpanel/uploadPackage` | `app/(admin)/packages/new/page.tsx` | Upload Packages |
| `/admin/adminpanel/activities` | `app/(admin)/activities/page.tsx` | Manage Activities |
| `/admin/adminpanel/blogs` | `app/(admin)/blogs/page.tsx` | BlogAdminList |
| `/admin/adminpanel/reviews` | `app/(admin)/reviews/page.tsx` | ReviewAdminList |
| `/admin/adminpanel/destinations` | `app/(admin)/destinations/page.tsx` | DestinationAdminList |
| `/admin/adminpanel/bookings` | `app/(admin)/bookings/page.tsx` | BookingList |

All routes will be wrapped in a shared Layout `app/(admin)/layout.tsx` containing the Admin Sidebar and Navigation.
