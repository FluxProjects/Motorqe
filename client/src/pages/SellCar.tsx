// src/pages/SellCar.tsx
import { ListingForm } from "@/components/forms/CarListingForm/ListingForm";
import { useTranslation } from "react-i18next";

export default function SellCar() {
  const { t } = useTranslation();
  return (
    <div className="bg-white min-h-screen py-8">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-bold text-neutral-900 mb-8">
      {t("common.sellCar")}
    </h1>

    <div className="md:flex md:gap-6">
      <div className="w-full">
        <ListingForm />
      </div>
    </div>
  </div>
</div>

  );
}
