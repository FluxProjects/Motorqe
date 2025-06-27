import GarageDashboardCards from "../../components/showroom/GarageDashboardCards";
import GarageAnalytics from "../../components/showroom/GarageAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { roleMapping } from "@shared/permissions";
import ShowroomNavigation from "@/components/showroom/ShowroomNavigation";


export default function ShowroomDashboard() {
     const { t } = useTranslation();
      const { user } = useAuth();
      const [location] = useLocation();
    
      const role = roleMapping?.[Number(user?.roleId)] ?? 'SELLER';
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Sub Navigation */}
      <ShowroomNavigation />
      
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
