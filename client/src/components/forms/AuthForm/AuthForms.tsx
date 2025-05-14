import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { roleMapping, roleSchema } from "@shared/permissions";
import { AuthHeader } from "./AuthHeader";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgetPasswordForm";
import { AuthFooter } from "./AuthFooter";

interface AuthFormsProps {
  initialView: "login" | "register" | "forget-password";
  onClose: () => void;
  onSwitchView: (view: "login" | "register" | "forget-password") => void;
}

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerFormSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z
      .string()
      .min(3),
    email: z
      .string()
      .email()
      .transform((val) => val.toLowerCase()),
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

  // Step 1: Request OTP (Email submission)
export const forgotPasswordStep1Schema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .transform(val => val.toLowerCase().trim()),
});

// Step 2: Verify OTP
export const forgotPasswordStep2Schema = z.object({
  otp: z.string()
    .min(6, "OTP must be exactly 6 digits")
    .max(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

// Step 3: Reset Password
export const forgotPasswordStep3Schema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginFormSchema>;
type RegisterFormValues = z.infer<typeof registerFormSchema>;
type ForgotPasswordStep1Values = z.infer<typeof forgotPasswordStep1Schema>;
type ForgotPasswordStep2Values = z.infer<typeof forgotPasswordStep2Schema>;
type ForgotPasswordStep3Values = z.infer<typeof forgotPasswordStep3Schema>;

export const AuthForms = ({
  initialView,
  onClose,
  onSwitchView,
}: AuthFormsProps) => {
  const navigate = useNavigate();
  const setUser = useAuth((state) => state.setUser);
  const [view, setView] = useState<"login" | "register" | "forget-password">(initialView);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [emailForPasswordReset, setEmailForPasswordReset] = useState("");
  const [otpToken, setOtpToken] = useState("");

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "BUYER", // or 'seller' or 'showroom' based on your default
      roleId: 1,
      termsAgreement: true,
    },
  });

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

  const handleApiError = (
  error: unknown,
  form: typeof loginForm | typeof registerForm | typeof step1Form | typeof step2Form | typeof step3Form
) => {
  let message = "An unexpected error occurred. Please try again.";

  // Handle standard Error objects
  if (error instanceof Error) {
    message = error.message;
  }

  // Handle HTTP error responses
  if (error && typeof error === "object" && "response" in error) {
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
          errors?: Record<string, string[]>;
          validationErrors?: Record<string, string[]>;
        };
      };
    };

    // Check for different error response formats
    if (apiError.response?.data?.message) {
      message = apiError.response.data.message;
    } else if (apiError.response?.data?.error) {
      message = apiError.response.data.error;
    } else if (apiError.response?.data?.errors || apiError.response?.data?.validationErrors) {
      // Handle validation errors (could map to specific fields if needed)
      const errors = apiError.response.data.errors || apiError.response.data.validationErrors;
       if (errors && typeof errors === "object") {
    const errorMessages = Object.values(errors).flat();
    message = errorMessages.join(" ");
  }
      
      // Optionally map specific field errors if available
      if (errors && typeof errors === 'object') {
        Object.entries(errors).forEach(([field, messages]) => {
          if (field in form.control._fields) {
            form.setError(field as any, {
              type: 'manual',
              message: messages.join(' ')
            });
          }
        });
        return; // Skip setting root error if we set field errors
      }
    }
  } else if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    // Handle other error objects that might have a message property
    message = error.message;
  }

  form.setError("root", { type: "manual", message });
};

  const onLoginSubmit = async (values: LoginFormValues) => {
    console.log("🏁 Starting login submission process");
    setIsSubmitting(true);
    loginForm.clearErrors();
    // if (!loginForm.formState.isValid) {
    //   console.warn(
    //     "⛔ Submission blocked — form is invalid",
    //     registerForm.formState.errors
    //   );
    //   return;
    // }

    try {
      console.log("🔐 Attempting to login with credentials");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          response: {
            data: errorData,
          },
        };
      }

      const data = await response.json();
      console.log("🎉 Login successful");
      console.log("response", response);

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      


      console.log("data", data);
      console.log("data.user.roleId:", data.user.roleId);
      setUser(data.user); 

      // Adjusting redirection logic based on roleId
      const dashboardByRole = {
        BUYER: "/buyer-dashboard",
        SELLER: "/seller-dashboard",
        SHOWROOM_BASIC: "/showroom-dashboard",
        SHOWROOM_PREMIUM: "/showroom-dashboard",
        MODERATOR: "/admin",
        ADMIN: "/admin",
        SUPER_ADMIN: "/admin",
      } as const;
      
      type RoleKey = keyof typeof dashboardByRole; // 'BUYER' | 'SELLER' | 'ADMIN' | 'SHOWROOM'
      
      // Make sure user.roleId is cast correctly:
      const role = data.user?.roleId as RoleKey; // Or use a type guard
      
      const dashboardPath = dashboardByRole[role];
      navigate(dashboardPath);
      onClose();
    } catch (error) {
      console.error("🔥 Login error caught:", error);
      handleApiError(error, loginForm);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    console.log("🏁 Starting registration submission process");
    setIsSubmitting(true);
    registerForm.clearErrors();

    console.log("Values", values);
    // if (!registerForm.formState.isValid) {
    //   console.warn(
    //     "⛔ Submission blocked — form is invalid",
    //     registerForm.formState.errors
    //   );
    //   return;
    // }

    try {
      console.log("🔐 Attempting to register with credentials");

      // Ensure role is uppercase
      const uppercaseRole = values.role.toUpperCase(); // Convert role to uppercase

      const roleIdKey = Object.keys(roleMapping).find(
        (key) => roleMapping[parseInt(key)] === uppercaseRole
      );

      if (!roleIdKey) {
        throw new Error("Invalid role selected");
      }

      const roleId = parseInt(roleIdKey, 10);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          role: uppercaseRole, // Ensure the role is uppercase before passing
          roleId: roleId,
          termsAgreement: values.termsAgreement,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          response: {
            data: errorData,
          },
        };
      }

      const data = await response.json();
      console.log("🎉 Registration successful");
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      
setUser(data.user); 

      console.log("data.user.roleId:", data.user.roleId);

      console.log("🛣️ Determining navigation path based on role...");
      setIsSubmitting(false);
      if (data.user.roleId === 1) {
        console.log("👔 Navigating to buyer dashboard (roleId: 1)");
        navigate("/buyer-dashboard");
      } else if (data.user.roleId === 2) {
        console.log("🛒 Navigating to seller dashboard (roleId: 2)");
        navigate("/seller-dashboard");
      } else if (data.user.roleId === 3 || data.user.roleId === 4) {
        console.log("👑 Navigating to Showroom Dashboard (roleId: 3 or 4)");
        navigate("/showroom-dashboard");
      } else if ([5, 6, 7, 8].includes(data.user.roleId)) {
        console.log("👑 Navigating to admin dashboard (roleId: 7 or 8)");
        navigate("/admin");
      } else {
        console.log(
          "❓ Unknown role, navigating to home (roleId:",
          data.user.roleId,
          ")"
        );
        navigate("/");
      }

      onClose();
    } catch (error) {
      console.error("🔥 Registration error caught:", error);
      handleApiError(error, registerForm);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordRequestOTP = async (values: { email: string }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          response: {
            data: errorData,
          },
        };
      }

      const data = await response.json();
      setEmailForPasswordReset(values.email);
      setOtpToken(data.token); // Store the token for verification
      setForgotPasswordStep(2);
    } catch (error) {
      handleApiError(error, step2Form);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordVerifyOTP = async (values: { otp: string }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForPasswordReset,
          otp: values.otp,
          token: otpToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          response: {
            data: errorData,
          },
        };
      }

      const data = await response.json();
      setOtpToken(data.verificationToken); // Store new token for password reset
      setForgotPasswordStep(3);
    } catch (error) {
      handleApiError(error, step2Form);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordReset = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForPasswordReset,
          newPassword: values.newPassword,
          token: otpToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          response: {
            data: errorData,
          },
        };
      }

      // Password reset successful
      alert("Password has been reset successfully. Please login with your new password.");
      setView("login");
      setForgotPasswordStep(1);
      setEmailForPasswordReset("");
      setOtpToken("");
    } catch (error) {
      handleApiError(error, step3Form);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailForPasswordReset }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          response: {
            data: errorData,
          },
        };
      }

      const data = await response.json();
      setOtpToken(data.token);
      alert("New OTP has been sent to your email.");
    } catch (error) {
      handleApiError(error, step1Form);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchView = (newView: "login" | "register" | "forget-password") => {
    setIsSubmitting(false);
    console.log("isSubmitting:", isSubmitting);
    setView(newView);
    setForgotPasswordStep(1);
    setEmailForPasswordReset("");
    setOtpToken("");
    if (newView !== "forget-password") {
      onSwitchView(newView);
    }
  };

   return (
    <div className="p-6">
      <AuthHeader view={view} onClose={onClose} />
      
      {view === "login" ? (
        <LoginForm 
          onSubmit={onLoginSubmit} 
          isSubmitting={isSubmitting}
          switchView={switchView}
        />
      ) : view === "register" ? (
        <RegisterForm 
          onSubmit={onRegisterSubmit} 
          isSubmitting={isSubmitting}
        />
      ) : view === "forget-password" ? (
        <ForgotPasswordForm 
          onSubmitRequestOTP={handleForgotPasswordRequestOTP}
          onSubmitVerifyOTP={handleForgotPasswordVerifyOTP}
          onSubmitResetPassword={handleForgotPasswordReset}
          isSubmitting={isSubmitting}
          currentStep={forgotPasswordStep}
          email={emailForPasswordReset}
          onResendOTP={handleResendOTP}
        />
      ): null}

      <AuthFooter view={view} switchView={switchView} />
    </div>
  );

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-2xl font-bold text-neutral-900">
//           {view === "login" ? t("auth.login") : t("auth.createAccount")}
//         </h3>
//         <Button variant="ghost" size="icon" onClick={onClose}>
//           <X className="h-5 w-5" />
//         </Button>
//       </div>

//       {view === "login" ? (
//         <Form {...loginForm}>
//           <form
//             onSubmit={loginForm.handleSubmit(onLoginSubmit)}
//             className="space-y-4"
//           >
//             <FormField
//               control={loginForm.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>{t("auth.email")}</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="email"
//                       placeholder="your@email.com"
//                       {...field}
//                       disabled={isSubmitting}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={loginForm.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>{t("auth.password")}</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="password"
//                       placeholder="••••••••"
//                       {...field}
//                       disabled={isSubmitting}
//                     />
//                   </FormControl>
//                   <div className="flex justify-end mt-1">
//                     <a
//                       href="#"
//                       className="text-sm text-primary hover:text-primary/90"
//                     >
//                       {t("auth.forgotPassword")}
//                     </a>
//                   </div>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <Button
//               type="submit"
//               className="w-full py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
//               disabled={isSubmitting || !loginForm.formState.isValid}
//             >
//               {isSubmitting ? t("common.loading") : t("auth.login")}
//             </Button>
//           </form>
//         </Form>
//       ) : (
//         <Form {...registerForm}>
//           <form
//             onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
//             className="space-y-4"
//           >
//             <Controller
//               name="role" // Use the correct field name
//               control={registerForm.control} // Attach to your form control
//               defaultValue="BUYER" // Default value if nothing is selected
//               rules={{ required: "Please select a role" }} // Validation rule
//               render={({ field }) => (
//                 <div role="radiogroup" className="gap-2 flex space-x-4">
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="radio"
//                       id="buyer"
//                       {...field} // Connects to react-hook-form
//                       checked={field.value === "BUYER"}
//                       onChange={() => field.onChange("BUYER")}
//                     />
//                     <label htmlFor="buyer">Buyer</label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="radio"
//                       id="seller"
//                       {...field} // Connects to react-hook-form
//                       checked={field.value === "SELLER"}
//                       onChange={() => field.onChange("SELLER")}
//                     />
//                     <label htmlFor="seller">Seller</label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="radio"
//                       id="showroom"
//                       {...field} // Connects to react-hook-form
//                       checked={field.value === "SHOWROOM_BASIC"}
//                       onChange={() => field.onChange("SHOWROOM_BASIC")}
//                     />
//                     <label htmlFor="showroom">Showroom</label>
//                   </div>
//                 </div>
//               )}
//             />
//             {/* <FormField
//               control={registerForm.control}
//               name="role"
//               render={({ field }) => (
//                 <FormItem className="mb-6">
//                   <FormLabel>{t('auth.registerAs')}</FormLabel>
//                   <FormControl>
//                     <RadioGroup
//                       onValueChange={field.onChange}
//                       value={field.value || "SELLER"}
//                       defaultValue="SELLER"
//                       className="flex space-x-4"
                      
                      
//                     >
//                       <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="BUYER" id="buyer" />
//                         <Label htmlFor="buyer">{t('auth.buyer')}</Label>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="SELLER" id="seller" />
//                         <Label htmlFor="seller">{t('auth.seller')}</Label>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="SHOWROOM_BASIC" id="showroom" />
//                         <Label htmlFor="showroom">{t('auth.showroom')}</Label>
//                       </div>
//                     </RadioGroup>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             /> */}

//             <FormField
//               control={registerForm.control}
//               name="roleId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormControl>
//                     <Input {...field} type="hidden" />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-2 gap-4">
//               <FormField
//                 control={registerForm.control}
//                 name="firstName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>{t("auth.firstName")}</FormLabel>
//                     <FormControl>
//                       <Input {...field} disabled={isSubmitting} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={registerForm.control}
//                 name="lastName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>{t("auth.lastName")}</FormLabel>
//                     <FormControl>
//                       <Input {...field} disabled={isSubmitting} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <FormField
//               control={registerForm.control}
//               name="username"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>{t("auth.username")}</FormLabel>
//                   <FormControl>
//                     <Input
//                       className="placeholder-gray-400"
//                       placeholder="johndoe"
//                       type="text"
//                       {...field}
//                       disabled={isSubmitting} // only disable if the form is submitting and the field is empty
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={registerForm.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>{t("auth.email")}</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="email"
//                       placeholder="your@email.com"
//                       {...field}
//                       disabled={isSubmitting}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={registerForm.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>{t("auth.password")}</FormLabel>
//                   <FormControl>
//                     <Input type="password" {...field} disabled={isSubmitting} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={registerForm.control}
//               name="confirmPassword"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>{t("auth.confirmPassword")}</FormLabel>
//                   <FormControl>
//                     <Input type="password" {...field} disabled={isSubmitting} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={registerForm.control}
//               name="termsAgreement"
//               render={({ field }) => (
//                 <FormItem className="mb-6">
//                   <div className="flex items-start space-x-2">
//                     <FormControl>
//                       <Checkbox
//                         id="termsAgreement"
//                         checked={field.value}
//                         onCheckedChange={field.onChange}
//                         disabled={isSubmitting}
//                       />
//                     </FormControl>
//                     <div className="space-y-1 leading-none">
//                       <Label
//                         htmlFor="termsAgreement"
//                         className="text-sm text-neutral-600"
//                       >
//                         {t("auth.agreeToTerms")}
//                       </Label>
//                     </div>
//                   </div>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             {registerForm.formState.errors.root && (
//   <p className="text-red-500 text-sm">
//     {registerForm.formState.errors.root.message}
//   </p>
// )}
//             <Button
//               type="submit"
//               className="w-full py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
//               disabled={isSubmitting || !loginForm.formState.isValid}
//             >
//               {isSubmitting ? t("common.loading") : t("auth.createAccount")}
//             </Button>
//           </form>
//         </Form>
//       )}

//       <div className="mt-6 text-center text-sm text-neutral-600">
//         {view === "login" ? (
//           <>
//             {t("auth.dontHaveAccount")}{" "}
//             <Button
//               variant="link"
//               className="p-0 text-primary hover:text-primary/90 font-medium"
//               onClick={() => switchView("register")}
//             >
//               {t("auth.registerNow")}
//             </Button>
//           </>
//         ) : (
//           <>
//             {t("auth.alreadyHaveAccount")}{" "}
//             <Button
//               variant="link"
//               className="p-0 text-primary hover:text-primary/90 font-medium"
//               onClick={() => switchView("login")}
//             >
//               {t("auth.login")}
//             </Button>
//           </>
//         )}
//       </div>
//     </div>
//   );
};
