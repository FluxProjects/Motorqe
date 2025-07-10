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
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function BasicInfoStep({ nextStep }: StepProps) {
  const { control, register, handleSubmit, getValues, setValue, watch } = useFormContext<ListingFormData>();
  const [sellerType, setSellerType] = useState<string>("");
  const { user } = useAuth();

   // Fetch private sellers
  const { data: users = [] } = useQuery({
    queryKey: ["get-users"],
    queryFn: async () => {
      const res = await fetch("/api/get-users");
      console.log("res", res);
      const data = await res.json();
      console.log("data", data);
      return data.filter((u: any) => u.role_id === 2);
    },
  });

  console.log("user", users);
  

  // Fetch showrooms
  const { data: showrooms = [] } = useQuery({
    queryKey: ["showrooms"],
    queryFn: async () => {
      const res = await fetch("/api/showrooms");
      return res.json();
    },
    enabled: sellerType === "showroom",
  });

  // If showroom is selected, auto-assign showroom.user_id
  useEffect(() => {
    if (sellerType !== "showroom") return;
    const selectedShowroomId = getValues("basicInfo.showroomId");
    if (!selectedShowroomId) return;

    const showroom = showrooms.find((s: any) => s.id === selectedShowroomId);
    if (showroom) {
      setValue("basicInfo.userId", showroom.user_id);
    }
  }, [sellerType, showrooms, getValues, setValue, watch("basicInfo.showroomId")]);

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

  useEffect(() => {
  if (user?.roleId > 6) {
    if (getValues("basicInfo.showroomId")) {
      setSellerType("showroom");
    } else if (getValues("basicInfo.userId")) {
      setSellerType("private");
    }
  }
}, [user?.roleId, getValues, setSellerType]);


  const onSubmit = (data: ListingFormData) => {
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Conditionally show if admin/manager (roleId > 6) */}
      {user?.roleId > 6 && (
        <>
          {/* Seller Type */}
          <div>
            <Label>Seller Type*</Label>
            <Select
              value={sellerType}
              onValueChange={(value) => {
                setSellerType(value);
                // Reset on change
                setValue("basicInfo.userId", undefined);
                setValue("basicInfo.showroomId", undefined);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Seller Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private Seller</SelectItem>
                <SelectItem value="showroom">Showroom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Private Seller User Selection */}
          {sellerType === "private" && (
            <div>
              <Label>Select Private Seller*</Label>
              <Controller
                name="basicInfo.userId"
                control={control}
                defaultValue={getValues("basicInfo.userId")}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select User" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u: any) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.first_name} {u.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Showroom Selection */}
          {sellerType === "showroom" && (
            <div>
              <Label>Select Showroom*</Label>
              <Controller
                name="basicInfo.showroomId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                      const selectedShowroom = showrooms.find((s: any) => s.id === Number(value));
                      if (selectedShowroom) {
                        setValue("basicInfo.userId", selectedShowroom.user_id);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Showroom" />
                    </SelectTrigger>
                    <SelectContent>
                      {showrooms.map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
        </>
      )}

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
