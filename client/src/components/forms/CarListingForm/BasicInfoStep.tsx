import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StepProps } from "@shared/schema";
import { ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GoogleMaps from "@/components/ui/google-maps";

export function BasicInfoStep({ data, updateData, nextStep }: StepProps) {
  const [formData, setFormData] = useState({
    listingType: data.basicInfo?.listingType || "",
    title: data.basicInfo?.title || "",
    titleAr: data.basicInfo?.titleAr || "",
    description: data.basicInfo?.description || "",
    descriptionAr: data.basicInfo?.descriptionAr || "",
    price: data.basicInfo?.price || "",
    currency: data.basicInfo?.currency || "QR",
    location: data.basicInfo?.location || "",
  });

   const handleMapClick = ({ lat, lng }: { lat: number; lng: number }) => {
    const locationString = `${lat},${lng}`;
    handleChange("location", locationString);
  };

    const marker =
    formData.location && formData.location.includes(",")
      ? [{
          lat: parseFloat(formData.location.split(",")[0]),
          lng: parseFloat(formData.location.split(",")[1]),
        }]
      : [];

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ basicInfo: formData });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Listing Type */}
      <div>
        <Label>Listing Type*</Label>
        <Select
          value={formData.listingType}
          onValueChange={(value) => handleChange("listingType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select listing type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sale">For Sale</SelectItem>
            <SelectItem value="exchange">For Exchange</SelectItem>
            <SelectItem value="both">Sale & Exchange</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title">Listing Title*</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="e.g. 2020 Toyota Camry XSE"
          required
        />
      </div>

      {/* Title (Arabic) */}
      <div>
        <Label htmlFor="titleAr">Listing Title (Arabic)*</Label>
        <Input
          id="titleAr"
          value={formData.titleAr}
          onChange={(e) => handleChange("titleAr", e.target.value)}
          placeholder="مثال: تويوتا كامري 2020"
          required
        />
      </div>

      {/* Description */}
      <div className="md:col-span-2">
        <Label htmlFor="description">Description*</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          placeholder="Describe your vehicle in detail..."
          required
        />
      </div>

      {/* Description (Arabic) */}
      <div className="md:col-span-2">
        <Label htmlFor="descriptionAr">Description (Arabic)*</Label>
        <Textarea
          id="descriptionAr"
          value={formData.descriptionAr}
          onChange={(e) => handleChange("descriptionAr", e.target.value)}
          rows={4}
          placeholder="وصف السيارة بالتفصيل..."
          required
        />
      </div>

      {/* Price */}
      <div>
        <Label htmlFor="price">Price (QAR)*</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) => handleChange("price", e.target.value)}
          placeholder="e.g. 15000"
          min={0}
          required
        />
      </div>

      {/* Location */}
      <div className="md:col-span-2">
        <Label htmlFor="location">Location*</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="City, Country"
          required
          hidden
          disabled
        />
        <GoogleMaps
          center={
            marker.length > 0
              ? marker[0]
              : { lat: 25.2854, lng: 51.5310 } // fallback center (Karachi)
          }
          zoom={11}
          onMapClick={handleMapClick}
          markers={marker}
        />
      </div>

      {/* Submit Button */}
      <div className="md:col-span-2 flex justify-end pt-4">
        <Button type="submit" className="bg-orange-500 flex items-center gap-2">
          Next: Specifications
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
