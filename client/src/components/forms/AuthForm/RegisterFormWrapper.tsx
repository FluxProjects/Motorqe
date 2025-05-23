import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema, RegisterFormValues } from "./AuthSchemas";
import { RegisterForm } from "./RegisterForm";
import { FormProvider } from "react-hook-form";
import { handleApiError } from "@/lib/utils";

interface RegisterFormWrapperProps {
  onSubmit: (values: RegisterFormValues, form: UseFormReturn<RegisterFormValues>) => Promise<void>;
  isSubmitting: boolean;
}

export const RegisterFormWrapper = ({
  onSubmit,
  isSubmitting,
}: RegisterFormWrapperProps) => {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "BUYER",
      roleId: 1,
      termsAgreement: true,
    },
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      await onSubmit(values, form);
    } catch (error) {
      handleApiError(error, form);
    }
  };

  return (
    <FormProvider {...form}>
      <RegisterForm
        form={form}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </FormProvider>
  );
};
