import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Check, X, Star, Trash2, CheckCircle, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminCarListing, AdminCarListingAction } from "@shared/schema";
import { Label } from "@/components/ui/label";
import GoogleMaps from "@/components/ui/google-maps";

interface ListingDetailsDialogProps {
  listing: AdminCarListing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleAction: (
    listing: AdminCarListing,
    action: AdminCarListingAction
  ) => void;
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
            {listing.title_ar && (
              <div className="text-sm text-slate-400 mt-1">
                {listing.title_ar}
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

              
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b pb-1">
            {t("listing.status")}
          </h3>
          <div className="bg-slate-700/50 p-3 rounded-lg">
                
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
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b pb-1">
            {t("listing.basicInfo")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t("listing.title")}</Label>
              <p className="font-medium">
                {listing.title || t("listing.notSpecified")}
              </p>
            </div>

            <div>
              <Label>{t("listing.price")}</Label>
              <p className="font-medium">
                {listing.currency || "QR"}{" "}
                {listing.price ? `${listing.price}` : t("listing.notSpecified")}
              </p>
            </div>

            <div className="md:col-span-2">
              <Label>{t("listing.description")}</Label>
              <p className="whitespace-pre-line">
                {listing.description || t("listing.noDescription")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <Label>{t("listing.location")}</Label>
              <p className="font-medium">
                {listing.location && (
                  <GoogleMaps
                    center={{
                      lat: parseFloat(listing.location.split(",")[0]),
                      lng: parseFloat(listing.location.split(",")[1]),
                    }}
                    zoom={17}
                    markers={[
                      {
                        lat: parseFloat(listing.location.split(",")[0]),
                        lng: parseFloat(listing.location.split(",")[1]),
                      },
                    ]}
                    className="rounded-md border mt-2 h-8 w-full" // 👈 reduced from h-12
                  />
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b pb-1">
            {t("listing.specifications")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t("listing.category")}</Label>
              <p>{listing.category_id || t("listing.notSpecified")}</p>
            </div>
            <div>
              <Label>{t("listing.make")}</Label>
              <p>{listing?.make?.name || t("listing.notSpecified")}</p>
            </div>
            <div>
              <Label>{t("listing.model")}</Label>
              <p>{listing?.model?.name || t("listing.notSpecified")}</p>
            </div>
            <div>
              <Label>{t("listing.year")}</Label>
              <p>{listing.year || t("listing.notSpecified")}</p>
            </div>
            <div>
              <Label>{t("listing.mileage")}</Label>
              <p>{listing.mileage}</p>
            </div>
            <div>
              <Label>{t("listing.fuelType")}</Label>
              <p>{listing.fuel_type || t("listing.notSpecified")}</p>
            </div>
            <div>
              <Label>{t("listing.transmission")}</Label>
              <p>{listing.transmission || t("listing.notSpecified")}</p>
            </div>
            <div>
              <Label>{t("listing.engineCapacity")}</Label>
              <p>{listing.size_liters}</p>
            </div>
            <div>
              <Label>{t("listing.cylinderCount")}</Label>
              <p>{listing.cylinderCount}</p>
            </div>
            <div>
              <Label>{t("listing.color")}</Label>
              <p>{listing.color || t("listing.notSpecified")}</p>
            </div>
            <div>
              <Label>{t("listing.interiorColor")}</Label>
              <p>{listing.interiorColor}</p>
            </div>
            <div>
              <Label>{t("listing.tinted")}</Label>
              <p>{listing.tinted}</p>
            </div>
            <div>
              <Label>{t("listing.condition")}</Label>
              <p>{listing.condition || t("listing.notSpecified")}</p>
            </div>

            <div>
              <Label>{t("listing.isImported")}</Label>
              <p>
                {listing.is_imported === "true"
                  ? t("listing.yes")
                  : listing.is_imported === "false"
                  ? t("listing.no")
                  : t("listing.notSpecified")}
              </p>
            </div>

            <div>
              <Label>{t("listing.isInspected")}</Label>
              <p>
                {listing.is_inspected === "true"
                  ? t("listing.yes")
                  : listing.is_inspected === "false"
                  ? t("listing.no")
                  : t("listing.notSpecified")}
              </p>
            </div>

            {listing.inspection_report && (
              <div>
                <Label>{t("listing.inspectionReport")}</Label>
                <p>
                  {listing.inspection_report.split("/").pop() ||
                    t("listing.notSpecified")}
                </p>
              </div>
            )}

            {listing.has_insurance === "true" && (
              <>
                <div>
                  <Label>{t("listing.hasInsurance")}</Label>
                  <p>{t("listing.yes")}</p>
                </div>
                <div>
                  <Label>{t("listing.insuranceExpiry")}</Label>
                  <p>{listing.insurance_expiry}</p>
                </div>
              </>
            )}

            {listing.has_warranty === "true" && (
              <>
                <div>
                  <Label>{t("listing.hasWarranty")}</Label>
                  <p>{t("listing.yes")}</p>
                </div>
                <div>
                  <Label>{t("listing.warrantyExpiry")}</Label>
                  <p>{listing.warranty_expiry}</p>
                </div>
              </>
            )}
          </div>
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
