import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, LoginFormValues } from "./AuthSchemas";
import { LoginForm } from "./LoginForm";
import { FormProvider } from "react-hook-form";
import { handleApiError } from "@/lib/utils";

interface LoginFormWrapperProps {
  onSubmit: (values: LoginFormValues, form: UseFormReturn<LoginFormValues>) => Promise<void>;
  isSubmitting: boolean;
  switchView: (view: "login" | "register" | "forget-password") => void;
}

export const LoginFormWrapper = ({
  onSubmit,
  isSubmitting,
  switchView,
}: LoginFormWrapperProps) => {
  const rememberEmail = localStorage.getItem("rememberedEmail");
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: rememberEmail || "",
      password: "",
      rememberMe: !!rememberEmail,
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await onSubmit(values, form);
    } catch (error) {
      handleApiError(error, form);
    }
  };

  return (
    <FormProvider {...form}>
      <LoginForm
        form={form}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        switchView={switchView}
      />
    </FormProvider>
  );
};