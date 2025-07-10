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
  skipPricing: boolean;
  data: ListingFormData;
  updateData: (newData: Partial<ListingFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: (action: "draft" | "publish") => void;
  listing?: AdminCarListing | null;
  user: User;
}

export const ListingFormSteps = ({
  step,
  skipPricing,
  data,
  updateData,
  nextStep,
  prevStep,
  handleSubmit,
  listing,
}: Props) => {
  const commonProps = { data, updateData, nextStep, prevStep };

  const stepComponentMap = skipPricing
    ? [
        <BasicInfoStep {...commonProps} />,
        <SpecsStep {...commonProps} />,
        <FeaturesStep listingId={listing?.id} {...commonProps} />,
        <CarPartsStep {...commonProps} />,
        <CarTyresStep {...commonProps} />,
        <MediaStep {...commonProps} />,
        <ReviewStep {...commonProps} handleSubmit={handleSubmit} />,
      ]
    : [
        <PricingStep {...commonProps} />,
        <BasicInfoStep {...commonProps} />,
        <SpecsStep {...commonProps} />,
        <FeaturesStep listingId={listing?.id} {...commonProps} />,
        <CarPartsStep {...commonProps} />,
        <CarTyresStep {...commonProps} />,
        <MediaStep {...commonProps} />,
        <ReviewStep {...commonProps} handleSubmit={handleSubmit} />,
      ];

  return stepComponentMap[step] ?? null;
};
