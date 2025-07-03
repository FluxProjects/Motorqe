// components/car/CompareTool.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Scale, List, AlertCircle } from "lucide-react";
import { CarListing } from "@shared/schema";
import { useTranslation } from "react-i18next";
import CarCard from "./CarCard";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import compareCarsIcon from "@/assets/compare-cars.png";

interface CompareToolProps {
  comparisonList: CarListing[];
  onRemove: (id: number) => void;
  onClear: () => void;
}

const CompareTool = ({ comparisonList, onRemove, onClear }: CompareToolProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Get unique cars
  const uniqueComparisonList = comparisonList?.filter(
    (car, index, self) => index === self.findIndex((c) => c.id === car.id)
  );

  const hasDuplicates = uniqueComparisonList?.length !== comparisonList?.length;

  const handleFullComparison = () => {
    const ids = uniqueComparisonList?.map(car => car.id).join(",");
    navigate(`/compare?cars=${ids}`);
  };

  // Floating button style
  const floatingButton = (
  <button
    onClick={() => setIsOpen(true)}
    className={`fixed right-4 bottom-4 z-50 bg-white shadow-black shadow-lg p-3 rounded-full hover:scale-105 transition-all ${
      comparisonList?.length > 0 ? "animate-bounce" : ""
    }`}
  >
    <img src={compareCarsIcon} alt="Compare Cars" className="w-6 h-6" />
 
      {comparisonList?.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {comparisonList?.length}
        </span>
      )}
    </button>
  );

  if (comparisonList?.length === 0) {
    return floatingButton;
  }

  return (
    <>
      {floatingButton}
      
      {/* Slide-in panel */}
      <div className={`fixed inset-0 z-40 transition-all duration-300 ${
        isOpen ? "bg-black bg-opacity-50" : "pointer-events-none"
      }`}>
        <div 
          className={`absolute left-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Scale size={18} />
                <h3 className="font-bold">
                  {t("common.compare")} ({uniqueComparisonList?.length})
                </h3>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 relative py-4 px-0 flex items-center justify-center">
              {uniqueComparisonList.length > 0 && (
                <>
                  {/* Left Arrow */}
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))}
                    disabled={currentIndex === 0}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Car Card */}
                  <div className="relative w-full max-w-xs">
                    <button
                      onClick={() => onRemove(uniqueComparisonList[currentIndex].id)}
                      className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow"
                    >
                      <X size={14} />
                    </button>
                    <CarCard
                      car={uniqueComparisonList[currentIndex]}
                      showCompareButton={false}
                    />
                  </div>

                  {/* Right Arrow */}
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev < uniqueComparisonList.length - 1 ? prev + 1 : prev
                      )
                    }
                    disabled={currentIndex === uniqueComparisonList.length - 1}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>



            {/* Footer */}
            <div className="p-4 border-t">
              <Button
                className="w-full mb-2"
                onClick={handleFullComparison}
                disabled={uniqueComparisonList?.length < 2}
              >
                {t("common.fullComparison")}
              </Button>
              <Button variant="outline" className="w-full" onClick={onClear}>
                {t("common.clearAll")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompareTool;