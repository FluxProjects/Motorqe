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

  const handleRegister = async (
    values: RegisterFormValues,
    form: UseFormReturn<RegisterFormValues>
  ) => {
    try {
      const uppercaseRole = values.role.toUpperCase();
      const roleIdKey = Object.keys(roleMapping).find(
        (key) => roleMapping[parseInt(key)] === uppercaseRole
      );

      if (!roleIdKey) {
        throw new Error("Invalid role selected");
      }

      const roleId = parseInt(roleIdKey, 10);

      // 1️⃣ Register user
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password,
          confirmPassword: values.confirmPassword,
          role: uppercaseRole,
          roleId: roleId,
          businessName: values.businessName,
          tlicense: values.tLicense,
          termsAgreement: values.termsAgreement,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw {
          response: {
            data: errorData,
          },
        };
      }

      // 2️⃣ Parse user data
      const data = await registerResponse.json();
      const registeredUser = data.user;
      console.log("✅ User registered", registeredUser);

      // 3️⃣ Conditionally create garage or showroom if applicable
      if (uppercaseRole === "GARAGE" || uppercaseRole === "DEALER") {
        const isGarage = uppercaseRole === "GARAGE";

        const garageResponse = await fetch("/api/showrooms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.businessName,
            tLicense: values.tLicense,
            isGarage,
            phone: values.phone,
            userId: registeredUser.id,
          }),
        });

        if (!garageResponse.ok) {
          const errorData = await garageResponse.json();
          throw {
            response: {
              data: errorData,
            },
          };
        }

        console.log("✅ Showroom/Garage created successfully");
      }

      // 4️⃣ Instead of auto-login, redirect to check-email page
      navigate(`/check-email?email=${encodeURIComponent(registeredUser.email)}`);

      return { success: true };
    } catch (error) {
      handleApiError(error, form);
      throw error;
    }
  };

  return { handleRegister };
};
