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
import {
  CarCategory,
  CarEngineCapacity,
  CarMake,
  CarModel,
} from "@shared/schema";
import { StepProps } from "@shared/schema";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";

export function SpecsStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const [formData, setFormData] = useState({
    year: data?.specifications?.year || "",

    makeId: data?.specifications?.makeId || "",
    modelId: data?.specifications?.modelId || "",
    categoryId: data?.specifications?.categoryId || "",

    mileage: data?.specifications?.mileage || "",
    fuelType: data?.specifications?.fuelType || "",
    transmission: data?.specifications?.transmission || "",
    engineCapacityId: data.specifications?.engineCapacityId || "",
    cylinderCount: data.specifications?.cylinderCount || "",

    color: data?.specifications?.color || "",
    interiorColor: data?.specifications?.interiorColor || "",
    tinted: data.specifications?.tinted || "",

    condition: data?.specifications?.condition || "used",

    isImported: data?.specifications?.isImported || "",
    isInspected: data?.specifications?.isInspected || "",
    inspectionReport: data?.specifications?.inspectionReport || "",

    ownerType: data?.specifications?.ownerType || "",
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

  const { data: carEngineCapacities = [] } = useQuery<CarEngineCapacity[]>({
    queryKey: ["/api/car-enginecapacities"], // Changed to a more standard key
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log("specs data", formData);
    e.preventDefault();
    updateData({ specifications: formData });
    nextStep();
  };

  useEffect(() => {
    if (formData.makeId && models?.length && !formData.modelId) {
      setFormData((prev) => ({
        ...prev,
        modelId: models[0].id.toString(),
      }));
    }
  }, [formData.makeId, models]);

  const colorOptions = [
    "Black",
    "White",
    "Silver",
    "Gray",
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Gold",
    "Brown",
  ];

  const handleInspectionReportUpload = (url: string) => {
  setFormData((prev) => ({
    ...prev,
    inspectionReport: url,
  }));
};


  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
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

      {/* Year */}
      <div>
        <Label htmlFor="year">Year*</Label>
        <Input
          id="year"
          type="number"
          placeholder="e.g., 2021"
          value={formData.year}
          onChange={(e) => {
            const value = e.target.value;
            // Allow empty string or max 4 digits
            if (/^\d{0,4}$/.test(value)) {
              handleChange("year", value);
            }
          }}
          onBlur={(e) => {
            const year = parseInt(e.target.value);
            if (year < 1900 || year > new Date().getFullYear()) {
              // Optionally reset or clamp
              handleChange("year", "");
            }
          }}
          className="rounded-lg border px-3 py-2 shadow-sm"
          min={1900}
          max={new Date().getFullYear()}
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

      {/* Engine Capacity ID */}
      <div>
        <Label>Engine Capacity</Label>
        <Select
          value={formData.engineCapacityId}
          onValueChange={(value) => handleChange("engineCapacityId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select engine size" />
          </SelectTrigger>
          <SelectContent>
            {carEngineCapacities?.map((cap) => (
              <SelectItem key={cap.id} value={cap.id.toString()}>
                {cap.size_liters}L
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cylinder Count */}
      <div>
        <Label>Cylinder Count</Label>
        <Input
          type="number"
          placeholder="e.g., 4"
          value={formData.cylinderCount}
          onChange={(e) => handleChange("cylinderCount", e.target.value)}
        />
      </div>

      {/* Color */}
      <div>
        <Label>Color</Label>
        <Select
          value={formData.color}
          onValueChange={(value) => handleChange("color", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select exterior color" />
          </SelectTrigger>
          <SelectContent>
            {colorOptions.map((colr) => (
              <SelectItem key={colr} value={colr}>
                {colr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Interior Color */}
      <div>
        <Label>Interior Color</Label>
        <Select
          value={formData.interiorColor}
          onValueChange={(value) => handleChange("interiorColor", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select interior color" />
          </SelectTrigger>
          <SelectContent>
            {colorOptions.map((color) => (
              <SelectItem key={color} value={color}>
                {color}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tinted */}
      <div>
        <Label>Tinted</Label>
        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="tinted"
              value="true"
              checked={formData.tinted === "true"}
              onChange={(e) => handleChange("tinted", e.target.value)}
            />
            Yes
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="tinted"
              value="false"
              checked={formData.tinted === "false"}
              onChange={(e) => handleChange("tinted", e.target.value)}
            />
            No
          </label>
        </div>
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
            <SelectItem value="scrap">Scrap</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Is Imported */}
      <div>
        <Label>Is Imported</Label>
        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="isImported"
              value="true"
              checked={formData.isImported === "true"}
              onChange={(e) => handleChange("isImported", e.target.value)}
            />
            Yes
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="isImported"
              value="false"
              checked={formData.isImported === "false"}
              onChange={(e) => handleChange("isImported", e.target.value)}
            />
            No
          </label>
        </div>
      </div>

      {/* Is Inspected */}
      <div>
        <Label>Is Inspected</Label>
        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="isInspected"
              value="true"
              checked={formData.isInspected === "true"}
              onChange={(e) => handleChange("isInspected", e.target.value)}
            />
            Yes
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="isInspected"
              value="false"
              checked={formData.isInspected === "false"}
              onChange={(e) => handleChange("isInspected", e.target.value)}
            />
            No
          </label>
        </div>
      </div>

      {/* Inspection Report Upload */}
      {formData.isInspected === "true" && (
        <div className="mt-4">
          <Label>Inspection Report</Label>
          <ImageUpload
            currentImage={formData.inspectionReport}
            onUploadComplete={handleInspectionReportUpload}
          />
        </div>
      )}

      {/* Owner Type */}
      <div>
        <Label>Owner Type</Label>
        <Select
          value={formData.ownerType}
          onValueChange={(value) => handleChange("ownerType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select owner type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="first">First</SelectItem>
            <SelectItem value="second">Second</SelectItem>
            <SelectItem value="third">Third</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Navigation buttons */}
      <div className="md:col-span-2 flex justify-between pt-4">
        <Button
          className="bg-blue-900 flex items-center gap-2"
          type="button"
          onClick={prevStep}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button className="bg-orange-500 flex items-center gap-2" type="submit">
          Next: Features
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
