import React, { useState } from "react";
import { AuthContext } from "./AuthContext";
import { ROLES } from "../constants";

// Mapeo extendido para incluir ID y Nombre (Simulando una DB de usuarios)
// Esto soluciona el problema de 'user.id' undefined en los servicios
const USER_MAP = {
  [import.meta.env.VITE_VIEWER_PIN]: {
    id: "viewer-001",
    name: "Visualizador",
    role: ROLES.VIEWER,
  },
  [import.meta.env.VITE_WORKER_PIN]: {
    id: "worker-001",
    name: "Trabajador",
    role: ROLES.WORKER,
  },
  [import.meta.env.VITE_ADMIN_PIN]: {
    id: "admin-001",
    name: "Administrador",
    role: ROLES.ADMIN,
  },
};

export const AuthProvider = ({ children }) => {
  // Inicialización robusta: Intentamos recuperar la sesión completa
  const [user, setUser] = useState(() => {
    try {
      const storedSession = sessionStorage.getItem("lan_center_session");
      return storedSession ? JSON.parse(storedSession) : null;
    } catch (error) {
      console.error("Error parsing session:", error);
      return null;
    }
  });

  const login = (pin) => {
    const userData = USER_MAP[pin];
    if (userData) {
      // Guardamos el objeto completo del usuario, no solo el rol
      sessionStorage.setItem("lan_center_session", JSON.stringify(userData));
      setUser(userData);
      return userData.role;
    }
    return null;
  };

  const logout = () => {
    sessionStorage.removeItem("lan_center_session");
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
