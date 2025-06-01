import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CarService, Showroom, ServiceStepProps } from '@shared/schema';
import { useFormContext, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface BasicInfoFormData {
  basicInfo: {
    serviceId: string;
    showroomId: string;
    description: string;
    descriptionAr: string;
    currency: string;
    price: string;
  };
}

export function BasicInfoStep({ data, updateData, nextStep }: ServiceStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    control,
  } = useFormContext<BasicInfoFormData>();

  const { user } = useAuth();

  const onSubmit = (formData: BasicInfoFormData) => {
    updateData({ basicInfo: formData.basicInfo });
    nextStep();
  };

     const { data: garages = [] } = useQuery<Showroom[]>({
    queryKey: ['user-garages'],
    queryFn: async () => {
      const url = '/api/garages';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch garages');
      return res.json();
    },
    enabled: !!user?.id && !!user?.roleId,
  });

 

  const { data: carservices = [] } = useQuery<CarService[]>({
    queryKey: ['car-services'],
    queryFn: () => fetch('/api/services').then((res) => res.json()),
  });

   // Set default values from incoming `data` on mount
  useEffect(() => {
    if (data?.basicInfo) {
      console.log("before set value basicInfo data", data?.basicInfo);
      const { showroomId, serviceId, price, currency, description, descriptionAr } = data.basicInfo;
      setValue("basicInfo.serviceId", serviceId || "");
      setValue("basicInfo.showroomId", showroomId || "");
      setValue("basicInfo.price", price || "");
      setValue("basicInfo.currency", currency || "QAR");
      setValue("basicInfo.description", description || "");
      setValue("basicInfo.descriptionAr", descriptionAr || "");
    }
  }, [data, setValue]);

  console.log("basicInfo data", data?.basicInfo);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Service Selection */}
      <div>
        <Label htmlFor="service">Service*</Label>
        <Controller
          name="basicInfo.serviceId"
          control={control}
          rules={{ required: "Service is required" }}
          defaultValue=""
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {carservices?.map((carservice) => (
                  <SelectItem key={carservice.id} value={carservice.id.toString()}>
                    {carservice.name || carservice.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.basicInfo?.serviceId && (
          <p className="text-sm text-red-500">{errors.basicInfo.serviceId.message}</p>
        )}
      </div>

      {/* Showroom Selection */}
      <div>
        <Label htmlFor="showroom">Showroom*</Label>
        <Controller
          name="basicInfo.showroomId"
          control={control}
          rules={{ required: "Showroom is required" }}
          defaultValue=""
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a showroom" />
              </SelectTrigger>
              <SelectContent>
                {garages?.map((showroom) => (
                  <SelectItem key={showroom.id} value={showroom.id.toString()}>
                    {showroom.name || showroom.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.basicInfo?.showroomId && (
          <p className="text-sm text-red-500">{errors.basicInfo.showroomId.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description (English)*</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Describe the service in detail..."
          {...register("basicInfo.description", { required: "Description is required" })}
        />
        {errors.basicInfo?.description && (
          <p className="text-sm text-red-500">{errors.basicInfo.description.message}</p>
        )}
      </div>

      {/* Arabic Description */}
      <div>
        <Label htmlFor="descriptionAr">Description (Arabic)*</Label>
        <Textarea
          id="descriptionAr"
          dir="rtl"
          className="text-right"
          rows={4}
          placeholder="وصف الخدمة باللغة العربية..."
          {...register("basicInfo.descriptionAr", { required: "Arabic description is required" })}
        />
        {errors.basicInfo?.descriptionAr && (
          <p className="text-sm text-red-500">{errors.basicInfo.descriptionAr.message}</p>
        )}
      </div>

      {/* Price */}
      <div>
        <Label htmlFor="price">Price (QAR)*</Label>
        <Input
          id="price"
          type="number"
          placeholder="e.g. 150"
          {...register("basicInfo.price", {
            required: "Price is required",
            min: { value: 0, message: "Price must be positive" },
          })}
        />
        {errors.basicInfo?.price && (
          <p className="text-sm text-red-500">{errors.basicInfo.price.message}</p>
        )}
      </div>

      {/* Hidden Currency Field */}
      <Input id="currency" type="hidden" {...register("basicInfo.currency")} />

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          Next: Availability
        </Button>
      </div>
    </form>
  );
}