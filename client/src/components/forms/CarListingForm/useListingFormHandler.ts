import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { ListingFormData, AdminCarListing } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { roleMapping } from "@shared/permissions";

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
    Response,
    Error,
    MutationVariables,
    unknown
  >({
    mutationFn: async ({ formData, listing }) => {
      console.log("➡️ Mutation started");
      console.log("📦 Received formData:", formData);
      console.log("🆔 Listing:", listing);

      // Set default package if none provided
      if (!formData.package?.packageId && !listing?.package_id) {
        formData.package = {
          packageId: "2",
          durationDays: 45,
          packagePrice: "150",
          noOfRefresh: 1,
          featureDuration: 5,
        };
      }

      let endDate = new Date();
      if (formData.package?.durationDays) {
        const durationDays = Number(formData.package.durationDays);
        if (!isNaN(durationDays)) {
          endDate.setDate(endDate.getDate() + durationDays);
        }
      } else if (listing?.end_date) {
        endDate = new Date(listing.end_date);
      }

      let featuredUntil: Date | undefined;
      if (formData.package?.featureDuration && formData.package.featureDuration > 0) {
        featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + Number(formData.package.featureDuration));
      } else if (listing?.featured_until) {
        featuredUntil = new Date(listing.featured_until);
      }

      // Determine effective user_id
      const effectiveUserId = formData.basicInfo?.userId
        ? Number(formData.basicInfo.userId)
        : user?.id;

      // If seller or dealer and updating, force status to PENDING
      if (listing && (effectiveUserId === 2 || effectiveUserId === 3)) {
        formData.status = "pending";
      }

      // =========== 🛠 PAYLOAD CONSTRUCTION ===========
      const payload = {
        listing_type: formData.basicInfo?.listingType,
        title: formData.basicInfo?.title,
        title_ar: formData.basicInfo?.titleAr,
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
        interior_images: formData.interiorImages ?? [],
        images_360: formData.images360 ?? [],
        owner_type: formData.specifications?.ownerType,
        featureIds: formData.features?.map((id: string) => Number(id)) ?? [],
        is_featured: !!formData.package?.featureDuration && formData.package.featureDuration > 0,
        featured_until: featuredUntil ? featuredUntil.toISOString() : null,
        is_imported: formData.specifications?.isImported,
        negotiable: formData.specifications?.negotiable,
        specification: formData.specifications?.specification,
        has_insurance: formData.specifications?.hasInsurance,
        insurance_expiry: formData.specifications?.insuranceExpiry
          ? new Date(formData.specifications.insuranceExpiry).toISOString()
          : new Date().toISOString(),
        insurance_type: formData.specifications?.insuranceType,
        has_warranty: formData.specifications?.hasWarranty,
        warranty_expiry: formData.specifications?.warrantyExpiry
          ? new Date(formData.specifications.warrantyExpiry).toISOString()
          : new Date().toISOString(),
        is_inspected: formData.specifications?.isInspected,
        inspection_report: formData.specifications?.inspectionReport,
        user_id: formData.basicInfo?.userId
          ? Number(formData.basicInfo.userId)
          : user?.id, // will override below if admin posting on behalf
        showroom_id: formData.basicInfo?.showroomId
          ? Number(formData.basicInfo.showroomId)
          : undefined,
        is_business: formData.basicInfo?.showroomId ? true : undefined,
        package_id: formData.package?.packageId
          ? Number(formData.package.packageId)
          : listing?.package_id,
        start_date: listing?.start_date
          ? new Date(listing.start_date).toISOString()
          : new Date().toISOString(),
        end_date: endDate.toISOString(),
        status: formData?.status,
      };


      // ========== 👑 ADMIN POSTING ON BEHALF ========== 
      // Assuming payload might be undefined:
      if (payload && formData.basicInfo?.userId) {
        console.log("👑 Admin posting on behalf of user ID:", formData.basicInfo.userId);
        payload.user_id =  Number(formData.basicInfo.userId);
      }

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

      const savedListing = await res.json();
      const listingId = savedListing.id;

      console.log("✅ Listing saved, ID:", listingId);

      // Send appropriate email notification based on whether this is a new listing or update
      try {
        if (listing) {
          // Send edit request email
          await fetch("/api/send-edit-request-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userEmail: user?.email || "",
              data: {
                firstName: user?.firstName || "User",
                listingTitle: formData.basicInfo?.title || "Your listing",
                adminComments: "Your listing edit has been received",
                editLink: `${process.env.BASE_URL}/listings/${listingId}`,
              },
            }),
          });
        } else {
          // Send pending approval email
          await fetch("/api/send-pending-approval-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userEmail: user?.email || "",
              data: {
                firstName: user?.firstName || "User",
                listingTitle: formData.basicInfo?.title || "Your listing",
                approvalTimeframe: "24-48 hours",
              },
            }),
          });

          // Send featured ad confirmation if applicable
          if (formData.package?.featureDuration && formData.package.featureDuration > 0) {
            await fetch("/api/send-featured-ad-confirmation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userEmail: user?.email || "",
                data: {
                  firstName: user?.firstName || "User",
                  listingTitle: formData.basicInfo?.title || "Your listing",
                  featureDuration: `${formData.package.featureDuration} days`,
                  featureBenefits: [
                    "Increased visibility in search results",
                    "Premium placement on the homepage",
                    "More inquiries from potential buyers",
                  ],
                },
              }),
            });
          }
        }
      } catch (emailError) {
        console.error("❌ Failed to send listing notification email:", emailError);
        toast({
          title: "Warning",
          description: "Listing saved but failed to send notification email",
          variant: "destructive",
        });
      }


      // ================= CAR PARTS SAVE =================
      if (formData.carParts) {
        try {
          const partsPayload = { ...formData.carParts, listingId };
          const partsMethod = listing?.carParts?.id ? "PUT" : "POST";
          const partsUrl = listing?.carParts?.id
            ? `/api/car-parts/${listing.carParts.id}`
            : "/api/car-parts";

          console.log(`🛠 Saving car parts: ${partsMethod} ${partsUrl}`, partsPayload);

          const partsRes = await fetch(partsUrl, {
            method: partsMethod,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(partsPayload),
          });

          if (!partsRes.ok) {
            const errorData = await partsRes.json().catch(() => ({}));
            console.error("❌ Failed to save car parts:", errorData);
            toast({
              title: "Warning",
              description: "Listing saved, but failed to save car parts",
              variant: "destructive",
            });
          } else {
            console.log("✅ Car parts saved successfully");
          }
        } catch (error) {
          console.error("🔥 Error saving car parts:", error);
        }
      }

      // ================= CAR TYRES SAVE =================
      if (formData.carTyres) {
        try {
          const tyresPayload = { ...formData.carTyres, listingId };
          const tyresMethod = listing?.carTyres?.id ? "PUT" : "POST";
          const tyresUrl = listing?.carTyres?.id
            ? `/api/car-tyres/${listing.carTyres.id}`
            : "/api/car-tyres";

          console.log(`🛠 Saving car tyres: ${tyresMethod} ${tyresUrl}`, tyresPayload);

          const tyresRes = await fetch(tyresUrl, {
            method: tyresMethod,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tyresPayload),
          });

          if (!tyresRes.ok) {
            const errorData = await tyresRes.json().catch(() => ({}));
            console.error("❌ Failed to save car tyres:", errorData);
            toast({
              title: "Warning",
              description: "Listing saved, but failed to save car tyres",
              variant: "destructive",
            });
          } else {
            console.log("✅ Car tyres saved successfully");
          }
        } catch (error) {
          console.error("🔥 Error saving car tyres:", error);
        }
      }

      console.log("✅ All processes complete");

      return savedListing;
    },

    onSuccess: (savedListing) => {
      console.log("🎉 Mutation succeeded, handling redirection");
      const role = user?.roleId ? roleMapping[user.roleId] : "DEALER";
      const listingId = savedListing?.id;

      if (role === "SELLER" || role === "DEALER") {
        navigate(`/confirmedlisting/${listingId}`);
      } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
        navigate("/admin/listings");
      }

      toast({
        title: "Success",
        description: savedListing ? "Listing updated" : "Listing created",
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