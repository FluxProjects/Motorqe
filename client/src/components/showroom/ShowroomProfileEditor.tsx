// GarageProfileEditor.tsx

import { useQuery, useMutation } from "@tanstack/react-query";
import { BaseProfileEditor } from "../users/BaseProfileEditor";
import { PasswordChangeForm } from "../users/PasswordChangeForm";
import { Controller, useForm, FormProvider, Control } from "react-hook-form";
import { AvailabilityEntry, Showroom, User } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import MultiImageUpload from "@/components/ui/multi-image-upload";
import ImageUpload from "@/components/ui/image-upload";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AvailabilityEditor } from "@/components/ui/availability";
import { toast } from "@/hooks/use-toast";
import { safeParseJSON } from "@/lib/utils";
import GoogleMaps from "../ui/google-maps";

type FormValues = {
  name: string;
  nameAr: string;
  tLicense: string;
  description: string;
  descriptionAr: string;
  address: string;
  addressAr: string;
  location: string;
  phone: string;
  timing: string;
  isMainBranch: boolean;
  logo: string;
  images: string[];
};

export function ShowroomProfileEditor({ user }: { user: User }) {
  const { t } = useTranslation();
  const auth = useAuth();
  const roleId = user?.role_id;
  const isGarage = user?.roleId === 3;
  const [marker, setMarker] = useState<{ lat: number; lng: number }[]>([]);

  const { data: showrooms = [], isLoading, refetch } = useQuery<Showroom[]>({
    queryKey: ["user-showrooms", user.id],
    queryFn: () =>
      fetch(`/api/showrooms/user/${user.id}`).then((res) =>
        res.json()
      ),
    enabled: !!user?.id,
  });

  const methods = useForm<FormValues>({
    defaultValues: {
      name: "",
      nameAr: "",
      tLicense: "",
      description: "",
      descriptionAr: "",
      address: "",
      addressAr: "",
      location: "",
      phone: "",
      timing: "",
      isMainBranch: false,
      logo: "",
      images: [],
    },
  });

 
  const parseLocation = (location: string | null) => {
    if (!location) return null;
    const coords = location.split(',');
    if (coords.length !== 2) return null;
    
    const lat = parseFloat(coords[0].trim());
    const lng = parseFloat(coords[1].trim());
    return isNaN(lat) || isNaN(lng) ? null : { lat, lng };
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker([{ lat, lng }]);
      methods.setValue("location", `${lat}, ${lng}`);
    }
  };


  const hasActiveDays = (value: string | Record<string, AvailabilityEntry> | null | undefined): boolean => {
    if (!value) return false;
  
    let parsed: Record<string, AvailabilityEntry>;
  
    try {
      parsed = typeof value === "string" ? JSON.parse(value) : value;
    } catch {
      return false;
    }
  
    return Object.values(parsed || {}).some((entry) => entry?.isOpen);
  };

  // Set form values when showroom data is loaded or changes
  useEffect(() => {
    if (showrooms.length > 0) {
      const showroom = showrooms[0]; // Only work with the first showroom/garage
      methods.reset({
        name: showroom.name ?? "",
        nameAr: showroom.name_ar ?? "",
        tLicense: showroom.t_license ?? "",
        description: showroom.description ?? "",
        descriptionAr: showroom.description_ar ?? "",
        address: showroom.address ?? "",
        addressAr: showroom.address_ar ?? "",
        location: showroom.location ?? "",
        phone: showroom.phone ?? "",
        timing: showroom.timing ?? "",
        isMainBranch: showroom.is_main_branch ?? false,
        logo: showroom.logo ?? "",
        images: showroom.images ?? [],
      });
    } else {
      methods.reset({
        name: "",
        nameAr: "",
        tLicense: "",
        description: "",
        descriptionAr: "",
        address: "",
        addressAr: "",
        location: "",
        phone: "",
        timing: "",
        isMainBranch: false,
        logo: "",
        images: [],
      });
    }
  }, [showrooms, methods]);

  const upsertMutation = useMutation({
  mutationFn: async (data: FormValues) => {
    const payload = {
      ...data,
      isGarage: isGarage,
    };

    if (showrooms.length > 0) {
      // Update existing showroom/garage
      const res = await fetch(`/api/showrooms/${showrooms[0].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update garage");
      return res.json();
    } else {
      // Create new showroom/garage
      const res = await fetch(`/api/showrooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          userId: user.id,
          isMainBranch: data.isMainBranch || false,
          images: data.images || [],
          createdAt: new Date(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create garage");
      return res.json();
    }
  },
  onSuccess: () => {
    refetch();
    toast({
          title: "Success",
          description: showrooms.length > 0 
            ? "Showroom updated successfully" 
            : "Showroom created successfully",
          variant: "default",
        });
  },
  onError: (error) => {
    console.error("Error upserting showroom/garage:", error);
    toast({
          title: "Error",
          description: error.message || "An error occurred",
          variant: "destructive",
        });
  },
});

  const updateUserMutation = useMutation({
    mutationFn: async (updatedUser: Partial<User>) => {
      const res = await fetch(`/api/users/${auth.user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!res.ok) {
        throw new Error("Failed to update user");
      }

      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({
            title: "Success",
            description: "Profile updated successfully",
            variant: "default",
          });
    },
    onError: (error) => {
    toast({
      title: "Error",
      description: error.message || "Failed to update profile",
      variant: "destructive",
    });
  },
  });

  const { handleSubmit, register, control, setValue, watch } = methods;
  const images = watch("images");
  const logo = watch("logo");

  const handleImagesUpload = (newImages: string[]) => {
    setValue("images", newImages);
  };

  const handleLogoUpload = (url: string) => {
    setValue("logo", url);
  };

   // Initialize map with existing location
  useEffect(() => {
    if (showrooms.length > 0 && showrooms[0].location) {
      const coords = parseLocation(showrooms[0].location);
      if (coords) {
        setMarker([coords]);
      }
    }
  }, [showrooms]);


  if (isLoading) return <p>{t("common.loading")}...</p>;



  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-3 w-[600px] mb-6">
        <TabsTrigger value="profile">{t("profile.profileInfo")}</TabsTrigger>
        {(Number(roleId) === 3) && (
          <TabsTrigger value="showroom">{t("profile.dealerInfo")}</TabsTrigger>
        )}
        {(Number(roleId) === 4) && (
          <TabsTrigger value="showroom">{t("profile.garageInfo")}</TabsTrigger>
        )}
        <TabsTrigger value="password">{t("profile.password")}</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <BaseProfileEditor 
          onSubmit={(data) => updateUserMutation.mutate(data)}
          user={user} 
        />
      </TabsContent>

      <TabsContent value="password">
        <PasswordChangeForm userId={user.id} />
      </TabsContent>

      <TabsContent value="showroom">
        <Card className="bg-muted/50">
          <CardContent className="p-4 space-y-4">
            <FormProvider {...methods}>

              <form onSubmit={handleSubmit((data) => upsertMutation.mutate(data))} className="grid gap-4">
              {/* Logo Upload */}
              
              <div className="grid grid-cols-2 gap-4">
                <div><label>{t("showroom.name")} (EN)</label><Input {...register("name")} /></div>
                <div><label>{t("showroom.name")} (AR)</label><Input {...register("nameAr")} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label>{t("showroom.description")} (EN)</label><Input {...register("description")} /></div>
                <div><label>{t("showroom.description")} (AR)</label><Input {...register("descriptionAr")} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label>{t("showroom.address")} (EN)</label><Input {...register("address")} /></div>
                <div><label>{t("showroom.address")} (AR)</label><Input {...register("addressAr")} /></div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div><label>{t("showroom.tLicense")}</label><Input {...register("tLicense")} /></div>
              </div>

              {/* Location Field with Map */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label>{t("showroom.location")}</label>
                  <Input 
                    {...register("location")} 
                    readOnly 
                    placeholder="Click on the map to set location coordinates" 
                  />
                </div>
                <div className="h-64 w-full rounded-lg overflow-hidden">
                  <GoogleMaps
                    center={
                      marker.length > 0
                        ? marker[0]
                        : { lat: 25.2854, lng: 51.5310 } // fallback center (Doha)
                    }
                    zoom={marker.length > 0 ? 15 : 11}
                    onMapClick={handleMapClick}
                    markers={marker}
                    containerStyle={{ width: "100%", height: "250px" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div><label>{t("showroom.phone")}</label><Input {...register("phone")} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>{t("showroom.timing")}</label>
                  <FormField
                      control={control}
                      name="timing"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="border-blue-900 border-2 text-blue-900 bg-white hover:bg-blue-900 hover:text-white">
                                  {hasActiveDays(field.value) ? "Update Garage Timing" : "Add Garage Timing"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle className="text-blue-900 font-bold">Showroom Timing</DialogTitle>
                                </DialogHeader>

                                {/* ✅ Use it here */}
                                <AvailabilityEditor
                                  availability={
                                    typeof field.value === "string"
                                      ? safeParseJSON(field.value)
                                      : field.value || {}
                                  }
                                  onChange={(newAvailability) =>
                                    field.onChange(JSON.stringify(newAvailability))
                                  }
                                />

                              </DialogContent>
                            </Dialog>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                <div>
                  <label className="inline-flex items-center space-x-2">
                    <Controller
                      name="isMainBranch"
                      control={control}
                      render={({ field }) => (
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <span>{t("showroom.isMainBranch")}</span>
                  </label>
                </div>
              </div>

              {/* Images section */}
              <div>
                <label>{t("showroom.logo")} & {t("showroom.images")}</label>
                <div className="grid grid-cols-4">
                  <ImageUpload
                  currentImage={logo}
                  onUploadComplete={handleLogoUpload}
                />
                </div>
                
                <MultiImageUpload
                  currentImages={images || []}
                  onUploadComplete={handleImagesUpload}
                />
              </div>

              <Button type="submit" disabled={upsertMutation.isLoading}>
                {upsertMutation.isLoading ? t("common.saving") : t("common.save")}
              </Button>
            </form>


            </FormProvider>
            
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}