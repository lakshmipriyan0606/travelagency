import { AppRoute } from "@/types/types";
import { Route, Routes } from "react-router-dom";
import { ReactNode, Suspense, isValidElement } from "react";
import routes from "./RouteConfig";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/error/FallbackErrorBoundary";

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



const AppRoutes = () => (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <Suspense fallback={<></>}>
            <Routes>{renderAppRoute(routes)}</Routes>
        </Suspense>
    </ErrorBoundary>
);

export default AppRoutes