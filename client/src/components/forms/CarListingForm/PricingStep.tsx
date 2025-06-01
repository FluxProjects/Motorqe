import { Button } from "@/components/ui/button";
import { PromotionPackage, StepProps } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ListingPlanCards from "./ListingPlanTable";

export function PricingStep({
  data,
  updateData,
  nextStep,
  prevStep,
}: StepProps) {
  // Enhanced debug logging
  console.groupCollapsed("[PricingStep] Debug Info");
  console.log("Props received:", data);
  console.log("Package data from props:", data?.package);
  console.groupEnd();

  const { data: packages = [], isLoading } = useQuery<PromotionPackage[]>({
    queryKey: ["promotion-packages"],
    queryFn: () => fetch("/api/promotion-packages").then((res) => res.json()),
  });

  // Initialize form state with proper fallbacks
  const [formData, setFormData] = useState<{
  selectedPackageId?: number;
  durationDays?: number;
  packageName?: string;
  packagePrice?: string;
}>({});


  // Sync form data when packages or props change
  useEffect(() => {
    console.log("[Effect] Checking for package updates...");
    if (!packages.length) return;

    const packageId = Number(data?.package?.packageId);

    if (packageId && packageId === formData.selectedPackageId) return;

    const matchingPackage = packages.find((pkg) => pkg.id === packageId);

    console.log("Found matching package:", matchingPackage);

    if (matchingPackage) {
      setFormData({
        selectedPackageId: packageId,
        durationDays: data?.package?.durationDays
          ? Number(data?.package?.durationDays)
          : matchingPackage.durationDays,
      });
    }
  }, [data?.package, packages]);

  const handleSelectPackage = (pkg: PromotionPackage) => {
    console.log("Package selected:", pkg);
    setFormData({
      selectedPackageId: pkg.id,
      durationDays: pkg.duration_days,
      packageName: pkg.name,
      packagePrice: pkg.price.toString(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.selectedPackageId) {
      console.error("No package selected - cannot proceed");
      return;
    }

    const selectedPackage = packages.find(
      (p) => p.id === formData.selectedPackageId
    );

    if (!selectedPackage) {
      console.error("Selected package not found in available packages");
      return;
    }

    console.log("Submitting package data:", {
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      packagePrice: selectedPackage.price.toString(),
      durationDays: selectedPackage.duration_days,
    });

    updateData({
      package: {
        packageId: selectedPackage.id.toString(),
        packageName: selectedPackage.name,
        packagePrice: selectedPackage.price.toString(),
        durationDays: selectedPackage.duration_days,
      },
    });
    console.log("Package data after update props:", data?.package);
    nextStep();
  };

  if (isLoading) {
    return <div>Loading packages...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
       <ListingPlanCards
                 packageslist={packages}
                 selectedPackageId={formData.selectedPackageId}
                 onSelect={handleSelectPackage}
               />
      </div>

      <div className="flex justify-between pt-4">
         <Button 
        className="bg-blue-900 flex items-center gap-2"
        type="button" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button 
        className="bg-orange-500 flex items-center gap-2"
        type="submit" disabled={!formData.selectedPackageId}>
          Next: Promotion
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
