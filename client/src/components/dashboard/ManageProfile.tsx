// pages/profile/ManageProfile.tsx
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { ShowroomProfileEditor } from "@/components/showroom/ShowroomProfileEditor";
import { BaseProfileEditor } from "@/components/dashboard/BaseProfileEditor";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SellerProfileEditor } from "../seller/SellerProfileEditor";

const ManageProfile = () => {
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
    switch (user?.role) {
      case 'BUYER':
      case 'SELLER':
        return <SellerProfileEditor user={user} />;
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return <BaseProfileEditor user={user} />;
      case 'SHOWROOM_BASIC':
      case 'SHOWROOM_PREMIUM':
        return <ShowroomProfileEditor user={user} />;
      default:
        return <BaseProfileEditor user={user} />;
    }
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
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
    </div>
  );
}

export default ManageProfile;