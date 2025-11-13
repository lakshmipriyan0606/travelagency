import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  allowedRoles?: string[];
  userRole?: string;
  redirectPath?: string;
}

const ProtectedRoute = ({
  isAuthenticated,
  allowedRoles = [],
  userRole,
  redirectPath = "/login",
}: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole || "")) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
