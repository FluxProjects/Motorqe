"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StepProps } from "@shared/schema";
import { ArrowRight } from "lucide-react";

export function CarPartsStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const [formData, setFormData] = useState({
    engineOil: data.carParts?.engineOil?.toString() || "",
    engineOilFilter: data.carParts?.engineOilFilter?.toString() || "",
    gearboxOil: data.carParts?.gearboxOil?.toString() || "",
    acFilter: data.carParts?.acFilter?.toString() || "",
    airFilter: data.carParts?.airFilter?.toString() || "",
    fuelFilter: data.carParts?.fuelFilter?.toString() || "",
    sparkPlugs: data.carParts?.sparkPlugs?.toString() || "",
    frontBrakePads: data.carParts?.frontBrakePads?.toString() || "",
    rearBrakePads: data.carParts?.rearBrakePads?.toString() || "",
    frontBrakeDiscs: data.carParts?.frontBrakeDiscs?.toString() || "",
    rearBrakeDiscs: data.carParts?.rearBrakeDiscs?.toString() || "",
    battery: data.carParts?.battery?.toString() || "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert string to number or undefined if empty
    const cleanedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        value.trim() === "" ? undefined : Number(value),
      ])
    );

    updateData({ carParts: cleanedData });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(formData).map(([key, value]) => (
        <div key={key}>
          <Label htmlFor={key}>{key.replace(/([A-Z])/g, " $1")}</Label>
          <Input
            id={key}
            type="number"
            value={value}
            onChange={(e) => handleChange(key as keyof typeof formData, e.target.value)}
            placeholder="Optional"
            min={0}
          />
        </div>
      ))}

      <div className="md:col-span-3 flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit" className="bg-orange-500 flex items-center gap-2">
          Next: Car Tyres
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
