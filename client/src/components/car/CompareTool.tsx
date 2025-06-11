// components/car/CompareTool.tsx
import { useEffect, useState, useMemo } from "react";
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

interface CompareToolProps {
  comparisonList: CarListing[];
  onRemove: (id: number) => void;
  onClear: () => void;
}

const CompareTool = ({
  comparisonList,
  onRemove,
  onClear,
}: CompareToolProps) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
  const stored = localStorage.getItem("comparisonList");
  console.log("Stored data:", stored);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      console.log("Parsed data:", parsed);
    } catch (error) {
      console.error("Parsing error:", error);
    }
  }
}, []);

  // Remove duplicates from the comparison list
  const uniqueComparisonList = useMemo(() => {
    const uniqueIds = new Set<number>();
    return comparisonList?.filter(car => {
      if (!car || !car?.id) return false;
      if (uniqueIds.has(car?.id)) return false;
      uniqueIds.add(car?.id);
      return true;
    });
  }, [comparisonList]);

  // Show warning if duplicates were removed
  const hasDuplicates = useMemo(() => {
    return uniqueComparisonList?.length !== comparisonList?.length;
  }, [uniqueComparisonList, comparisonList]);

  // Sync with localStorage and handle index
  useEffect(() => {
    if (uniqueComparisonList?.length > 0 && currentIndex >= uniqueComparisonList?.length) {
      setCurrentIndex(Math.max(0, uniqueComparisonList?.length - 1));
    }
  }, [uniqueComparisonList, currentIndex]);

  const handleRemove = (id: number) => {
    onRemove(id);
    if (currentIndex >= uniqueComparisonList?.length - 1) {
      setCurrentIndex(Math.max(0, uniqueComparisonList?.length - 2));
    }
  };

  const handleFullComparison = () => {
    const ids = uniqueComparisonList?.map(car => car?.id).join(",");
    navigate(`/compare?cars=${ids}`);
  };

  const getSellerInfo = (car: CarListing) => {
    if (car?.seller) {
      return {
        id: car?.seller?.id,
        username: car?.seller?.username || "Unknown",
        avatar: car?.seller?.avatar,
      };
    }
    return {
      id: car?.user_id || 0,
      username: "Unknown",
      avatar: null,
    };
  };

  if (uniqueComparisonList?.length === 0) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border dark:border-gray-700 z-50 w-80 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Scale size={18} />
            {t("common.compare")}
          </h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
          {t("common.emptyMessage")}
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed ${expanded ? 'right-4 bottom-4 h-[85vh]' : 'right-4 bottom-4'} transition-all duration-300 z-50`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 overflow-hidden ${expanded ? 'w-[90vw] max-w-6xl h-full' : 'w-80'}`}>
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-primary" />
            <h3 className="font-bold text-gray-800 dark:text-gray-100">
              {t("common.compare")} ({uniqueComparisonList?.length})
              {hasDuplicates && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400 ml-2">
                  ({comparisonList?.length - uniqueComparisonList?.length} duplicates removed)
                </span>
              )}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {expanded ? (
                      <ChevronRight size={16} />
                    ) : (
                      <List size={16} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {expanded ? t("common.collapse") : t("common.showAll")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("common.clearAll")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {hasDuplicates && (
          <Alert variant="warning" className="mx-4 mt-2 mb-4 p-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {t("common.duplicatesRemoved")}
            </AlertDescription>
          </Alert>
        )}

        {expanded ? (
          <div className="p-4 h-[calc(100%-140px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueComparisonList?.map((car) => (
                <div key={`${car?.id}-${car?.user_id}`} className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(car?.id)}
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-700/90 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400"
                  >
                    <X size={14} />
                  </Button>
                  <CarCard
                    car={{
                      ...car,
                      seller: getSellerInfo(car),
                      title: car?.title || t("car.untitled"),
                      price: car?.price || "0",
                      year: car?.year || new Date().getFullYear(),
                      mileage: car?.mileage || "0",
                      location: car?.location || t("car.unknownLocation"),
                    }}
                    showCompareButton={false}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="relative">
              <div className="flex justify-end mb-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(uniqueComparisonList?.[currentIndex].id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X size={14} className="mr-1" />
                  {t("common.remove")}
                </Button>
              </div>

              <CarCard
                car={{
                  ...uniqueComparisonList?.[currentIndex],
                  seller: getSellerInfo(uniqueComparisonList?.[currentIndex]),
                  title: uniqueComparisonList?.[currentIndex].title || t("car.untitled"),
                  price: uniqueComparisonList?.[currentIndex].price || "0",
                  year: uniqueComparisonList?.[currentIndex].year || new Date().getFullYear(),
                  mileage: uniqueComparisonList?.[currentIndex].mileage || "0",
                  location: uniqueComparisonList?.[currentIndex].location || t("car.unknownLocation"),
                }}
                showCompareButton={false}
              />

              <div className="flex justify-between items-center mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="w-10 p-0"
                >
                  <ChevronLeft size={16} />
                </Button>
                
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentIndex + 1} / {uniqueComparisonList?.length}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === uniqueComparisonList?.length - 1}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="w-10 p-0"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t dark:border-gray-700">
          <Button
            className="w-full"
            onClick={handleFullComparison}
            disabled={uniqueComparisonList?.length < 2}
            size="lg"
          >
            {t("common.fullComparison")} ({uniqueComparisonList?.length})
          </Button>
          {uniqueComparisonList?.length < 2 && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              {t("common.minimumRequired")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareTool;