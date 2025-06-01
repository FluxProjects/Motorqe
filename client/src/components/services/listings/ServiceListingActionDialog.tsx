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
        return hasPermission(roleName, Permission.MANAGE_SERVICE_PROMOTIONS);
      case "approve":
      case "reject":
        return hasPermission(roleName, Permission.MANAGE_SHOWROOM_SERVICES);
      case "publish":
        return (
                    (isListingOwner && hasPermission(roleName, Permission.MANAGE_OWN_SERVICES)) ||
                    hasPermission(roleName, Permission.MANAGE_ALL_SERVICES)
                );
      case "delete":
        return (
          (service?.showroomId === service?.showroom?.id && 
           hasPermission(roleName, Permission.MANAGE_OWN_SERVICES)) ||
          hasPermission(roleName, Permission.MANAGE_ALL_SERVICES));
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
          title: service.isFeatured 
            ? t("services.unfeatureService")
            : t("services.featureService"),
          description: service.isFeatured
            ? t("services.unfeatureServiceDesc")
            : t("services.featureServiceDesc"),
          icon: <Star className="h-4 w-4 mr-2" />,
          buttonClass: "bg-yellow-600 hover:bg-yellow-700",
        };
      case "approve":
        return {
          title: t("services.activateService"),
          description: t("services.activateServiceDesc"),
          icon: <Check className="h-4 w-4 mr-2" />,
          buttonClass: "bg-green-700 hover:bg-green-800",
        };
      case "reject":
        return {
          title: t("services.deactivateService"),
          description: t("services.deactivateServiceDesc"),
          icon: <X className="h-4 w-4 mr-2" />,
          buttonClass: "bg-red-700 hover:bg-red-800",
        };
      case "delete":
        return {
          title: t("services.deleteService"),
          description: t("services.deleteServiceDesc"),
          icon: <Trash2 className="h-4 w-4 mr-2" />,
          buttonClass: "bg-red-700 hover:bg-red-800",
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
                  <DialogTitle className="text-white">
                      {actionType === "publish" && t("admin.publishListing")}
                      {actionType === "approve" && t("admin.approveListing")}
                      {actionType === "reject" && t("admin.rejectListing")}
                      {actionType === "feature" && t("admin.featureListing")}
                      {actionType === "delete" && t("admin.deleteListing")}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                      {actionType === "publish" && t("admin.publishListingDesc")}
                      {actionType === "approve" && t("admin.approveListingDesc")}
                      {actionType === "reject" && t("admin.rejectListingDesc")}
                      {actionType === "feature" && t("admin.featureListingDesc")}
                      {actionType === "delete" && (
                          <>
                              {isListingOwner
                                  ? t("admin.deleteOwnListingDesc")
                                  : t("admin.deleteListingDesc")}
                          </>
                      )}
                  </DialogDescription>
              </DialogHeader>

                                {actionType === "feature" && (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="featured"
                                                defaultChecked={true}
                                                className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
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
                                    <div className={`p-3 rounded-md text-sm ${
                                        isListingOwner 
                                            ? "bg-amber-900/20 border border-amber-800 text-amber-300"
                                            : "bg-red-900/20 border border-red-800 text-red-300"
                                    }`}>
                                        <p>
                                            {isListingOwner
                                                ? t("admin.deleteOwnListingWarning")
                                                : t("admin.deleteListingWarning")}
                                        </p>
                                    </div>
                                )}

        <div className="space-y-4 py-4">
          {actionType === "feature" && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  defaultChecked={true}
                  className="border-slate-500 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
                />
                <Label htmlFor="featured" className="text-slate-300">
                  {t("services.markAsFeatured")}
                </Label>
              </div>
              <p className="text-sm text-slate-400">
                {t("services.featuredServiceInfo")}
              </p>
            </div>
          )}

          {actionType === "delete" && (
            <div className="p-3 rounded-md text-sm bg-red-900/20 border border-red-800 text-red-300">
              <p>{t("services.deleteServiceWarning")}</p>
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
                      className={`
                        ${
                              actionType === "publish"
                                  ? "bg-green-700 hover:bg-green-800"
                                  : ""
                          }  
                        ${
                              actionType === "approve"
                                  ? "bg-green-700 hover:bg-green-800"
                                  : ""
                          }
                          ${
                              actionType === "reject"
                                  ? "bg-amber-700 hover:bg-amber-800"
                                  : ""
                          }
                          ${
                              actionType === "feature"
                                  ? "bg-blue-700 hover:bg-blue-800"
                                  : ""
                          }
                          ${
                              actionType === "delete"
                                  ? "bg-red-700 hover:bg-red-800"
                                  : ""
                          }
                          text-white
                      `}
                  >
                      {actionInProgress ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                          <>
                              {actionType === "publish" && (
                                  <Check className="h-4 w-4 mr-2" />
                              )}
                              {actionType === "approve" && (
                                  <Check className="h-4 w-4 mr-2" />
                              )}
                              {actionType === "reject" && (
                                  <X className="h-4 w-4 mr-2" />
                              )}
                              {actionType === "feature" && (
                                  <Star className="h-4 w-4 mr-2" />
                              )}
                              {actionType === "delete" && (
                                  <Trash2 className="h-4 w-4 mr-2" />
                              )}
                          </>
                      )}
                     {actionType === "publish" && t("admin.publishListing")}
                      {actionType === "approve" && t("admin.approveListing")}
                      {actionType === "reject" && t("admin.rejectListing")}
                      {actionType === "feature" && t("admin.featureListing")}
                      {actionType === "delete" && t("admin.deleteListing")}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
  );
};