import { UseFormReturn } from "react-hook-form";
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
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  form: UseFormReturn<LoginFormValues>;
  onSubmit: (values: LoginFormValues) => Promise<void>;
  isSubmitting: boolean;
  switchView: (view: "login" | "register" | "forget-password") => void;
}

export const LoginForm = ({
  form,
  onSubmit,
  isSubmitting,
  switchView,
}: LoginFormProps) => {
  const { t } = useTranslation();

  const handleFormSubmit = async (values: LoginFormValues) => {
    try {
      await onSubmit(values);
    } catch (err: any) {
      // In case you still want to catch at the child level:
      form.setError("root", {
        type: "server",
        message: err?.response?.data?.message ?? "Login failed",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.email")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@youremail.com"
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

              {/* Remember Me and Forgot Password Row */}
              <div className="flex items-center justify-between mt-2">
                {/* Remember Me */}
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 m-0 p-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="form-checkbox text-primary"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal text-muted-foreground m-0">
                        {t("auth.rememberMe", "Remember Me")}
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {/* Forgot Password */}
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-primary hover:text-primary/90 p-0 h-auto"
                  onClick={() => switchView("forget-password")}
                >
                  {t("auth.forgotPassword")}
                </Button>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="pt-10 flex justify-left">
          <Button
            type="submit"
            className="w-60 py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-blue-900 transition-colors"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? t("common.loading") : t("auth.login")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
