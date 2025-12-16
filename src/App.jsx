import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DailyEntry from "./pages/DailyEntry";
import Debts from "./pages/Debts";
import History from "./pages/History";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./context/AuthProvider";
import { ToastProvider } from "./context/ToastProvider";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { ROLES } from "./constants";

import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={[ROLES.ADMIN, ROLES.VIEWER]}
                    />
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/history" element={<History />} />
                </Route>

                <Route path="/debts" element={<Debts />} />

                {/* Admin Only Routes */}
                <Route
                  element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}
                >
                  <Route path="/daily-entry" element={<DailyEntry />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all route for 404 */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
export default App;
