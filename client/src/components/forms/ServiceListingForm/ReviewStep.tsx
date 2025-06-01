import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ServicePromotionPackage, ServiceStepProps } from "@shared/schema";
import { formatAvailability } from "@/lib/utils";

export function ReviewStep({
  data,
  updateData,
  nextStep,
  prevStep,
  handleSubmit,
}: ServiceStepProps) {
  const { t } = useTranslation();
  const formData = data;

  console.log("formData", formData);

  const availability = formData.availability ? JSON.parse(formData.availability) : null;

  const { data: garage } = useQuery({
    queryKey: ["showroom", formData.basicInfo?.showroomId],
    queryFn: () =>
      fetch(`/api/garages/${formData.basicInfo?.showroomId}`).then((res) =>
        res.json()
      ),
    enabled: !!formData.basicInfo?.showroomId,
  });

  const { data: carservice } = useQuery({
    queryKey: ["car-service", formData.basicInfo?.serviceId],
    queryFn: () =>
      fetch(`/api/services/${formData.basicInfo?.serviceId}`).then((res) =>
        res.json()
      ),
    enabled: !!formData.basicInfo?.serviceId,
  });

  const { data: promotionPackage } = useQuery<ServicePromotionPackage>({
    queryKey: ["promotion-package", formData.package?.packageId],
    queryFn: async () => {
      const response = await fetch(`/api/promotion-packages/services/${formData.package?.packageId}`);
      if (!response.ok) throw new Error("Failed to fetch package");
      return response.json();
    },
    enabled: !!formData.package?.packageId,
  });

  console.log("car service",carservice, "garaage", garage, "promotion package", promotionPackage);

  

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4 p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold">{t("services.basicInfo")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-gray-500">{t("services.serviceType")}</Label>
            <p className="font-medium mt-1">
              {carservice?.service.name || t("services.notSpecified")}
            </p>
          </div>
          <div>
            <Label className="text-gray-500">{t("services.showroom")}</Label>
            <p className="font-medium mt-1">
              {garage?.name || t("services.notSpecified")}
            </p>
          </div>
          <div>
            <Label className="text-gray-500">{t("services.price")}</Label>
            <p className="font-medium mt-1">
              {formData.basicInfo.price} {formData.basicInfo.currency || "QAR"}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <Label className="text-gray-500">{t("services.description")} (English)</Label>
          <p className="mt-1 whitespace-pre-line bg-gray-50 p-3 rounded">
            {formData.basicInfo?.description || t("services.noDescription")}
          </p>
        </div>
        
        <div className="mt-4">
          <Label className="text-gray-500">{t("services.description")} (Arabic)</Label>
          <p className="mt-1 whitespace-pre-line bg-gray-50 p-3 rounded text-right" dir="rtl">
            {formData.basicInfo?.descriptionAr || t("services.noDescription")}
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4 p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold">{t("services.availability")}</h3>
        
        <div className="mt-4">
          <Label className="text-gray-500">{t("services.availability")}</Label>
          <div className="mt-2">
            {formatAvailability(availability)}
          </div>
        </div>
      </div>

      {/* Promotion Package */}
      {promotionPackage && (
        <div className="space-y-4 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">{t("services.promotionPackage")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-gray-500">{t("services.packageName")}</Label>
              <p className="font-medium mt-1">{promotionPackage.name}</p>
            </div>
            <div>
              <Label className="text-gray-500">{t("services.packageDuration")}</Label>
              <p className="mt-1">
                {promotionPackage.duration_days
                  ? `${promotionPackage.duration_days} ${t("services.days")}`
                  : t("services.notSpecified")}
              </p>
            </div>
            <div>
              <Label className="text-gray-500">{t("services.packagePrice")}</Label>
              <p className="mt-1">
                {promotionPackage.price
                  ? `${promotionPackage.price} ${promotionPackage.currency}`
                  : t("services.notSpecified")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" type="button" onClick={prevStep}>
          {t("services.back")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={() => handleSubmit?.("draft")}>
            {t("services.saveAsDraft")}
          </Button>
          <Button type="button" onClick={() => handleSubmit?.("publish")}>
            {t("services.publishListing")}
          </Button>
        </div>
      </div>
    </div>
  );
}