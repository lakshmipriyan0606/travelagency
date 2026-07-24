# Sprint 5.3 Layout Audit

## Current Structure
The legacy Admin layout is managed via `apps/b2c-web/src/pages/Admin/AdminPanel/AdminPanel.tsx` and `SideNavbar/SideNavbar.tsx`. 

## Components to Migrate
- **Sidebar**: Legacy uses `react-router-dom` and a complex local state for menu expansion. Need to convert to a deterministic Next.js component utilizing `usePathname`.
- **Header**: Contains user profile and logout logic wired to Redux `authSlice`.
- **Navigation Items**: Defined in `constant.tsx`.

## Dependencies
- Redux (`useSelector`, `useDispatch`)
- `react-router-dom` (`useNavigate`, `useLocation`)
- Lucide React (Icons)
- Framer Motion (Animations for Sidebar)

## Refactoring Requirements
- **Next.js Routing**: Replace `react-router-dom` with `next/link`.
- **Layout Shell**: Adopt Next.js nested layouts (`layout.tsx`) utilizing server-rendered containers.
- **Server Component First**: The Layout should call `requireAdmin()` on the server side and pass the `admin` user object down to the Header, avoiding client-side Redux checks.
- **Responsive Navigation**: Use shadcn/ui or existing tailwind structures to manage mobile drawers instead of legacy inline conditional rendering.
