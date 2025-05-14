import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FormProvider, useForm } from "react-hook-form";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Permission } from "@shared/permissions";
import { useListingFormHandler } from "./useListingFormHandler";
import { ListingFormSteps } from "./ListingFormSteps";
import { ProgressHeader } from "@/components/layout/ProgressHeader";
import { ListingFormData, AdminCarListing } from "@shared/schema";

const steps = [
  "Basic Info",
  "Specifications",
  "Features",
  "Media",
  "Pricing",
  "Review",
];

interface Props {
  listing?: AdminCarListing | null;
  onSuccess?: () => void;
}

export function ListingForm({ listing, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const methods = useForm<ListingFormData>();
  const { reset, handleSubmit : rhfHandleSubmit, getValues } = methods;

  // Calculate duration days from package dates
  const calculateDurationDays = (startDateStr?: string, endDateStr?: string): number | undefined => {
    if (!startDateStr || !endDateStr) return undefined;
    
    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      const msPerDay = 1000 * 60 * 60 * 24;
      return Math.round((endDate.getTime() - startDate.getTime()) / msPerDay);
    } catch (error) {
      console.error("Error calculating duration days:", error);
      return undefined;
    }
  };

  // Initialize form with listing data if in edit mode
  useEffect(() => {
    if (listing) {
      console.groupCollapsed("[ListingForm] Initializing form with listing data");
      console.log("Raw listing data:", listing);
      
      // Transform backend data to frontend format
      const parsedData: ListingFormData = {
        basicInfo: {
          title: listing.title,
          description: listing.description,
          price: listing.price?.toString(),
          currency: listing.currency || "QAR",
          location: listing.location,
        },
        specifications: {
          categoryId: listing.category_id?.toString(),
          makeId: listing.make_id?.toString(),
          modelId: listing.model_id?.toString(),
          year: listing.year?.toString(),
          mileage: listing.mileage?.toString(),
          fuelType: listing.fuel_type,
          transmission: listing.transmission,
          color: listing.color,
          condition: listing.condition,
        },
        media: listing.images?.map((img) => {
          try {
            return typeof img === "string" && img.startsWith("{")
              ? JSON.parse(img)
              : { path: img, relativePath: img };
          } catch {
            return { path: img, relativePath: img };
          }
        }) || [],
        features: listing.features || [],
        package: listing.package_id ? {
          packageId: listing.package_id.toString(),
          packageName: listing.package_name || undefined,
          packagePrice: listing.package_price?.toString(),
          durationDays: calculateDurationDays(listing.start_date?.toString(), listing.end_date?.toString()),
        } : undefined,
        status: listing.status,
      };

      console.log("Transformed form data:", parsedData);
      console.groupEnd();

      reset(parsedData);
    }
  }, [listing, reset]);

  const updateData = (newData: Partial<ListingFormData>) => {
    // Merge new data with existing form data
    const currentData = getValues();
    reset({ ...currentData, ...newData });
  };

  const nextStep = () =>
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const { mutate } = useListingFormHandler(onSuccess);


  const onSubmitHandler = (action: 'draft' | 'publish') =>
  rhfHandleSubmit(async (data) => {
    const status = (action === 'publish' ? 'pending' : 'draft') as ListingFormData['status'];
    const payload = {
      ...data,
      status,
    };

    console.log('[onSubmitHandler] Submitting with data:', payload);

    try {
      await mutate({
        formData: payload,
        listing,
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
        <PermissionGuard permission={Permission.CREATE_LISTINGS}>
          <ListingFormSteps
            step={step}
            data={methods.getValues()} // Pass current form values
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            handleSubmit={(action: 'draft' | 'publish') => onSubmitHandler(action)()}
            listing={listing}
          />
        </PermissionGuard>
      </Card>
    </FormProvider>
  );
}
