import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { LoginFormWrapper } from "./LoginFormWrapper";
import { RegisterFormWrapper } from "./RegisterFormWrapper";
import { ForgotPasswordForm } from "./ForgetPasswordForm";
import { AuthHeader } from "./AuthHeader";
import { AuthFooter } from "./AuthFooter";
import { 
  LoginFormValues, 
  RegisterFormValues, 
  ForgotPasswordStep1Values, 
  ForgotPasswordStep2Values, 
  ForgotPasswordStep3Values,
  forgotPasswordStep1Schema,
  forgotPasswordStep2Schema,
  forgotPasswordStep3Schema,
  loginFormSchema,
  registerFormSchema
} from "./AuthSchemas";
import { useRegisterHandler } from "@/lib/auth/registerHandler";
import { useAuthNavigation } from "@/lib/auth/navigation";
import { useLoginHandler } from "@/lib/auth/loginHandler";
import { useForgotPasswordHandler } from "@/lib/auth/forgetPasswordHandler";

interface AuthFormsProps {
  initialView: "login" | "register" | "forget-password";
  onClose: () => void;
  onSwitchView: (view: "login" | "register" | "forget-password") => void;
}

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
  
  const { handleLogin } = useLoginHandler();
  const { handleRegister } = useRegisterHandler();
  const { navigateByRole } = useAuthNavigation();
  const {
    handleRequestOTP,
    handleVerifyOTP,
    handleResetPassword,
    handleResendOTP: resendOTPHandler,
  } = useForgotPasswordHandler();

  const rememberEmail = localStorage.getItem("rememberedEmail");
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema), // Make sure to use the correct schema here
    defaultValues: {
      email: rememberEmail || "",
      password: "",
      rememberMe: !!rememberEmail,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema), // Make sure to use the correct schema here
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "SELLER",
      termsAgreement: false,
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

  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await handleLogin(values, loginForm);
      if (values.rememberMe) {
        localStorage.setItem("rememberedEmail", values.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      onClose();
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await handleRegister(values, registerForm);
      onClose();
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordRequestOTP = async (values: ForgotPasswordStep1Values) => {
    setIsSubmitting(true);
    try {
      const { token } = await handleRequestOTP(values, step1Form);
      setEmailForPasswordReset(values.email);
      setOtpToken(token);
      setForgotPasswordStep(2);
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordVerifyOTP = async (values: ForgotPasswordStep2Values) => {
    setIsSubmitting(true);
    try {
      const { verificationToken } = await handleVerifyOTP(
        values,
        emailForPasswordReset,
        otpToken,
        step2Form
      );
      setOtpToken(verificationToken);
      setForgotPasswordStep(3);
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordReset = async (values: ForgotPasswordStep3Values) => {
    setIsSubmitting(true);
    try {
      await handleResetPassword(values, emailForPasswordReset, otpToken, step3Form);
      alert("Password has been reset successfully. Please login with your new password.");
      setView("login");
      setForgotPasswordStep(1);
      setEmailForPasswordReset("");
      setOtpToken("");
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSubmitting(true);
    try {
      const { token } = await resendOTPHandler(emailForPasswordReset, step1Form);
      setOtpToken(token);
      alert("New OTP has been sent to your email.");
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchView = (newView: "login" | "register" | "forget-password") => {
    setIsSubmitting(false);
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
        <LoginFormWrapper
          onSubmit={onLoginSubmit}
          isSubmitting={isSubmitting}
          switchView={switchView}
        />
      ) : view === "register" ? (
        <RegisterFormWrapper
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
      ) : null}

      <AuthFooter view={view} switchView={switchView} />
    </div>
  );
};