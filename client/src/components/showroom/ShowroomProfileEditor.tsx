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

type FormValues = {
  new_name: string;
  new_nameAr: string;
  new_address: string;
  new_addressAr: string;
  new_location: string;
  new_phone: string;
  new_isMainBranch: boolean;
};

export function ShowroomProfileEditor({ user }: { user: User }) {
  const { t } = useTranslation();
  const auth = useAuth();
console.log("inside showroom profile");
const roleId = user?.role_id;
  const { data: showrooms = [], isLoading, refetch } = useQuery<Showroom[]>({
  queryKey: ["user-showrooms", user.id],
  queryFn: () =>
    fetch(`/api/showrooms/user/${user.id}`).then((res) => res.json()),
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
          user_id: user.id,
          isMainBranch: newData.isMainBranch || false,
        }),
      }).then((res) => res.json()),
    onSuccess: () => refetch(),
  });

  const updateMutation = useMutation({
    mutationFn: (updated: Showroom) =>
      fetch(`/api/showrooms/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
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
        <BaseProfileEditor onSubmit={() => {}} user={user} />
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
                      isMainBranch: data.new_isMainBranch,
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
      address: showroom.address ?? "",
      addressAr: showroom.addressAr ?? "",
      location: showroom.location ?? "",
      phone: showroom.phone ?? "",
      isMainBranch: showroom.isMainBranch ?? false,
    },
  });

  const { handleSubmit, register, control } = methods;

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4 space-y-4">
        <form
          onSubmit={handleSubmit((data) => onUpdate({ ...showroom, ...data }))}
          className="grid gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>{t("showroom.name")} (English)</label>
              <Input {...register("name")} />
            </div>
            <div>
              <label>{t("showroom.name")} (Arabic)</label>
              <Input {...register("nameAr")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>{t("showroom.address")} (English)</label>
              <Input {...register("address")} />
            </div>
            <div>
              <label>{t("showroom.address")} (Arabic)</label>
              <Input {...register("addressAr")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>{t("showroom.location")}</label>
              <Input {...register("location")} />
            </div>
            <div>
              <label>{t("showroom.phone")}</label>
              <Input {...register("phone")} />
            </div>
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
  const { register, handleSubmit, control } = useForm<FormValues>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <h3 className="text-lg font-semibold">{t("showroom.addNew")}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>{t("showroom.name")} (English)</label>
          <Input {...register("new_name")} />
        </div>
        <div>
          <label>{t("showroom.name")} (Arabic)</label>
          <Input {...register("new_nameAr")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>{t("showroom.address")} (English)</label>
          <Input {...register("new_address")} />
        </div>
        <div>
          <label>{t("showroom.address")} (Arabic)</label>
          <Input {...register("new_addressAr")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>{t("showroom.location")}</label>
          <Input {...register("new_location")} />
        </div>
        <div>
          <label>{t("showroom.phone")}</label>
          <Input {...register("new_phone")} />
        </div>
      </div>

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

      <Button type="submit">{t("common.add")}</Button>
    </form>
  );
}
