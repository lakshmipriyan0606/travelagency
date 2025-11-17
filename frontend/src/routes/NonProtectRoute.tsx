import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const NonProtectedRoute = () => {

    const { user } = useSelector((state: any) => state.auth);
    console.log('user: ', user);

    if (user?.role === "admin") {
        return <Navigate to="/admin/adminpanel" replace />;
    }

    return <Outlet />;
};

export default NonProtectedRoute;
