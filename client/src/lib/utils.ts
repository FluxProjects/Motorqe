import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Role } from "@shared/permissions";

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

