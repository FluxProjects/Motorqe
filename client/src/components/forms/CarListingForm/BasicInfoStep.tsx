import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StepProps } from "@shared/schema";
import { useFormContext } from "react-hook-form";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface BasicInfoFormData {
  basicInfo: {
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    price: string;
    location: string;
  };
}

export function BasicInfoStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useFormContext<BasicInfoFormData>();

  const onSubmit = (formData: BasicInfoFormData) => {
    updateData({ basicInfo: formData.basicInfo });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Listing Title*</Label>
          <Input
            id="title"
            {...register("basicInfo.title", { required: "Title is required" })}
            placeholder="e.g. 2020 Toyota Camry XSE"
          />
          {errors.basicInfo?.title && (
            <p className="text-sm text-red-500">{errors.basicInfo.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="title_ar">Listing Title (Arabic)*</Label>
          <Input
            id="title_ar"
            {...register("basicInfo.titleAr", { required: "Arabic title is required" })}
            placeholder="مثال: تويوتا كامري 2020"
          />
          {errors.basicInfo?.titleAr && (
            <p className="text-sm text-red-500">{errors.basicInfo.titleAr.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description*</Label>
          <Textarea
            id="description"
            {...register("basicInfo.description", {
              required: "Description is required",
            })}
            rows={4}
            placeholder="Describe your vehicle in detail..."
          />
          {errors.basicInfo?.description && (
            <p className="text-sm text-red-500">{errors.basicInfo.description.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description_ar">Description (Arabic)*</Label>
          <Textarea
            id="description_ar"
            {...register("basicInfo.descriptionAr", {
              required: "Arabic description is required",
            })}
            rows={4}
            placeholder="وصف السيارة بالتفصيل..."
          />
          {errors.basicInfo?.descriptionAr && (
            <p className="text-sm text-red-500">{errors.basicInfo.descriptionAr.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="price">Price (QAR)*</Label>
          <Input
            id="price"
            type="number"
            {...register("basicInfo.price", {
              required: "Price is required",
              min: { value: 0, message: "Price must be positive" },
            })}
            placeholder="e.g. 15000"
          />
          {errors.basicInfo?.price && (
            <p className="text-sm text-red-500">{errors.basicInfo.price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="location">Location*</Label>
          <Input
            id="location"
            {...register("basicInfo.location", {
              required: "Location is required",
            })}
            placeholder="City, Country"
          />
          {errors.basicInfo?.location && (
            <p className="text-sm text-red-500">{errors.basicInfo.location.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4">
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
          Next: Specifications
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
