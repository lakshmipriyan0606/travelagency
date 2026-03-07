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
import BackToTop from "@/components/common/BackToTop";
import Loading from "@/components/Loading/Loading";
import AppToastContainer from "@/components/AppToastContainer/AppToastContainer";
import Navbar from "@/components/layout/navbar/Navbar";
import Footer from "@/components/layout/footer/Footer";

const renderAppRoute = (routesList: AppRoute[]): ReactNode => {
    return routesList.map(({ path, element, children }) => {
        const RouteElement = isValidElement(element) ? element : <></>
        return (
            <Route key={path} path={path} element={RouteElement}>
                {children && children.length > 0 && renderAppRoute(children)}
            </Route>
        );
    });
};

const AppRoutes = () => {
    const dispatch = useDispatch();
    const { data: user } = UseFetchAPIQuery({
        key: ["me"],
        queryFn: currentUserAPI,
    });

    useEffect(() => {
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) {
            const id = crypto.randomUUID();
            localStorage.setItem("userId", id);
        }
    }, []);

    useEffect(() => {
        dispatch(setUser(user || null));
    }, [user, dispatch]);

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
            <Suspense fallback={<Loading />}>
                <ScrollToTop />
                <BackToTop />
                <AppToastContainer />
                <Navbar />
                <Routes>{renderAppRoute(routes)}</Routes>
                <Footer />
            </Suspense>
        </ErrorBoundary>
    );
};

export default AppRoutes
