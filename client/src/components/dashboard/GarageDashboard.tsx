import GarageDashboardCards from "./GarageDashboardCards";
import GarageAnalytics from "./GarageAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { roleMapping } from "@shared/permissions";
import GarageNavigation from "./GarageNavigation";


export default function GarageDashboard() {
     const { t } = useTranslation();
      const { user } = useAuth();
      const [location] = useLocation();
    
      const role = roleMapping?.[Number(user?.roleId)] ?? 'USER';
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Sub Navigation */}
      <GarageNavigation />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Welcome, {user?.firstName} {user?.lastName} !</h1>
        
        <GarageDashboardCards />
        <GarageAnalytics />
      </main>

    </div>
  );
}
