# Package Module Discovery

## 1. Package List
- **Current State**: Handled via a monolithic `FilterPackage.tsx` (used for both B2C search and Admin listing).
- **Features**: Pagination, filters, sorting exist in a client-side wrapper. Admin actions (Edit, Delete, Duplicate, Toggle Status) are conditionally rendered.
- **Migration Need**: Needs a dedicated Server Component `(admin)/packages/page.tsx` utilizing Next.js `searchParams` for server-side pagination/filtering and a clean Shadcn data table.

## 2. Package Creation & Editing
- **Current State**: Handled by `AdminUploadPackageForm.tsx` (hardened in Sprint 5.1 with Zod schemas).
- **Features**: 
  - Nested field arrays for Itinerary (`ItineraryDaySection.tsx`), Slots (`SlotFieldSection.tsx`), Highlights (`HighlightsSection.tsx`), Prices, and SEO.
  - Image uploads via `react-dropzone` sending raw `File` objects embedded in `FormData`.
  - Multi-part requests handled by `axiosClient` to Express + Multer + Cloudinary backend.
- **Migration Need**: Split into a Server Component (for fetching edit data) and a Client Component (`PackageFormClient.tsx`) for the complex interactive `react-hook-form` state.

## 3. Package Actions (Mutations)
- **Delete / Duplicate / Publish (Toggle Status)**:
  - Legacy UI dispatches these via React Query `useMutation` pointing to `auth.api.ts` (e.g. `DeleteCurrentPackage`, `UpdatePackageRank`, `TogglePackageStatus`).
- **Migration Need**: Create typed mutation hooks in `src/features/admin/packages/api.ts` wrapping the legacy API calls, utilizing TanStack Query v5 with optimistic updates and `router.refresh()` where appropriate.

## 4. Upload Pipeline
- **Images**: Main package images, itinerary slot images. 
- **Migration Need**: Ensure the client form correctly builds the `FormData` object mimicking the exact structure the backend Multer middleware expects. Preserve existing image URLs during the Edit flow so they are not wiped.

