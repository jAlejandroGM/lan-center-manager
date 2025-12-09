import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DailyEntry from "./pages/DailyEntry";
import Debts from "./pages/Debts";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./context/AuthProvider";
import { ToastProvider } from "./context/ToastProvider";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { ROLES } from "./constants";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/debts" element={<Debts />} />

                {/* Admin Only Routes */}
                <Route
                  element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}
                >
                  <Route path="/daily-entry" element={<DailyEntry />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
export default App;
