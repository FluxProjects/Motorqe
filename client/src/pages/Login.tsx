import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginFormWrapper } from "@/components/forms/AuthForm/LoginFormWrapper";
import { RegisterFormWrapper } from "@/components/forms/AuthForm/RegisterFormWrapper";
import { ForgotPasswordForm } from "@/components/forms/AuthForm/ForgetPasswordForm";
import {
  ForgotPasswordStep1Values,
  ForgotPasswordStep2Values,
  ForgotPasswordStep3Values,
  forgotPasswordStep1Schema,
  forgotPasswordStep2Schema,
  forgotPasswordStep3Schema,
  loginFormSchema,
  LoginFormValues,
  registerFormSchema,
  RegisterFormValues,
} from "@/components/forms/AuthForm/AuthSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginHandler } from "@/lib/auth/loginHandler";
import { useRegisterHandler } from "@/lib/auth/registerHandler";
import { useForgotPasswordHandler } from "@/lib/auth/forgetPasswordHandler";
import { useAuthNavigation } from "@/lib/auth/navigation";


const Login = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forget-password">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgetPasswordStep, setForgetPasswordStep] = useState(1);
  const [forgetPasswordEmail, setForgetPasswordEmail] = useState("");
  const [emailForPasswordReset, setEmailForPasswordReset] = useState("");
  const [otpToken, setOtpToken] = useState("");


  const { user } = useAuth();

  const { handleLogin } = useLoginHandler();
  const { handleRegister } = useRegisterHandler();
  const { navigateByRole } = useAuthNavigation();

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
      role: "BUYER",
      termsAgreement: false,
    },
  });

  const step1Form = useForm<ForgotPasswordStep1Values>({
    resolver: zodResolver(forgotPasswordStep1Schema),
    defaultValues: { email: "" },
  });

  const step2Form = useForm<ForgotPasswordStep2Values>({
    resolver: zodResolver(forgotPasswordStep2Schema),
    defaultValues: { otp: "" },
  });

  const step3Form = useForm<ForgotPasswordStep3Values>({
    resolver: zodResolver(forgotPasswordStep3Schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const {
  handleRequestOTP,
  handleVerifyOTP,
  handleResetPassword,
  handleResendOTP: resendOTPHandler,
} = useForgotPasswordHandler();


  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const success = await handleLogin(values, loginForm);
      if (values.rememberMe) {
        localStorage.setItem("rememberedEmail", values.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      if (success && user?.roleId) {
        navigateByRole(user?.roleId); // or user.roleId if numeric
      }
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const success = await handleRegister(values, registerForm);
      if (success && user?.roleId) {
        navigateByRole(user?.roleId); // or user.roleId if numeric
      }
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchView = (view: "login" | "register" | "forget-password") => {
    setActiveTab(view);
  };

  const handleForgotPasswordRequestOTP = async (values: ForgotPasswordStep1Values) => {
  setIsSubmitting(true);
  try {
    const { token } = await handleRequestOTP(values, step1Form);
    setEmailForPasswordReset(values.email);
    setOtpToken(token);
    setForgetPasswordStep(2);
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
    setForgetPasswordStep(3);
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
    alert("Password reset successful. Please login with your new password.");
    setActiveTab("login");
    setForgetPasswordStep(1);
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
    alert("New OTP sent to your email.");
  } catch (error) {
    throw error;
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row mt-5">
  {/* Login Section */}
  {/* Left Section */}
    <div className="w-full md:w-1/2 bg-neutral-100 flex flex-col px-6 sm:px-10 md:px-14 lg:px-20 py-14 md:py-20">
      {activeTab === "login" && (
        <>
          <h2 className="text-2xl font-bold">
            {t("login.title", "Login to your account")}
          </h2>
          <p className="text-neutral-500 mb-10">
            {t("login.desc", "Welcome Back! Sign In to your account")}
          </p>
          <LoginFormWrapper
            onSubmit={onLoginSubmit}
            isSubmitting={isSubmitting}
            switchView={switchView} // Update your LoginFormWrapper to accept view switching
          />
        </>
      )}

      {activeTab === "forget-password" && (
        <>
          <h2 className="text-2xl font-bold">
            {t("forget.title", "Reset Your Password")}
          </h2>
          <p className="text-neutral-500 mb-10">
            {t("forget.desc", "Enter your email to reset your password")}
          </p>
          <ForgotPasswordForm
            onSubmitRequestOTP={handleForgotPasswordRequestOTP}
            onSubmitVerifyOTP={handleForgotPasswordVerifyOTP}
            onSubmitResetPassword={handleForgotPasswordReset}
            isSubmitting={isSubmitting}
            currentStep={forgetPasswordStep}
            email={emailForPasswordReset}
            onResendOTP={handleResendOTP}
          />
        </>
      )}
    </div>


  {/* Register Section */}
  <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-20 py-14 md:py-20">
    <h2 className="text-2xl font-bold">
      {t("register.title", "Register to sell your Vehicle")}
    </h2>
    <p className="text-neutral-500 mb-10">
      {t("register.desc", "Create New Account Today")}
    </p>
    <div
      className={`transition-all ${
        activeTab === "register" ? "md:order-1" : "md:order-2"
      }`}
    >
      <RegisterFormWrapper
        onSubmit={onRegisterSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  </div>
</div>

  );
};

export default Login;
