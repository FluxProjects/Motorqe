// components/common/PermissionGuard.tsx
import { hasPermission, roleMapping } from "@shared/permissions";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard = ({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) => {
  const { user } = useAuth();
  const role = user?.roleId ? roleMapping[user.roleId] : "BUYER";

  return hasPermission(role, permission as any) ? <>{children}</> : <>{fallback}</>;
};