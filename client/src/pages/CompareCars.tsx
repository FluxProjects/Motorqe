import {
  CarCategory,
  CarEngineCapacity,
  CarListing,
  CarMake,
  CarModel,
  CarListingFilters,
} from "@shared/schema";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Scale, Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { fetchModelsByMake, getEngineSizeLabel } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { MultiSelect } from "@/components/ui/multiselect";

type ComparisonField = {
  key: string;
  label: string;
  format?: (val: string | number | boolean | string[] | Date | null | undefined) => string;
};

type CarCompareFormProps = {
  cars: {
    make: string;
    model: string;
    year: string;
  }[];
};




const MAX_COMPARE_ITEMS = 4;

function CompareCars() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [comparisonList, setComparisonList] = useState<CarListing[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarListing | null>(null);
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  const [filters, setFilters] = useState<CarListingFilters>({
    search: searchParams?.get("search") || "",
    minPrice: "all",
    maxPrice: "all",
    minYear: "all",
    maxYear: "all",
    make: "all",
    model: "all",
    category: "all",
    milesRange: {
      from: "all",
      to: "all",
    },
    fuelType: [],
    transmission: [],
    engineCapacity: [],
    cylinderCount: [],
    color: [],
    interiorColor: [],
    tinted: "all",
    condition: "all",
    location: [],
    status: "active",
    isActive: true,
    isFeatured: "all",
    isImported: "all",
    ownerType: [],
    hasWarranty: "all",
    hasInsurance: "all",
    sort: "newest",
    page: 1,
    limit: 9,
  });

  const form = useForm<CarCompareFormProps>({
  defaultValues: {
    cars: Array.from({ length: MAX_COMPARE_ITEMS }, () => ({
      make: "",
      model: "",
      year: "",
    })),
  },
});


  const {
    data: carsData = [],
    isLoading,
    isFetching,
    isError,
  } = useQuery<CarListing[]>({
    queryKey: ["/api/car-listings", filters],
    enabled: !!searchParams,
  });

  // Fetch car makes
  const { data: makes = [] } = useQuery<CarMake[]>({
    queryKey: ["/api/car-makes"],
  });

  const selectedMakeId = form.watch("make");

 const { data: models = [] } = useQuery<CarModel[]>({
  queryKey: ["car-models", selectedMakeId],
  queryFn: () => fetchModelsByMake(selectedMakeId),
  enabled: !!selectedMakeId && selectedMakeId !== "all",
});

  const makeOptions = [
    { value: "all", label: t("common.all") },
    ...(makes?.map((make: CarMake) => ({
      value: String(make.id),
      label: make.name,
    })) ?? []),
  ];

  const modelOptions =
    models?.map((model: CarModel) => ({
      value: String(model.id),
      label: model.name,
    })) ?? [];

  const { data: categories = [] } = useQuery<CarCategory[]>({
    queryKey: ["/api/car-categories"],
  });

  const { data: carEngineCapacities = [] } = useQuery<CarEngineCapacity[]>({
    queryKey: ["/api/car-enginecapacities"],
  });

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) return "-";
    if (value instanceof Date) return value.toLocaleDateString();
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  const filteredCars = useMemo(() => {
    return carsData.filter((car) => {
      const makeMatch = selectedMake
        ? car.make_id === parseInt(selectedMake)
        : true;
      const modelMatch = selectedModel
        ? car.model_id === parseInt(selectedModel)
        : true;
      const yearMatch = selectedYear
        ? car.year === parseInt(selectedYear)
        : true;
      return makeMatch && modelMatch && yearMatch;
    });
  }, [carsData, selectedMake, selectedModel, selectedYear]);

  const uniqueComparisonList = useMemo(() => {
    const seenIds = new Set<number>();
    return comparisonList.filter((car) => {
      if (!car || seenIds.has(car.id)) return false;
      seenIds.add(car.id);
      return true;
    });
  }, [comparisonList]);

  const handleCompareNow = () => {
    if (uniqueComparisonList.length < 2) {
      toast({
        title: "Not enough cars",
        description: "Please select at least 2 cars to compare",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Comparison Started",
      description: "Cars are being compared. Results will load shortly.",
    });
  };

  const handleAddFromSelection = () => {
    if (filteredCars.length > 0) {
      const carToAdd = filteredCars[0];
      if (uniqueComparisonList.some((car) => car.id === carToAdd.id)) {
        toast({
          title: "Car already added",
          description: "This car is already in the comparison list",
          variant: "destructive",
        });
        return;
      }
      if (uniqueComparisonList.length >= MAX_COMPARE_ITEMS) {
        toast({
          title: "Maximum cars reached",
          description: `You can only compare up to ${MAX_COMPARE_ITEMS} cars`,
          variant: "destructive",
        });
        return;
      }
      setComparisonList((prev) => [...prev, carToAdd]);
      toast({
        title: "Car added",
        description: `${carToAdd.title} added to comparison`,
      });
    } else {
      toast({
        title: "No matching car",
        description: "No car matches your selection criteria",
        variant: "destructive",
      });
    }
  };

  const handleAddToBrowse = () => {
    const params = new URLSearchParams();
    if (selectedMake) params.set("make", selectedMake);
    if (selectedModel) params.set("model", selectedModel);
    if (selectedYear) {
      params.set("minYear", selectedYear);
      params.set("maxYear", selectedYear);
    }
    navigate(`/browse?${params.toString()}`);
  };

  const handleViewMore = () => {
    toast({
      title: "Loading More",
      description: "Loading additional car comparisons...",
    });
  };

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

  useEffect(() => {
    if (isClient) {
      if (uniqueComparisonList.length > 0) {
        localStorage.setItem(
          "comparisonList",
          JSON.stringify(uniqueComparisonList)
        );
      } else {
        localStorage.removeItem("comparisonList");
      }
    }
  }, [uniqueComparisonList, isClient]);

  const handleRemove = (id: number) => {
    setComparisonList((prev) => prev.filter((car) => car.id !== id));
  };

  const handleClear = () => {
    setComparisonList([]);
  };

  const handleAddCar = () => {
    navigate("/browse");
  };

  const handleAddToComparison = (car: CarListing) => {
    if (uniqueComparisonList.length >= MAX_COMPARE_ITEMS) {
      toast({
        title: "Maximum cars reached",
        description: `You can only compare up to ${MAX_COMPARE_ITEMS} cars at once`,
        variant: "destructive",
      });
      return;
    }
    setComparisonList((prev) => [...prev, car]);
    toast({
      title: "Car added",
      description: `${car.title} has been added to comparison`,
    });
  };

  const comparisonFields: ComparisonField[] = [
    {
      key: "price",
      label: "Price",
      format: (val: number) =>
        `${val} ${uniqueComparisonList[0]?.currency || "QAR"}`,
    },
    { key: "year", label: "Year" },
    { key: "mileage", label: "Mileage", format: (val: number) => `${val} km` },
    { key: "fuel_type", label: "Fuel Type" },
    { key: "transmission", label: "Transmission" },
    { key: "color", label: "Color" },
    { key: "condition", label: "Condition" },
    {
      key: "has_warranty",
      label: "Warranty",
      format: (val: boolean) => (val ? "Yes" : "No"),
    },
    {
      key: "has_insurance",
      label: "Insurance",
      format: (val: boolean) => (val ? "Yes" : "No"),
    },
    {
      key: "is_inspected",
      label: "Inspected",
      format: (val: boolean) => (val ? "Yes" : "No"),
    },
    {
      key: "tinted",
      label: "Tinted Windows",
      format: (val: boolean) => (val ? "Yes" : "No"),
    },
    { key: "owner_type", label: "Owner Type" },
    { key: "engine_capacity", label: "Engine Capacity" },
  ];

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-normal text-gray-600 mb-4">
            Compare Cars
          </h1>
          <p className="text-gray-600 max-w-5xl text-sm leading-relaxed">
            Confused which Car you should buy? Compare cars with our comparison
            tool. Compare cars on various parameters like price, features,
            specifications, fuel consumption, mileage, performance, dimension,
            safety & more to make a smart choice.
          </p>
        </div>

        {/* Car Selection Cards */}
        <div className="bg-gray-50 rounded-xl border-2 border-orange-400 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {[0, 1, 2, 3].map((slot) => (
              <div key={slot} className="text-center">
                {uniqueComparisonList[slot] ? (
                  <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-full border-2 border-orange-400 flex items-center justify-center overflow-hidden">
                    <img
                      src={uniqueComparisonList[slot].images?.[0] || "/placeholder-car.jpg"}
                      alt={uniqueComparisonList[slot].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <Button
                    className="w-32 h-32 mx-auto mb-6 bg-white rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-orange-400 transition-colors"
                    onClick={handleAddFromSelection}
                    disabled={
                      !form.watch(`cars.${slot}.make`) ||
                      !form.watch(`cars.${slot}.model`) ||
                      !form.watch(`cars.${slot}.year`)
                    }
                  >
                    <Plus className="h-12 w-12 text-gray-400" />
                  </Button>
                )}

                <div className="text-sm text-gray-500 mb-4">
                  {uniqueComparisonList[slot]?.title || "Add Car"}
                </div>

                <Form {...form}>
                  <FormField
                    control={form.control}
                    name={`cars.${slot}.make`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <MultiSelect
                          options={makeOptions}
                          selected={field.value ? [String(field.value)] : []}
                          onChange={(val) => field.onChange(val[0] ?? "")}
                          placeholder="Select Make"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`cars.${slot}.model`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <MultiSelect
                          options={modelOptions}
                          selected={field.value ? [String(field.value)] : []}
                          onChange={(val) => field.onChange(val[0] ?? "")}
                          placeholder="Select Model"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`cars.${slot}.year`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full h-10 rounded-md border-gray-300 text-gray-500">
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(
                              { length: 20 },
                              (_, i) => new Date().getFullYear() - i
                            ).map((year) => (
                              <SelectItem key={year} value={String(year)}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              </div>
            ))}


          </div>

          <div className="text-center mt-8">
            <Button
              onClick={handleCompareNow}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium text-sm"
              disabled={uniqueComparisonList.length < 2}
            >
              Compare Now
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {uniqueComparisonList.map((car) => (
              <div
                key={car.id}
                className="bg-neutral-50 relative group border-2 border-orange-400 rounded-2xl overflow-hidden flex flex-col"
              >
                <button
                  onClick={() => handleRemove(car.id)}
                  className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-red-100 text-red-500 p-1 rounded-full"
                >
                  <X size={16} />
                </button>

                <div className="h-40 mb-4 overflow-hidden">
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

                <h2 className="px-4 text-xl text-blue-900 font-bold mb-1 line-clamp-1">
                  {car.title}
                </h2>

                <p className="px-4 text-primary text-neutral-300 font-semibold text-lg mb-2">
                  {car.currency} {car.price}
                </p>

                <div className="px-4 flex justify-between text-sm text-gray-600 mb-4">
                  <span>{car.year}</span>
                  <span>{car.mileage} km</span>
                </div>

                <div className="bg-white px-4 pb-4 mt-auto">
                  {comparisonFields.map((field) => (
                    <div
                      key={field.key}
                      className="flex justify-between text-sm border-t pt-2"
                    >
                      <span className="text-gray-600 font-medium">
                        {field.label}
                      </span>
                      <span className="text-gray-800">
                        {field.format
                          ? field.format(car[field.key as keyof CarListing])
                          : formatValue(car[field.key as keyof CarListing])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {uniqueComparisonList.length < MAX_COMPARE_ITEMS && (
              <div className="p-4 flex items-center justify-center border-2 border-dashed rounded-2xl hover:border-primary transition-colors">
                <button
                  onClick={handleAddCar}
                  className="w-full h-full flex flex-col items-center justify-center p-6 group"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                    <Plus
                      className="text-gray-500 group-hover:text-primary"
                      size={24}
                    />
                  </div>
                  <span className="font-medium text-gray-600 group-hover:text-primary">
                    Add Vehicle
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    {MAX_COMPARE_ITEMS - uniqueComparisonList.length} remaining
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow border">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Scale size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-600 mb-2">
              No Vehicles Selected
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Add up to {MAX_COMPARE_ITEMS} vehicles to compare their
              specifications side by side
            </p>
            <Button onClick={handleAddCar} size="lg" className="gap-2">
              <Plus size={18} />
              Add Vehicles to Compare
            </Button>
          </div>
        )}

        {/* Popular Cars Comparison */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Popular cars comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {carsData.slice(0, 2).map((car, index) => (
              <div key={index}>
                <div className="bg-gray-50 rounded-2xl border-2 border-orange-400 overflow-hidden mb-4">
                  <div className="relative">
                    <div className="grid grid-cols-2">
                      <img
                        src={car.images?.[0] || "/placeholder-car.jpg"}
                        alt={car.title}
                        className="w-full h-32 object-cover"
                      />
                      <img
                        src={
                          carsData[index + 1]?.images?.[0] ||
                          "/placeholder-car.jpg"
                        }
                        alt={carsData[index + 1]?.title || "Car"}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                        VS
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400 text-xs mb-1">
                          {makes.find((m) => m.id === car.make_id)?.name ||
                            "Unknown Make"}
                        </div>
                        <div className="font-bold text-blue-600">
                          {car.title}
                        </div>
                        <div className="text-blue-600">{car.year}</div>
                        <div className="font-bold text-blue-600">
                          {car.currency} {car.price}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">
                          {carsData[index + 1]
                            ? makes.find(
                                (m) => m.id === carsData[index + 1].make_id
                              )?.name || "Unknown Make"
                            : "Select Car"}
                        </div>
                        <div className="font-bold text-blue-600">
                          {carsData[index + 1]?.title || "Add another car"}
                        </div>
                        <div className="text-blue-600">
                          {carsData[index + 1]?.year || "-"}
                        </div>
                        <div className="font-bold text-blue-600">
                          {carsData[index + 1]
                            ? `${carsData[index + 1].currency} ${
                                carsData[index + 1].price
                              }`
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Button
                    onClick={() => {
                      if (carsData[index + 1]) {
                        handleAddToComparison(car);
                        handleAddToComparison(carsData[index + 1]);
                      } else {
                        toast({
                          title: "Select another car",
                          description: "Please add another car to compare",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 font-medium"
                  >
                    Compare Now
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Button
              onClick={handleViewMore}
              variant="outline"
              className="text-blue-600 border-orange-500 px-8 py-2 rounded-full hover:bg-orange-500 hover:text-white border-2"
            >
              View More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompareCars;
