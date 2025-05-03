import { useQuery, useMutation } from "@tanstack/react-query";
import { BaseProfileEditor } from "../users/BaseProfileEditor";
import { PasswordChangeForm } from "../users/PasswordChangeForm";
import { useForm } from "react-hook-form";
import { Showroom, User } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export function ShowroomProfileEditor({ user }: { user: User }) {
  const { t } = useTranslation();
  const auth = useAuth();

  const { data: showroom, isLoading } = useQuery<Showroom>({
    queryKey: ['showroom-profile', auth.user?.id],
    queryFn: () => fetch(`/api/showrooms/user/${auth.user?.id}`).then(res => res.json())
  });

  const { register, handleSubmit, formState, setValue } = useForm({
    defaultValues: showroom
  });

  const mutation = useMutation({
    mutationFn: (data: Showroom) => 
      fetch(`/api/showrooms/${showroom?.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  });

  if (isLoading) return <div>Loading...</div>;

  // Handle logo upload
  const handleLogoUpload = (url: string) => {
    setValue("logo", url);  // Update the form value to the new logo URL
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-3 w-[600px] mb-6">
        <TabsTrigger value="profile">{t('profile.profileInfo')}</TabsTrigger>
        <TabsTrigger value="showroom">{t('showroom.showroomInfo')}</TabsTrigger>
        <TabsTrigger value="password">{t('profile.password')}</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <BaseProfileEditor 
        onSubmit={mutation.mutate}
        user={user} />
      </TabsContent>

      <TabsContent value="showroom">
        <div className="space-y-6">

        {/* Logo Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {t('showroom.logo')}
          </label>

          {/* Display current logo if available */}
          {showroom?.logo && (
            <div className="mb-4">
              <img src={showroom.logo} alt="Showroom Logo" className="w-32 h-32 object-cover" />
            </div>
          )}

          <AvatarImage 
            value={showroom?.logo} 
            onChange={handleLogoUpload} // Pass the uploaded logo URL to handleLogoUpload
          />

          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("file", file);

              // Upload the image to your server
              const res = await fetch("/api/uploads", {
                method: "POST",
                body: formData,
              });

              const { url } = await res.json();
              setValue("logo", url); // Update the logo field in form state
            }}
          />

          {/* Display the new logo after uploading */}
          {showroom?.logo && (
            <img
              src={showroom.logo}
              alt="Logo"
              className="mt-2 w-24 h-24 object-cover rounded"
            />
          )}
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('showroom.name')}</label>
          <Input {...register('name')} />
        </div>

        {/* Name in Arabic */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('showroom.nameAr')}</label>
          <Input {...register('nameAr')} />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('showroom.phone')}</label>
          <Input {...register('phone')} />
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('showroom.address')}</label>
          <Input {...register('address')} />
        </div>

        {/* Address in Arabic */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('showroom.addressAr')}</label>
          <Input {...register('addressAr')} />
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('showroom.location')}</label>
          <Input {...register('location')} />
        </div>

        {/* Is Main Branch */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('showroom.isMainBranch')}</label>
          <input type="checkbox" {...register('isMainBranch')} />
        </div>

        {/* Parent Showroom ID */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('showroom.parentId')}</label>
          <Input type="number" {...register('parentId')} />
        </div>

        </div>
      </TabsContent>

      <TabsContent value="password">
        <PasswordChangeForm userId={user.id} />
      </TabsContent>
    </Tabs>
  );
}
