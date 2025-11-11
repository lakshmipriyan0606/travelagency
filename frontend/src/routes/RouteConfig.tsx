import LoginForm from "@/pages/Admin/login/Login";
import RegisterForm from "@/pages/Admin/register/Register";
import AllPackage from "@/pages/AllPackage/AllPackage";
import PackageDetail from "@/pages/PackageDetail/PackageDetail";
import { AppRoute } from "@/types/types";
import { lazy } from "react";

const Home = lazy(() => import('@/pages/Home/Home'));




const routes: AppRoute[] = [
    {
        path: '/',
        element: <Home />,
        isProtectRoute: false,
    },
    {
        path: '/packages',
        element: <PackageDetail />,
        isProtectRoute: false,
    },
    {
        path: '/destination',
        element: <AllPackage />,
        isProtectRoute: false,
    },
    {
        path: '/admin/register',
        element: <RegisterForm />,
        isProtectRoute: false,
    },
    {
        path: '/admin/login',
        element: <LoginForm />,
        isProtectRoute: false,
    },
];

export default routes;
