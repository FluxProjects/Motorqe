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
          tlicense: values.tlicense,
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

      // 2️⃣ Parse user and token
      const data = await registerResponse.json();
      const registeredUser = data.user;
      console.log("user registered", registeredUser);

      // 3️⃣ Conditionally create garage or showroom based on role
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
            isGarage: isGarage,
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

        console.log("Showroom/Garage created successfully");
      }

      // 4️⃣ Set auth token and user, navigate
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      if (data.user.roleId === 1) {
        navigate("/buyer-dashboard");
      } else if ([2, 3].includes(data.user.roleId)) {
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
