import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { ServiceListingForm } from "@/components/forms/ServiceListingForm/ServiceListingForm";

export default function SellService() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Prevent rendering while redirecting
  }

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {t("common.sellCar")}
          </h1>
          <div className="w-40 h-1 bg-orange-500 mx-auto rounded-full" />
        </div>

        <div className="md:flex md:gap-6">
          <div className="w-full">
            <ServiceListingForm />
          </div>
        </div>
      </div>
    </div>
  );
}
