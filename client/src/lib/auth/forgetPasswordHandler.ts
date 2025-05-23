// src/utils/auth/handlers/forgotPasswordHandler.ts
import { handleApiError } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { 
  ForgotPasswordStep1Values, 
  ForgotPasswordStep2Values, 
  ForgotPasswordStep3Values 
} from "@/components/forms/AuthForm/AuthSchemas";

export const useForgotPasswordHandler = () => {
  const handleRequestOTP = async (
    values: ForgotPasswordStep1Values,
    form: UseFormReturn<ForgotPasswordStep1Values>
  ) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
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
      return { success: true, token: data.token };
    } catch (error) {
      handleApiError(error, form);
      throw error;
    }
  };

  const handleVerifyOTP = async (values: ForgotPasswordStep2Values, email: string, token: string, form: UseFormReturn<ForgotPasswordStep2Values>) => {
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: values.otp,
          token,
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
      return { success: true, verificationToken: data.verificationToken };
    } catch (error) {
      handleApiError(error, form);
      throw error;
    }
  };

  const handleResetPassword = async (values: ForgotPasswordStep3Values, email: string, token: string, form: UseFormReturn<ForgotPasswordStep3Values>) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword: values.newPassword,
          token,
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

      return { success: true };
    } catch (error) {
      handleApiError(error, form);
      throw error;
    }
  };

  // In your forgotPasswordHandler.ts
const handleResendOTP = async (email: string, form: UseFormReturn<ForgotPasswordStep1Values>): Promise<{ token: string }> => {
  try {
    const response = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
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
    return { token: data.token }; // Make sure this matches what you expect
  } catch (error) {
    handleApiError(error, form);
    throw error;
  }
};

  return {
    handleRequestOTP,
    handleVerifyOTP,
    handleResetPassword,
    handleResendOTP,
  };
};