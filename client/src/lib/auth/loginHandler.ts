// src/utils/auth/handlers/loginHandler.ts
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { handleApiError } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { LoginFormValues } from "@/components/forms/AuthForm/AuthSchemas";

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
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      const dashboardByRole = {
        BUYER: "/buyer-dashboard",
        SELLER: "/seller-dashboard",
        DEALER: "/showroom-dashboard",
        GARAGE: "/showroom-dashboard",
        MODERATOR: "/admin",
        ADMIN: "/admin",
        SUPER_ADMIN: "/admin",
      } as const;

      type RoleKey = keyof typeof dashboardByRole;
      const role = data.user?.roleId as RoleKey;
      const dashboardPath = dashboardByRole[role];
      navigate(dashboardPath);
      
      return { success: true };
    } catch (error) {
      handleApiError(error, form);
      throw error;
    }
  };

  return { handleLogin };
};