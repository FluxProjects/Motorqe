import { useState } from "react";
import { BasicInfoStep } from "./BasicInfoStep";
import { SpecsStep } from "./SpecsStep";
import { FeaturesStep } from "./FeaturesStep";
import { MediaStep } from "./MediaStep";
import { PricingStep } from "./PricingStep";
import { ReviewStep } from "./ReviewStep";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ListingFormData } from "@shared/schema";

const steps = ["Basic Info", "Specifications", "Features", "Media", "Pricing", "Review"];

export function ListingForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<ListingFormData>({});

  const updateData = (newData: Partial<ListingFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () =>
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = () => {
    // Here, you can place logic to submit the data to your server or API
    console.log("Submitting Listing:", formData);
    // Example submission code:
    // fetch('/api/submit-listing', {
    //   method: 'POST',
    //   body: JSON.stringify(formData),
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })
    //   .then(response => response.json())
    //   .then(data => console.log('Listing submitted:', data))
    //   .catch(error => console.error('Error:', error));
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

  return (
    <Card className="mx-auto mt-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{steps[step]}</h2>
        <Progress value={(step / (steps.length - 1)) * 100} className="mt-2" />
      </div>
      {renderStep()}
    </Card>
  );
}
