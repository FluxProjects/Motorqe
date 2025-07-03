import { PromotionPackage, StepProps } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import ListingPlanCards from "./ListingPlanTable";
import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

export function PricingStep({ data, updateData, nextStep }: StepProps) {
  const { watch, setValue, handleSubmit } = useFormContext<PromotionPackage>();
  const selectedPackageId = watch("package.packageId");

  // Enhanced debug logging
  console.groupCollapsed("[PricingStep] Debug Info");
  console.log("Current form values:", watch());
  console.log("Props received:", data);
  console.groupEnd();

  const { data: packages = [], isLoading } = useQuery<PromotionPackage[]>({
    queryKey: ["promotion-packages"],
    queryFn: async () => {
      const res = await fetch("/api/promotion-packages");
      if (!res.ok) throw new Error("Failed to fetch packages");
      return res.json();
    },
  });

  // Auto-proceed when package is selected
  useEffect(() => {
    if (selectedPackageId) {
      handleSubmit((formData) => {
        console.log("Submitting package data:", formData?.package);
        updateData({ package: formData?.package });
        nextStep();
      })();
    }
  }, [selectedPackageId, handleSubmit, nextStep, updateData]);

  // Initialize form with existing data
  useEffect(() => {
    if (data?.package) {
      setValue("package", data.package);
    }
  }, [data?.package, setValue]);

  const handleSelectPackage = (pkg: PromotionPackage) => {
    console.log("Package selected:", pkg);
    setValue("package", {
      packageId: pkg.id.toString(),
      packageName: pkg.name,
      packagePrice: pkg.price.toString(),
      durationDays: pkg.duration_days,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
     <ListingPlanCards
        packageslist={packages.filter(pkg => pkg.is_active)}
        selectedPackageId={selectedPackageId ? parseInt(selectedPackageId) : undefined}
        onSelect={handleSelectPackage}
      />
    </div>
  );
}