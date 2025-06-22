// pages/profile/GarageProfile.tsx
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { ShowroomProfileEditor } from "@/components/showroom/ShowroomProfileEditor";
import { BaseProfileEditor } from "@/components/dashboard/BaseProfileEditor";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SellerProfileEditor } from "@/components/seller/SellerProfileEditor";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { roleMapping } from "@shared/permissions";
import GarageNavigation from "@/components/showroom/GarageNavigation";
import { GarageProfileEditor } from "@/components/showroom/GarageProfileEditor";

const GarageProfile = () => {
  const auth = useAuth();
  const { t } = useTranslation();


  const { data: user, status, refetch, error, isError } = useQuery({
  queryKey: ['user', auth.user?.id],
  queryFn: async () => {
    const res = await fetch(`/api/users/${auth.user?.id}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },
  enabled: !!auth.user?.id,
});

if (status === "pending" || !user) {
  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
}

const renderEditor = () => {
  const roleId = user?.role_id;
  console.log("🔍 typeof roleId:", typeof roleId, "| value:", roleId);

  switch (Number(roleId)) {
    case 1:
    case 2:
      return <SellerProfileEditor user={user} />;
    case 3:
        return <ShowroomProfileEditor user={user} />;
    case 4:
      return <GarageProfileEditor user={user} />;
    case 7:
    case 8:
      return <BaseProfileEditor user={user} />;
    default:
      return <BaseProfileEditor user={user} />;
  }
};



  return (
    <div className="min-h-screen bg-gray-50">
          {/* Sub Navigation */}
          <GarageNavigation />
    
          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                  <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-3xl font-bold text-neutral-900">
                        {t("common.manageProfile")}
                      </h1>
                      <p className="text-neutral-500 mt-2">
                        {t("profile.manageDescription")}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-6 md:p-8">
                        {renderEditor()}
                      </div>
                    </div>
                  </div>
        </main>

    </div>
  );
}

export default GarageProfile;