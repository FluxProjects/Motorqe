import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wrench, Star, Check, X, MapPin, Trash2, Edit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminServiceListing, ServiceListingAction } from "@shared/schema";
import { formatAvailability } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

interface ServiceListingDetailDialogProps {
  service: AdminServiceListing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleAction: (service: AdminServiceListing, action: ServiceListingAction) => void;
}

export const ServiceListingDetailDialog = ({
  service,
  open,
  onOpenChange,
  handleAction,
}: ServiceListingDetailDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-gray-800 border-gray-200 max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900 flex items-center">
            <Wrench className="h-5 w-5 mr-2 text-blue-600" />
            {t("services.serviceDetails")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Service Image */}
            {service?.service?.image && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="mt-3 overflow-hidden rounded-lg">
                  <img
                    src={service?.service.image}
                    alt={service?.service.name}
                    className="w-full h-auto max-h-48 object-contain mx-auto"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-900">
                {t("services.description")}
              </h3>
              <p className="text-gray-600 mt-2 whitespace-pre-line">
                {service.description || t("services.noDescription")}
              </p>
              {service.descriptionAr && (
                <>
                  <h4 className="font-semibold text-lg mt-4 text-gray-900">
                    {t("services.descriptionAr")}
                  </h4>
                  <p className="text-gray-600 mt-2 whitespace-pre-line text-right" dir="rtl">
                    {service.descriptionAr}
                  </p>
                </>
              )}
            </div>

            {/* Status & Featured */}
            <div className="flex gap-4">
              <div>
                <h4 className="text-gray-500 text-sm font-medium">
                  {t("services.status")}
                </h4>
                <div className="mt-1">
                  {StatusBadge(service?.status)}
                </div>
              </div>
              
              <div>
                <h4 className="text-gray-500 text-sm font-medium">
                  {t("services.featured")}
                </h4>
                <div className="mt-1">
                  {service.isFeatured ? (
                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Star className="h-3 w-3 mr-1" />
                      {t("services.featured")}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-50 text-gray-700 border-gray-200">
                      {t("services.standard")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Service Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-900">
                {t("services.name")}
              </h3>
              
              <div className="mt-3 space-y-4">
                <div>
                  <p className="text-gray-900 font-medium">
                    {service.service?.name || t("services.unknownService")}
                  </p>
                  {service.service?.nameAr && (
                    <p className="text-gray-900 font-medium text-right" dir="rtl">
                      {service.service.nameAr}
                    </p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-gray-500 text-sm font-medium">
                    {t("services.price")}
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {service.price} {service.currency}
                  </p>
                </div>
              </div>
            </div>

            {/* Showroom Details */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                {t("services.showroomInfo")}
              </h3>
              
              <div className="mt-3 flex items-start">
                <Avatar className="h-12 w-12 mr-3 border border-gray-200">
                  <AvatarImage src={service.showroom?.logo} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {service.showroom?.name?.charAt(0).toUpperCase() || "S"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h4 className="text-gray-900 font-medium">
                    {service.showroom_name || t("services.unknownShowroom")}
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {service.showroom_location || "N/A"}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {service.showroom_phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-900">
                {t("services.availability")}
              </h3>
              <p className="text-gray-600 mt-2">
                {(() => {
                  try {
                    const availability = typeof service?.availability === "string"
                      ? JSON.parse(service.availability)
                      : service?.availability;
                    return formatAvailability(availability) || t("services.unknownAvailability");
                  } catch (e) {
                    return t("services.unknownAvailability");
                  }
                })()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            {t("common.close")}
          </Button>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={() => {
                onOpenChange(false);
                handleAction(service, 'feature');
              }}
            >
              <Star className="mr-2 h-4 w-4" />
              {t("services.feature")}
            </Button>

            <Button
              variant={service.isActive ? "destructive" : "default"}
              className={service.isActive ? "" : "bg-green-600 hover:bg-green-700 text-white"}
              onClick={() => {
                onOpenChange(false);
                handleAction(service, service.isActive ? 'reject' : 'approve');
              }}
            >
              {service.isActive ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  {t("services.deactivate")}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t("services.activate")}
                </>
              )}
            </Button>

            <Button
              variant="destructive"
              className="hover:bg-red-700"
              onClick={() => {
                onOpenChange(false);
                handleAction(service, 'delete');
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