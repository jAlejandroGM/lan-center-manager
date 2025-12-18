import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../features/auth/context/AuthProvider";
import { ToastProvider } from "../context/ToastProvider";
import { queryClient } from "../lib/query-client";

export const AppProviders = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
