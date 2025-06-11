import CompareTool from "@/components/car/CompareTool";
import { CarListing } from "@shared/schema";
import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { X, Scale, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MAX_COMPARE_ITEMS = 4;

function CompareCars() {
  const navigate = useNavigate();
  const [comparisonList, setComparisonList] = React.useState<CarListing[]>([]);
  const [isClient, setIsClient] = React.useState(false);

  // Remove duplicates while preserving order
  const uniqueComparisonList = useMemo(() => {
    const seenIds = new Set<number>();
    return comparisonList.filter(car => {
      if (!car || seenIds.has(car.id)) return false;
      seenIds.add(car.id);
      return true;
    });
  }, [comparisonList]);

  // Load comparison list from localStorage
  useEffect(() => {
    const storedComparison = localStorage.getItem("comparisonList");
    if (storedComparison) {
      try {
        const parsedData = JSON.parse(storedComparison) as CarListing[];
        setComparisonList(parsedData);
      } catch (error) {
        console.error("Failed to parse comparison list:", error);
      }
    }
    setIsClient(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isClient) {
      if (uniqueComparisonList.length > 0) {
        localStorage.setItem("comparisonList", JSON.stringify(uniqueComparisonList));
      } else {
        localStorage.removeItem("comparisonList");
      }
    }
  }, [uniqueComparisonList, isClient]);

  const handleRemove = (id: number) => {
    setComparisonList(prev => prev.filter(car => car.id !== id));
  };

  const handleClear = () => {
    setComparisonList([]);
  };

  const handleAddCar = () => {
    navigate("/browse"); // Navigate to car listings page
  };

  // Key specifications to compare
  const comparisonFields = [
    { key: "price", label: "Price", format: (val: string) => `${val} ${uniqueComparisonList[0]?.currency || 'QAR'}` },
    { key: "year", label: "Year" },
    { key: "mileage", label: "Mileage", format: (val: string) => `${val} km` },
    { key: "fuel_type", label: "Fuel Type" },
    { key: "transmission", label: "Transmission" },
    { key: "color", label: "Color" },
    { key: "condition", label: "Condition" },
    { key: "has_warranty", label: "Warranty", format: (val: boolean) => val ? "Yes" : "No" },
    { key: "has_insurance", label: "Insurance", format: (val: boolean) => val ? "Yes" : "No" },
    { key: "tinted", label: "Tinted Windows", format: (val: boolean) => val ? "Yes" : "No" },
    { key: "owner_type", label: "Owner Type" },
    { key: "engine_capacity", label: "Engine Capacity" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Scale className="text-primary" size={28} />
          Vehicle Comparison
          {uniqueComparisonList.length > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({uniqueComparisonList.length} of {MAX_COMPARE_ITEMS})
            </span>
          )}
        </h1>
        {uniqueComparisonList.length > 0 && (
          <Button variant="destructive" onClick={handleClear}>
            <X className="mr-2" size={16} />
            Clear All
          </Button>
        )}
      </div>

      {uniqueComparisonList.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border dark:border-gray-700">
          {/* Cars Header Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-b dark:border-gray-700">
            {uniqueComparisonList.map((car) => (
              <div key={car.id} className="p-4 relative group border-r dark:border-gray-700 last:border-r-0">
                <button
                  onClick={() => handleRemove(car.id)}
                  className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-700/90 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 p-1 rounded-full"
                >
                  <X size={16} />
                </button>
                <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-md mb-4 overflow-hidden">
                  {car.images?.[0] ? (
                    <img
                      src={car.images[0]}
                      alt={car.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-1 line-clamp-1">{car.title}</h2>
                <p className="text-primary font-bold text-lg mb-2">
                  {car.price} {car.currency}
                </p>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>{car.year}</span>
                  <span>{car.mileage} km</span>
                </div>
              </div>
            ))}

            {/* Add Car Card (if less than max) */}
            {uniqueComparisonList.length < MAX_COMPARE_ITEMS && (
              <div className="p-4 flex items-center justify-center border-r dark:border-gray-700 last:border-r-0">
                <button
                  onClick={handleAddCar}
                  className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:border-primary transition-colors group"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                    <Plus className="text-gray-500 group-hover:text-primary" size={24} />
                  </div>
                  <span className="font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary">
                    Add Vehicle
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    {MAX_COMPARE_ITEMS - uniqueComparisonList.length} remaining
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Specifications Table */}
          <div className="divide-y dark:divide-gray-700">
            {comparisonFields.map((field) => (
              <div key={field.key} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
               {uniqueComparisonList.map((car) => (
  <div key={`car-${car.id}`} className="p-4 border gray-700">
    <div className="grid grid-cols-2 gap-2">
     
          <div className="font-medium text-gray-600 dark:text-gray-300">
            {field.label}
          </div>
          <div className="text-gray-800 dark:text-white">
            {field?.format
              ? field?.format(car?.[field?.key as keyof CarListing])
              : car?.[field?.key as keyof CarListing] || "-"}
          </div>
      
    </div>
  </div>
))}

                {/* Empty cells for add car button space */}
                {Array.from({ length: MAX_COMPARE_ITEMS - uniqueComparisonList.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-3 border-r dark:border-gray-700 last:border-r-0"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <Scale size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
            No Vehicles Selected
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Add up to {MAX_COMPARE_ITEMS} vehicles to compare their specifications side by side
          </p>
          <Button onClick={handleAddCar} size="lg" className="gap-2">
            <Plus size={18} />
            Add Vehicles to Compare
          </Button>
        </div>
      )}

      {/* Floating Compare Tool (optional) */}
      {uniqueComparisonList.length > 0 && (
        <CompareTool
          comparisonList={uniqueComparisonList}
          onRemove={handleRemove}
          onClear={handleClear}
        />
      )}
    </div>
  );
}

export default CompareCars;