import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is logged in but doesn't have permission, redirect to a safe default or show error
    // For now, redirecting to dashboard if they have access, or login if not.
    // A better approach might be a dedicated "Unauthorized" page.
    return (
      <div className="p-4 text-red-500">
        Acceso Denegado: Permisos Insuficientes
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
