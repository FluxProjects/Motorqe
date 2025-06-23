// src/utils/auth/handlers/registerHandler.ts
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { handleApiError } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "@/components/forms/AuthForm/AuthSchemas";
import { roleMapping } from "@shared/permissions";

export const useRegisterHandler = () => {
  const navigate = useNavigate();
  const setUser = useAuth((state) => state.setUser);

  const handleRegister = async (values: RegisterFormValues, form: UseFormReturn<RegisterFormValues>) => {
    try {
      const uppercaseRole = values.role.toUpperCase();
      const roleIdKey = Object.keys(roleMapping).find(
        (key) => roleMapping[parseInt(key)] === uppercaseRole
      );

      if (!roleIdKey) {
        throw new Error("Invalid role selected");
      }

      const roleId = parseInt(roleIdKey, 10);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          email: values.email,
          phone: null,
          password: values.password,
          confirmPassword: values.confirmPassword,
          role: uppercaseRole,
          roleId: roleId,
          termsAgreement: values.termsAgreement,
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
      setUser(data?.user);

      if (data.user.roleId === 1) {
        navigate("/buyer-dashboard");
      } else if (data.user.roleId === 2) {
        navigate("/seller-dashboard");
      } else if (data.user.roleId === 3) {
        navigate("/showroom-dashboard");
      } else if (data.user.roleId === 4) {
      navigate("/garage-dashboard");
      } else if ([5, 6, 7, 8].includes(data.user.roleId)) {
        navigate("/admin");
      } else {
        navigate("/");
      }

      return { success: true };
    } catch (error) {
      handleApiError(error, form);
      throw error;
    }
  };

  return { handleRegister };
};