import { UseMutateFunction, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { ServiceBookingFormData, AdminServiceBooking } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { roleMapping } from "@shared/permissions";

interface ServiceBookingMutationVariables {
  formData: ServiceBookingFormData;
  booking?: AdminServiceBooking | null;
}

export const useServiceBookingFormHandler = (onSuccess?: () => void) => {
  const auth = useAuth();
  const user = auth?.user;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  return useMutation<
    Response,
    Error,
    ServiceBookingMutationVariables,
    unknown
  >({
    mutationFn: async ({ formData, booking }) => {
      console.log("Starting booking form submission");
      console.log("Form data:", formData);
      console.log("Existing booking:", booking);

      const payload = {
        serviceId: formData.serviceId,
        userId: formData.userId,
        showroomId: formData.showroomId,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        notes: formData.notes,
        status: formData.status,
        price: formData.price,
        currency: formData.currency,
      };

      console.log("Constructed payload:", payload);

      const method = booking ? "PUT" : "POST";
      const url = booking 
        ? `/api/service-bookings/${booking.id}`
        : "/api/service-bookings";

      console.log(`Sending ${method} request to ${url}`);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Failed to save booking");
      }

      return res;
    },

    onSuccess: () => {
      console.log("Booking saved successfully");
      const role = user?.roleId ? roleMapping[user.roleId] : "CUSTOMER";
      
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        navigate("/admin/bookings");
      } else if (role === "SHOWROOM_BASIC" || role === "SHOWROOM_PREMIUM") {
        navigate("/showroom-dashboard/bookings");
      } else {
        navigate("/my-bookings");
      }

      toast({
        title: "Success",
        description: booking ? "Booking updated" : "Booking created",
      });
      onSuccess?.();
    },

    onError: (error: Error) => {
      console.error("Booking save failed:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};