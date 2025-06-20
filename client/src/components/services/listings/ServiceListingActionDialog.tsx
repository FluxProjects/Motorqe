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
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Check, X, Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ServiceListingAction, AdminServiceListing } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { Permission, roleMapping, hasPermission } from "@shared/permissions";

interface ServiceListingActionDialogProps {
  service: AdminServiceListing;
  actionType: ServiceListingAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionReason: string;
  setActionReason: (reason: string) => void;
  actionInProgress: boolean;
  confirmAction: () => void;
}

export const ServiceListingActionDialog = ({
  service,
  actionType,
  open,
  onOpenChange,
  actionReason,
  setActionReason,
  actionInProgress,
  confirmAction,
}: ServiceListingActionDialogProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const isListingOwner = user && service?.user?.id === user.id;

  const hasActionPermission = () => {
    if (!user) return false;
    const roleName = roleMapping[user?.roleId];

    console.log("Listing Owner:", service?.user?.id, "Current User ID:", user.id, "Current rolename", roleName);

    switch (actionType) {
      case "feature":
      case "unfeature":
        return hasPermission(roleName, Permission.MANAGE_PROMOTIONS);
      case "approve":
      case "reject":
        return hasPermission(roleName, Permission.APPROVE_LISTINGS);
      case "publish":
        return (
          (isListingOwner && hasPermission(roleName, Permission.MANAGE_OWN_SERVICES)) ||
          hasPermission(roleName, Permission.MANAGE_ALL_SERVICES)
        );
      case "delete":
        return (
          (isListingOwner && hasPermission(roleName, Permission.MANAGE_OWN_SERVICES)) ||
          hasPermission(roleName, Permission.MANAGE_ALL_SERVICES)
        );
      default:
        return false;
    }
  };

  const isActionDisabled = () => {
    if (!hasActionPermission()) return true;

    switch (actionType) {
      case "reject":
        return !actionReason.trim();
      default:
        return false;
    }
  };

  if (!hasActionPermission()) {
    return null;
  }

  const getActionDetails = () => {
    switch (actionType) {
      case "feature":
        return {
          title: t("admin.featureListing"),
          description: t("admin.featureListingDesc"),
          icon: <Star className="h-4 w-4 mr-2" />,
          buttonClass: "bg-yellow-600 hover:bg-yellow-700",
        };
      case "unfeature":
        return {
          title: t("admin.unfeatureListing"),
          description: t("admin.unfeatureListingDesc"),
          icon: <Star className="h-4 w-4 mr-2" />,
          buttonClass: "bg-yellow-600 hover:bg-yellow-700",
        };
      case "approve":
        return {
          title: t("admin.approveListing"),
          description: t("admin.approveListingDesc"),
          icon: <Check className="h-4 w-4 mr-2" />,
          buttonClass: "bg-green-700 hover:bg-green-800",
        };
      case "reject":
        return {
          title: t("admin.rejectListing"),
          description: t("admin.rejectListingDesc"),
          icon: <X className="h-4 w-4 mr-2" />,
          buttonClass: "bg-red-700 hover:bg-red-800",
        };
      case "delete":
        return {
          title: t("admin.deleteListing"),
          description: t("admin.deleteListingDesc"),
          icon: <Trash2 className="h-4 w-4 mr-2" />,
          buttonClass: "bg-red-700 hover:bg-red-800",
        };
      case "publish":
        return {
          title: t("admin.publishListing"),
          description: t("admin.publishListingDesc"),
          icon: <Check className="h-4 w-4 mr-2" />,
          buttonClass: "bg-blue-700 hover:bg-blue-800",
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

        {actionType === "feature" && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                defaultChecked={true}
                className="border-slate-500 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
              />
              <Label htmlFor="featured" className="text-slate-300">
                {t("admin.markAsFeatured")}
              </Label>
            </div>
            <p className="text-sm text-slate-400">
              {t("admin.featuredListingInfo")}
            </p>
          </div>
        )}

        {actionType === "delete" && (
          <div
            className={`p-3 rounded-md text-sm ${
              isListingOwner
                ? "bg-amber-900/20 border border-amber-800 text-amber-300"
                : "bg-red-900/20 border border-red-800 text-red-300"
            }`}
          >
            <p>
              {isListingOwner
                ? t("admin.deleteOwnListingWarning")
                : t("admin.deleteListingWarning")}
            </p>
          </div>
        )}

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
              <>
                {icon}
                {title}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};