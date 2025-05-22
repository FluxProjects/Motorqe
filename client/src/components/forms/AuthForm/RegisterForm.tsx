import { UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { roleSchema } from "@shared/permissions";

const registerFormSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z.string().min(3),
    email: z.string().email().transform((val) => val.toLowerCase()),
    password: z.string().min(6).regex(/[a-zA-Z]/, "Must contain letters"),
    confirmPassword: z.string().min(6),
    role: roleSchema,
    roleId: z.number().int(),
    termsAgreement: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

interface RegisterFormProps {
  form: UseFormReturn<RegisterFormValues>;  // ← receive the parent’s form
  onSubmit: (values: RegisterFormValues) => Promise<void>;
  isSubmitting: boolean;
}



export const RegisterForm = ({ form, onSubmit, isSubmitting }: RegisterFormProps) => {
  const { t } = useTranslation();

  const handleFormSubmit = async (values: RegisterFormValues) => {
    try {
      await onSubmit(values);
    } catch (err: any) {
      // In case you still want to catch at the child level:
      form.setError("root", {
        type: "server",
        message: err?.response?.data?.message ?? "Registration failed",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form?.handleSubmit(handleFormSubmit)} className="space-y-4">
        <Controller
          name="role"
          control={form?.control}
          defaultValue="SELLER"
          render={({ field }) => (
            <div role="radiogroup" className="gap-2 flex space-x-4">
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="seller"
                  {...field}
                  checked={field.value === "SELLER"}
                  onChange={() => field.onChange("SELLER")}
                />
                <Label htmlFor="seller">Private Seller</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="dealer"
                  {...field}
                  checked={field.value === "DEALER"}
                  onChange={() => field.onChange("DEALER")}
                />
                <Label htmlFor="dealer">DEALER</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="GARAGE"
                  {...field}
                  checked={field.value === "GARAGE"}
                  onChange={() => field.onChange("GARAGE")}
                />
                <Label htmlFor="garage">GARAGE</Label>
              </div>
            </div>
          )}
        />

        <FormField
          control={form?.control}
          name="roleId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} type="hidden" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form?.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.firstName")}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form?.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.lastName")}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form?.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.username")}</FormLabel>
              <FormControl>
                <Input
                  className="placeholder-gray-400"
                  placeholder="johndoe"
                  type="text"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form?.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.email")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form?.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.password")}</FormLabel>
              <FormControl>
                <Input type="password" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form?.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.confirmPassword")}</FormLabel>
              <FormControl>
                <Input type="password" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form?.control}
          name="termsAgreement"
          render={({ field }) => (
            <FormItem className="mb-6">
              <div className="flex items-start space-x-2">
                <FormControl>
                  <Checkbox
                    id="termsAgreement"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <Label
                    htmlFor="termsAgreement"
                    className="text-sm text-neutral-600"
                  >
                    {t("auth.agreeToTerms")}
                  </Label>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {form?.formState?.errors.root && (
          <p className="text-red-500 text-sm">
            {form?.formState?.errors.root.message}
          </p>
        )}

        <Button
          type="submit"
        className="w-full py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-blue-900 transition-colors"
           disabled={isSubmitting || !form?.formState?.isValid}
        >
          {isSubmitting ? t("common.loading") : t("auth.createAccount")}
        </Button>
      </form>
    </Form>
  );
};