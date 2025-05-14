import { useForm } from "react-hook-form";
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
import { useTranslation } from "react-i18next";

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  isSubmitting: boolean;
  switchView: (view: "login" | "register" | "forget-password") => void;
}

export const LoginForm = ({ onSubmit, isSubmitting, switchView }: LoginFormProps) => {
  const { t } = useTranslation();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.password")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="flex justify-end mt-1">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-primary hover:text-primary/90 p-0 h-auto"
                  onClick={() => switchView("forgot-password")}
                >
                  {t("auth.forgotPassword")}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
          disabled={isSubmitting || !form.formState.isValid}
        >
          {isSubmitting ? t("common.loading") : t("auth.login")}
        </Button>
      </form>
    </Form>
  );
};