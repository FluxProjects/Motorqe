import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StepProps, ListingFormData } from "@shared/schema";
import { ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import GoogleMaps from "@/components/ui/google-maps";

export function BasicInfoStep({ nextStep }: StepProps) {
  const { control, register, handleSubmit, getValues, setValue } = useFormContext<ListingFormData>();

  const handleMapClick = ({ lat, lng }: { lat: number; lng: number }) => {
    const locationString = `${lat},${lng}`;
    setValue("basicInfo.location", locationString);
  };

  const marker = (() => {
    const location = getValues("basicInfo.location");
    if (location && location.includes(",")) {
      const [lat, lng] = location.split(",");
      return [{ lat: parseFloat(lat), lng: parseFloat(lng) }];
    }
    return [];
  })();

  const onSubmit = (data: ListingFormData) => {
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Listing Type */}
      <div>
        <Label>Listing Type*</Label>
        <Controller
          name="basicInfo.listingType"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
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
          )}
        />
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title">Listing Title*</Label>
        <Input
          id="title"
          {...register("basicInfo.title", { required: true })}
          placeholder="e.g. 2020 Toyota Camry XSE"
        />
      </div>

      {/* Title (Arabic) */}
      <div>
        <Label htmlFor="titleAr">Listing Title (Arabic)*</Label>
        <Input
          id="titleAr"
          {...register("basicInfo.titleAr", { required: true })}
          placeholder="مثال: تويوتا كامري 2020"
        />
      </div>

      {/* Description */}
      <div className="md:col-span-2">
        <Label htmlFor="description">Description*</Label>
        <Textarea
          id="description"
          {...register("basicInfo.description", { required: true })}
          rows={4}
          placeholder="Describe your vehicle in detail..."
        />
      </div>

      {/* Description (Arabic) */}
      <div className="md:col-span-2">
        <Label htmlFor="descriptionAr">Description (Arabic)*</Label>
        <Textarea
          id="descriptionAr"
          {...register("basicInfo.descriptionAr", { required: true })}
          rows={4}
          placeholder="وصف السيارة بالتفصيل..."
        />
      </div>

      {/* Price */}
      <div>
        <Label htmlFor="price">Price (QAR)*</Label>
        <Input
          id="price"
          type="number"
          {...register("basicInfo.price", { required: true })}
          placeholder="e.g. 15000"
          min={0}
        />
      </div>

      {/* Location */}
      <div className="md:col-span-2">
        <Label>Location*</Label>
        <Input
          hidden
          disabled
          {...register("basicInfo.location", { required: true })}
        />
        <GoogleMaps
          center={
            marker.length > 0
              ? marker[0]
              : { lat: 25.2854, lng: 51.5310 } // fallback center (Doha)
          }
          zoom={11}
          onMapClick={handleMapClick}
          markers={marker}
          containerStyle={{ width: "100%", height: "256px" }}
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
