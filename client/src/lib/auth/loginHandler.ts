// src/utils/auth/handlers/loginHandler.ts
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { handleApiError } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { LoginFormValues } from "@/components/forms/AuthForm/AuthSchemas";
import { User } from "@shared/schema";
import { useState } from "react";

export const useLoginHandler = () => {
  const navigate = useNavigate();
  const setUser = useAuth((state) => state.setUser);

  const handleLogin = async (values: LoginFormValues, form: UseFormReturn<LoginFormValues>) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          response: {
            data: errorData,
          },
        };
      }

      const data = await response.json();
      
      // Store auth data
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("refreshToken", data.refreshToken || ""); // If your API provides one
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      // Get redirect destination (priority order)
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirectTo');
      const fromPath = history.state?.from?.pathname; // From ProtectedRoute

      const dashboardByRole = {
        BUYER: "/buyer-dashboard",
        SELLER: "/seller-dashboard",
        DEALER: "/showroom-dashboard",
        GARAGE: "/garage-dashboard",
        MODERATOR: "/admin",
        ADMIN: "/admin",
        SUPER_ADMIN: "/admin",
      } as const;

      // Determine where to redirect
      const role = data.user?.roleId as keyof typeof dashboardByRole;
      const defaultPath = dashboardByRole[role] || "/";
      const destination = redirectTo || fromPath || defaultPath;

      // Clear any sensitive data from URL before redirecting
      const cleanDestination = destination.split('?')[0];
      
      navigate(cleanDestination, {
        replace: true,
        state: null // Clear any sensitive state
      });
      
      return { success: true };
    } catch (error) {
      // Clear auth data on failed login
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      
      handleApiError(error, form);
      throw error;
    }
  };

  return { handleLogin };
};