import { useMutation } from "@tanstack/react-query";
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

      const savedBooking = await res.json();

      // Only send notifications for new bookings (not updates)
      if (!booking) {
        try {
          // Fetch additional data needed for notifications
          const [service, showroom, customer] = await Promise.all([
            fetch(`/api/services/${formData.serviceId}`).then(res => res.json()),
            formData.showroomId
              ? fetch(`/api/showrooms/${formData.showroomId}`).then(res => res.json())
              : Promise.resolve(null),
            fetch(`/api/users/${formData.userId}`).then(res => res.json())
          ]);

          // Format date/time for display
          const bookingDate = new Date(formData.scheduledAt);
          const formattedDate = bookingDate.toLocaleDateString();
          const formattedTime = bookingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // Send customer confirmation email
          await fetch("/api/send-service-booking-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerEmail: customer.email,
              data: {
                firstName: customer.firstName || "Customer",
                serviceName: service.name,
                bookingDate: formattedDate,
                bookingTime: formattedTime,
                garageName: showroom?.name || "Our Service Center",
                garageAddress: showroom?.address || "Contact us for location details",
                contactPhone: showroom?.phone,
                preparationInstructions: service.preparationInstructions,
              },
            }),
          });

          if (showroom && showroom.notificationEmail) {
            await fetch("/api/send-booking-confirmed-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                garageEmail: showroom.notificationEmail,
                data: {
                  firstName: showroom.contactPerson || "Team",
                  serviceName: service.name,
                  bookingDate: formattedDate,
                  bookingTime: formattedTime,
                  location: showroom.address,
                  contactPhone: customer.phone || "Not provided",
                  cancellationPolicy: "24 hours notice required",
                },
              }),
            });
          }


        } catch (emailError) {
          console.error('Failed to send booking notifications:', emailError);
          // Don't fail the booking if notifications fail
          toast({
            title: "Warning",
            description: "Booking saved but failed to send notifications",
            variant: "destructive",
          });
        }
      }

      return savedBooking;
    },

    onSuccess: () => {
      console.log("Booking saved successfully");
      const role = user?.roleId ? roleMapping[user.roleId] : "CUSTOMER";

      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        navigate("/admin/bookings");
      } else if (role === "DEALER" || role === "GARAGE") {
        navigate("/garage-dashboard/bookings");
      } else {
        navigate("/bookings");
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