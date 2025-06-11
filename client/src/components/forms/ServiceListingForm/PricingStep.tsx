import { Button } from "@/components/ui/button";
import { ServicePromotionPackage, ServiceStepProps } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import ServicePlanCards from "@/components/forms/ServiceListingForm/ServicePlanTable";

export function PricingStep({
  data,
  updateData,
  nextStep,
  prevStep,
}: ServiceStepProps) {
  // Enhanced debug logging
  console.groupCollapsed("[PricingStep] Debug Info");
  console.log("Props received:", data);
  console.log("Package data from props:", data?.package);
  console.groupEnd();

  const { data: packages = [], isLoading: isLoading } = useQuery<
    ServicePromotionPackage[]
  >({
    queryKey: [`/api/promotion-packages/services`],
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

  const handleSelectPackage = (pkg: ServicePromotionPackage) => {
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
        <ServicePlanCards
          packageslist={packages}
          selectedPackageId={formData.selectedPackageId}
          onSelect={handleSelectPackage}
        />
      </div>

    </form>
  );
}
