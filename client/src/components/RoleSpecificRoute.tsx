// src/components/RoleSpecificRoute.tsx
import { Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { roleMapping } from "@shared/permissions";
import { LoadingScreen } from "./LoadingScreen";


export const RoleSpecificRoute = ({ role, children }: {
    role: string;
    children: React.ReactNode;
  }) => {
    const { user, isLoading } = useAuth();
   
    return roleMapping[user?.roleId] === role ? <>{children}</> : <Redirect to="/" />;
  };