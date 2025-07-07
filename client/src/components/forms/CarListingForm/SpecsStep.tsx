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
import { toast } from "@/hooks/use-toast";

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
    wheelDrive: data.specifications?.wheelDrive || "",
    color: data?.specifications?.color || "",
    interiorColor: data?.specifications?.interiorColor || "",
    tinted: data.specifications?.tinted || "",
    condition: data?.specifications?.condition || "used",
    isImported: data?.specifications?.isImported || "",
    hasInsurance: data?.specifications?.hasInsurance || "",
    insuranceExpiry: data?.specifications?.insuranceExpiry || "",
    hasWarranty: data?.specifications?.hasWarranty || "",
    warrantyExpiry: data?.specifications?.warrantyExpiry || "",
    isInspected: data?.specifications?.isInspected || "",
    inspectionReport: data?.specifications?.inspectionReport || "",
    ownerType: data?.specifications?.ownerType || "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    queryFn: () => fetch("/api/car-enginecapacities").then((res) => res.json()),
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
    // Clear error when field is updated
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const requiredFields = [
      'year', 'makeId', 'modelId', 'categoryId', 'mileage', 'fuelType',
      'transmission', 'engineCapacityId', 'cylinderCount', 'color',
      'interiorColor', 'condition', 'isImported', 'ownerType'
    ];

    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    // Additional validation for numeric fields
    if (formData.mileage && isNaN(Number(formData.mileage))) {
      errors.mileage = "Mileage must be a number";
    }

    if (formData.cylinderCount && isNaN(Number(formData.cylinderCount))) {
      errors.cylinderCount = "Cylinder count must be a number";
    }

    // Validate inspection report if inspected
    if (formData.isInspected === "true" && !formData.inspectionReport) {
      errors.inspectionReport = "Inspection report is required when car is inspected";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    // ✅ Normalize wheelDrive before updating data
const validWheelDrives = ["AWD", "FWD", "RWD"] as const;
const wheelDriveNormalized = validWheelDrives.includes(formData.wheelDrive.toUpperCase() as any)
  ? formData.wheelDrive.toUpperCase() as "AWD" | "FWD" | "RWD"
  : undefined;

// ✅ Create a clean specifications payload matching the expected type
const cleanSpecifications = {
  ...formData,
  wheelDrive: wheelDriveNormalized,
};


    updateData({ specifications: cleanSpecifications });
    nextStep();
    setIsSubmitting(false);
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
    if (formErrors.inspectionReport) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.inspectionReport;
        return newErrors;
      });
    }
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
        {formErrors.makeId && <p className="text-red-500 text-sm mt-1">{formErrors.makeId}</p>}
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
        {formErrors.modelId && <p className="text-red-500 text-sm mt-1">{formErrors.modelId}</p>}
      </div>

      {/* Category */}
      <div>
        <Label>Category*</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => handleChange("categoryId", value)}
          required
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
        {formErrors.categoryId && <p className="text-red-500 text-sm mt-1">{formErrors.categoryId}</p>}
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
        {formErrors.year && <p className="text-red-500 text-sm mt-1">{formErrors.year}</p>}
      </div>

      {/* Mileage */}
      <div>
        <Label>Mileage (km)*</Label>
        <Input
          type="number"
          placeholder="e.g., 50000"
          value={formData.mileage}
          onChange={(e) => handleChange("mileage", e.target.value)}
          required
        />
        {formErrors.mileage && <p className="text-red-500 text-sm mt-1">{formErrors.mileage}</p>}
      </div>

      {/* Fuel Type */}
      <div>
        <Label>Fuel Type*</Label>
        <Select
          value={formData.fuelType}
          onValueChange={(value) => handleChange("fuelType", value)}
          required
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
        {formErrors.fuelType && <p className="text-red-500 text-sm mt-1">{formErrors.fuelType}</p>}
      </div>

      {/* Transmission */}
      <div>
        <Label>Transmission*</Label>
        <Select
          value={formData.transmission}
          onValueChange={(value) => handleChange("transmission", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select transmission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="automatic">Automatic</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.transmission && <p className="text-red-500 text-sm mt-1">{formErrors.transmission}</p>}
      </div>

      {/* Engine Capacity ID */}
      <div>
        <Label>Engine Capacity*</Label>
        <Select
          value={formData.engineCapacityId}
          onValueChange={(value) => handleChange("engineCapacityId", value)}
          required
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
        {formErrors.engineCapacityId && <p className="text-red-500 text-sm mt-1">{formErrors.engineCapacityId}</p>}
      </div>

      {/* Cylinder Count */}
      <div>
        <Label>Cylinder Count*</Label>
        <Input
          type="number"
          placeholder="e.g., 4"
          value={formData.cylinderCount}
          onChange={(e) => handleChange("cylinderCount", e.target.value)}
          required
        />
        {formErrors.cylinderCount && <p className="text-red-500 text-sm mt-1">{formErrors.cylinderCount}</p>}
      </div>

      {/* Wheel Drive */}
      <div>
        <Label>Wheel Drive*</Label>
        <Select
          value={formData.wheelDrive}
          onValueChange={(value) => handleChange("wheelDrive", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select wheel drive" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FWD">Front Wheel Drive (FWD)</SelectItem>
            <SelectItem value="RWD">Rear Wheel Drive (RWD)</SelectItem>
            <SelectItem value="AWD">All Wheel Drive (AWD)</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.wheelDrive && <p className="text-red-500 text-sm mt-1">{formErrors.wheelDrive}</p>}
      </div>

      {/* Color */}
      <div>
        <Label>Color*</Label>
        <Select
          value={formData.color}
          onValueChange={(value) => handleChange("color", value)}
          required
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
        {formErrors.color && <p className="text-red-500 text-sm mt-1">{formErrors.color}</p>}
      </div>

      {/* Interior Color */}
      <div>
        <Label>Interior Color*</Label>
        <Select
          value={formData.interiorColor}
          onValueChange={(value) => handleChange("interiorColor", value)}
          required
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
        {formErrors.interiorColor && <p className="text-red-500 text-sm mt-1">{formErrors.interiorColor}</p>}
      </div>

      {/* Tinted */}
      <div>
        <Label>Tinted*</Label>
        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="tinted"
              value="true"
              checked={formData.tinted === "true"}
              onChange={(e) => handleChange("tinted", e.target.value)}
              required
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
        {formErrors.tinted && <p className="text-red-500 text-sm mt-1">{formErrors.tinted}</p>}
      </div>

      {/* Condition */}
      <div>
        <Label>Condition*</Label>
        <Select
          value={formData.condition}
          onValueChange={(value) => handleChange("condition", value)}
          required
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
        {formErrors.condition && <p className="text-red-500 text-sm mt-1">{formErrors.condition}</p>}
      </div>

    

      {/* Has Insurance */}
      <div>
        <Label>Has Insurance*</Label>
        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="hasInsurance"
              value="true"
              checked={formData.hasInsurance === "true"}
              onChange={(e) => handleChange("hasInsurance", e.target.value)}
              required
            />
            Yes
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="hasInsurance"
              value="false"
              checked={formData.hasInsurance === "false"}
              onChange={(e) => handleChange("hasInsurance", e.target.value)}
            />
            No
          </label>
        </div>
        {formErrors.hasInsurance && <p className="text-red-500 text-sm mt-1">{formErrors.hasInsurance}</p>}
      </div>

      {/* Insurance Expiry */}
      {formData.hasInsurance === "true" && (
        <div>
          <Label>Insurance Expiry Date*</Label>
          <Input
            type="date"
            value={formData.insuranceExpiry}
            onChange={(e) => handleChange("insuranceExpiry", e.target.value)}
            required
          />
          {formErrors.insuranceExpiry && <p className="text-red-500 text-sm mt-1">{formErrors.insuranceExpiry}</p>}
        </div>
      )}

      {/* Has Warranty */}
      <div>
        <Label>Has Warranty*</Label>
        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="hasWarranty"
              value="true"
              checked={formData.hasWarranty === "true"}
              onChange={(e) => handleChange("hasWarranty", e.target.value)}
              required
            />
            Yes
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="hasWarranty"
              value="false"
              checked={formData.hasWarranty === "false"}
              onChange={(e) => handleChange("hasWarranty", e.target.value)}
            />
            No
          </label>
        </div>
        {formErrors.hasWarranty && <p className="text-red-500 text-sm mt-1">{formErrors.hasWarranty}</p>}
      </div>

      {/* Warranty Expiry */}
      {formData.hasWarranty === "true" && (
        <div>
          <Label>Warranty Expiry Date*</Label>
          <Input
            type="date"
            value={formData.warrantyExpiry}
            onChange={(e) => handleChange("warrantyExpiry", e.target.value)}
            required
          />
          {formErrors.warrantyExpiry && <p className="text-red-500 text-sm mt-1">{formErrors.warrantyExpiry}</p>}
        </div>
      )}

      {/* Is Inspected */}
      <div>
        <Label>Is Inspected*</Label>
        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="isInspected"
              value="true"
              checked={formData.isInspected === "true"}
              onChange={(e) => handleChange("isInspected", e.target.value)}
              required
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
        {formErrors.isInspected && <p className="text-red-500 text-sm mt-1">{formErrors.isInspected}</p>}
      </div>

        {/* Is Imported */}
      <div>
        <Label>Is Imported*</Label>
        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="isImported"
              value="true"
              checked={formData.isImported === "true"}
              onChange={(e) => handleChange("isImported", e.target.value)}
              required
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
        {formErrors.isImported && <p className="text-red-500 text-sm mt-1">{formErrors.isImported}</p>}
      </div>

      {/* Inspection Report Upload */}
      {formData.isInspected === "true" && (
        <div className="mt-4 mb-8">
          <Label>Inspection Report*</Label>
          <div className="w-[200px] h-[200px]">
          <ImageUpload
            currentImage={formData.inspectionReport}
            onUploadComplete={handleInspectionReportUpload}
            isFile={true}
          />
          </div>
          {formErrors.inspectionReport && <p className="text-red-500 text-sm mt-1">{formErrors.inspectionReport}</p>}
        </div>
      )}

      {/* Owner Type */}
      <div>
        <Label>Owner Type*</Label>
        <Select
          value={formData.ownerType}
          onValueChange={(value) => handleChange("ownerType", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select owner type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="first">First</SelectItem>
            <SelectItem value="second">Second</SelectItem>
            <SelectItem value="third">Third</SelectItem>
            <SelectItem value="fourth">Fourth</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.ownerType && <p className="text-red-500 text-sm mt-1">{formErrors.ownerType}</p>}
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
        <Button 
          className="bg-orange-500 flex items-center gap-2" 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Validating..." : "Next: Features"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}