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
import { MultiSelect } from "@/components/ui/multiselect";
import { useTranslation } from "react-i18next";

export function SpecsStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const { t } = useTranslation();
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

  // Track selected options for display
  const [selectedMake, setSelectedMake] = useState<{value: string, label: string} | null>(null);
  const [selectedModel, setSelectedModel] = useState<{value: string, label: string} | null>(null);
  const [selectedYear, setSelectedYear] = useState<{value: string, label: string} | null>(null);

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
    queryKey: ["/api/car-enginecapacities"],
  });

  // Initialize selected values when data loads or changes
  useEffect(() => {
    if (makes.length > 0 && formData.makeId) {
      const make = makes.find(m => m.id.toString() === formData.makeId);
      if (make) {
        setSelectedMake({ value: make.id.toString(), label: make.name });
      }
    }
  }, [makes, formData.makeId]);

  useEffect(() => {
    if (models.length > 0 && formData.modelId) {
      const model = models.find(m => m.id.toString() === formData.modelId);
      if (model) {
        setSelectedModel({ value: model.id.toString(), label: model.name });
      }
    }
  }, [models, formData.modelId]);

  useEffect(() => {
    if (formData.year) {
      setSelectedYear({ value: formData.year, label: formData.year });
    }
  }, [formData.year]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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

  const makeOptions = makes?.map((make: CarMake) => ({
    value: String(make.id),
    label: make.name,
  })) ?? [];

  const modelOptions = models?.map((model: CarModel) => ({
    value: String(model.id),
    label: model.name,
  })) ?? [];

  // Generate year options (e.g., last 30 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  // Handler for MultiSelect that ensures only one item is selected
  const handleSingleSelect = (field: string, values: string[]) => {
    // Take the last selected item (or empty if deselected)
    const selectedValue = values.length > 0 ? values[values.length - 1] : "";
    handleChange(field, selectedValue);
    
    // Update the selected option state
    if (field === 'makeId') {
      const selected = makeOptions.find(opt => opt.value === selectedValue);
      setSelectedMake(selected || null);
      // Reset model when make changes
      if (selectedValue !== formData.makeId) {
        handleChange("modelId", "");
        setSelectedModel(null);
      }
    } else if (field === 'modelId') {
      const selected = modelOptions.find(opt => opt.value === selectedValue);
      setSelectedModel(selected || null);
    } else if (field === 'year') {
      const selected = yearOptions.find(opt => opt.value === selectedValue);
      setSelectedYear(selected || null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Make */}
      <div>
        <Label>Make*</Label>
        <MultiSelect
          options={makeOptions}
          selected={formData.makeId ? [formData.makeId] : []}
          value={selectedMake ? [selectedMake] : []}
          onChange={(values) => handleSingleSelect("makeId", values)}
          placeholder="Select make"
          singleSelect
        />
      </div>

      {/* Model */}
      <div>
        <Label>Model*</Label>
        <MultiSelect
          options={modelOptions}
          selected={formData.modelId ? [formData.modelId] : []}
          value={selectedModel ? [selectedModel] : []}
          onChange={(values) => handleSingleSelect("modelId", values)}
          placeholder="Select model"
          disabled={!formData.makeId}
          singleSelect
        />
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
        <Label>Year*</Label>
        <MultiSelect
          options={yearOptions}
          selected={formData.year ? [formData.year] : []}
          value={selectedYear ? [selectedYear] : []}
          onChange={(values) => handleSingleSelect("year", values)}
          placeholder="Select year"
          singleSelect
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
            isFile={true}
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
