// components/admin/listings/ListingFormDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ServiceBookingForm } from "@/components/forms/ServiceBookingForm/ServiceBookingForm";
import { AdminServiceBooking, ServiceBooking } from "@shared/schema"

interface BookingFormDialogProps {
  booking?: ServiceBooking;
  isEditing: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ServiceBookingFormDialog = ({
  booking,
  isEditing,
  open,
  onOpenChange,
  onSuccess,
}: BookingFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {booking ? "Edit Booking" : "Create New Booking"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <ServiceBookingForm 
            booking={booking}
            onSuccess={() => {
              onOpenChange(false);
              onSuccess?.();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};