import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import {
    Eye,
    Check,
    X,
    Star,
    Trash2,
    CheckCircle,
    MapPin,
  } from "lucide-react";
  import { useTranslation } from "react-i18next";
  import { AdminCarListing, AdminCarListingAction } from "@shared/schema";
  
  interface ListingDetailsDialogProps {
    listing: AdminCarListing;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    handleAction: (listing: AdminCarListing, action: AdminCarListingAction) => void;
  }
  
  export const CarListingDetailDialog = ({
    listing,
    open,
    onOpenChange,
    handleAction,
  }: ListingDetailsDialogProps) => {
    const { t } = useTranslation();
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              {listing.title}
              {listing.titleAr && (
                <div className="text-sm text-slate-400 mt-1">
                  {listing.titleAr}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Main Image */}
            <div>
              {listing.images && listing.images.length > 0 && (
                <div className="overflow-hidden rounded-lg bg-slate-700 aspect-video">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
  
              {/* Image Gallery */}
              {listing.images && listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {listing.images
                    .slice(1, 5)
                    .map((image: string, index: number) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-md bg-slate-700 aspect-video"
                      >
                        <img
                          src={image}
                          alt={`${listing.title} ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
  
            {/* Listing Details */}
            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {listing.title}
                  </h3>
                  {listing.titleAr && (
                    <div className="text-sm text-slate-400">
                      {listing.titleAr}
                    </div>
                  )}
                  <div className="flex items-center mt-1 text-slate-400">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{listing.location}</span>
                    {listing.locationAr && (
                      <span className="mr-2"> / {listing.locationAr}</span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-blue-400 mt-2">
                    ${listing.price.toLocaleString()}
                  </div>
                </div>
  
                <div className="bg-slate-700/50 p-3 rounded-lg">
                  <h4 className="font-medium text-slate-300 mb-2">
                    {t("car.carDetails")}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("car.make")}</span>
                      <span className="text-white">
                        {listing.make?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("car.model")}</span>
                      <span className="text-white">
                        {listing.model?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("car.category")}</span>
                      <span className="text-white">
                        {listing.category?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("car.year")}</span>
                      <span className="text-white">{listing.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("car.mileage")}</span>
                      <span className="text-white">
                        {listing.mileage?.toLocaleString() || "0"} mi
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("car.fuelType")}</span>
                      <span className="text-white capitalize">
                        {listing.fuel_type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {t("car.transmission")}
                      </span>
                      <span className="text-white capitalize">
                        {listing.transmission}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("car.color")}</span>
                      <span className="text-white capitalize">
                        {listing.color}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("car.condition")}</span>
                      <span className="text-white capitalize">
                        {listing.condition}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("car.views")}</span>
                      <span className="text-white">{listing.views || 0}</span>
                    </div>
                  </div>
                </div>
  
                <div className="bg-slate-700/50 p-3 rounded-lg">
                  <h4 className="font-medium text-slate-300 mb-2">
                    {t("admin.sellerInfo")}
                  </h4>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={listing.seller?.avatar} />
                      <AvatarFallback className="bg-blue-600">
                        {listing.seller?.username?.charAt(0).toUpperCase() || "J"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white">
                        {listing.seller?.username || "John Doe"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {t("admin.contact")}: {listing.contact_number || "N/A"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {t("admin.memberSince")}:{" "}
                        {listing.seller?.created_at
                          ? new Date(listing.seller.created_at).getFullYear()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
  
                <div className="bg-slate-700/50 p-3 rounded-lg">
                  <h4 className="font-medium text-slate-300 mb-2">
                    {t("admin.listingStatus")}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("common.status")}</span>
                      <span className="text-white">{listing.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {t("admin.listedOn")}
                      </span>
                      <span className="text-white">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {t("admin.lastUpdated")}
                      </span>
                      <span className="text-white">
                        {listing.updated_at
                          ? new Date(listing.updated_at).toLocaleDateString()
                          : "Never"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {t("admin.featured")}
                      </span>
                      <span className="text-white">
                        {listing.is_featured ? (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            <Star className="h-3 w-3 mr-1 fill-purple-800" />
                            {t("common.yes")}
                          </Badge>
                        ) : (
                          t("common.no")
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("admin.active")}</span>
                      <span className="text-white">
                        {listing.is_active ? t("common.yes") : t("common.no")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Description */}
          <div className="mt-4 bg-slate-700/50 p-3 rounded-lg">
            <h4 className="font-medium text-slate-300 mb-2">
              {t("car.description")}
            </h4>
            <p className="text-slate-300 text-sm whitespace-pre-line">
              {listing.description || t("car.noDescription")}
            </p>
            {listing.descriptionAr && (
              <>
                <h4 className="font-medium text-slate-300 mt-4 mb-2">
                  {t("car.descriptionAr")}
                </h4>
                <p
                  className="text-slate-300 text-sm whitespace-pre-line text-right"
                  dir="rtl"
                >
                  {listing.descriptionAr}
                </p>
              </>
            )}
          </div>
  
          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-slate-700 hover:bg-slate-700"
            >
              {t("common.close")}
            </Button>
  
            <div className="space-x-2">
              {listing.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    className="border-red-800 bg-red-900/20 text-red-400 hover:bg-red-900/30"
                    onClick={() => {
                      onOpenChange(false);
                      handleAction(listing, "reject");
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t("admin.reject")}
                  </Button>
  
                  <Button
                    className="bg-green-700 hover:bg-green-800 text-white"
                    onClick={() => {
                      onOpenChange(false);
                      handleAction(listing, "approve");
                    }}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {t("admin.approve")}
                  </Button>
                </>
              )}
  
              {listing.status === "active" && (
                <>
                  {!listing.is_featured && (
                    <Button
                      className="bg-amber-700 hover:bg-amber-800 text-white"
                      onClick={() => {
                        onOpenChange(false);
                        handleAction(listing, "feature");
                      }}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      {t("admin.featureListing")}
                    </Button>
                  )}
                  <Button
                    className="bg-blue-700 hover:bg-blue-800 text-white"
                    onClick={() => {
                      onOpenChange(false);
                      handleAction(listing, "sold");
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t("admin.markAsSold")}
                  </Button>
                </>
              )}

              {listing.status === "draft" && (
                <>
                  <Button
                    className="bg-blue-700 hover:bg-blue-800 text-white"
                    onClick={() => {
                      onOpenChange(false);
                      handleAction(listing, "publish");
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t("admin.markAsSold")}
                  </Button>
                </>
              )}
  
              <Button
                variant="destructive"
                onClick={() => {
                  onOpenChange(false);
                  handleAction(listing, "delete");
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };