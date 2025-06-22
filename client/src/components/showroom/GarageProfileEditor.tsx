// GarageProfileEditor.tsx

import { useQuery, useMutation } from "@tanstack/react-query";
import { BaseProfileEditor } from "../users/BaseProfileEditor";
import { PasswordChangeForm } from "../users/PasswordChangeForm";
import { Controller, useForm, FormProvider } from "react-hook-form";
import { Showroom, User } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import MultiImageUpload from "../ui/multi-image-upload";
import ImageUpload from "../ui/image-upload";

type FormValues = {
  name: string;
  nameAr: string;
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

export function GarageProfileEditor({ user }: { user: User }) {
  const { t } = useTranslation();
  const auth = useAuth();
  const roleId = user?.role_id;
  const isGarage = user?.roleId === 4;

  const { data: showrooms = [], isLoading, refetch } = useQuery<Showroom[]>({
    queryKey: ["user-garages", user.id],
    queryFn: () =>
      fetch(`/api/garages/user/${user.id}`).then((res) =>
        res.json()
      ),
    enabled: !!user?.id,
  });

  const methods = useForm<FormValues>({
    defaultValues: {
      name: "",
      nameAr: "",
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

  // Set form values when showroom data is loaded or changes
  useEffect(() => {
    if (showrooms.length > 0) {
      const showroom = showrooms[0]; // Only work with the first showroom/garage
      methods.reset({
        name: showroom.name ?? "",
        nameAr: showroom.nameAr ?? "",
        description: showroom.description ?? "",
        descriptionAr: showroom.descriptionAr ?? "",
        address: showroom.address ?? "",
        addressAr: showroom.addressAr ?? "",
        location: showroom.location ?? "",
        phone: showroom.phone ?? "",
        timing: showroom.timing ?? "",
        isMainBranch: showroom.isMainBranch ?? false,
        logo: showroom.logo ?? "",
        images: showroom.images ?? [],
      });
    } else {
      methods.reset({
        name: "",
        nameAr: "",
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
      const res = await fetch(`/api/garages/${showrooms[0].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update garage");
      return res.json();
    } else {
      // Create new showroom/garage
      const res = await fetch(`/api/garages`, {
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
  },
  onError: (error) => {
    console.error("Error upserting showroom/garage:", error);
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
                <div><label>{t("showroom.location")}</label><Input {...register("location")} /></div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div><label>{t("showroom.phone")}</label><Input {...register("phone")} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label>{t("showroom.timing")}</label><Input {...register("timing")} /></div>
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
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}