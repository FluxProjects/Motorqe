import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StepProps } from '@shared/schema';
import { useFormContext } from "react-hook-form";

interface BasicInfoFormData {
  basicInfo: {
    title: string;
    description: string;
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
        <Label htmlFor="description">Description*</Label>
        <Textarea
          id="description"
          {...register("basicInfo.description", { required: "Description is required" })}
          rows={4}
          placeholder="Describe your vehicle in detail..."
        />
        {errors.basicInfo?.description && (
          <p className="text-sm text-red-500">{errors.basicInfo.description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="price">Price (QAR)*</Label>
        <Input
          id="price"
          type="number"
          {...register("basicInfo.price", { 
            required: "Price is required",
            min: { value: 0, message: "Price must be positive" }
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
          {...register("basicInfo.location", { required: "Location is required" })}
          placeholder="City, Country"
        />
        {errors.basicInfo?.location && (
          <p className="text-sm text-red-500">{errors.basicInfo.location.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          Next: Specifications
        </Button>
      </div>
    </form>
  );
}