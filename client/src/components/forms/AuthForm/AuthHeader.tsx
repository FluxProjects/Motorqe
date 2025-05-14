import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AuthHeaderProps {
  view: "login" | "register" | "forget-password";
  onClose: () => void;
}

export const AuthHeader = ({ view, onClose }: AuthHeaderProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl font-bold text-neutral-900">
        {view === "login" 
          ? t("auth.login") 
          : view === "register" 
            ? t("auth.createAccount") 
            : t("auth.forgotPassword")}
      </h3>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};