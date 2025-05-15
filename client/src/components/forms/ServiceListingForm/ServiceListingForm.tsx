import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FormProvider, useForm } from "react-hook-form";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Permission } from "@shared/permissions";
import { useServiceListingFormHandler } from "./useListingFormHandler";
import { ServiceListingFormSteps } from "./ServiceListingFormSteps";
import { ProgressHeader } from "@/components/layout/ProgressHeader";
import { ServiceListingFormData, AdminServiceListing } from "@shared/schema";

const steps = [
  "Service Details",
  "Pricing",
  "Description",
  "Availability",
  "Review"
];

interface Props {
  service?: AdminServiceListing | null;
  onSuccess?: () => void;
}

export function ServiceListingForm({ service, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const methods = useForm<ServiceListingFormData>();
  const { reset, handleSubmit: rhfHandleSubmit, getValues } = methods;

  // Initialize form with service data if in edit mode
  useEffect(() => {
    if (service) {
      console.log("[ServiceListingForm] Initializing form with service data:", service);
      
      const parsedData: ServiceListingFormData = {
        serviceId: service.serviceId.toString(),
        price: service.price,
        currency: service.currency || "QAR",
        description: service.description,
        descriptionAr: service.descriptionAr,
        isFeatured: service.isFeatured,
        isActive: service.isActive,
        showroomId: service.showroomId.toString(),
      };

      reset(parsedData);
    }
  }, [service, reset]);

  const updateData = (newData: Partial<ServiceListingFormData>) => {
    const currentData = getValues();
    reset({ ...currentData, ...newData });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const { mutate } = useServiceListingFormHandler(onSuccess);

  const onSubmitHandler = rhfHandleSubmit(async (data) => {
    console.log('Submitting service form with data:', data);

    try {
      await mutate({
        formData: data,
        service,
      });
    } catch (error) {
      console.error('Error submitting service form:', error);
    }
  });

  return (
    <FormProvider {...methods}>
      <Card className="mx-auto mt-2">
        <ProgressHeader
          currentStep={step}
          totalSteps={steps.length}
          stepTitles={steps}
        />
        <PermissionGuard permission={Permission.MANAGE_SERVICES}>
          <ServiceListingFormSteps
            step={step}
            data={methods.getValues()}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            handleSubmit={onSubmitHandler}
            service={service}
          />
        </PermissionGuard>
      </Card>
    </FormProvider>
  );
}