import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import CarCategoryCard from "./CarCategoryCard";
import CarMakeCard from "./CarMakeCard";
import { CarCategory, CarMake } from "@shared/schema";
import CarBudgetCard from "./CarBudgetCard";
import { BudgetRange } from "@shared/schema";

type TabType = "category" | "brand" | "budget";

const CarTypeTabsSection = () => {
  const { t } = useTranslation();
  const [activeType, setActiveType] = useState<string | null>(null);

  const tabs: { key: TabType; label: string }[] = [
    { key: "category", label: t("common.bodyType") },
    { key: "brand", label: t("common.brands") },
    { key: "budget", label: t("common.budget") },
  ];

  const staticBudgets: BudgetRange[] = [
    { id: "1", name: "Under $10,000", min: 0, max: 10000 },
    { id: "2", name: "$10,000 - $20,000", min: 10000, max: 20000 },
    { id: "3", name: "$20,000 - $30,000", min: 20000, max: 30000 },
    { id: "4", name: "Above $30,000", min: 30000, max: Infinity },
  ];

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery<CarCategory[]>({
    queryKey: ["/api/car-categories"],
  });

  const {
    data: makes = [],
    isLoading: brandsLoading,
    isError: brandsError,
  } = useQuery<CarMake[]>({
    queryKey: ["/api/car-makes"],
  });

  const currentTab = activeType || tabs[0].key;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-neutral-900">
            {t("common.browseByType")}
          </h2>
          <p className="mt-2 text-neutral-600">
            {t("common.browseByTypeSubtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-3">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveType(key)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                key === currentTab
                  ? "bg-blue-900 text-white shadow"
                  : "bg-white text-blue-900 border hover:bg-blue-700 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {currentTab === "category" &&
            categories.map((cat) => (
              <CarCategoryCard key={cat.id} category={cat} />
            ))}

          {currentTab === "brand" &&
            makes.map((brand) => <CarMakeCard key={brand.id} make={brand} />)}

          {currentTab === "budget" &&
            staticBudgets.map((budget) => (
              <CarBudgetCard
                key={budget.id}
                budget={budget}
              />
            ))}
        </div>
      </div>
    </section>
  );
};

export default CarTypeTabsSection;
