// components/users/BaseProfileEditor.tsx
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@shared/schema";

interface BaseProfileEditorProps {
  user: User;
  onSubmit: (values: any) => void;
  isLoading?: boolean;
  additionalFields?: React.ReactNode;
}

export function BaseProfileEditor({ user, onSubmit, isLoading, additionalFields }: BaseProfileEditorProps) {
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      notificationEmail: user.notificationEmail || '',
      notificationPhone: user.notificationPhone || '',
      avatar: user.avatar || '',
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={form.watch('avatar')} />
            <AvatarFallback>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem className="w-full max-w-xs">
                <FormLabel>{t('user.avatarUrl')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://example.com/avatar.jpg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('user.firstName')}</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>{t('user.lastName')}</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>{t('user.email')}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
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
                <FormLabel>{t('user.phone')}</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {additionalFields}

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline">
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('common.saving') : t('common.saveChanges')}
          </Button>
        </div>
      </form>
    </Form>
  );
}