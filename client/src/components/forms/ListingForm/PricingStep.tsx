import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PromotionPackage, StepProps } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import clsx from "clsx"; // optional, for class toggling

export function PricingStep({
  data,
  updateData,
  nextStep,
  prevStep,
}: StepProps) {
  const { data: packages = [] } = useQuery<PromotionPackage[]>({
    queryKey: ['promotion-packages'],
    queryFn: () => fetch('/api/promotion-packages').then(res => res.json()),
  });

  const [formData, setFormData] = useState({
    selectedPackageId: data?.package?.packageId || null,
  });

  const handleSelectPackage = (pkg: PromotionPackage) => {
    setFormData({
      ...formData,
      selectedPackageId: pkg.id,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPackage = packages.find(p => p.id === formData.selectedPackageId);
    if (!selectedPackage) return;

    updateData({
      package: {
        packageId: selectedPackage.id,
      },
    });

    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Select a Pricing Package*</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {packages.map((pkg) => (
            <button
              type="button"
              key={pkg.id}
              onClick={() => handleSelectPackage(pkg)}
              className={clsx(
                "border rounded-xl p-4 text-left transition-colors",
                formData.selectedPackageId === pkg.id
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-primary"
              )}
            >
              <div className="font-medium">{pkg.name}</div>
              <div className="text-sm text-muted-foreground">
              {pkg.price} {(pkg.currency ?? "QAR").toUpperCase()}- {pkg.durationDays} days
              </div>
              {pkg.isFeatured && (
                <div className="mt-1 text-xs text-yellow-600 font-semibold">Featured</div>
              )}
            </button>
          ))}
        </div>
      </div>


      <div className="flex justify-between pt-4">
        <Button variant="outline" type="button" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit" disabled={!formData.selectedPackageId}>
          Next: Promotion
        </Button>
      </div>
    </form>
  );
}
