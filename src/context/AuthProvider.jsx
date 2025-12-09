import React, { useState } from "react";
import { AuthContext } from "./AuthContext";
import { ROLES } from "../constants";

// In a real app, these should be in .env or a database, but for "Soft Auth" this works.
const PIN_MAP = {
  1234: ROLES.VIEWER,
  5678: ROLES.WORKER,
  9999: ROLES.ADMIN,
};

export const AuthProvider = ({ children }) => {
  // Lazy initialization to read from sessionStorage once on mount
  const [user, setUser] = useState(() => {
    const storedRole = sessionStorage.getItem("lan_center_role");
    return storedRole ? { role: storedRole } : null;
  });

  const login = (pin) => {
    const role = PIN_MAP[pin];
    if (role) {
      sessionStorage.setItem("lan_center_role", role);
      setUser({ role });
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem("lan_center_role");
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
