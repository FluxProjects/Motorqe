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
import { ShowroomService } from "@shared/schema";

interface ServiceListingDetailDialogProps {
  service: ShowroomService;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleAction: (service: ShowroomService, action: 'feature' | 'activate' | 'deactivate' | 'delete') => void;
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
      <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            {service.service?.name || t("services.unknownService")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Service Details */}
          <div className="space-y-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg">{t("services.serviceDetails")}</h3>
              
              <div className="mt-3 space-y-3">
                <div>
                  <h4 className="text-slate-400 text-sm">{t("services.name")}</h4>
                  <p className="text-white">
                    {service.service?.name || t("services.unknownService")}
                  </p>
                  {service.service?.nameAr && (
                    <p className="text-white text-right" dir="rtl">
                      {service.service.nameAr}
                    </p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-slate-400 text-sm">{t("services.price")}</h4>
                  <p className="text-2xl font-bold text-blue-400">
                    {service.price} {service.currency}
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <div>
                    <h4 className="text-slate-400 text-sm">{t("services.status")}</h4>
                    {service.isActive ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        {t("services.active")}
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <X className="h-3 w-3 mr-1" />
                        {t("services.inactive")}
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-slate-400 text-sm">{t("services.featured")}</h4>
                    {service.isFeatured ? (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        {t("services.featured")}
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        {t("services.standard")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg">{t("services.description")}</h3>
              <p className="text-slate-300 mt-2 whitespace-pre-line">
                {service.description || t("services.noDescription")}
              </p>
              {service.descriptionAr && (
                <>
                  <h4 className="font-semibold text-lg mt-4">{t("services.descriptionAr")}</h4>
                  <p className="text-slate-300 mt-2 whitespace-pre-line text-right" dir="rtl">
                    {service.descriptionAr}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Showroom Details */}
          <div className="space-y-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {t("services.showroomInfo")}
              </h3>
              
              <div className="mt-3 flex items-center">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={service.showroom?.logo} />
                  <AvatarFallback className="bg-blue-600">
                    {service.showroom?.name?.charAt(0).toUpperCase() || "S"}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h4 className="text-white font-medium">
                    {service.showroom?.name || t("services.unknownShowroom")}
                  </h4>
                  <p className="text-slate-400 text-sm">
                    {service.showroom?.address || "N/A"}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {service.showroom?.contactNumber || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Image */}
            {service.service?.image && (
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">{t("services.serviceImage")}</h3>
                <div className="mt-3 overflow-hidden rounded-lg">
                  <img
                    src={service.service.image}
                    alt={service.service.name}
                    className="w-full h-auto max-h-48 object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {t("common.close")}
          </Button>

          <div className="space-x-2">
            <Button
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-900/30"
              onClick={() => {
                onOpenChange(false);
                handleAction(service, service.isFeatured ? 'unfeature' : 'feature');
              }}
            >
              <Star className="mr-2 h-4 w-4" />
              {service.isFeatured ? t("services.unfeature") : t("services.feature")}
            </Button>

            <Button
              variant={service.isActive ? "destructive" : "default"}
              className={service.isActive ? "" : "bg-green-700 hover:bg-green-800"}
              onClick={() => {
                onOpenChange(false);
                handleAction(service, service.isActive ? 'deactivate' : 'activate');
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