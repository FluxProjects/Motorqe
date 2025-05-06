import { Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { roleMapping, Roles } from "@shared/permissions";

export const ProtectedRoute = ({
  children,
  permissions = [],
  fallback = "/",
}: {
  children: React.ReactNode;
  permissions: string[];
  fallback?: string;
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log("✅ Auth State:", { user, isAuthenticated, isLoading });

  const userRole = roleMapping[user?.roleId] || "BUYER";
  console.log("✅ Mapped Role:", user?.roleId, "→", userRole);

  const rolePermissions = Roles[userRole] || [];
  console.log("✅ Role Permissions:", rolePermissions);

  // if (isLoading) {
  //   return <LoadingScreen />;
  // }

  if (permissions?.length === 0) {
    console.log("✅ No permissions required, rendering children.");
    return <>{children}</>;
  }

  console.log("🔍 Required Permissions:", permissions);

  const hasAccess = permissions?.some((permission) =>
    rolePermissions.includes(permission as any)
  );

  console.log("🔐 Access Check:", { hasAccess });

  if (hasAccess) {
    console.log("✅ Access granted. Rendering protected content.");
    return <>{children}</>;
  } else {
    console.warn("⛔ Access denied. Redirecting to fallback:", fallback);
    return <Redirect to={fallback} />;
  }
};

export default ProtectedRoute;
