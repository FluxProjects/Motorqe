import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { BasicInfoStep } from "./BasicInfoStep";
import { SpecsStep } from "./SpecsStep";
import { FeaturesStep } from "./FeaturesStep";
import { MediaStep } from "./MediaStep";
import { PricingStep } from "./PricingStep";
import { ReviewStep } from "./ReviewStep";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ListingFormData } from "@shared/schema";
import { useForm, FormProvider } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  "Basic Info",
  "Specifications",
  "Features",
  "Media",
  "Pricing",
  "Review",
];

export const useCreateListing = () => {
  const auth = useAuth();
  const user = auth?.user;
  const [, navigate] = useLocation();

  return useMutation({
    mutationFn: async (formData: any) => {
      const payload = {
        title: formData.basicInfo?.title,
        title_ar: formData.basicInfo?.title,
        description: formData.basicInfo?.description,
        price: formData.basicInfo?.price,
        location: formData.basicInfo?.location,
        category_id: formData.specifications?.categoryId,
        make_id: formData.specifications?.makeId,
        model_id: formData.specifications?.modelId,
        year: formData.specifications?.year,
        mileage: formData.specifications?.mileage,
        fuel_type: formData.specifications?.fuelType,
        transmission: formData.specifications?.transmission,
        color: formData.specifications?.color,
        condition: formData.specifications?.condition,
        images: formData.media ?? [],
        featureIds: formData.features?.map((f: { id: string }) => f.id) ?? [],
        user_id: user.id,
      };

      const res = await fetch("/api/car-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create listing");
      const listing = await res.json();

      if (formData.package?.packageId) {
        const promoRes = await fetch("/api/listing-promotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            listingId: listing.id,
            packageId: formData.package.packageId,
          }),
        });

        if (!promoRes.ok) throw new Error("Failed to initiate promotion");
        const promoData = await promoRes.json();
        console.log("Promotion Payment Intent:", promoData.clientSecret);
      }

      // Navigate based on user role
      const role = user?.role;
      if (role === "SELLER") {
        navigate("/seller-dashboard/listings");
      } else if (role === "ADMIN" || "SUPER_ADMIN") {
        navigate("/admin/listings");
      } else if (role === "SHOWROOM_BASIC" || "SHOWROOM_PREMIUM") {
        navigate("/showroom-dashboard/listing");
      }
      return listing;
    },
  });
};

export function ListingForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<ListingFormData>({});

  const { mutate: createListing } = useCreateListing();

  const updateData = (newData: Partial<ListingFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () =>
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = () => {
    createListing(formData);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <BasicInfoStep
            data={formData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 1:
        return (
          <SpecsStep
            data={formData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 2:
        return (
          <FeaturesStep
            data={formData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <MediaStep
            data={formData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <PricingStep
            data={formData}
            updateData={updateData}
            prevStep={prevStep}
            nextStep={nextStep} // In case PricingStep needs to navigate to the next step, this should work.
          />
        );
      case 5:
        return (
          <ReviewStep
            data={formData}
            updateData={updateData}
            prevStep={prevStep}
            nextStep={nextStep}
            handleSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  const methods = useForm<ListingFormData>({
    defaultValues: formData,
  });

  return (
    <FormProvider {...methods}>
      <Card className="mx-auto mt-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{steps[step]}</h2>
          <Progress
            value={(step / (steps.length - 1)) * 100}
            className="mt-2"
          />
        </div>
        {renderStep()}
      </Card>
    </FormProvider>
  );
}
