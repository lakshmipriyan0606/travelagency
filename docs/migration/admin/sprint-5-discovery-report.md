# Phase 5 Discovery Report

## Existing Admin Architecture Audit

### Current Framework
- **Legacy Path:** `apps/b2c-web/src/pages/Admin` and `apps/web-next/src/components/layout/Admin`.
- **Framework:** The legacy Admin panel is deeply coupled to React Router DOM (`react-router-dom`) inside a monolithic Vite/CRA structure, although components were partially moved to `web-next/src/components/layout/Admin`.
- **Routing Strategy:** React Router `useNavigate` and `Routes` were used.
- **State Management:** Uses Redux (`useSelector`, `useDispatch`) tied to a global `authSlice`.
- **Authentication Flow:** User logs in via `/api/admin/auth/login`. Response `data.user` is dispatched to Redux `setUser` payload and local `axiosClient` interceptors fetch JWT from cookies (`withCredentials: true`) or localStorage.
- **Dependency List:** `react-router-dom`, `redux`, `lucide-react`, `zod`, `react-hook-form`, `framer-motion`.

## Overall Status
The B2C Admin panel has heavy technical debt, particularly regarding `ts-nocheck` directives and monolithic Redux states that violate App Router server-first architecture.
