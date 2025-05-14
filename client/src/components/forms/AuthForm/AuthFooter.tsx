import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface AuthFooterProps {
  view: "login" | "register" | "forget-password";
  switchView: (view: "login" | "register" | "forget-password") => void;
}

export const AuthFooter = ({ view, switchView }: AuthFooterProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="mt-6 text-center text-sm text-neutral-600">
      {view === "login" ? (
        <>
          {t("auth.dontHaveAccount")}{" "}
          <Button
            variant="link"
            className="p-0 text-primary hover:text-primary/90 font-medium"
            onClick={() => switchView("register")}
          >
            {t("auth.registerNow")}
          </Button>
        </>
      ) : view === "register" ? (
        <>
          {t("auth.alreadyHaveAccount")}{" "}
          <Button
            variant="link"
            className="p-0 text-primary hover:text-primary/90 font-medium"
            onClick={() => switchView("login")}
          >
            {t("auth.login")}
          </Button>
        </>
      ) : (
        <>
          {t("auth.rememberPassword")}{" "}
          <Button
            variant="link"
            className="p-0 text-primary hover:text-primary/90 font-medium"
            onClick={() => switchView("login")}
          >
            {t("auth.backToLogin")}
          </Button>
        </>
      )}
    </div>
  );
};