// components/buyer/BuyerProfileEditor.tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { BaseProfileEditor } from "../users/BaseProfileEditor";
import { PasswordChangeForm } from "../users/PasswordChangeForm";
import { User } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function BuyerProfileEditor({ user }: { user: User }) {
  const { t } = useTranslation();
  const auth = useAuth();

  const mutation = useMutation({
    mutationFn: (values: any) => 
      fetch(`/api/users/${auth.user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      }),
    onSuccess: () => {
      // Handle success (e.g., show toast, update auth context)
    }
  });

  if (!user) return null;

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-2 w-[400px] mb-6">
        <TabsTrigger value="profile">{t('profile.profileInfo')}</TabsTrigger>
        <TabsTrigger value="password">{t('profile.password')}</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <BaseProfileEditor 
          onSubmit={mutation.mutate}
          user={user}
          additionalFields={
            <>
              {/* Buyer-specific fields */}
              <FormField
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('buyer.preferences')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('buyer.preferencesPlaceholder')} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          }
        />
      </TabsContent>

      <TabsContent value="password">
        <PasswordChangeForm userId={user.id} />
      </TabsContent>
    </Tabs>
  );
}