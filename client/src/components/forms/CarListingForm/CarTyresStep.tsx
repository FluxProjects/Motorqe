"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StepProps } from "@shared/schema";
import { ArrowRight } from "lucide-react";

export function CarTyresStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const [formData, setFormData] = useState({
    frontTyreSize: data.carTyres?.frontTyreSize || "",
    frontTyrePrice: data.carTyres?.frontTyrePrice?.toString() || "",
    rearTyreSize: data.carTyres?.rearTyreSize || "",
    rearTyrePrice: data.carTyres?.rearTyrePrice?.toString() || "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedData = {
      frontTyreSize: formData.frontTyreSize || undefined,
      frontTyrePrice: formData.frontTyrePrice.trim() === "" ? undefined : Number(formData.frontTyrePrice),
      rearTyreSize: formData.rearTyreSize || undefined,
      rearTyrePrice: formData.rearTyrePrice.trim() === "" ? undefined : Number(formData.rearTyrePrice),
    };

    updateData({ carTyres: cleanedData });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="frontTyreSize">Front Tyre Size</Label>
        <Input
          id="frontTyreSize"
          value={formData.frontTyreSize}
          onChange={(e) => handleChange("frontTyreSize", e.target.value)}
          placeholder="e.g. 225/45 R17"
        />
      </div>

      <div>
        <Label htmlFor="frontTyrePrice">Front Tyre Price (QAR)</Label>
        <Input
          id="frontTyrePrice"
          type="number"
          value={formData.frontTyrePrice}
          onChange={(e) => handleChange("frontTyrePrice", e.target.value)}
          placeholder="Optional"
          min={0}
        />
      </div>

      <div>
        <Label htmlFor="rearTyreSize">Rear Tyre Size</Label>
        <Input
          id="rearTyreSize"
          value={formData.rearTyreSize}
          onChange={(e) => handleChange("rearTyreSize", e.target.value)}
          placeholder="e.g. 235/40 R18"
        />
      </div>

      <div>
        <Label htmlFor="rearTyrePrice">Rear Tyre Price (QAR)</Label>
        <Input
          id="rearTyrePrice"
          type="number"
          value={formData.rearTyrePrice}
          onChange={(e) => handleChange("rearTyrePrice", e.target.value)}
          placeholder="Optional"
          min={0}
        />
      </div>

      <div className="md:col-span-2 flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit" className="bg-orange-500 flex items-center gap-2">
          Next: Media
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
