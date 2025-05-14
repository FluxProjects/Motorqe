// components/admin/listings/ListingFormDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ServiceListingForm } from "@/components/forms/ServiceListingForm/ServiceListingForm";
import { AdminServiceBooking } from "@shared/schema";

interface ListingFormDialogProps {
  service?: AdminServiceBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ServiceListingFormDialog = ({
  service,
  open,
  onOpenChange,
  onSuccess,
}: ListingFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {service ? "Edit Service" : "Create New Service"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <ServiceListingForm 
            service={service}
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