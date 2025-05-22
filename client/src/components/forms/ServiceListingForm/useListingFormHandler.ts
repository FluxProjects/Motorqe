import { UseMutateFunction, useMutation } from "@tanstack/react-query";
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
      console.log("Starting service form submission");
      console.log("Form data:", formData);
      console.log("Existing service:", service);

      const payload = {
        showroomId: formData.showroomId || user?.showroomId,
        serviceId: formData.serviceId,
        price: formData.price,
        currency: formData.currency,
        description: formData.description,
        descriptionAr: formData.descriptionAr,
        isFeatured: formData.isFeatured || false,
        isActive: formData.isActive !== false, // Default to true
      };

      console.log("Constructed payload:", payload);

      const method = service ? "PUT" : "POST";
        const url = service 
            ? `/api/showroom/services/${service.id}`
            : "/api/showroom/services";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to save service");
        }

      return res.json();
    },

    onSuccess: (data, variables) => {
      console.log("Service saved successfully");
      const role = user?.roleId ? roleMapping[user.roleId] : "DEALER";
      
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        navigate("/admin/services");
      } else {
        navigate("/showroom-dashboard/services");
      }

      toast({
        title: "Success",
        description: variables.service ? "Service updated" : "Service created",
      });
      onSuccess?.();
    },

    onError: (error: Error) => {
      console.error("Service save failed:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};