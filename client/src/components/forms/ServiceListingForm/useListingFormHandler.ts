import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { ServiceListingFormData, AdminServiceListing } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { roleMapping } from "@shared/permissions";

interface ServiceListingMutationVariables {
  formData: ServiceListingFormData;
  service?: AdminServiceListing | null;
}

export const useServiceListingFormHandler = (onSuccess?: () => void) => {
  const auth = useAuth();
  const user = auth?.user;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  return useMutation<
    Response,
    Error,
    ServiceListingMutationVariables,
    unknown
  >({
    mutationFn: async ({ formData, service }) => {
      console.log("➡️ Mutation started");
      console.log("📦 Received formData:", formData);
      console.log("🆔 service:", service);

      let endDate = new Date();
      if (formData.package?.durationDays) {
        const durationDays = Number(formData.package?.durationDays);
         console.log("Duration Days", durationDays);
        if (!isNaN(durationDays)) {
          endDate.setDate(endDate.getDate() + durationDays);
        }
      } else if (service?.end_date) {
        // Use existing end date if editing and no new duration specified
        endDate = new Date(service?.end_date);
      }


      const payload = {
        showroomId: formData.basicInfo.showroomId?.toString(),
        serviceId: formData.basicInfo.serviceId?.toString(),
        price: formData.basicInfo.price,
        currency: formData.basicInfo.currency,
        description: formData.basicInfo.description,
        descriptionAr: formData.basicInfo.descriptionAr,
        availability: formData.availability,
        isFeatured: formData.isFeatured || false,
        isActive: formData.isActive !== false, // Default to true

        user_id: user?.id,
        package_id: formData.package?.packageId
          ? Number(formData.package.packageId)
          : service?.package_id, // Fallback to existing package
        start_date: service?.start_date
          ? new Date(service.start_date).toISOString()
          : new Date().toISOString(),
        end_date: endDate.toISOString(),
        status: formData?.status,
      };

      console.log("🛠 Constructed payload:", payload);

      const method = service ? "PUT" : "POST";
      const url = service ? `/api/showroom/services/${service.id}` : "/api/showroom/services";
        
        console.log(`🌐 Sending ${method} request to ${url}`);

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        console.log("📥 Response status:", res.status);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to save service");
        }

      console.log("✅ Mutation successful");

      return res;
    },

    onSuccess: (variables) => {
      console.log("Service saved successfully");
      const role = user?.roleId ? roleMapping[user.roleId] : "GARAGE";
      
       if (role === "SELLER") {
        navigate("/seller-dashboard/servicelistings");
       } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
        navigate("/admin/servicelistings");
      } else if ( role === "GARAGE") {
        navigate("/garage-dashboard/servicelistings");
      }

      console.log("✅ Redirect complete");
      toast({
        title: "Success",
        description: variables.service ? "Service updated" : "Service created",
      });
      onSuccess?.();
    },

    onError: (error: Error) => {
      console.error("🔥 Mutation failed:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};