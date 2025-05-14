import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BaseProfileEditorProps {
  user: User;
  additionalFields?: React.ReactNode;
}

type FormFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notificationEmail: string;
  notificationPhone: string;
};

export function BaseProfileEditor({ user: initialUser, additionalFields }: BaseProfileEditorProps) {
  const { t } = useTranslation();
  const { user: authUser, setUser, setToken, setIsAuthenticated } = useAuth();
  const { toast } = useToast();
  const user = authUser || initialUser;

  if (!user) return null;

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      notificationEmail: user.notificationEmail || "",
      notificationPhone: user.notificationPhone || "",
    },
  });

  const fieldMapping: Record<keyof FormFields, string> = {
    firstName: "first_name",
    lastName: "last_name",
    email: "email",
    phone: "phone",
    notificationEmail: "notification_email",
    notificationPhone: "notification_phone",
  };

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Failed to update user");
      }
      const data = await res.json();
    
    // Store the new token if returned
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    
    return data;
    },

    onSuccess: (response) => {
      try {
        // Remove @ts-ignore by properly accessing the response
        const updatedUser = response.user || response;
        const newToken = response.token || localStorage.getItem("auth_token");
        setIsAuthenticated(true);
        setUser(updatedUser);        
        
        if (newToken) {
          setToken(newToken);
        }
        
        reset({
          firstName: updatedUser.first_name || "",
          lastName: updatedUser.last_name || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
          notificationEmail: updatedUser.notification_email || "",
          notificationPhone: updatedUser.notification_phone || "",
        });

        toast({
        title: t("profile.updateSuccess"),
        description: t("profile.updateSuccessDesc"),
      });
        } catch (e) {
    console.error("Auth refresh failed", e);
    // Handle error or redirect to login if needed
  }
    },

    onError: (error: any) => {
      console.error("User update failed:", error);
    },
  });

  const onSubmit = (data: FormFields) => {
    const mappedData: Record<string, string> = {};
    (Object.keys(data) as (keyof FormFields)[]).forEach((key) => {
      mappedData[fieldMapping[key]] = data[key];
    });
    mutation.mutate(mappedData);
  };

  

  const { isPending } = mutation;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("profile.firstName")}</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            placeholder={t("profile.firstNamePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t("profile.lastName")}</Label>
          <Input
            id="lastName"
            {...register("lastName")}
            placeholder={t("profile.lastNamePlaceholder")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("profile.email")}</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder={t("profile.emailPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("profile.phone")}</Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder={t("profile.phonePlaceholder")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="notificationEmail">{t("profile.notificationEmail")}</Label>
          <Input
            id="notificationEmail"
            type="email"
            {...register("notificationEmail")}
            placeholder={t("profile.notificationEmailPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notificationPhone">{t("profile.notificationPhone")}</Label>
          <Input
            id="notificationPhone"
            type="tel"
            {...register("notificationPhone")}
            placeholder={t("profile.notificationPhonePlaceholder")}
          />
        </div>
      </div>

      {additionalFields}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("profile.saveChanges")}
        </Button>
      </div>
    </form>
  );
}
