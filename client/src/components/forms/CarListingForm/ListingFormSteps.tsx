import { BasicInfoStep } from "./BasicInfoStep";
import { SpecsStep } from "./SpecsStep";
import { FeaturesStep } from "./FeaturesStep";
import { CarPartsStep } from "./CarPartsStep";
import { CarTyresStep } from "./CarTyresStep";
import { MediaStep } from "./MediaStep";
import { PricingStep } from "./PricingStep";
import { ReviewStep } from "./ReviewStep";
import { AdminCarListing, ListingFormData, User } from "@shared/schema";

interface Props {
  step: number;
  data: ListingFormData;
  updateData: (newData: Partial<ListingFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: (action: 'draft' | 'publish') => void;
  listing?: AdminCarListing | null;
  user: User;
}

export const ListingFormSteps = ({
  step,
  data,
  updateData,
  nextStep,
  prevStep,
  handleSubmit,
  listing,
  user,
}: Props) => {
  const isPricingSkipped = user?.roleId === 3;

  const adjustedStep = isPricingSkipped
    ? step + (step >= 0 ? 1 : 0)
    : step;

  switch (adjustedStep) {
    case 0:
      return isPricingSkipped ? (
        <BasicInfoStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      ) : (
        <PricingStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      );
    case 1:
      return <BasicInfoStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 2:
      return <SpecsStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 3:
      return <FeaturesStep listingId={listing?.id} data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 4:
      return <CarPartsStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 5:
      return <CarTyresStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 6:
      return <MediaStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 7:
      return <ReviewStep data={data} updateData={updateData} prevStep={prevStep} nextStep={nextStep} handleSubmit={handleSubmit} />;
    default:
      return null;
  }
};
