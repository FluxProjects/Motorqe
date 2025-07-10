import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FormProvider, useForm } from "react-hook-form";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Permission } from "@shared/permissions";
import { useListingFormHandler } from "./useListingFormHandler";
import { ListingFormSteps } from "./ListingFormSteps";
import { ProgressHeader } from "@/components/layout/ProgressHeader";
import { ListingFormData, AdminCarListing, User } from "@shared/schema";
import { calculateDurationDays, getListingSteps } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";



interface Props {
  listing?: AdminCarListing | null;
  onSuccess?: () => void;
}

export function ListingForm({ listing, onSuccess }: Props) {

  const methods = useForm<ListingFormData>();
  const { reset, handleSubmit : rhfHandleSubmit, getValues } = methods;
  const {user} = useAuth();

  // Calculate duration days from package dates
  const stepTitles = getListingSteps(listing, user);
const [step, setStep] = useState(0);

const nextStep = () =>
  setStep((prev) => Math.min(prev + 1, stepTitles.length - 1));
const prevStep = () =>
  setStep((prev) => Math.max(prev - 1, 0));

const skipPricing = listing?.id !== undefined || user?.roleId === 3;
const displayedStep = skipPricing ? step + 1 : step;


  // Initialize form with listing data if in edit mode
  useEffect(() => {
    if (listing) {
      console.groupCollapsed("[ListingForm] Initializing form with listing data");
      console.log("Raw listing data:", listing);
      
      // Transform backend data to frontend format
     const parsedData: ListingFormData = {
      basicInfo: {
        listingType: listing.listing_type,
        title: listing.title,
        titleAr: listing.title_ar,
        description: listing.description,
        descriptionAr: listing.description_ar,
        price: listing.price?.toString(),
        currency: listing.currency || "QR",
        location: listing.location,
        userId: user && user.roleId > 6 && listing.user_id
        ? listing.user_id.toString()
        : user?.id
          ? user.id.toString()
          : undefined,
        showroomId: listing.showroom_id,

      },
      specifications: {
        year: listing.year?.toString(),
        makeId: listing.make_id?.toString(),
        modelId: listing.model_id?.toString(),
        categoryId: listing.category_id?.toString(),
        
        mileage: listing.mileage?.toString(),
        fuelType: listing.fuel_type,
        transmission: listing.transmission,
        engineCapacityId: listing.engine_capacity_id?.toString(),
        cylinderCount: listing.cylinder_count?.toString(),
        wheelDrive: listing.wheel_drive,

        color: listing.color,
        interiorColor: listing.interior_color,
        tinted: listing.tinted?.toString(),

        ownerType: listing.owner_type,
        condition: listing.condition,
        isImported: listing.is_imported?.toString(),
        specification: listing.specification,
        hasInsurance: listing.has_insurance?.toString(),
        insuranceType: listing.insurance_type,
        insuranceExpiry: listing.insurance_expiry?.toString(),
        hasWarranty: listing.has_warranty?.toString(),
        warrantyExpiry: listing.warranty_expiry?.toString(), 
        isInspected: listing.is_inspected?.toString(),
        inspectionReport: listing.inspection_report || undefined,
        negotiable: listing.negotiable,
        
      },
      carParts: {
        engineOil: listing.carParts?.engine_oil,
        engineOilFilter: listing.carParts?.engine_oil_filter,
        gearboxOil: listing.carParts?.gearbox_oil,
        acFilter: listing.carParts?.ac_filter,
        airFilter: listing.carParts?.air_filter,
        fuelFilter: listing.carParts?.fuel_filter,
        sparkPlugs: listing.carParts?.spark_plugs,
        frontBrakePads: listing.carParts?.front_brake_pads,
        rearBrakePads: listing.carParts?.rear_brake_pads,
        frontBrakeDiscs: listing.carParts?.front_brake_discs,
        rearBrakeDiscs: listing.carParts?.rear_brake_discs,
        battery: listing.carParts?.battery,
      },
      carTyres: {
        frontTyreSize: listing.carTyres?.front_tyre_size,
        frontTyrePrice: listing.carTyres?.front_tyre_price,
        rearTyreSize: listing.carTyres?.rear_tyre_size,
        rearTyrePrice: listing.carTyres?.rear_tyre_price,
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
      interiorImages: listing.interior_images?.map((img) => {
        try {
          return typeof img === "string" && img.startsWith("{")
            ? JSON.parse(img)
            : { path: img, relativePath: img };
        } catch {
          return { path: img, relativePath: img };
        }
      }) || [],
      images360: listing.images_360?.map((img) => {
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
        photoLimit: listing.photo_limit || 3,
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


  const { mutate } = useListingFormHandler(onSuccess);


 const onSubmitHandler = (action: 'draft' | 'publish') =>
  rhfHandleSubmit(async (data) => {
    const status =
      action === 'publish'
        ? (user?.roleId ?? 0) > 6
          ? 'active'
          : 'pending'
        : 'draft';

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
      <Card className="mx-auto mt-2 shadow-none border-none">
        <ProgressHeader
          currentStep={skipPricing ? step : step}
          totalSteps={stepTitles.length}
          stepTitles={stepTitles}
        />
        <PermissionGuard permission={Permission.CREATE_LISTINGS}>
          <ListingFormSteps
            step={step}
            skipPricing={skipPricing}
            data={methods.getValues()} // Pass current form values
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            handleSubmit={(action: 'draft' | 'publish') => onSubmitHandler(action)()}
            listing={listing}
            user={user}
          />
        </PermissionGuard>
      </Card>
    </FormProvider>
  );
}
