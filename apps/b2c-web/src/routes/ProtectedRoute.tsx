import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  userRole?: string;
  redirectPath?: string;
}

const ProtectedRoute = ({
  allowedRoles = [],
  redirectPath = "/admin/login",
}: ProtectedRouteProps) => {

  const {user} = useSelector((state:any) => state?.auth);

  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
