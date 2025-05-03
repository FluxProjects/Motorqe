import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ListingFormData, StepProps } from "@shared/schema";
import { Button } from "@/components/ui/button";

export function ReviewStep({
  data,
  updateData,
  nextStep,
  prevStep,
  handleSubmit,
}: StepProps) {
  const { t } = useTranslation();
  const { watch } = useFormContext<ListingFormData>();
  const formData = watch();

  const { data: makes = [] } = useQuery({
    queryKey: ["car-makes"],
    queryFn: () => fetch("/api/car-makes").then((res) => res.json()),
  });

  const { data: models = [] } = useQuery({
    queryKey: ["car-models", formData.specifications?.makeId],
    queryFn: () =>
      fetch(`/api/car-models?makeId=${formData.specifications?.makeId}`).then(
        (res) => res.json()
      ),
    enabled: !!formData.specifications?.makeId,
  });

  const { data: features = [] } = useQuery({
    queryKey: ["car-features"],
    queryFn: () => fetch("/api/car-features").then((res) => res.json()),
  });

  const selectedMake = makes.find(
    (m: any) => m.id === formData.specifications?.makeId
  );
  const selectedModel = models.find(
    (m: any) => m.id === formData.specifications?.modelId
  );
  const selectedFeatures = features.filter((f: any) =>
    formData.features?.includes(f.id)
  );

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-medium">{t("listing.basicInfo")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{t("listing.title")}</Label>
            <p>{formData.basicInfo?.title}</p>
          </div>
          <div>
            <Label>{t("listing.price")}</Label>
            <p>
              {formData.pricing?.price} {formData.pricing?.currency}
            </p>
          </div>
          <div>
            <Label>{t("listing.description")}</Label>
            <p className="whitespace-pre-line">
              {formData.basicInfo?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-4">
        <h3 className="font-medium">{t("listing.specifications")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{t("listing.make")}</Label>
            <p>{selectedMake?.name || "-"}</p>
          </div>
          <div>
            <Label>{t("listing.model")}</Label>
            <p>{selectedModel?.name || "-"}</p>
          </div>
          <div>
            <Label>{t("listing.year")}</Label>
            <p>{formData.specifications?.year}</p>
          </div>
          <div>
            <Label>{t("listing.mileage")}</Label>
            <p>{formData.specifications?.mileage}</p>
          </div>
        </div>
      </div>

      {/* Features */}
      {selectedFeatures.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">{t("listing.features")}</h3>
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
        </div>
      )}

      {/* Media (Images) */}
      {(formData.media?.length ?? 0) > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">{t("listing.images")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.media?.map((mediaItem, index) => (
              <div key={index}>
                {typeof mediaItem === "string" ? (
                  // If it's a string (URL), render an <img> tag
                  <img
                    src={mediaItem}
                    alt={`Preview ${index + 1}`}
                    className="rounded-md aspect-square object-cover"
                  />
                ) : (
                  // If it's a File, render a placeholder for file (could be a file icon or something else)
                  <div className="flex justify-center items-center text-gray-500">
                    <span>File {index + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" type="button" onClick={prevStep}>
          Back
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Submit Listing
        </Button>
      </div>
    </div>
  );
}
