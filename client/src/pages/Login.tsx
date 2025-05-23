import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginFormWrapper } from "@/components/forms/AuthForm/LoginFormWrapper";
import { RegisterFormWrapper } from "@/components/forms/AuthForm/RegisterFormWrapper";
import {
  forgotPasswordStep1Schema,
  loginFormSchema,
  LoginFormValues,
  registerFormSchema,
  RegisterFormValues,
} from "@/components/forms/AuthForm/AuthSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginHandler } from "@/lib/auth/loginHandler";
import { useRegisterHandler } from "@/lib/auth/registerHandler";
import { useAuthNavigation } from "@/lib/auth/navigation";


const Login = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const switchView = (view: "login" | "register") => {
    setActiveTab(view);
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row mt-5">
  {/* Login Section */}
  <div className="w-full md:w-1/2 bg-neutral-100 flex flex-col px-6 sm:px-10 md:px-14 lg:px-20 py-14 md:py-20">
  <h2 className="text-2xl font-bold">
      {t("login.title", "Login to your account")}
    </h2>
    <p className="text-neutral-500 mb-10">
      {t("login.desc", "Welcome Back! Sign In to your account")}
    </p>
    <div
      className={`transition-all ${
        activeTab === "login" ? "md:order-1" : "md:order-2"
      }`}
    >
      <LoginFormWrapper
        onSubmit={onLoginSubmit}
        isSubmitting={isSubmitting}
        switchView={() => switchView("register")}
      />
    </div>
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
