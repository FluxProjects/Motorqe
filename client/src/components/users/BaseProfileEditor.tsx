import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { User } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUpload from "@/components/ui/image-upload";

interface BaseProfileEditorProps {
  user: User;
  onSubmit: (values: any) => void;
  isLoading?: boolean;
  additionalFields?: React.ReactNode;
}

export function BaseProfileEditor({
  user,
  onSubmit,
  isLoading,
  additionalFields,
}: BaseProfileEditorProps) {
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notificationEmail: "",
      NotificationPhone: "",
      emailNotifications: false,
      smsNotifications: false,
      avatar: "",
    },
  });

  const { setValue } = form;
  const avatar = form.watch("avatar");


  console.log("user inside basic profile", user);


  const handleAvatarUpload = (url: string) => {
    setValue("avatar", url);
  };
  // Reset form when user data is available
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        notificationEmail: user.notification_email || user.email || "",
        NotificationPhone: user.notification_phone || false,
        emailNotifications: user.email_notifications || false,
        smsNotifications: user.sms_notifications || false,
        avatar: user.avatar || '',
      });
    }
  }, [user, form]);
  

  const toSnakeCase = (str: string) =>
  str.replace(/([A-Z])/g, (match, p1, offset) => (offset > 0 ? '_' : '') + p1.toLowerCase());


  const handleSubmit = (values: any) => {
  const snakeCasePayload: Record<string, any> = {};

  for (const key in values) {
    snakeCasePayload[toSnakeCase(key)] = values[key];
  }

  onSubmit(snakeCasePayload);
};



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Avatar Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="grid grid-cols-4">
            <ImageUpload
              currentImage={avatar}
              onUploadComplete={handleAvatarUpload}
            />
    
          </div>

        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("user.firstName")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder={t("user.firstNamePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("user.lastName")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder={t("user.lastNamePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("user.email")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    value={field.value || ""}
                    placeholder={t("user.emailPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("user.phone")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    value={field.value || ""}
                    placeholder={t("user.phonePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notification Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Notifications */}
          <FormField
            control={form.control}
            name="emailNotifications"
            render={({ field }) => (
              <div className="space-y-2">
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>{t("user.emailNotifications")}</FormLabel>
                </FormItem>
                {field.value && (
                  <FormField
                    control={form.control}
                    name="notificationEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("user.enterEmail")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
          />

          {/* SMS Notifications */}
          <FormField
            control={form.control}
            name="smsNotifications"
            render={({ field }) => (
              <div className="space-y-2">
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>{t("user.smsNotifications")}</FormLabel>
                </FormItem>
                {field.value && (
                  <FormField
                    control={form.control}
                    name="notificationPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("user.enterPhone")}</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+97412345678"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
          />
        </div>

        {additionalFields}

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline">
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("common.saving") : t("common.saveChanges")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
