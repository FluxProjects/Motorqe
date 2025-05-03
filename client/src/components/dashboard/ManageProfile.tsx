// pages/profile/ManageProfile.tsx
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { BuyerProfileEditor } from "@/components/buyer/BuyerProfileEditor";
import { SellerProfileEditor } from "@/components/seller/SellerProfileEditor";
import { ShowroomProfileEditor } from "@/components/showroom/ShowroomProfileEditor";
import { AdminProfileEditor } from "@/components/admin/AdminProfileEditor";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const ManageProfile = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', auth.user?.id],
    queryFn: () => fetch(`/api/users/${auth.user?.id}`).then(res => res.json()),
    enabled: !!auth.user?.id
  });

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  const renderEditor = () => {
    switch (auth.user?.role?.name.toLowerCase()) {
      case 'admin':
        return <AdminProfileEditor user={user} />;
      case 'seller':
        return <SellerProfileEditor user={user} />;
      case 'showroom_basic':
      case 'showroom_premium':
        return <ShowroomProfileEditor user={user} />;
      default:
        return <BuyerProfileEditor user={user} />;
    }
  };

  return (
    <div className="bg-white min-h-screen py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">
        {t("common.manageProfile")}
      </h1>
  
      <div className="md:flex md:gap-6">
        <div className="w-full">
      {renderEditor()}
      </div>
    </div>
  </div>
</div>
  );
}

export default ManageProfile;