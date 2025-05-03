// src/components/listings/PricingStep.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StepProps } from "@shared/schema";
import { useState } from "react";

export function PricingStep({
  data,
  updateData,
  nextStep,
  prevStep,
}: StepProps) {
  const [formData, setFormData] = useState({
    price: data?.pricing?.price || "",
    currency: data?.pricing?.currency || "usd",
    isNegotiable: data?.pricing?.negotiable || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({
      pricing: {
        price: formData.price,
        negotiable: formData.isNegotiable,
      },
    });

    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="price">Price ($)*</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="100"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="negotiable"
          checked={formData.isNegotiable}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isNegotiable: checked })
          }
        />
        <Label htmlFor="negotiable">Price is negotiable</Label>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" type="button" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit">Next: Promotion</Button>
      </div>
    </form>
  );
}
