import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Role } from "@shared/permissions";
import { UseFormReturn } from "react-hook-form";
import { CarEngineCapacity } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDashboardPathForRole = (role: Role): string => {
  switch (role) {
    case "BUYER":
      return "/buyer-dashboard";
    case "SELLER":
      return "/seller-dashboard";
    case "DEALER":
    case "GARAGE":
      return "/showroom-dashboard";
    case "MODERATOR":
    case "SENIOR_MODERATOR":
      return "/moderator-dashboard";
    case "ADMIN":
      return "/admin";
    case "SUPER_ADMIN":
      return "/admin"; // or your super admin panel
    default:
      return "/";
  }
};

export const redirectToCorrectDashboard = (userRole: Role, currentPath: string, navigate: (path: string) => void) => {
  const correctDashboard = getDashboardPathForRole(userRole);
  if (!currentPath.startsWith(correctDashboard)) {
    navigate(correctDashboard);
  }
};

export const fetchModelsByMake = async (makeId: string) => {
  const res = await fetch(`/api/car-models?makeId=${makeId}`);
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
};

export const handleApiError = (
  error: unknown,
  form: UseFormReturn<any>
) => {
  let message = "An unexpected error occurred. Please try again.";

  if (error instanceof Error) {
    message = error.message;
  }

  if (error && typeof error === "object" && "response" in error) {
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
          errors?: Record<string, string[]>;
          validationErrors?: Record<string, string[]>;
        };
      };
    };

    if (apiError.response?.data?.message) {
      message = apiError.response.data.message;
    } else if (apiError.response?.data?.error) {
      message = apiError.response.data.error;
    } else if (
      apiError.response?.data?.errors ||
      apiError.response?.data?.validationErrors
    ) {
      const errors =
        apiError.response.data.errors ||
        apiError.response.data.validationErrors;
      if (errors && typeof errors === "object") {
        const errorMessages = Object.values(errors).flat();
        message = errorMessages.join(" ");
      }

      if (errors && typeof errors === "object") {
        Object.entries(errors).forEach(([field, messages]) => {
          if (field in form.control._fields) {
            form.setError(field as any, {
              type: "manual",
              message: messages.join(" "),
            });
          }
        });
        return;
      }
    }
  } else if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    message = error.message;
  }

  form.setError("root", { type: "manual", message });
};

export function getEngineSizeLabel(
  engineCapacityId: number | undefined,
  capacities: CarEngineCapacity[]
): string {
  if (!engineCapacityId) return "Unknown";
  const match = capacities.find((e) => e.id === engineCapacityId);
  return match?.size_liters ?? "Unknown";
}

