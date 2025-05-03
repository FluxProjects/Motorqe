import { useCallback } from "react";
import { Permission, type PermissionType, type Role, hasPermission } from "@shared/permissions";

// Mock user role - replace with actual user role from auth context
let currentUserRole: Role = "SUPER_ADMIN";

export function usePermissions() {
  const can = useCallback((permission: PermissionType) => {
    return hasPermission(currentUserRole, permission);
  }, []);

  return {
    can,
    Permission,
  };
}