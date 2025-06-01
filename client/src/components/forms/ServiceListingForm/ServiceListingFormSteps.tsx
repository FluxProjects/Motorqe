import { BasicInfoStep } from "./BasicInfoStep";
import { AvailabilityStep } from "./AvailabilityStep";
import { PricingStep } from "./PricingStep";
import { ReviewStep } from "./ReviewStep";
import { AdminServiceListing, ServiceListingFormData } from "@shared/schema";

interface Props {
  step: number;
  data: ServiceListingFormData;
  updateData: (newData: Partial<ServiceListingFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: (action: 'draft' | 'publish') => void;
  service?: AdminServiceListing | null;
}

export const ServiceListingFormSteps = ({
  step,
  data,
  updateData,
  nextStep,
  prevStep,
  handleSubmit,
  service,
}: Props) => {
  switch (step) {
    case 0:
      return <BasicInfoStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 1:
      return <AvailabilityStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 2:
      return <PricingStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 3:
      return <ReviewStep data={data} updateData={updateData} prevStep={prevStep} nextStep={nextStep} handleSubmit={handleSubmit} />;
    default:
      return null;
  }
};
