import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {CarCategory, PromotionPackage, StepProps } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FilePen, Rocket } from "lucide-react";

export function ReviewStep({
  data,
  updateData,
  nextStep,
  prevStep,
  handleSubmit,
}: StepProps) {
  const { t } = useTranslation();
  const formData = data;

  const { data: categories = [] } = useQuery<CarCategory[]>({
      queryKey: ["car-categories"],
      queryFn: () => fetch("/api/car-categories").then((res) => res.json()),
    });

  const { data: makes = [] } = useQuery({
    queryKey: ["car-makes"],
    queryFn: () => fetch("/api/car-makes").then((res) => res.json()),
  });

  const { data: models = [] } = useQuery({
    queryKey: ["car-models", formData.specifications?.makeId],
    queryFn: () =>
      fetch(`/api/car-makes/${formData.specifications?.makeId}/models`).then(
        (res) => res.json()
      ),
    enabled: !!formData.specifications?.makeId,
  });

  const { data: features = [] } = useQuery({
    queryKey: ["car-features"],
    queryFn: () => fetch("/api/car-features").then((res) => res.json()),
  });
  
  const { data: promotionPackage } = useQuery<PromotionPackage>({
    queryKey: ['promotion-package', formData.package?.packageId],
    queryFn: async () => {
      const response = await fetch(`/api/promotion-packages/${formData.package?.packageId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch package');
      }
      return response.json();
    },
    enabled: !!formData.package?.packageId,
  });

  const selectedCategory = categories.find(
    (m: any) => String(m.id) === formData.specifications?.categoryId
  );

  const selectedMake = makes.find(
    (m: any) => String(m.id) === formData.specifications?.makeId
  );
  const selectedModel = models.find(
    (m: any) => String(m.id) === formData.specifications?.modelId
  );
  
  const selectedFeatures = features.filter((f) =>
    (formData.features as string[]).includes(String(f.id))
  );

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-medium">{t("listing.basicInfo")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{t("listing.title")}</Label>
            <p className="font-medium">{formData.basicInfo?.title || t("listing.notSpecified")}</p>
          </div>
          <div>
            <Label>{t("listing.price")}</Label>
            <p className="font-medium">
              {formData.basicInfo?.price ? `${formData.basicInfo?.price} ${t("listing.currency")}` : t("listing.notSpecified")}
            </p>
          </div>
          <div className="md:col-span-2">
            <Label>{t("listing.description")}</Label>
            <p className="whitespace-pre-line">
              {formData.basicInfo?.description || t("listing.noDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-4">
        <h3 className="font-medium">{t("listing.specifications")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label>{t("listing.category")}</Label>
            <p>{selectedCategory?.name || t("listing.notSpecified")}</p>
          </div>
          <div>
            <Label>{t("listing.make")}</Label>
            <p>{selectedMake?.name || t("listing.notSpecified")}</p>
          </div>
          <div>
            <Label>{t("listing.model")}</Label>
            <p>{selectedModel?.name || t("listing.notSpecified")}</p>
          </div>
          <div>
            <Label>{t("listing.year")}</Label>
            <p>{formData.specifications?.year || t("listing.notSpecified")}</p>
          </div>
          <div>
            <Label>{t("listing.mileage")}</Label>
            <p>{formData.specifications?.mileage ? `${formData.specifications.mileage} km` : t("listing.notSpecified")}</p>
          </div>
          <div>
            <Label>{t("listing.fuelType")}</Label>
            <p>{formData.specifications?.fuelType || t("listing.notSpecified")}</p>
          </div>
          <div>
            <Label>{t("listing.transmission")}</Label>
            <p>{formData.specifications?.transmission || t("listing.notSpecified")}</p>
          </div>
          <div>
            <Label>{t("listing.color")}</Label>
            <p>{formData.specifications?.color || t("listing.notSpecified")}</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="font-medium">{t("listing.features")}</h3>
        {selectedFeatures && selectedFeatures.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedFeatures.map((feature: any) => (
              <span
                key={feature.id}
                className="bg-muted px-3 py-1 rounded-full text-sm"
              >
                {feature.name}
              </span>
            ))}
          </div>
        ) : (
          <p>{t("listing.noFeaturesSelected")}</p>
        )}
      </div>

      {/* Promotion Package */}
      {promotionPackage && (
        <div className="space-y-4">
          <h3 className="font-medium">{t("listing.promotionPackage")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t("listing.packageName")}</Label>
              <p>{promotionPackage.name || t("listing.notSpecified")}</p>
            </div>
            <div>
              <Label>{t("listing.packageDuration")}</Label>
              <p>{promotionPackage.duration_days ? `${promotionPackage.duration_days} ${t("listing.days")}` : t("listing.notSpecified")}</p>
            </div>
            <div>
              <Label>{t("listing.packagePrice")}</Label>
              <p>{promotionPackage.price ? `${promotionPackage.price} ${promotionPackage.currency}` : t("listing.notSpecified")}</p>
            </div>
            
          </div>
        </div>
      )}

      {/* Media (Images) */}
      <div className="space-y-4">
        <h3 className="font-medium">{t("listing.images")}</h3>
        {(formData.media?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.media?.map((mediaItem, index) => (
              <div key={index}>
                {typeof mediaItem === "string" ? (
                  <img
                    src={mediaItem}
                    alt={`Preview ${index + 1}`}
                    className="rounded-md aspect-square object-cover"
                  />
                ) : (
                  <div className="flex justify-center items-center text-gray-500">
                    <span>{t("listing.file")} {index + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>{t("listing.noImages")}</p>
        )}
      </div>

      {/* Review Action Buttons */}
       <div className="flex justify-between pt-4">
         <Button 
        className="bg-blue-900 flex items-center gap-2"
        type="button" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-blue-900 text-blue-900 flex items-center gap-2"
            type="button" 
            onClick={() => handleSubmit?.('draft')}
          >
            {t("listing.saveAsDraft")}
            <FilePen className="w-4 h-4" />
          </Button>
          <Button 
          className="bg-orange-500 flex items-center gap-2"
            type="button" 
            onClick={() => handleSubmit?.('publish')}
          >
            {t("listing.publishListing")}
            <Rocket className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}