import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { CarCategory, PromotionPackage, StepProps } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FilePen, Rocket } from "lucide-react";
import GoogleMaps from "@/components/ui/google-maps";

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

  const { data: engineCapacities = [] } = useQuery({
    queryKey: ["/api/car-enginecapacities"],
    queryFn: () => fetch("/api/car-enginecapacities").then((res) => res.json()),
  });

  const { data: features = [] } = useQuery({
    queryKey: ["car-features"],
    queryFn: () => fetch("/api/car-features").then((res) => res.json()),
  });

  const { data: promotionPackage } = useQuery<PromotionPackage>({
    queryKey: ["promotion-package", formData.package?.packageId],
    queryFn: async () => {
      const response = await fetch(
        `/api/promotion-packages/${formData.package?.packageId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch package");
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

  const selectedEngineCapacity = engineCapacities.find(
    (c: any) => String(c.id) === formData.specifications?.engineCapacityId
  );

  const selectedFeatures = features.filter((f) =>
    (formData.features as string[]).includes(String(f.id))
  );

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-900 border-b pb-1">
          {t("listing.basicInfo")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Title (English)</Label>
            <p className="font-medium">
              {formData.basicInfo?.title || t("listing.notSpecified")}
            </p>
          </div>

           <div>
            <Label>Title (Arabic)</Label>
            <p className="font-medium">
              {formData.basicInfo?.titleAr || t("listing.notSpecified")}
            </p>
          </div>

          <div>
            <Label>{t("listing.price")}</Label>
            <p className="font-medium">
             {formData.basicInfo?.currency || "QR"} {formData.basicInfo?.price
                ? `${formData.basicInfo?.price}`
                : t("listing.notSpecified")}
            </p>
          </div>

           <div className="md:col-span-2">
            <Label>Description (English)</Label>
            <p className="whitespace-pre-line">
              {formData.basicInfo?.description || t("listing.noDescription")}
            </p>
          </div>

          <div className="md:col-span-2">
            <Label>Description (Arabic)</Label>
            <p className="whitespace-pre-line">
              {formData.basicInfo?.descriptionAr || t("listing.noDescription")}
            </p>
          </div>
        </div>
         
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div>
            <Label>{t("listing.location")}</Label>
            <p className="font-medium">
              {formData.basicInfo?.location && (
                <GoogleMaps
                  center={{
                    lat: parseFloat(formData.basicInfo.location.split(",")[0]),
                    lng: parseFloat(formData.basicInfo.location.split(",")[1])
                  }}
                  zoom={17}
                  markers={[
                    {
                      lat: parseFloat(formData.basicInfo.location.split(",")[0]),
                      lng: parseFloat(formData.basicInfo.location.split(",")[1]),
                    },
                  ]}
                  containerStyle={{ width: "100%", height: "256px" }} // increased height
                />
              )}
            </p>

          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-900 border-b pb-1">
          {t("listing.specifications")}
        </h3>

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
            <p>
              {formData.specifications?.mileage
                ? `${formData.specifications.mileage} km`
                : t("listing.notSpecified")}
            </p>
          </div>
          <div>
            <Label>{t("listing.fuelType")}</Label>
            <p>
              {formData.specifications?.fuelType || t("listing.notSpecified")}
            </p>
          </div>
          <div>
            <Label>{t("listing.transmission")}</Label>
            <p>
              {formData.specifications?.transmission ||
                t("listing.notSpecified")}
            </p>
          </div>
          <div>
            <Label>{t("listing.engineCapacity")}</Label>
            <p>
              {selectedEngineCapacity?.size_liters
                ? `${selectedEngineCapacity.size_liters} L`
                : t("listing.notSpecified")}
            </p>
          </div>
          <div>
            <Label>{t("listing.cylinderCount")}</Label>
            <p>{formData.specifications?.cylinderCount}</p>
          </div>
          <div>
            <Label>{t("listing.color")}</Label>
            <p>{formData.specifications?.color || t("listing.notSpecified")}</p>
          </div>
          <div>
            <Label>{t("listing.interiorColor")}</Label>
            <p>{formData.specifications?.interiorColor}</p>
          </div>
          <div>
            <Label>{t("listing.tinted")}</Label>
            <p>{formData.specifications?.tinted}</p>
          </div>
          <div>
            <Label>{t("listing.condition")}</Label>
            <p>{formData.specifications?.condition || t("listing.notSpecified")}</p>
          </div>

          <div>
            <Label>{t("listing.isImported")}</Label>
            <p>
              {formData.specifications?.isImported === "true"
                ? t("listing.yes")
                : formData.specifications?.isImported === "false"
                ? t("listing.no")
                : t("listing.notSpecified")}
            </p>
          </div>

          <div>
            <Label>{t("listing.negotiable")}</Label>
            <p>
              {formData.specifications?.negotiable === "true"
                ? t("listing.yes")
                : formData.specifications?.negotiable === "false"
                ? t("listing.no")
                : t("listing.notSpecified")}
            </p>
          </div>

          <div>
            <Label>{t("listing.specification")}</Label>
            <p>{formData.specifications?.specification}</p>
          </div>

          <div>
            <Label>{t("listing.isInspected")}</Label>
            <p>
              {formData.specifications?.isInspected === "true"
                ? t("listing.yes")
                : formData.specifications?.isInspected === "false"
                ? t("listing.no")
                : t("listing.notSpecified")}
            </p>
          </div>

          {formData.specifications?.inspectionReport && (
          <div>
            <Label>{t("listing.inspectionReport")}</Label>
            <p>
              {formData.specifications.inspectionReport.split("/").pop() ||
                t("listing.notSpecified")}
            </p>
          </div>
        )}

        {formData.specifications?.hasInsurance === "true" && (
  <>
    <div>
      <Label>{t("listing.hasInsurance")}</Label>
      <p>{t("listing.yes")}</p>
    </div>
    <div>
      <Label>{t("listing.insuranceExpiry")}</Label>
      <p>
        {formData.specifications?.insuranceExpiry
          ? formData.specifications.insuranceExpiry
          : t("listing.notSpecified")}
      </p>
    </div>
    <div>
      <Label>{t("listing.insuranceType")}</Label>
      <p>{formData.specifications?.insuranceType}</p>
    </div>
  </>
)}

{formData.specifications?.hasWarranty === "true" && (
  <>
    <div>
      <Label>{t("listing.hasWarranty")}</Label>
      <p>{t("listing.yes")}</p>
    </div>
    <div>
      <Label>{t("listing.warrantyExpiry")}</Label>
      <p>
        {formData.specifications?.warrantyExpiry
          ? formData.specifications.warrantyExpiry
          : t("listing.notSpecified")}
      </p>
    </div>
  </>
)}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-900 border-b pb-1">
          {t("listing.features")}
        </h3>

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

      {/* Car Parts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-900 border-b pb-1">
          Car Parts
        </h3>

        {data.carParts ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.carParts).map(([key, value]) => (
              value ? (
                <span
                  key={key}
                  className="bg-muted px-3 py-1 rounded-full text-sm"
                >
                  {`${key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}: QR ${value}`}
                </span>
              ) : null
            ))}
          </div>
        ) : (
          <p>No car parts data provided.</p>
        )}
      </div>

      {/* Car Tyres */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-900 border-b pb-1">
          Car Tyres
        </h3>

        {data.carTyres ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.carTyres).map(([key, value]) => (
              value ? (
                <span
                  key={key}
                  className="bg-muted px-3 py-1 rounded-full text-sm"
                >
                  {`${key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}: ${value}`}
                </span>
              ) : null
            ))}
          </div>
        ) : (
          <p>No car tyres data provided.</p>
        )}
      </div>


      {/* Promotion Package */}
      {promotionPackage && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-900 border-b pb-1">
            {t("listing.promotionPackage")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t("listing.packageName")}</Label>
              <p>{promotionPackage.name || t("listing.notSpecified")}</p>
            </div>
            <div>
              <Label>{t("listing.packageDuration")}</Label>
              <p>
                {promotionPackage.duration_days
                  ? `${promotionPackage.duration_days} ${t("listing.days")}`
                  : t("listing.notSpecified")}
              </p>
            </div>
            <div>
              <Label>{t("listing.packagePrice")}</Label>
              <p>
                {promotionPackage.price
                  ? `${promotionPackage.price} ${promotionPackage.currency}`
                  : t("listing.notSpecified")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Media (Images) */}
<div className="space-y-6">

  {/* Main Images */}
  <div className="space-y-2">
    <h3 className="font-medium">{t("listing.images")}</h3>
    {(formData.media?.length ?? 0) > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <span>
                  {t("listing.file")} {index + 1}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p>{t("listing.noImages")}</p>
    )}
  </div>

  {/* Interior Images (if available) */}
  {formData.interiorImages && formData.interiorImages.length > 0 && (
    <div className="space-y-2">
      <h3 className="font-medium">{t("listing.interiorImages")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {formData.interiorImages.map((image, index) => (
          <div key={index}>
            {typeof image === "string" ? (
              <img
                src={image}
                alt={`Interior ${index + 1}`}
                className="rounded-md aspect-square object-cover"
              />
            ) : (
              <div className="flex justify-center items-center text-gray-500">
                <span>
                  {t("listing.file")} {index + 1}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )}

  {/* 360 Images (if available) */}
  {formData.images360 && formData.images360.length > 0 && (
    <div className="space-y-2">
      <h3 className="font-medium">{t("listing.images360")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {formData.images360.map((image, index) => (
          <div key={index}>
            {typeof image === "string" ? (
              <img
                src={image}
                alt={`360° ${index + 1}`}
                className="rounded-md aspect-square object-cover"
              />
            ) : (
              <div className="flex justify-center items-center text-gray-500">
                <span>
                  {t("listing.file")} {index + 1}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )}

</div>


      {/* Review Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          className="bg-blue-900 flex items-center gap-2"
          type="button"
          onClick={prevStep}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-blue-900 text-blue-900 flex items-center gap-2"
            type="button"
            onClick={() => handleSubmit?.("draft")}
          >
            {t("listing.saveAsDraft")}
            <FilePen className="w-4 h-4" />
          </Button>
          <Button
            className="bg-orange-500 flex items-center gap-2"
            type="button"
            onClick={() => handleSubmit?.("publish")}
          >
            {t("listing.publishListing")}
            <Rocket className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
