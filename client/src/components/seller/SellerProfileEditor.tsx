// components/seller/SellerProfileEditor.tsx
import { BaseProfileEditor } from "../users/BaseProfileEditor";
import { PasswordChangeForm } from "../users/PasswordChangeForm";
import { useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

export function SellerProfileEditor({ user }: { user: User }) {
  const { t } = useTranslation();
  const auth = useAuth();
console.log("inside seller profile");
  const mutation = useMutation({
    mutationFn: (values: any) => 
      fetch(`/api/users/${auth.user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      }),
    onSuccess: () => {
      // Handle success
    }
  });

  if (!user) return null;

  return (
    <Tabs defaultValue="profile" className="w-full">
    <TabsList className="grid grid-cols-2 w-[600px] mb-6">
      <TabsTrigger value="profile">{t('profile.profileInfo')}</TabsTrigger>
      <TabsTrigger value="password">{t('profile.password')}</TabsTrigger>
    </TabsList>

    <TabsContent value="profile">
      <BaseProfileEditor 
      onSubmit={mutation.mutate}
      user={user} />
    </TabsContent>

    

    <TabsContent value="password">
      <PasswordChangeForm userId={user.id} />
    </TabsContent>
  </Tabs>
  );
}