import AdminPanel from "@/pages/Admin/AdminPanel/AdminPanel";
import LoginForm from "@/pages/Admin/login/Login";
import RegisterForm from "@/pages/Admin/register/Register";
import AllPackage from "@/pages/AllPackage/AllPackage";
import PackageDetail from "@/pages/PackageDetail/PackageDetail";
import { AppRoute } from "@/types/types";
import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
import NonProtectedRoute from "./NonProtectRoute";

const Home = lazy(() => import('@/pages/Home/Home'));




const routes: AppRoute[] = [
    {
        path: '/',
        element: <Home />,
        isProtectRoute: false,
    },
    {
        path: '/package/:id',
        element: <PackageDetail />,
        isProtectRoute: false,
    },
    {
        path: '/allpackage',
        element: <AllPackage />,
        isProtectRoute: false,
    },
    // {
    //     path: '/admin/register',
    //     element: <RegisterForm />,
    //     isProtectRoute: false,
    // },
    {
        path: '/admin/login',
        element: <NonProtectedRoute />,
        children: [{ path: '', element: <LoginForm /> }],
        isProtectRoute: false,
    },
    {
        path: '/admin/adminpanel',
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        isProtectRoute: false,
        children: [
            { path: "", element: <AdminPanel /> },
        ],
    },
];

export default routes;
