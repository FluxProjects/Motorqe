import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FormProvider, useForm } from "react-hook-form";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Permission } from "@shared/permissions";
import { useServiceListingFormHandler } from "./useListingFormHandler";
import { ServiceListingFormSteps } from "./ServiceListingFormSteps";
import { ProgressHeader } from "@/components/layout/ProgressHeader";
import { ServiceListingFormData, AdminServiceListing } from "@shared/schema";
import { calculateDurationDays } from "@/lib/utils";

const steps = [
  "Select Plan",
  "Basic Info",
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
        basicInfo: {
          showroomId: service.showroom_id?.toString(),
          serviceId: service.service_id?.toString(),
          price: service.price?.toString(),
          currency: service.currency || "QAR",
          description: service.description,
          descriptionAr: service.description_ar,
        },
        availability: service.availability,      
        isFeatured: service.is_featured,
        isActive: service.is_active,
        package: service.package_id ? {
          packageId: service.package_id.toString(),
          packageName: service.package_name || undefined,
          packagePrice: service.package_price?.toString(),
          durationDays: calculateDurationDays(service.start_date?.toString(), service.end_date?.toString()),
        } : undefined,
        status: service.status,
        
      };

       console.log("Transformed form data:", parsedData);
      console.groupEnd();

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

   const onSubmitHandler = (action: 'draft' | 'publish') =>
    rhfHandleSubmit(async (data) => {
      const status = (action === 'publish' ? 'pending' : 'draft') as ServiceListingFormData['status'];
      const payload = {
        ...data,
        status,
      };
  
      console.log('[onSubmitHandler] Submitting with data:', payload);
  
      try {
        await mutate({
          formData: payload,
          service,
        });
      } catch (error) {
        console.error('[onSubmitHandler] Error submitting form:', error);
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
        <PermissionGuard permission={Permission.CREATE_SERVICES}>
          <ServiceListingFormSteps
            step={step}
            data={methods.getValues()}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            handleSubmit={(action: 'draft' | 'publish') => onSubmitHandler(action)()}
            service={service}
          />
        </PermissionGuard>
      </Card>
    </FormProvider>
  );
}