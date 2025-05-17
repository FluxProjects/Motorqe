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
import { useState } from "react";

// Step 1: Request OTP
const forgotPasswordStep1Schema = z.object({
  email: z.string().email(),
});

// Step 2: Verify OTP
const forgotPasswordStep2Schema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6),
});

// Step 3: Reset Password
const forgotPasswordStep3Schema = z
  .object({
    newPassword: z.string().min(6).regex(/[a-zA-Z]/, "Must contain letters"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ForgotPasswordStep1Values = z.infer<typeof forgotPasswordStep1Schema>;
type ForgotPasswordStep2Values = z.infer<typeof forgotPasswordStep2Schema>;
type ForgotPasswordStep3Values = z.infer<typeof forgotPasswordStep3Schema>;

interface ForgotPasswordFormProps {
  onSubmitRequestOTP: (values: ForgotPasswordStep1Values) => Promise<void>;
  onSubmitVerifyOTP: (values: ForgotPasswordStep2Values) => Promise<void>;
  onSubmitResetPassword: (values: ForgotPasswordStep3Values) => Promise<void>;
  isSubmitting: boolean;
  currentStep: number;
  email: string;
  onResendOTP: () => Promise<void>;
}

export const ForgotPasswordForm = ({
  onSubmitRequestOTP,
  onSubmitVerifyOTP,
  onSubmitResetPassword,
  isSubmitting,
  currentStep,
  email,
  onResendOTP,
}: ForgotPasswordFormProps) => {
  const { t } = useTranslation();

  const step1Form = useForm<ForgotPasswordStep1Values>({
    resolver: zodResolver(forgotPasswordStep1Schema),
    defaultValues: {
      email: "",
    },
  });

  const step2Form = useForm<ForgotPasswordStep2Values>({
    resolver: zodResolver(forgotPasswordStep2Schema),
    defaultValues: {
      otp: "",
    },
  });

  const step3Form = useForm<ForgotPasswordStep3Values>({
    resolver: zodResolver(forgotPasswordStep3Schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  return (
    <div className="space-y-4">
      {currentStep === 1 && (
        <Form {...step1Form}>
          <form
            onSubmit={step1Form.handleSubmit(onSubmitRequestOTP)}
            className="space-y-4"
          >
            <FormField
              control={step1Form.control}
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

            <Button
              type="submit"
         className="w-full py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-blue-900 transition-colors"
               disabled={isSubmitting || !step1Form.formState.isValid}
            >
              {isSubmitting ? t("common.loading") : t("auth.sendOTP")}
            </Button>
          </form>
        </Form>
      )}

      {currentStep === 2 && (
        <Form {...step2Form}>
          <form
            onSubmit={step2Form.handleSubmit(onSubmitVerifyOTP)}
            className="space-y-4"
          >
            <p className="text-sm text-neutral-600">
              {t("auth.otpSentTo")} {email}
            </p>

            <FormField
              control={step2Form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.enterOTP")}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="123456"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between">
              <Button
                type="button"
                variant="link"
              className="w-full py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-blue-900 transition-colors"
            onClick={onResendOTP}
                disabled={isSubmitting}
              >
                {t("auth.resendOTP")}
              </Button>

              <Button
                type="submit"
            className="w-full py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-blue-900 transition-colors"
              disabled={isSubmitting || !step2Form.formState.isValid}
              >
                {isSubmitting ? t("common.loading") : t("auth.verifyOTP")}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {currentStep === 3 && (
        <Form {...step3Form}>
          <form
            onSubmit={step3Form.handleSubmit(onSubmitResetPassword)}
            className="space-y-4"
          >
            <FormField
              control={step3Form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.newPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={step3Form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.confirmNewPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
           className="w-full py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-blue-900 transition-colors"
            disabled={isSubmitting || !step3Form.formState.isValid}
            >
              {isSubmitting ? t("common.loading") : t("auth.resetPassword")}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};