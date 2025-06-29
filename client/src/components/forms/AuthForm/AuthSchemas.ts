import { z } from "zod";
import { roleSchema } from "@shared/permissions";

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

export const registerFormSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z.string().min(3),
    email: z
      .string()
      .email()
      .transform((val) => val.toLowerCase()),
    businessName: z.string().optional(),
    tLicense: z.string().optional(),
    phone: z.string().regex(/^\+?[0-9\s\-]{7,15}$/, "Invalid phone number").min(3),
    password: z
      .string()
      .min(6)
      .regex(/[a-zA-Z]/, "Must contain letters"),
    confirmPassword: z.string().min(6),
    role: roleSchema,
    roleId: z.number().int(),
    termsAgreement: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordStep1Schema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .transform((val) => val.toLowerCase().trim()),
});

// Step 2: Verify OTP
export const forgotPasswordStep2Schema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be exactly 6 digits")
    .max(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

// Step 3: Reset Password
export const forgotPasswordStep3Schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type ForgotPasswordStep1Values = z.infer<typeof forgotPasswordStep1Schema>;
export type ForgotPasswordStep2Values = z.infer<typeof forgotPasswordStep2Schema>;
export type ForgotPasswordStep3Values = z.infer<typeof forgotPasswordStep3Schema>;