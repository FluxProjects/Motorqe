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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Check,
  X,
  Star,
  Trash2,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminCarListing, AdminCarListingAction } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { Permission, roleMapping, hasPermission } from "@shared/permissions";

interface ActionDialogProps {
  listing: AdminCarListing;
  actionType: AdminCarListingAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionReason: string;
  setActionReason: (reason: string) => void;
  actionInProgress: boolean;
  confirmAction: () => void;
}

export const CarListingActionDialog = ({
  listing,
  actionType,
  open,
  onOpenChange,
  actionReason,
  setActionReason,
  actionInProgress,
  confirmAction,
}: ActionDialogProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const isListingOwner = user && listing.user_id === user.id;

 const hasActionPermission = () => {
    if (!user) return false;

    const roleName = roleMapping[user?.roleId];

    console.log("Listing Owner:", listing.user_id, "Current User ID:", user.id, "Current rolename", roleName);


    switch (actionType) {
        case "approve":
        case "reject":
            return hasPermission(roleName, Permission.APPROVE_LISTINGS) ||
                   hasPermission(roleName, Permission.MANAGE_ALL_LISTINGS);

        case "feature":
            console.log('Checking feature permission for role:', roleName);
            console.log('Has Manage All Listings Permission:', hasPermission(roleName, Permission.MANAGE_ALL_LISTINGS));
            console.log('Has Create Promotions Permission:', hasPermission(roleName, Permission.CREATE_PROMOTIONS));
            
            return (
                hasPermission(roleName, Permission.MANAGE_ALL_LISTINGS) || 
                hasPermission(roleName, Permission.CREATE_PROMOTIONS)
            );

        case "publish":
        case "sold":
            return (
                        (isListingOwner && hasPermission(roleName, Permission.MANAGE_OWN_LISTINGS)) ||
                        hasPermission(roleName, Permission.MANAGE_ALL_LISTINGS)
                    );

        case "delete":
            if (isListingOwner) {
                return hasPermission(roleName, Permission.MANAGE_OWN_LISTINGS);
            }
            return hasPermission(roleName, Permission.MANAGE_ALL_LISTINGS);

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

// Only render dialog if user has permission
if (!hasActionPermission()) {
    return null;
}


  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="bg-slate-800 text-white border-slate-700">
              <DialogHeader>
                  <DialogTitle className="text-white">
                      {actionType === "publish" && t("admin.publishListing")}
                      {actionType === "approve" && t("admin.approveListing")}
                      {actionType === "reject" && t("admin.rejectListing")}
                      {actionType === "sold" && t("admin.markSoldListing")}
                      {actionType === "feature" && t("admin.featureListing")}
                      {actionType === "delete" && t("admin.deleteListing")}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                      {actionType === "publish" && t("admin.publishListingDesc")}
                      {actionType === "approve" && t("admin.approveListingDesc")}
                      {actionType === "reject" && t("admin.rejectListingDesc")}
                      {actionType === "sold" && t("admin.markSoldListingDesc")}
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

              <div className="space-y-4 py-4">
                  {actionType === "reject" && (
                      <div className="space-y-2">
                          <Label htmlFor="reason" className="text-slate-300">
                              {t("admin.rejectionReason")}
                          </Label>
                          <Textarea
                              id="reason"
                              placeholder={t("admin.rejectionReasonPlaceholder")}
                              value={actionReason}
                              onChange={(e) => setActionReason(e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                              required
                          />
                      </div>
                  )}

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
                  
                  {actionType === "sold" && (
                        <div className={`p-3 rounded-md text-sm ${
                            isListingOwner 
                                ? "bg-blue-900/20 border border-blue-800 text-blue-300"
                                : "bg-purple-900/20 border border-purple-800 text-purple-300"
                        }`}>
                            <p>
                                {isListingOwner
                                    ? t("admin.markSoldOwnListingWarning")
                                    : t("admin.markSoldListingWarning")}
                            </p>
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
                            actionType === "sold"
                                ? "bg-purple-700 hover:bg-purple-800"
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
                              {actionType === "sold" && (
                                  <Check className="h-4 w-4 mr-2" />
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
                      {actionType === "sold" && t("admin.soldListing")}
                      {actionType === "feature" && t("admin.featureListing")}
                      {actionType === "delete" && t("admin.deleteListing")}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
  );
};