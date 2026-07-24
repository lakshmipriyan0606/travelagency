# Admin Blog Management - Discovery Audit

## Folder Structure & Component Hierarchy
**Legacy Path:** `apps/web-next/src/components/layout/Admin/Blog/`
- `BlogAdminList.tsx`: Displays a paginated/filtered list of blogs with "Published"/"Draft" toggles and Edit/Delete actions.
- `BlogForm.tsx`: Handles both Create and Update flows for blog entries.

## Routing
- Currently, this module mounts inside a monolithic `AdminPanel.tsx` based on a global Redux/Context state (`active === "AllBlogs"` or `"CreateBlog"`). 

## API Integration & React Query Usage
- **Client Fetching:** Uses TanStack Query v5 `useQuery` and `useMutation`. 
  - `getAdminBlogs({ search, status })`: Fetches list.
  - `getBlogById(id)`: Fetches a single blog for editing.
  - `createBlog(formData)` / `updateBlog(id, formData)`: Form mutations.
  - `deleteBlog(id)`: Delete mutation.

## Form Logic & Validation
- **Form Wrapper:** `react-hook-form` coupled with `@hookform/resolvers/zod`.
- **Zod Schema (`blogSchema`)**: Validates `title`, `slug`, `category`, `author`, `miniDescription`, `content`, optional image URLs and ALTs, and an array of `faqs` (`question` / `answer`).
- **Slug Generation**: Handled automatically in `useEffect` when the `title` field changes and no `editBlogId` exists.
- **Rich Text Editor**: Uses a `Controller` wrapping a custom `RichTextEditor` component.

## Image Upload Flow & Cloudinary
- Integrates `react-dropzone`.
- Images (`thumbnailImage`, `bannerImage`) are extracted as `File` objects.
- Uses `FormData` to package text fields and files before transmission. If a URL is used (already hosted on Cloudinary from a previous edit), it switches modes to prevent redundant file re-upload, sending `thumbnailImageUrl` instead.

## Publish Workflow
- Toggles between `"Draft"` and `"Published"`. 
- List view allows quick inline status toggling via the `updateBlog` endpoint.
- Form submissions require the author to explicitly hit a "Save Draft" or "Publish" button which binds the `status` to the `FormData`.

## Current TypeScript Issues
- Heavy use of `// @ts-nocheck` at the top of both files.
- `any` types littered across error catch blocks, response mapping, and context declarations (`AdminPanelContext = createContext<any>(null)`).

## Migration Plan Alignment
- We can completely sever the `AdminPanelContext`.
- We will transition list data-fetching from Client-side `useQuery` to Server-side Next.js `fetch()`.
- The interactive `BlogForm` will become a dedicated Client Component, utilizing the same Zod schema but with hardened typings (removing `ts-nocheck`).
