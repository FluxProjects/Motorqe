import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowUp,
  BarChart3,
  Edit,
  Trash,
  Plus,
  Check,
  RotateCcw,
} from "lucide-react";
import type { AdminCarListing, PromotionPackage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ListingForm } from "../forms/CarListingForm/ListingForm";
import { roleMapping, hasPermission, Permission } from "@shared/permissions";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ListingPlanCards from "../forms/CarListingForm/ListingPlanTable";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useLocation } from "wouter";

interface CarEditCardProps {
  car: AdminCarListing;
}

export default function CarEditCard({ car }: CarEditCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [editOpen, setEditOpen] = useState(false);
  const [showUpgradePlans, setShowUpgradePlans] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);


console.log("car", car);


  const featuredDaysRemaining = (() => {
    if (!car.start_date || !car.end_date) return null;
    const end = new Date(car.end_date);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  })();

   const { data: packages = [], isLoading } = useQuery<PromotionPackage[]>({
    queryKey: ["promotion-packages"],
    queryFn: async () => {
      const res = await fetch("/api/promotion-packages");
      if (!res.ok) throw new Error("Failed to fetch packages");
      return res.json();
    },
  });

  const currentPackage = packages.find((pkg) => pkg.id === car?.package_id);
console.log("currentPackage", currentPackage);
  const getBorderClass = () =>
    car.is_featured ? "border-2 border-orange-500" : "";

  const refreshMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/car-listings/${id}/refresh`, {});
      if (!res.ok) throw new Error("Failed to refresh listing");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Listing refreshed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/car-listings"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : "Failed to refresh",
        variant: "destructive",
      });
    },
  });


  const handleRefresh = () => {
  if (!car?.refresh_left || car?.refresh_left <= 0) {
    toast({
      title: t("common.error"),
      description: "No refreshes remaining",
      variant: "destructive",
    });
    return;
  }

  refreshMutation.mutate(car.id);
};

  const performAction = useMutation({
    mutationFn: async ({
      id,
      action,
      reason,
      featured,
      package: pkg,
    }: {
      id: number;
      action: string;
      reason?: string;
      featured?: boolean;
      package?: PromotionPackage;
    }) => {
      setActionInProgress(true);
      const roleName = roleMapping[user?.roleId];
      const isListingOwner = car?.user_id === user?.id;
      

      if (action === "upgrade") {
        console.log("ACTION:", action);
    console.log("PKG:", pkg);
    console.log("isListingOwner:", isListingOwner);
    console.log("roleName:", roleName);
        if (isListingOwner ||
          ["SUPER_ADMIN", "ADMIN", "MODERATOR", "SENIOR_MODERATOR", "SELLER", "DEALER"].includes(
            roleName
          )
        ) {
          await apiRequest("PUT", `/api/car-listings/${id}/actions`, {
            action: "upgrade",                   // ✅ send action explicitly
            package_id: pkg.id,
            refresh_left: pkg.no_of_refresh      // optional
          });
          return action;
        }
        throw new Error("Unauthorized to upgrade package");
      }

      if (action === "publish" && car?.status === "draft") {
        if (isListingOwner && roleName !== "BUYER") {
          await apiRequest("PUT", `/api/car-listings/${id}/actions`, {
            action: "pending",
            reason,
            featured,
          });
          return action;
        }
      }

      if (action === "publish") {
        if (
          ["SUPER_ADMIN", "ADMIN", "MODERATOR", "SENIOR_MODERATOR"].includes(
            roleName
          )
        ) {
          await apiRequest("PUT", `/api/car-listings/${id}/actions`, {
            action: "active",
            reason,
            featured,
          });
          return action;
        }
        throw new Error("Unauthorized to publish listing");
      }

      if (["approve", "reject"].includes(action)) {
        if (
          ["SUPER_ADMIN", "ADMIN", "MODERATOR", "SENIOR_MODERATOR"].includes(
            roleName
          )
        ) {
          await apiRequest("PUT", `/api/car-listings/${id}/actions`, {
            action,
            reason,
            featured,
          });
          return action;
        }
        throw new Error("Unauthorized to approve/reject listings");
      }

      if (action === "feature") {
        if (["SUPER_ADMIN", "ADMIN"].includes(roleName)) {
          await apiRequest("PUT", `/api/car-listings/${id}/actions`, {
            action,
            reason,
            featured,
          });
          return action;
        }
        throw new Error("Unauthorized to feature listings");
      }

      if (action === "sold") {
        if (
          ["SUPER_ADMIN", "ADMIN"].includes(roleName) ||
          (roleName === "SELLER" &&
            hasPermission(roleName, Permission.MANAGE_OWN_LISTINGS)) ||
          (roleName?.startsWith("DEALER") &&
            hasPermission(roleName, Permission.MANAGE_SHOWROOM_LISTINGS))
        ) {
          await apiRequest("PUT", `/api/car-listings/${id}/actions`, {
            action,
            reason,
            featured,
          });
          return action;
        }
        throw new Error("Unauthorized to mark listing as sold");
      }

      if (action === "delete") {
        if (
          ["SUPER_ADMIN", "ADMIN"].includes(roleName) ||
          (roleName === "SELLER" &&
            hasPermission(roleName, Permission.MANAGE_OWN_LISTINGS)) ||
          (roleName?.startsWith("DEALER") &&
            hasPermission(roleName, Permission.MANAGE_SHOWROOM_LISTINGS))
        ) {
          await apiRequest("DELETE", `/api/car-listings/${id}`);
          return action;
        }
        throw new Error("Unauthorized to delete listing");
      }

      throw new Error("Unsupported action or insufficient permissions");
    },
    onSuccess: (returnedAction) => {
      const actionMessages: Record<string, string> = {
        upgrade: t("admin.packageUpgraded"),
        publish: t("admin.listingPublished"),
        approve: t("admin.listingApproved"),
        reject: t("admin.listingRejected"),
        feature: t("admin.listingFeatured"),
        sold: t("admin.listingSold"),
        delete: t("admin.listingDeleted"),
      };

      toast({
        title: t("common.success"),
        description: actionMessages[returnedAction] || t("admin.actionSuccess"),
      });

      queryClient.invalidateQueries({ queryKey: ["/api/car-listings"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error ? error.message : t("admin.actionFailed"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setActionInProgress(false);
    },
  });

  const submitPackageUpgradeRequest = async (pkg: PromotionPackage) => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/listing-package-upgrade/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: car.id,
          requestedBy: user.id,
          requestedPackageId: pkg.id,
          price: pkg.price,
          currency: pkg.currency,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit upgrade request");

      const data = await response.json();
      
      toast({
        title: t("common.success"),
        description: "Package upgrade request submitted successfully",
      });
      
      setShowUpgradePlans(false);
      navigate(`/package-upgrade-confirmation/${data.id}`);

    } catch (error) {
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : "Failed to submit request",
        variant: "destructive",
      });
    }
  };

  const handleAction = async (actionType: string, pkg?: PromotionPackage) => {
    let confirmText = "Are you sure?";
    switch (actionType) {
      case "upgrade":
        if (!pkg) return;
        confirmText = `Are you sure you want to request upgrade to ${pkg.name} package for ${pkg.price} ${pkg.currency || "QAR"}?`;
        if (window.confirm(confirmText)) {
          await submitPackageUpgradeRequest(pkg);
        }
        return;
      case "feature":
        confirmText = "Are you sure you want to feature this ad?";
        break;
      case "sold":
        confirmText = "Are you sure you want to mark this car as sold?";
        break;
      case "publish":
        confirmText = "Are you sure you want to publish this ad?";
        break;
      case "delete":
        confirmText = "Are you sure you want to delete this ad?";
        break;
    }
    if (!window.confirm(confirmText)) return;

    performAction.mutate({ id: car.id, action: actionType, package: pkg });
  };



  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden ${getBorderClass()}`}
      >
        <div className="relative">
          <img
            src={car.images?.[0] || "/placeholder-car.png"}
            alt={`${car?.make?.name} ${car?.model?.name}`}
            className="w-full h-48 object-cover"
          />
          {car.is_featured && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
              FEATURED
            </div>
          )}
          {car.status === "sold" && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-red-500 text-xl font-extrabold border-red-500 border-2 px-6 py-2 shadow-lg transform rotate-[-10deg] opacity-90">
                SOLD
              </div>
            </div>
          )}
          {/* NEW RIBBON */}
          {car.condition === "new" && car?.status !== "sold" && (
            <div className="absolute top-5 left-[-40px] -rotate-45 bg-red-700 text-white font-black px-20 py-1 text-lg shadow-lg z-10">
              NEW
            </div>
          )}
          {/* LOW MILEAGE RIBBON */}
          {(() => {
            const currentYear = new Date().getFullYear();
            const carYear = parseInt(car.year);
            const yearsOwned = Math.max(currentYear - carYear + 1, 1); // Prevent division by zero
            const avgMileagePerYear = car.mileage / yearsOwned;
            const condition = car.condition?.toLowerCase();

            if (
              condition === "used" &&
              car?.status !== "sold" &&
              avgMileagePerYear < 25000
            ) {
              return (
                <div className="absolute top-10 left-[-60px] -rotate-45 bg-green-500 text-white font-black px-20 py-1 text-sm shadow-lg z-10">
                  LOW MILEAGE
                </div>
              );
            }
            return null;
          })()}
          {car.image360 && (
            <div className="absolute bottom-2 left-2 z-10">
              <img
                src="/src/assets/360-listing.png"
                alt="360 Available"
                className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg"
              />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1">
            {car?.make?.name} {car?.model?.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4">{car?.package_name}</p>

          <div className="flex gap-2 mb-2">
            <button
            className="flex-1 bg-blue-900 text-white py-3 px-2 rounded-xl text-xs hover:opacity-90 flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowUpgradePlans(true)}
            disabled={car.status === "sold" || car.status === "pending"}
          >
            <ArrowUp className="h-5 w-5 mb-1" />
            <span>Upgrade Plan</span>
          </button>

            <button
              className="flex-1 bg-blue-900 text-white py-3 px-2 rounded-xl text-xs hover:opacity-90 flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => navigate("/showroom-dashboard")}
              disabled={car.status === "pending"}
            >
              <BarChart3 className="h-5 w-5 mb-1" />
              <span>Stats</span>
            </button>

            <button
              className="flex-1 bg-blue-900 text-white py-3 px-2 rounded-xl text-xs hover:opacity-90 flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => car.is_featured ? handleRefresh() : navigate(`/sell-car/${car.id}`)}
              disabled={
                (car.is_featured && (car.status === "sold" || car.status === "pending" || car.refresh_left <= 0)) ||
                (!car.is_featured && (car.status === "sold" || car.status === "pending"))
              }
            >
              {car.is_featured ? (
                <>
                  <RotateCcw className="h-5 w-5 mb-1" />
                  <span>
                    Refresh ({car.refresh_left}/{currentPackage?.no_of_refresh || 0})
                  </span>
                </>
              ) : (
                <>
                  <Edit className="h-5 w-5 mb-1" />
                  <span>Edit</span>
                </>
              )}
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              className="flex-1 bg-blue-900 text-white py-3 px-2 rounded-xl text-xs hover:opacity-90 flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => navigate(`/sell-car/${car.id}`)}
              disabled={car.status === "sold" || car.status === "pending"}
            >
              <Edit className="h-5 w-5 mb-1" />
              <span>Edit</span>
            </button>


            <button
              className="flex-1 bg-red-500 text-white py-3 px-2 rounded-xl text-xs hover:bg-red-600 flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleAction("delete")}
              disabled={actionInProgress}
            >
              <Trash className="h-5 w-5 mb-1" />
              <span>Delete</span>
            </button>

            <button
              className="flex-1 bg-green-600 text-white py-3 px-2 rounded-xl text-xs hover:bg-green-700 flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleAction("feature")}
              disabled={
                actionInProgress ||
                car.status === "sold" ||
                car.status === "reject" ||
                car.is_featured ||
                car.status === "pending"
              }
            >
              <ArrowUp className="h-5 w-5 mb-1" />
              <span>Feature Ad</span>
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              className="w-full bg-orange-500 text-white text-center py-3 px-2 rounded-xl text-xs hover:bg-orange-600 flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleAction("sold")}
              disabled={
                actionInProgress ||
                car.status === "sold" ||
                car.status === "pending"
              }
            >
              <Check className="h-5 w-5 mb-1" />
              <span>Sold</span>
            </button>
          </div>

          <div className="text-xs text-gray-500">
            Promotion Start:{" "}
            {car.start_date
              ? format(new Date(car.start_date), "dd/MM/yyyy")
              : "N/A"}{" "}
            &nbsp; | &nbsp; Expires:{" "}
            {car.end_date
              ? format(new Date(car.end_date), "dd/MM/yyyy")
              : "N/A"}
            {car.is_featured && featuredDaysRemaining !== null && (
              <>
                <br />
                Featured Ad Days Remaining:{" "}
                <strong>{featuredDaysRemaining} Days</strong>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <ListingForm
            listing={car}
            onSuccess={() => {
              setEditOpen(false);
              toast({
                title: "Success",
                description: "Listing updated successfully.",
              });
            }}
          />
        </DialogContent>
      </Dialog>

<Dialog open={showUpgradePlans} onOpenChange={setShowUpgradePlans}>
  <DialogContent className="max-w-3xl p-0 overflow-hidden">
    <div className="p-6">
      <DialogTitle className="text-xl font-bold mb-4">Upgrade Your Listing Plan</DialogTitle>
      <ListingPlanCards
              packageslist={packages.filter(pkg => 
                pkg.is_active && 
                (!car.package_id || pkg.price > currentPackage?.price)
              )}
              selectedPackageId={car.package_id}
              onSelect={(selectedPackage) => {
                handleAction("upgrade", selectedPackage);
              }}
            />
    </div>
  </DialogContent>
</Dialog>
    </>
  );
}