// components/admin/listings/ListingFormDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ListingForm } from "@/components/forms/ListingForm/ListingForm";
import { AdminCarListing } from "@shared/schema";

interface ListingFormDialogProps {
  listing?: AdminCarListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CarListingFormDialog = ({
  listing,
  open,
  onOpenChange,
  onSuccess,
}: ListingFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {listing ? "Edit Listing" : "Create New Listing"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <ListingForm 
            listing={listing}
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