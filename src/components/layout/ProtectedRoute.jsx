import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirigir al login, guardando la ubicación intentada para UX futuro
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Si el usuario existe pero no tiene permiso, lo mandamos a 404
    // para no revelar la existencia de la ruta (seguridad por oscuridad)
    // o simplemente porque es una ruta "no encontrada" para su nivel de acceso.
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
