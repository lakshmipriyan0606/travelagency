import { AppRoute } from "@/types/types";
import { Route, Routes } from "react-router-dom";
import { ReactNode, Suspense, isValidElement, useEffect } from "react";
import routes from "./RouteConfig";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/error/FallbackErrorBoundary";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { currentUserAPI } from "@/api/admin/auth.api";
import { setUser } from "@/store/authSlice";
import { useDispatch } from "react-redux";
import ScrollToTop from "@/components/layout/AutoScrollTopView/AutoScrolltopView";

const renderAppRoute = (routesList: AppRoute[]): ReactNode => {
    const dispatch = useDispatch()
    const { data: user, } = UseFetchAPIQuery({
        key: ["me"],
        queryFn: currentUserAPI,
    });

    useEffect(() => {
        const currentUserId = localStorage.getItem("userId");
        const id = crypto.randomUUID();
        if (!currentUserId) {
            localStorage.setItem("userId", id);
        }
    }, [])

    useEffect(() => {
        dispatch(setUser(user || null))
    }, [user])

    return routesList.map(({ path, element, children }) => {
        const RouteElement = isValidElement(element) ? element : <></>
        return (
            <Route key={path} path={path} element={RouteElement}>
                {children && children.length > 0 && renderAppRoute(children)}
            </Route>
        );
    });
};



const AppRoutes = () => (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <Suspense fallback={<>loading...</>}>
            <ScrollToTop />
            <Routes>{renderAppRoute(routes)}</Routes>
        </Suspense>
    </ErrorBoundary>
);

export default AppRoutes