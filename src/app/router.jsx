import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../features/auth/Login";
import Dashboard from "../features/dashboard/Dashboard";
import DailyEntry from "../features/daily-ops/DailyEntry";
import History from "../features/daily-ops/History";
import Debts from "../features/debts/Debts";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import NotFound from "./NotFound";
import { ROLES } from "../config/constants";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.VIEWER]} />
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
            </Route>

            <Route path="/debts" element={<Debts />} />

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
              <Route path="/daily-entry" element={<DailyEntry />} />
            </Route>
          </Route>

          {/* Catch-all route for 404 - Protected to prevent route enumeration */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
