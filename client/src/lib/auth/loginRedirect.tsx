import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import Login from "@/pages/Login";

export function LoginRedirect() {
  const [, navigate] = useLocation();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && currentUser) {
      // Redirect based on user role
      switch (currentUser.role) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "SELLER":
          navigate("/seller-dashboard");
          break;
        case "DEALER":
          navigate("/showroom-dashboard");
          break;
        case "GARAGE":
          navigate("/garage-dashboard");
          break;
        case "SUPER_ADMIN":
          navigate("/admin");
          break;
        default:
          // For other roles or no role, stay on login page
          break;
      }
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Only render the Login component if user is not logged in
  return <Login />;
}