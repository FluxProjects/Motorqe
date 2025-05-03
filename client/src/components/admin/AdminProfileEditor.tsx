import { BaseProfileEditor } from "../users/BaseProfileEditor";
import { PasswordChangeForm } from "../users/PasswordChangeForm";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { FormControl } from "@/components/ui/form";

export function AdminProfileEditor({ user }: { user: User }) {
  const { t } = useTranslation();
  const auth = useAuth();

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => fetch('/api/roles').then(res => res.json())
  });

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

  if (!user || !roles) return null;

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-2 w-[400px] mb-6">
        <TabsTrigger value="profile">{t('profile.profileInfo')}</TabsTrigger>
        <TabsTrigger value="password">{t('profile.password')}</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">


    <BaseProfileEditor
      user={user}
      onSubmit={mutation.mutate}
      isLoading={mutation.isPending}
      additionalFields={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manually wrapping Select in a label */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {t('user.role')}
            </label>
            <Select
              onValueChange={(value) => {
                // Update form or handle the role change
                mutation.mutate({ ...user, roleId: value }); // Example of updating user role
              }}
              defaultValue={user.roleId?.toString()}
            >
              <FormControl>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder={t('user.selectRole')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {/* Option for selecting all roles */}
                <SelectItem value="all">{t('common.allRoles')}</SelectItem>
                {/* Dynamically render roles */}
                {Array.isArray(roles) &&
                  roles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <label className="block text-sm font-medium mb-1">
              {t('user.permissions')}
            </label>
          <Input
            placeholder={t('user.permissionsPlaceholder')}
            disabled
          />
        </div>
      }
    />
    </TabsContent>

<TabsContent value="password">
  <PasswordChangeForm userId={user.id} />
</TabsContent>
</Tabs>
  );
}
