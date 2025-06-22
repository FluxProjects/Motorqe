import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FormProvider, useForm } from "react-hook-form";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Permission } from "@shared/permissions";
import { useServiceBookingFormHandler } from "./useBookingFormHandler";
import { ServiceBookingFormSteps } from "./ServiceBookingFormSteps";
import { ProgressHeader } from "@/components/layout/ProgressHeader";
import { ServiceBookingFormData, AdminServiceBooking, ServiceBooking } from "@shared/schema";

const steps = [
  "Service Selection",
  "Scheduling",
  "Customer Info",
  "Additional Details",
  "Review"
];

interface Props {
  booking?: ServiceBooking | null;
  onSuccess?: () => void;
}

export function ServiceBookingForm({ booking, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const methods = useForm<ServiceBookingFormData>();
  const { reset, handleSubmit: rhfHandleSubmit, getValues } = methods;

  // Initialize form with booking data if in edit mode
  useEffect(() => {
    if (booking) {
      console.log("[ServiceBookingForm] Initializing form with booking data:", booking);
      
      const parsedData: ServiceBookingFormData = {
        serviceId: booking.serviceId.toString(),
        userId: booking.userId.toString(),
        showroomId: booking.showroomId?.toString(),
        scheduledAt: new Date(booking.scheduledAt).toISOString(),
        notes: booking.notes || '',
        price: booking.price,
        currency: booking.currency || "QAR",
        status: booking.status,
      };

      reset(parsedData);
    }
  }, [booking, reset]);

  const updateData = (newData: Partial<ServiceBookingFormData>) => {
    const currentData = getValues();
    reset({ ...currentData, ...newData });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const { mutate } = useServiceBookingFormHandler(onSuccess);

  const onSubmitHandler = (action: 'draft' | 'publish') =>
    rhfHandleSubmit(async (data) => {
      const status = (action === 'publish' ? 'pending' : 'draft') as ServiceBookingFormData['status'];
      const payload = {
        ...data,
        status,
      };

      console.log('Submitting booking form with data:', payload);

      try {
        await mutate({
          formData: payload,
          booking,
        });
      } catch (error) {
        console.error('Error submitting booking form:', error);
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
        <PermissionGuard permission={Permission.CREATE_BOOKINGS}>
          <ServiceBookingFormSteps
            step={step}
            data={methods.getValues()}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            handleSubmit={(action: 'draft' | 'publish') => onSubmitHandler(action)()}
            booking={booking}
          />
        </PermissionGuard>
      </Card>
    </FormProvider>
  );
}