// pages/showroom/ManageSubscription.tsx
import { ServicePackageEditor } from "@/components/showroom/SubscriptionPackageEditor";
import { useAuth } from "@/contexts/AuthContext";

export function ManageSubscription() {
  const auth = useAuth();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Service Packages</h1>
      {auth.user?.showroomId && (
        <ServicePackageEditor showroomId={auth.user.showroomId} />
      )}
    </div>
  );
}