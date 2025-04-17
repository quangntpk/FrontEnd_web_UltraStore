import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ProtectedRoute = ({ allowedRoles, children }: { allowedRoles: number[], children?: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.vaiTro)) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;