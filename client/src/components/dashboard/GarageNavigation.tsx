import { useAuth } from "@/contexts/AuthContext";
import { roleMapping } from "@shared/permissions";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function GarageNavigation() {
    const { t } = useTranslation();
          const { user } = useAuth();
          const [location] = useLocation();
        
          const role = roleMapping?.[Number(user?.roleId)] ?? 'USER';
    return(
<div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <a 
              href="#" 
              className="border-b-2 border-motoroe-orange text-motoroe-orange py-4 px-1 text-sm font-medium"
            >
              {t('garage.dashboard')}
            </a>
            <a 
              href="/garage-dashboard/servicelistings" 
              className="border-b-2 border-transparent text-motoroe-blue hover:text-motoroe-blue hover:border-gray-300 py-4 px-1 text-sm font-medium"
            >
              {t('admin.manageServiceListings')}
            </a>
            <a 
              href="/garage-dashboard/servicebookings" 
              className="border-b-2 border-transparent text-motoroe-blue hover:text-motoroe-blue hover:border-gray-300 py-4 px-1 text-sm font-medium"
            >
              {t('admin.manageServiceBookings')}
            </a>
            <a 
              href="/garage-dashboard/profile" 
              className="border-b-2 border-transparent text-motoroe-blue hover:text-motoroe-blue hover:border-gray-300 py-4 px-1 text-sm font-medium"
            >
              {t('garage.profile')}
            </a>
            <a 
              href="/logout" 
              className="border-b-2 border-transparent text-motoroe-blue hover:text-motoroe-blue hover:border-gray-300 py-4 px-1 text-sm font-medium"
            >
              Logout
            </a>
          </nav>
        </div>
      </div>
    )
}
