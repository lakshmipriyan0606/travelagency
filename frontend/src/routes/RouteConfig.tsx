import { AppRoute } from "@/types/types";
import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
import NonProtectedRoute from "./NonProtectRoute";
import FavouritePackage from "@/pages/FavouritePackage/FavouritePackage";
import RegisterForm from "@/pages/Admin/register/Register";

const Home = lazy(() => import('@/pages/Home/Home'));
const AllPackage = lazy(() => import('@/pages/AllPackage/AllPackage'));
const AdminPanel = lazy(() => import('@/pages/Admin/AdminPanel/AdminPanel'));
const PackageDetail = lazy(() => import('@/pages/PackageDetail/PackageDetail'));
const LoginForm = lazy(() => import('@/pages/Admin/login/Login'));
const NotFound = lazy(() => import('@/pages/NotFound/NotFound'));
const ActivityPackageList = lazy(() => import('@/pages/Activities/ActivityPackageList'));

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
    {
        path: '/activities',
        element: <ActivityPackageList />,
        isProtectRoute: false,
    },
    {
        path: '/likepackage',
        element: <FavouritePackage />,
        isProtectRoute: false,
    },
    {
        path: '/admin/register',
        element: <RegisterForm />,
        isProtectRoute: false,
    },
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
    {
        path: '*',
        element: <NotFound />,
        isProtectRoute: false,
    }
];

export default routes;
