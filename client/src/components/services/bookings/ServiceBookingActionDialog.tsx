import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Clock, Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminServiceBooking, ServiceBookingAction } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { Permission, roleMapping, hasPermission } from "@shared/permissions";

interface ServiceBookingActionDialogProps {
  booking: AdminServiceBooking;
  actionType: ServiceBookingAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionReason: string;
  setActionReason: (reason: string) => void;
  actionInProgress: boolean;
  confirmAction: () => void;
}

export const ServiceBookingActionDialog = ({
  booking,
  actionType,
  open,
  onOpenChange,
  actionReason,
  setActionReason,
  actionInProgress,
  confirmAction,
}: ServiceBookingActionDialogProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const hasActionPermission = () => {
    if (!user) return false;
    const roleName = roleMapping[user.roleId];

    switch (actionType) {
      case "confirm":
      case "reject":
        return hasPermission(roleName, Permission.MANAGE_SERVICE_BOOKINGS);
      case "reschedule":
      case "complete":
      case "cancel":
        return hasPermission(roleName, Permission.MANAGE_OWN_BOOKINGS) || 
               hasPermission(roleName, Permission.MANAGE_SERVICE_BOOKINGS);
      default:
        return false;
    }
  };

  const isActionDisabled = () => {
    if (!hasActionPermission()) return true;
    return actionType === "reject" && !actionReason.trim();
  };

  if (!hasActionPermission()) {
    return null;
  }

  const getActionDetails = () => {
    switch (actionType) {
      case "confirm":
        return {
          title: t("bookings.confirmBooking"),
          description: t("bookings.confirmBookingDesc"),
          icon: <Check className="h-4 w-4 mr-2" />,
          buttonClass: "bg-green-700 hover:bg-green-800",
        };
      case "reject":
        return {
          title: t("bookings.rejectBooking"),
          description: t("bookings.rejectBookingDesc"),
          icon: <X className="h-4 w-4 mr-2" />,
          buttonClass: "bg-red-700 hover:bg-red-800",
        };
      case "reschedule":
        return {
          title: t("bookings.rescheduleBooking"),
          description: t("bookings.rescheduleBookingDesc"),
          icon: <Clock className="h-4 w-4 mr-2" />,
          buttonClass: "bg-blue-700 hover:bg-blue-800",
        };
      case "complete":
        return {
          title: t("bookings.completeBooking"),
          description: t("bookings.completeBookingDesc"),
          icon: <Check className="h-4 w-4 mr-2" />,
          buttonClass: "bg-purple-700 hover:bg-purple-800",
        };
      case "cancel":
        return {
          title: t("bookings.cancelBooking"),
          description: t("bookings.cancelBookingDesc"),
          icon: <X className="h-4 w-4 mr-2" />,
          buttonClass: "bg-amber-700 hover:bg-amber-800",
        };
      default:
        return {
          title: "",
          description: "",
          icon: null,
          buttonClass: "",
        };
    }
  };

  const { title, description, icon, buttonClass } = getActionDetails();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {(actionType === "reject" || actionType === "cancel") && (
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-slate-300">
                {t("bookings.reason")}
              </Label>
              <Textarea
                id="reason"
                placeholder={
                  actionType === "reject"
                    ? t("bookings.rejectionReasonPlaceholder")
                    : t("bookings.cancellationReasonPlaceholder")
                }
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                required
              />
            </div>
          )}

          {actionType === "cancel" && (
            <div className="p-3 rounded-md text-sm bg-amber-900/20 border border-amber-800 text-amber-300">
              <p>{t("bookings.cancelBookingWarning")}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            disabled={actionInProgress}
          >
            {t("common.cancel")}
          </Button>

          <Button
            onClick={confirmAction}
            disabled={isActionDisabled() || actionInProgress}
            className={`${buttonClass} text-white`}
          >
            {actionInProgress ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              icon
            )}
            {title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};