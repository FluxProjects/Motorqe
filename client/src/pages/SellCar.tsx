import { AuthForms } from "@/components/forms/AuthForm/AuthForms";
import { useAuth } from "@/contexts/AuthContext";
import { ListingForm } from "@/components/forms/CarListingForm/ListingForm";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

export default function SellCar() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [authModal, setAuthModal] = useState<"login" | "register" | "forget-password" | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthModal("login");
    }
  }, [isAuthenticated]);

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">
          {t("common.sellCar")}
        </h1>

        <div className="md:flex md:gap-6">
          <div className="w-full">
            {isAuthenticated ? (
              <ListingForm />
            ) : (
              <div className="text-neutral-600">
  {t("common.pleaseLoginToContinue")}{" "}
  <button
    onClick={() => setAuthModal("login")}
    className="text-primary font-medium underline hover:no-underline"
  >
    {t("common.login")}
  </button>
</div>

            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {authModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 animate-in fade-in duration-300">
            <AuthForms
              initialView={authModal}
              onClose={() => setAuthModal(null)}
              onSwitchView={(view) => setAuthModal(view)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
