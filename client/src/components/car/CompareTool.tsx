// components/car/CompareTool.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { CarListing } from "@shared/schema";
import { useTranslation } from "react-i18next";
import CarCard from "./CarCard";

interface CompareToolProps {
  comparisonList: CarListing[];
  onRemove: (id: number) => void;
  onClear: () => void;
}

export function CompareTool({
  comparisonList,
  onRemove,
  onClear,
}: CompareToolProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (comparisonList.length === 0) return null;

  const currentCar = comparisonList[currentIndex];

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50 w-80">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">{t("compare.title")}</h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X size={16} />
        </Button>
      </div>

      <div className="relative">
        <CarCard
          car={{
            id: currentCar.id,
            title: currentCar.title,
            titleAr: currentCar.titleAr || "undefined",
            price: currentCar.price,
            location: currentCar.location,
            images: currentCar.images ?? [], // Ensure it's an array
            mileage: currentCar.mileage,
            fuel_type: currentCar.fuelType || "Petrol", // default if missing
            transmission: currentCar.transmission,
            condition: currentCar.condition,
            color: currentCar.color,
            isFeatured: currentCar.isFeatured ?? false,
            seller: {
              id: currentCar.sellerId, // You may need to fetch seller data if not nested
              username: currentCar.sellerName ?? "Unknown", // fallback
              avatar: currentCar.sellerAvatar ?? undefined, // optional
            },
          }}
        />

        <div className="flex justify-between mt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
          >
            <ChevronLeft size={16} />
          </Button>
          <span>
            {currentIndex + 1} / {comparisonList.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex === comparisonList.length - 1}
            onClick={() => setCurrentIndex((prev) => prev + 1)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Button
          className="w-full"
          onClick={() => (window.location.href = "/compare")}
        >
          {t("compare.fullComparison")} ({comparisonList.length})
        </Button>
      </div>
    </div>
  );
}
