import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import CarCategoryCard from "./CarCategoryCard";
import CarMakeCard from "./CarMakeCard";
import { CarCategory, CarMake } from "@shared/schema";
import CarBudgetCard from "./CarBudgetCard";
import { BudgetRange } from "@shared/schema";
import { Link } from "wouter";
import CarYearCard from "./CarYearCard";
import CarCapacityCard from "./CarCapacityCard";

type TabType = "category" | "brand" | "budget" | "year";

const CarTypeTabsSection = () => {
  const { t } = useTranslation();
  const [activeType, setActiveType] = useState<string | null>(null);

  const tabs: { key: TabType; label: string }[] = [
    { key: "category", label: t("common.bodyType") },
    { key: "brand", label: t("common.brands") },
    { key: "budget", label: t("common.budget") },
    { key: "year", label: t("common.year") },
    { key: "capacity", label: t("common.engineCapacity") },
  ];

  const staticBudgets: BudgetRange[] = [
  { id: "1", name: "Under QAR 10,000", min: 0, max: 10000 },
  { id: "2", name: "QAR 10,000 - QAR 20,000", min: 10000, max: 20000 },
  { id: "3", name: "QAR 20,000 - QAR 30,000", min: 20000, max: 30000 },
  { id: "4", name: "QAR 30,000 - QAR 40,000", min: 30000, max: 40000 },
  { id: "5", name: "QAR 40,000 - QAR 50,000", min: 40000, max: 50000 },
  { id: "6", name: "QAR 50,000 - QAR 60,000", min: 50000, max: 60000 },
  { id: "7", name: "QAR 60,000 - QAR 70,000", min: 60000, max: 70000 },
  { id: "8", name: "QAR 70,000 - QAR 80,000", min: 70000, max: 80000 },
  { id: "9", name: "QAR 80,000 - QAR 100,000", min: 80000, max: 100000 },
  { id: "10", name: "Above QAR 100,000", min: 100000, max: Infinity },
];

const staticYears: BudgetRange[] = [
  { id: "1", name: "Before 1995", min: 0, max: 1994 },
  { id: "2", name: "1995 - 1999", min: 1995, max: 1999 },
  { id: "3", name: "2000 - 2002", min: 2000, max: 2002 },
  { id: "4", name: "2003 - 2005", min: 2003, max: 2005 },
  { id: "5", name: "2006 - 2010", min: 2006, max: 2010 },
  { id: "6", name: "2011 - 2013", min: 2011, max: 2013 },
  { id: "7", name: "2014 - 2016", min: 2014, max: 2016 },
  { id: "8", name: "2017 - 2019", min: 2017, max: 2019 },
  { id: "9", name: "2020 - 2022", min: 2020, max: 2022 },
  { id: "10", name: "2023 and newer", min: 2023, max: Infinity },
];

const engineCapacityRanges: BudgetRange[] = [
  { id: "1", name: "Under 1.0L", min: 0, max: 0.99 },
  { id: "2", name: "1.0L - 1.4L", min: 1.0, max: 1.4 },
  { id: "3", name: "1.5L - 1.9L", min: 1.5, max: 1.9 },
  { id: "4", name: "2.0L - 2.4L", min: 2.0, max: 2.4 },
  { id: "5", name: "2.5L - 2.9L", min: 2.5, max: 2.9 },
  { id: "6", name: "3.0L - 3.9L", min: 3.0, max: 3.9 },
  { id: "7", name: "4.0L - 4.9L", min: 4.0, max: 4.9 },
  { id: "8", name: "5.0L - 5.9L", min: 5.0, max: 5.9 },
  { id: "9", name: "6.0L and above", min: 6.0, max: Infinity },
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

  const famousMakes = ["Toyota", "Honda", "Kia", "Mercedes-Benz", "Audi", "Ford", "Chevrolet", "Lexus", "Volkswagen", "Hyundai"];



  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 text-center relative">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            {t("common.browseByType")}
          </h2>
          <div className="w-40 h-1 bg-orange-500 mx-auto mb-20 rounded-full" />

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-3">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveType(key)}
              className={`px-5 py-2 text-sm font-medium transition-all ${
                key === currentTab
                  ? "text-orange-500 border-b-4 border-b-orange-500 hover:font-bold"
                  : "text-blue-900"
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
  makes
    .filter((brand) => famousMakes.includes(brand.name))
    .slice(0, 10)
    .map((brand) => <CarMakeCard key={brand.id} make={brand} />)}


          {currentTab === "budget" &&
            staticBudgets.map((budget) => (
              <CarBudgetCard
                key={budget.id}
                budget={budget}
              />
            ))}

            {currentTab === "year" &&
            staticYears.map((year) => (
              <CarYearCard key={year.id} yearRange={year} />
            ))}

             {currentTab === "capacity" &&
            engineCapacityRanges.map((capacity) => (
              <CarCapacityCard key={capacity.id} capacity={capacity} />
            ))}
        </div>

        {/* View More Button */}
        <div className="flex flex-col items-end mt-10">
          <Link href="/browse">
            <a className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full transition">
              View More
            </a>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default CarTypeTabsSection;
