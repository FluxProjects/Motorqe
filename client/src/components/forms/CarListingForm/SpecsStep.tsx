import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CarCategory, CarMake, CarModel } from "@shared/schema";
import { StepProps } from "@shared/schema";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function SpecsStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const [formData, setFormData] = useState({
    categoryId: data?.specifications?.categoryId || "",
    makeId: data?.specifications?.makeId || "",
    modelId: data?.specifications?.modelId || "",
    year: data?.specifications?.year || "",
    mileage: data?.specifications?.mileage || "",
    fuelType: data?.specifications?.fuelType || "",
    transmission: data?.specifications?.transmission || "",
    color: data?.specifications?.color || "",
    condition: data?.specifications?.condition || "used",
  });

  const { data: categories = [] } = useQuery<CarCategory[]>({
    queryKey: ["car-categories"],
    queryFn: () => fetch("/api/car-categories").then((res) => res.json()),
  });

  const { data: makes = [] } = useQuery<CarMake[]>({
    queryKey: ["car-makes"],
    queryFn: () => fetch("/api/car-makes").then((res) => res.json()),
  });

  const { data: models = [] } = useQuery<CarModel[]>({
    queryKey: ["car-models", formData.makeId],
    queryFn: () =>
      fetch(`/api/car-makes/${formData.makeId}/models`).then((res) =>
        res.json()
      ),
    enabled: !!formData.makeId,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ specifications: formData });
    nextStep();
  };

  useEffect(() => {
  if (
    formData.makeId &&
    models?.length &&
    !formData.modelId
  ) {
    setFormData((prev) => ({
      ...prev,
      modelId: models[0].id.toString(),
    }));
  }
}, [formData.makeId, models]);


  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {/* Category */}
      <div>
        <Label>Category*</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => {
            setFormData((prev) => ({ ...prev, categoryId: value }));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Make */}
      <div>
        <Label>Make*</Label>
        <Select
          value={formData.makeId}
          onValueChange={(value) => {
            setFormData((prev) => ({ ...prev, makeId: value, modelId: "" }));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select make" />
          </SelectTrigger>
          <SelectContent>
            {makes?.map((make) => (
              <SelectItem key={make.id} value={make.id.toString()}>
                {make.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model */}
      <div>
        <Label>Model*</Label>
        <Select
          value={formData.modelId}
          disabled={!formData.makeId}
          onValueChange={(value) => handleChange("modelId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {models?.map((model) => (
              <SelectItem key={model.id} value={model.id.toString()}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year */}
      <div>
        <Label>Year</Label>
        <Input
          type="number"
          placeholder="e.g., 2021"
          value={formData.year}
          onChange={(e) => handleChange("year", e.target.value)}
        />
      </div>

      {/* Mileage */}
      <div>
        <Label>Mileage (km)</Label>
        <Input
          type="number"
          placeholder="e.g., 50000"
          value={formData.mileage}
          onChange={(e) => handleChange("mileage", e.target.value)}
        />
      </div>

      {/* Fuel Type */}
      <div>
        <Label>Fuel Type</Label>
        <Select
          value={formData.fuelType}
          onValueChange={(value) => handleChange("fuelType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select fuel type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="petrol">Petrol</SelectItem>
            <SelectItem value="gasoline">Gasoline</SelectItem>
            <SelectItem value="diesel">Diesel</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="electric">Electric</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transmission */}
      <div>
        <Label>Transmission</Label>
        <Select
          value={formData.transmission}
          onValueChange={(value) => handleChange("transmission", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select transmission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="automatic">Automatic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Color */}
      <div>
        <Label>Color</Label>
        <Input
          type="text"
          placeholder="e.g., Red"
          value={formData.color}
          onChange={(e) => handleChange("color", e.target.value)}
        />
      </div>

      {/* Condition */}
      <div>
        <Label>Condition</Label>
        <Select
          value={formData.condition}
          onValueChange={(value) => handleChange("condition", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="certified">Certified Pre-Owned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Navigation buttons */}
      <div className="md:col-span-2 flex justify-between pt-4">
        <Button 
        className="bg-blue-900 flex items-center gap-2"
        type="button" 
        onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button 
        className="bg-orange-500 flex items-center gap-2"
        type="submit">Next: Features
        <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
