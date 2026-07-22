import { AppRoute } from "@/types/types";
import { Route, Routes, useLocation } from "react-router-dom";
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
import MobileStickyBottomBar from "@/components/layout/mobileStickyBottomBar/MobileStickyBottomBar";
import FloatingActions from "@/components/layout/FloatingActions";
import EnquiryModal from "@/components/layout/herosection/EnquiryModal";
import { useState } from "react";

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
    const location = useLocation();
    const { data: user } = UseFetchAPIQuery({
        key: ["me"],
        queryFn: currentUserAPI,
    });

    const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);

    useEffect(() => {
        dispatch(setUser(user || null));
    }, [user, dispatch]);

    const isAdminRoute = location.pathname.startsWith("/admin");

    useEffect(() => {
        if (isAdminRoute) return;

        const hasTriggered = sessionStorage.getItem('enquiryModalTriggered');
        if (hasTriggered) return;

        const timer = setTimeout(() => {
            setIsAutoModalOpen(true);
            sessionStorage.setItem('enquiryModalTriggered', 'true');
        }, 30000); // 10 seconds

        return () => clearTimeout(timer);
    }, [isAdminRoute]);

    useEffect(() => {
        if (!localStorage.getItem("userId")) {
            const tempUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("userId", tempUserId);
        }
    }, []);

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
            <Suspense fallback={<Loading />}>
                <ScrollToTop />
                <BackToTop />
                <AppToastContainer />
                {!isAdminRoute && <Navbar />}
                <Routes>{renderAppRoute(routes)}</Routes>
                {!isAdminRoute && <Footer />}
                {!isAdminRoute && <MobileStickyBottomBar />}
                {!isAdminRoute && <FloatingActions />}
                <EnquiryModal isOpen={isAutoModalOpen} onClose={() => setIsAutoModalOpen(false)} />
            </Suspense>
        </ErrorBoundary>
    );
};

export default AppRoutes
