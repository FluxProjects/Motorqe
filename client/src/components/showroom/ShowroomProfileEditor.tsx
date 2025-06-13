// ShowroomProfileEditor.tsx

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
  new_name: string;
  new_nameAr: string;
  new_description: string;
  new_descriptionAr: string;
  new_address: string;
  new_addressAr: string;
  new_location: string;
  new_phone: string;
  new_timing: string;
  new_isMainBranch: boolean;
  new_logo: string;
  new_images: string[];
};


export function ShowroomProfileEditor({ user }: { user: User }) {
  const { t } = useTranslation();
  const auth = useAuth();
console.log("inside showroom profile");
const roleId = user?.role_id;

 const isGarage = user?.roleId === 4;

const { data: showrooms = [], isLoading, refetch } = useQuery<Showroom[]>({
  queryKey: [isGarage ? "user-garages" : "user-showrooms", user.id],
  queryFn: () =>
    fetch(`/api/${isGarage ? "garages" : "showrooms"}/user/${user.id}`).then((res) =>
      res.json()
    ),
  enabled: !!user?.id,
});



  const addFormMethods = useForm<FormValues>();
  const { reset } = addFormMethods;

  const addMutation = useMutation({
  mutationFn: (newData: Partial<Showroom>) =>
    fetch("/api/showrooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newData,
        userId: user.id,
        isMainBranch: newData.isMainBranch || false,
        isGarage: isGarage, // Garage role
        images: newData.images || [],
        createdAt: new Date(), // ✅ Returns current date-time
      }),
    }).then((res) => res.json()),
  onSuccess: () => refetch(),
  onError: (error) => {
    console.error("Error adding showroom:", error);
    // Show error to user
  }
});


  const updateMutation = useMutation({
  mutationFn: (updated: Showroom) =>
    fetch(`/api/showrooms/${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...updated,
        isGarage: isGarage,
      }),
    }),
  onSuccess: () => refetch(),
});


  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/showrooms/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => refetch(),
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
    refetch(); // refetch user data
  },
  });

  


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
        <BaseProfileEditor onSubmit={(data) => {
            updateUserMutation.mutate(data);
          }}
          user={user} 
        />
      </TabsContent>

      <TabsContent value="password">
        <PasswordChangeForm userId={user.id} />
      </TabsContent>

      <TabsContent value="showroom">
        <div className="space-y-6">
          {showrooms.map((showroom) => (
            <ShowroomEditCard
              key={showroom.id}
              showroom={showroom}
              onUpdate={updateMutation.mutate}
              onDelete={deleteMutation.mutate}
            />
          ))}

          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-4">
              <FormProvider {...addFormMethods}>
                <ShowroomAddForm
                  onSubmit={(data) =>
                    addMutation.mutate({
                      name: data.new_name,
                      nameAr: data.new_nameAr,
                      address: data.new_address,
                      addressAr: data.new_addressAr,
                      location: data.new_location,
                      phone: data.new_phone,
                      logo: data.new_logo,
                      timing: data.new_timing,
                      description: data.new_description,
                      descriptionAr: data.new_descriptionAr,
                      isMainBranch: data.new_isMainBranch,
                      images: data.new_images,
                    })
                  }
                />
              </FormProvider>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      
    </Tabs>
  );
}

function ShowroomEditCard({
  showroom,
  onUpdate,
  onDelete,
}: {
  showroom: Showroom;
  onUpdate: (data: Showroom) => void;
  onDelete: (id: number) => void;
}) {
  const { t } = useTranslation();
  const methods = useForm({
    defaultValues: {
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
    },
  });

  const { handleSubmit, register, control, setValue, watch } = methods;
  const images = watch("images");

  const handleImagesUpload = (newImages: string[]) => {
    setValue("images", newImages);
  };

  const handleLogoUpload = (url: string) => {
    setValue("logo", url);
  };

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4 space-y-4">
        <form
          onSubmit={handleSubmit((data) => onUpdate({ ...showroom, ...data, images: data.images || [] }))}
          className="grid gap-4"
        >

          {/* Logo Upload */}
          <div>
            <label>{t("showroom.logo")}</label>
            <ImageUpload
              currentImage={watch("logo")}
              onUploadComplete={handleLogoUpload}
            />
          </div>
          
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

          <div className="grid grid-cols-2 gap-4">
            <div><label>{t("showroom.location")}</label><Input {...register("location")} /></div>
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

          

          

          {/* images section */}
          <div>
            <label>{t("showroom.images")}</label>
            <MultiImageUpload
              currentImages={images || []}
              onUploadComplete={handleImagesUpload}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">{t("common.update")}</Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(showroom.id)}
            >
              {t("common.delete")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ShowroomAddForm({
  onSubmit,
}: {
  onSubmit: (data: FormValues) => void;
}) {
  const { t } = useTranslation();
  const { register, handleSubmit, control, setValue } = useForm<FormValues>();
  const [logo, setLogo] = useState("");
  const [images, setImages] = useState<string[]>([]);

   const handleLogoUpload = (url: string) => {
    setLogo(url);
    setValue("new_logo", url);
  };

  const handleImagesUpload = (newImages: string[]) => {
    setImages(newImages);
    setValue("new_images", newImages);
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, new_logo: logo, new_images: images }))} className="grid gap-4">
      <h3 className="text-lg font-semibold">{t("showroom.addNew")}</h3>

      {/* Logo Upload */}
      <div>
        <label>{t("showroom.logo")}</label>
        <ImageUpload
          currentImage={logo}
          onUploadComplete={handleLogoUpload}
        />
      </div>

       <div className="grid grid-cols-2 gap-4">
        <div><label>{t("showroom.name")} (EN)</label><Input {...register("new_name")} /></div>
        <div><label>{t("showroom.name")} (AR)</label><Input {...register("new_nameAr")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label>{t("showroom.description")} (EN)</label><Input {...register("new_description")} /></div>
        <div><label>{t("showroom.descriptionAr")} (AR)</label><Input {...register("new_descriptionAr")} /></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><label>{t("showroom.address")} (EN)</label><Input {...register("new_address")} /></div>
        <div><label>{t("showroom.address")} (AR)</label><Input {...register("new_addressAr")} /></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><label>{t("showroom.location")}</label><Input {...register("new_location")} /></div>
        <div><label>{t("showroom.phone")}</label><Input {...register("new_phone")} /></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        
        <div><label>{t("showroom.timing")}</label><Input {...register("new_timing")} /></div>
         <div>
        <label className="inline-flex items-center space-x-2">
          <Controller
            name="new_isMainBranch"
            control={control}
            render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <span>{t("showroom.isMainBranch")}</span>
        </label>
      </div>
      </div>

      

     

      {/* images section */}
      <div>
        <label>{t("showroom.images")}</label>
        <MultiImageUpload
          currentImages={images}
          onUploadComplete={handleImagesUpload}
        />
      </div>


      <Button type="submit">{t("common.add")}</Button>
    </form>
  );
}
