import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Role } from "@shared/permissions";
import { UseFormReturn } from "react-hook-form";
import { CarEngineCapacity, CarService } from "@shared/schema";
import { t } from "i18next";
import { Badge } from "@/components/ui/badge";

import { format, addHours } from "date-fns";
import { useQuery } from "@tanstack/react-query";

export function formatServiceTimeRange(startTime: string): string {
  const [hours, minutes] = startTime.split(":").map(Number);

  const start = new Date();
  start.setHours(hours, minutes, 0, 0);

  const end = addHours(start, 1);

  return `${format(start, "hh:mm a")} - ${format(end, "hh:mm a")}`;
}

export function safeParseJSON(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    console.warn("Invalid JSON, returning empty object. Value:", value);
    return {};
  }
}

export function generateTimeSlots(start: string, end: string, stepMinutes: number = 30) {
  const slots: string[] = [];
  let [startHour, startMin] = start.split(":").map(Number);
  let [endHour, endMin] = end.split(":").map(Number);

  let current = new Date();
  current.setHours(startHour, startMin, 0, 0);

  const endTime = new Date();
  endTime.setHours(endHour, endMin - 30, 0, 0);

  while (current < endTime) {
    const hh = String(current.getHours()).padStart(2, "0");
    const mm = String(current.getMinutes()).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    current.setMinutes(current.getMinutes() + stepMinutes);
  }

  return slots;
}

// utils/timeAgo.ts
export function formatTimeAgo(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;

  return `${Math.floor(diff / 31536000)} years ago`;
}



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
      return "/garage-dashboard";
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

  form.setError("rootServerError", { type: "manual", message });
};

export function getEngineSizeLabel(
  engineCapacityId: number | undefined,
  capacities: CarEngineCapacity[]
): string {
  if (!engineCapacityId) return "Unknown";
  const match = capacities.find((e) => e.id === engineCapacityId);
  return match?.size_liters ?? "Unknown";
}

export const calculateDurationDays = (startDateStr?: string, endDateStr?: string): number | undefined => {
    if (!startDateStr || !endDateStr) return undefined;
    
    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      const msPerDay = 1000 * 60 * 60 * 24;
      return Math.round((endDate.getTime() - startDate.getTime()) / msPerDay);
    } catch (error) {
      console.error("Error calculating duration days:", error);
      return undefined;
    }
  };

  // Format the availability data
type DayAvailability = {
  day: string;
  isOpen: boolean;
  startTime?: string;
  endTime?: string;
};

type Availability = Record<string, DayAvailability>;

export const formatAvailability = (
  availability: Availability | null | undefined
) => {
  if (!availability) return <p>Not Specified</p>;

  const days = Object.values(availability);
  const openDays = days.filter((day) => day.isOpen);

  if (openDays.length === 0) {
    return <p>{t("services.closedAllWeek")}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-2">
  {days.map((day) => (
    <div
      key={day.day}
      className="flex items-center justify-between border border-gray-200 rounded-md p-2"
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            day.isOpen ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        <span className="font-medium text-sm">{t(`days.${day.day}`)}</span>
      </div>
      <div className="text-sm text-gray-700">
        {day.isOpen
          ? `${day.startTime} - ${day.endTime}`
          : t("services.closed")}
      </div>
    </div>
  ))}
</div>


  );
};

export function isOpenNow(timing: any): boolean {
  try {
    const availability = typeof timing === "string" ? JSON.parse(timing) : timing;
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., 'Monday'
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

    const todayTimings = availability?.[currentDay] ?? [];

    return todayTimings.some((slot: { start: string; end: string }) => {
      const [startH, startM] = slot.start.split(":").map(Number);
      const [endH, endM] = slot.end.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      return currentTime >= startMinutes && currentTime <= endMinutes;
    });
  } catch {
    return false;
  }
}

export const RoleBadge = ({
  role,
  className = "",
}: {
  role: string;
  className?: string;
}) => {
  // Convert role to lowercase for styling purposes
  const roleLower = role.toUpperCase();
  let bgColor = "bg-slate-100";
  let textColor = "text-slate-800 hover:text-white";

  switch (roleLower) {
    case "admin":
      bgColor = "bg-red-100";
      textColor = "text-red-800 hover:text-white";
      break;
    case "moderator":
      bgColor = "bg-amber-100";
      textColor = "text-amber-800 hover:text-white";
      break;
    case "seller":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800 hover:text-white";
      break;
    case "garage":
      bgColor = "bg-green-100";
      textColor = "text-green-800 hover:text-white";
      break;
    case "dealer":
      bgColor = "bg-purple-100";
      textColor = "text-purple-800 hover:text-white";
      break;
  }

  return (
    <Badge className={`${bgColor} ${textColor} ${className}`}>
      {roleLower} {/* Display lowercase for consistency */}
    </Badge>
  );
};

export const getServiceNames = (
  serviceIds: string[] | string | undefined,
  carServices: CarService[]
): string => {
  console.log("[getServiceNames] called with:", { serviceIds, carServices });

  if (!serviceIds || !carServices?.length) {
    console.log("[getServiceNames] Returning N/A: No serviceIds or empty carServices");
    return "N/A";
  }

  const idsArray = Array.isArray(serviceIds) ? serviceIds : [serviceIds];
  console.log("[getServiceNames] Normalized idsArray:", idsArray);

  const names = idsArray.map(serviceId => {
    const idNumber = parseInt(serviceId, 10);
    console.log(`[getServiceNames] Processing serviceId: ${serviceId} (parsed: ${idNumber})`);

    const carService = carServices.find(cs => cs.id === idNumber);
    if (carService) {
      console.log(`[getServiceNames] Found carService:`, carService);
      return carService.name;
    } else {
      console.log(`[getServiceNames] No match found for serviceId: ${serviceId}`);
      return `Service ID: ${serviceId}`;
    }
  });

  const joinedNames = names.join(", ");
  console.log("[getServiceNames] Final joined names:", joinedNames);

  return joinedNames;
};


export function calculateMonthlyPayment(
  vehiclePrice: number,
  options?: {
    downPaymentPercentage?: number; // e.g., 0.2 for 20%
    interestRate?: number;          // Annual rate, e.g., 5.5
    loanPeriodMonths?: number;      // e.g., 60
  }
): number {
  const downPaymentPercentage = options?.downPaymentPercentage ?? 0.2;
  const interestRate = options?.interestRate ?? 5.5;
  const loanPeriod = options?.loanPeriodMonths ?? 60;

  const downPayment = vehiclePrice * downPaymentPercentage;
  const principal = vehiclePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanPeriod;

  const monthlyPayment =
    principal > 0 && monthlyRate > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      : principal / numPayments;

  return Math.round(monthlyPayment);
}
