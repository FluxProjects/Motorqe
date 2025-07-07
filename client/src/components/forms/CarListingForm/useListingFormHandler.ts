import { UseMutateFunction, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { ListingFormData, AdminCarListing } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { roleMapping } from "@shared/permissions";
import { Cylinder } from "lucide-react";

interface MutationVariables {
  formData: ListingFormData;
  listing?: AdminCarListing | null;
}

export const useListingFormHandler = (onSuccess?: () => void) => {
  const auth = useAuth();
  const user = auth?.user;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  return useMutation<
    Response, // Return type
    Error, // Error type
    MutationVariables, // Variables type
    unknown // Context type
  >({
    mutationFn: async ({ formData, listing }) => {
      console.log("➡️ Mutation started");
      console.log("📦 Received formData:", formData);
      console.log("🆔 Listing:", listing);

      // Set default package if no packageId is found
      if (!formData.package?.packageId && !listing?.package_id) {
        formData.package = {
          packageId: "2",
          durationDays: 45,
          packagePrice: "150",
          noOfRefresh: 1,
        };
      }

      let endDate = new Date();
      if (formData.package?.durationDays) {
        const durationDays = Number(formData.package?.durationDays);
         console.log("Duration Days", durationDays);
        if (!isNaN(durationDays)) {
          endDate.setDate(endDate.getDate() + durationDays);
        }
      } else if (listing?.end_date) {
        // Use existing end date if editing and no new duration specified
        endDate = new Date(listing?.end_date);
      }

      const payload = {
        listing_type: formData.basicInfo?.listingType,
        title: formData.basicInfo?.title,
        title_ar: formData.basicInfo?.title,
        description: formData.basicInfo?.description,
        description_ar: formData.basicInfo?.descriptionAr,
        price: formData.basicInfo?.price,
        year: formData.specifications?.year,

        make_id: formData.specifications?.makeId,
        model_id: formData.specifications?.modelId,
        category_id: formData.specifications?.categoryId,

        mileage: formData.specifications?.mileage,
        fuel_type: formData.specifications?.fuelType,
        transmission: formData.specifications?.transmission,
        engine_capacity_id: formData.specifications?.engineCapacityId,
        cylinder_count: formData.specifications?.cylinderCount,
        wheel_drive: formData.specifications?.wheelDrive,
        
        color: formData.specifications?.color,
        interior_color: formData.specifications?.interiorColor,
        tinted: formData.specifications?.tinted,

        location: formData.basicInfo?.location,
        condition: formData.specifications?.condition,

        images: formData.media ?? [],

        owner_type:  formData.specifications?.ownerType,
        featureIds: formData.features?.map((id: string) => Number(id)) ?? [],
        is_imported: formData.specifications?.isImported,
        has_insurance: formData.specifications?.hasInsurance,
        insurance_expiry: formData.specifications?.insuranceExpiry
          ? new Date(
  listing?.insurance_expiry ? listing.insurance_expiry : new Date()
).toISOString()
          : new Date().toISOString(),
        has_warranty: formData.specifications?.hasWarranty,
        warranty_expiry: formData.specifications?.warrantyExpiry
          ? new Date(
  listing?.warranty_expiry ? listing.warranty_expiry : new Date()
).toISOString()

          : new Date().toISOString(),
        is_inspected: formData.specifications?.isInspected,
        inspection_report: formData.specifications?.inspectionReport,
        
        user_id: user?.id,
        package_id: formData.package?.packageId
          ? Number(formData.package.packageId)
          : listing?.package_id, // Fallback to existing package
        start_date: listing?.start_date
          ? new Date(listing.start_date).toISOString()
          : new Date().toISOString(),
        end_date: endDate.toISOString(),
        status: formData?.status,
      };

      console.log("🛠 Constructed payload:", payload);

      const method = listing ? "PUT" : "POST";
      const url = listing ? `/api/car-listings/${listing.id}` : "/api/car-listings";

      console.log(`🌐 Sending ${method} request to ${url}`);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📥 Response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("❌ API Error response:", errorData);
        throw new Error(errorData.message || "Failed to save listing");
      }

      console.log("✅ Mutation successful");
      return res;
    },

    onSuccess: (variables) => {
      console.log("🎉 Mutation succeeded, handling redirection");
      const role = user?.roleId ? roleMapping[user.roleId] : "DEALER";
      console.log("👤 User role:", role);

      if (role === "SELLER") {
        navigate("/seller-dashboard/listings");
      } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
        navigate("/admin/listings");
      } else if (role === "DEALER") {
        navigate("/showroom-dashboard/listings");
      } else if (role === "GARAGE") {
        navigate("/garage-dashboard/listings");
      }

      console.log("✅ Redirect complete");
      toast({
        title: "Success",
        description: variables.listing ? "Listing updated" : "Listing created",
      });
      onSuccess?.();
    },

    onError: (error: Error) => {
      console.error("🔥 Mutation failed:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

};