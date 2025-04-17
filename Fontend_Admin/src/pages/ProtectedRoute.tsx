// src/pages/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: number[] }) => {
  const { user } = useAuth();
  

  if (!user || !allowedRoles.includes(user.vaiTro)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;