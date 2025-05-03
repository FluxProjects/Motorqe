// components/seller/SellerProfileEditor.tsx
import { BaseProfileEditor } from "../users/BaseProfileEditor";
import { PasswordChangeForm } from "../users/PasswordChangeForm";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

export function SellerProfileEditor({ user }: { user: User }) {
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
      // Handle success
    }
  });

  if (!user) return null;

  return (
    <Tabs defaultValue="profile" className="w-full">
    <TabsList className="grid grid-cols-3 w-[600px] mb-6">
      <TabsTrigger value="profile">{t('profile.profileInfo')}</TabsTrigger>
      <TabsTrigger value="seller">{t('seller.businessInfo')}</TabsTrigger>
      <TabsTrigger value="password">{t('profile.password')}</TabsTrigger>
    </TabsList>

    <TabsContent value="profile">
      <BaseProfileEditor 
      onSubmit={mutation.mutate}
      user={user} />
    </TabsContent>

    <TabsContent value="seller">
      <div className="space-y-6">
        <FormField
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('seller.businessName')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          name="businessDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('seller.businessDescription')}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
            </FormItem>
          )}
        />
        
        {/* Tax ID, business license, etc. */}
      </div>
    </TabsContent>

    <TabsContent value="password">
      <PasswordChangeForm userId={user.id} />
    </TabsContent>
  </Tabs>
  );
}