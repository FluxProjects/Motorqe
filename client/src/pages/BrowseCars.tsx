import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { CarSearchForm, CarCard, CarListItem } from "@/components/car";
import { LayoutGrid, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  FilterX,
  SlidersHorizontal,
  LoaderCircle,
  XCircle,
  Check,
  Car,
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import {
  CarListingFilters,
  CarCategory,
  CarMake,
  CarsData,
  CarListing,
  UserWithStats,
  User,
  CarModel,
  CarEngineCapacity,
} from "@shared/schema";
import { fetchModelsByMake } from "@/lib/utils";
import { MultiSelect } from "@/components/ui/multiselect";

const BrowseCars = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // Default to grid view
  const [searchParams, setSearchParams] = useState<URLSearchParams>();
  const [filters, setFilters] = useState<CarListingFilters>({
    minPrice: "all",
    maxPrice: "all",
    year: [1900, new Date().getFullYear()],

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
    isFeatured: "all",
    isImported: "all",

    ownerType:[],
    hasWarranty: 'all',
    hasInsurance: 'all',

    sort: "newest",
    page: 1,
    limit: 9,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Extract query params on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);

    // Set initial filters from URL params
    // In your useEffect for handling initial params:
    if (params.has("minPrice")) {
      const minPriceValue = params.get("minPrice") || "";
      setFilters((prev) => ({ ...prev, minPrice: minPriceValue }));
    }
    if (params.has("maxPrice")) {
      const maxPriceValue = params.get("maxPrice") || "";
      setFilters((prev) => ({ ...prev, maxPrice: maxPriceValue }));
    }
    if (params.has("minYear") && params.has("maxYear")) {
      setFilters((prev) => ({
        ...prev,
        year: [
          parseInt(params.get("minYear") || "1990"),
          parseInt(params.get("maxYear") || "2023"),
        ],
      }));
    }

    if (params.has("make")) {
      const makeValue = params.get("make") || "all";
      setFilters((prev) => ({ ...prev, make: makeValue }));
    }
    if (params.has("model")) {
      const modelValue = params.get("model") || "";
      setFilters((prev) => ({ ...prev, model: modelValue }));
    }
    if (params.has("category")) {
      const categoryValue = params.get("category") || "all";
      setFilters((prev) => ({ ...prev, category: categoryValue }));
    }

    if (params.has("minMile")) {
  const minMileValue = params.get("minMile") || "";
  setFilters((prev) => ({
    ...prev,
    milesRange: {
      from: minMileValue,
      to: prev.milesRange?.to ?? undefined,
    },
  }));
}

if (params.has("maxMile")) {
  const maxMileValue = params.get("maxMile") || "";
  setFilters((prev) => ({
    ...prev,
    milesRange: {
      from: prev.milesRange?.from ?? '0',
      to: maxMileValue,
    },
  }));
}


    if (params.has("fuel_type")) {
      const fuelTypes = params.getAll("fuel_type");
      setFilters((prev) => ({ ...prev, fuelType: fuelTypes }));
    }
    if (params.has("fuelType")) {
      const fuelTypes = params.getAll("fuelType");
      setFilters((prev) => ({ ...prev, fuelType: fuelTypes }));
    }
    if (params.has("transmission")) {
      const transmissions = params.getAll("transmission");
      setFilters((prev) => ({ ...prev, transmission: transmissions }));
    }
    if (params.has("engine_capacity")) {
      const engineCapacityVal = params.getAll("engine_capacity");
      setFilters((prev) => ({ ...prev, engineCapacity: engineCapacityVal }));
    }
    if (params.has("engineCapacity")) {
      const engineCapacitys = params.getAll("engineCapacity");
      setFilters((prev) => ({ ...prev, engineCapacity: engineCapacitys }));
    }
    if (params.has("cylinder_count")) {
      const cylinderCount = params.getAll("cylinder_count");
      setFilters((prev) => ({ ...prev, cylinderCount: cylinderCount }));
    }

    if (params.has("cylinderCount")) {
      const cylinderCount = params.getAll("cylinderCount");
      setFilters((prev) => ({ ...prev, cylinderCount: cylinderCount }));
    }

    if (params.has("color")) {
      const colors = params.getAll("color");
      setFilters((prev) => ({ ...prev, color: colors }));
    }
    if (params.has("interior_color")) {
      const interiorColor = params.getAll("interior_color");
      setFilters((prev) => ({ ...prev, interiorColor: interiorColor }));
    }
     if (params.has("interiorColor")) {
      const interiorColor = params.getAll("interiorColor");
      setFilters((prev) => ({ ...prev, interiorColor: interiorColor }));
    }
    if (params.has("tinted")) {
      const val = params.get("tinted");
      if (val === "true" || val === "false" || val === "all") {
        setFilters((prev) => ({
          ...prev,
          tinted: val,
        }));
      }
    }

    if (params.has("condition")) {
      const conditionValue = params.get("condition") || "";
      setFilters((prev) => ({ ...prev, condition: conditionValue }));
    }
    if (params.has("location")) {
      const locations = params.getAll("location");
      setFilters((prev) => ({ ...prev, location: locations }));
    }

    if (params.has("owner_type")) {
      const ownerTypes = params.getAll("owner_type");
      setFilters((prev) => ({ ...prev, ownerType: ownerTypes }));
    }
    if (params.has("is_featured")) {
      const val = params.get("is_featured");
      if (val === "true" || val === "false" || val === "all") {
        setFilters((prev) => ({
          ...prev,
          isFeatured: val,
        }));
      }
    }
    if (params.has("isFeatured")) {
      const val = params.get("isFeatured");
      if (val === "true" || val === "false" || val === "all") {
        setFilters((prev) => ({
          ...prev,
          isFeatured: val,
        }));
      }
    }
    if (params.has("is_imported")) {
      const val = params.get("is_imported");
      if (val === "true" || val === "false" || val === "all") {
        setFilters((prev) => ({
          ...prev,
          isImported: val,
        }));
      }
    }
     if (params.has("isImported")) {
      const val = params.get("isImported");
      if (val === "true" || val === "false" || val === "all") {
        setFilters((prev) => ({
          ...prev,
          isImported: val,
        }));
      }
    }


    // Handle sort
    if (params.has("sort")) {
      setFilters((prev) => ({ ...prev, sort: params.get("sort")! }));
    }
    if (params.has("page"))
      setFilters((prev) => ({
      ...prev,
      page: parseInt(params.get("page") || "1"),
    }));


    
  }, []);

  // Fetch available makes for filter
  const { data: makes = [] } = useQuery<CarMake[]>({
    queryKey: ["/api/car-makes"],
  });

  const { data: models = [] } = useQuery({
    queryKey: ["car-models", filters.make],
    queryFn: () => fetchModelsByMake(filters.make),
    enabled: !!filters.make && filters.make !== "all", // Only fetch if a specific make is selected
  });

  // Fetch car categories for filter
  const { data: categories = [] } = useQuery<CarCategory[]>({
    queryKey: ["/api/car-categories"],
  });

  // First, ensure your query has the correct type and default value
  const { data: carEngineCapacities = [] } = useQuery<CarEngineCapacity[]>({
    queryKey: ["/api/car-enginecapacities"], // Changed to a more standard key
  });

  // Then create a safe mapping function
  const engineCapacityOptions = useMemo(() => {
    if (!Array.isArray(carEngineCapacities)) return [];
    return carEngineCapacities.map((capacity) => ({
      value: capacity.id.toString(),
      label: capacity.size_liters, // Make sure this matches your API response
    }));
  }, [carEngineCapacities]);

  // Fetch cars
  const {
    data: carsData = [],
    isLoading,
    isFetching,
    isError,
  } = useQuery<CarListing[]>({
    queryKey: ["/api/car-listings", filters],
    enabled: !!searchParams,
  });

  // Fetch sellers
  const { data: sellersData = [] } = useQuery<User[]>({
    queryKey: [
      "car-sellers",
      carsData
        ?.map((c) => c.user_id)
        .sort()
        .join(","),
    ], // Use user_id here
    enabled: !!carsData?.length,
    queryFn: async () => {
      if (!carsData || carsData.length === 0) return []; // Early return if no cars

      // Debugging the structure of carsData and user_id mapping
      console.log("Cars Data:", carsData);
      const userIds = Array.from(new Set(carsData.map((car) => car.user_id))); // Use user_id
      console.log("User IDs:", userIds); // Debug the user IDs

      const res = await fetch(`/api/get-users?ids=${userIds.join(",")}`);
      console.log("Response Status:", res.status); // Log the response status
      const responseBody = await res.json();
      console.log("Response Body:", responseBody); // Log the response body

      return responseBody;
    },
  });

  const filterCars = (
    allCars: CarListing[],
    filters: CarListingFilters
  ): CarListing[] => {
    return allCars.filter((car) => {
      console.log("Evaluating car:", car);

      // Price Filter
      const minPrice = filters?.minPrice === "all" ? 0 : parseFloat(filters?.minPrice || "0");
      const maxPrice = filters?.maxPrice === "all" ? Infinity : parseFloat(filters?.maxPrice || "0");
      const carPrice = car.price;

      if (isNaN(carPrice)) {
        console.warn("Invalid car price:", car.price, "for car ID:", car.id);
        return false;
      }

      if (carPrice < minPrice || carPrice > maxPrice) {
        console.log(
          `Filtered out by price: ${carPrice} not in ${minPrice}-${maxPrice}`
        );
        return false;
      }

      // Year Filter
      if (filters?.year && car.year < filters?.year[0] || filters?.year && car.year > filters?.year[1]) {
        console.log(
          `Filtered out by year: ${car.year} not in ${filters?.year[0]}-${filters?.year[1]}`
        );
        return false;
      }
      
      // Make Filter
      if (filters?.make && filters?.make !== "all") {
        if (car.make_id !== Number(filters?.make)) {
          console.log(
            `Filtered out by make: car.make_id=${car.make_id}, filter=${filters?.make}`
          );
          return false;
        }
      }

      // Model Filter
      if (filters?.model && filters?.model !== "all" && car.model_id !== Number(filters?.model)) {
        console.log(
          `Filtered out by model: car.modelId=${car.model_id}, filter=${filters?.model}`
        );
        return false;
      }

      // Category Filter
      if (filters?.category && filters?.category !== "all") {
        if (car.category_id !== Number(filters?.category)) {
          console.log(
            `Filtered out by category: car.category_id=${car.category_id}, filter=${filters?.category}`
          );
          return false;
        }
      }

      // Mileage Filter
      const minMile = filters?.milesRange?.from === "all" ? 0 : parseFloat(filters?.milesRange?.from || "0");
      const maxMile = filters?.milesRange?.to === "all" ? Infinity: parseFloat(filters?.milesRange?.to || "0");
      const carMile = car.mileage;

      if (isNaN(carMile)) {
        console.warn("Invalid car mileage:", car.mileage, "for car ID:", car.id);
        return false;
      }

      if (carMile < minMile || carMile > maxMile) {
        console.log(
          `Filtered out by price: ${carMile} not in ${minMile}-${maxMile}`
        );
        return false;
      }

      // Fuel Type Filter
      if (filters.fuelType && filters.fuelType.length > 0 && !filters.fuelType.includes(car.fuel_type)) {
        return false;
      }

      // Transmission Filter
      if (filters.transmission && filters.transmission.length > 0 && !filters.transmission.includes(car.transmission)) {
        return false;
      }

      // Engine Capacity Filter
     if (filters.engineCapacity && filters.engineCapacity.length > 0 && !filters.engineCapacity.includes(car.engineCapacityId)) {
        return false;
      }
      // Cylinder Count Filter
      if (filters?.cylinderCount && filters.cylinderCount.length > 0 && car?.cylinder_count && !filters.cylinderCount.includes(car.cylinder_count)) {
        console.log(`Filtered out by Cylinder Count: ${car.cylinder_count}`);
        return false;
      }

      // Color Filter
      if (filters?.color && filters?.color.length > 0 && car?.color && !filters.color.includes(car.color)) {
        console.log(`Filtered out by Color: ${car.color}`);
        return false;
      }

      // Interior Color Filter
      if (filters?.interiorColor && filters?.interiorColor.length > 0 && car?.interior_color && !filters.interiorColor.includes(car.interior_color)) {
        console.log(`Filtered out by Interior Color: ${car.interior_color}`);
        return false;
      }

      // Tinted Filter
      if (filters?.tinted !== undefined && filters?.tinted !== "all") {
        const filterValue = filters?.tinted === "true";
        if (car.tinted !== filterValue) {
          console.log(`Filtered out by tinted: car.tinted=${car.tinted}, filter=${filters?.tinted}`);
          return false;
        }
      }


      // Condition Filter
      if (filters?.condition && filters?.condition !== "all" && car?.condition) {
        if (car.condition !== filters?.condition) {
          console.log(
            `Filtered out by condition: car.condition_id=${car.condition}, filter=${filters?.condition}`
          );
          return false;
        }
      }   
      
      // Location Filter
      if (filters?.location && filters?.location.length > 0 && car?.location && !filters?.location.includes(car.location)) {
        console.log(`Filtered out by location: ${car.location}`);
        return false;
      }

      // Featured Filter
      if (filters.isFeatured !== "all" && car.is_featured !== (filters.isFeatured === "true")) {
        return false;
      }

      // Imported Filter
      if (filters.isImported !== "all" && car.is_imported !== (filters.isImported === "true")) {
        return false;
      }

      // Owner Type Filter
      if (filters?.ownerType && filters?.ownerType.length > 0 && car.owner_type) {
        if (car.owner_type !== filters?.ownerType) {
          console.log(
            `Filtered out by condition: car.owner_type=${car.owner_type}, filter=${filters?.ownerType}`
          );
          return false;
        }
      } 

      // Has Warranty Filter
      if (typeof filters?.hasWarranty !== undefined && filters?.hasWarranty !== "all" && car?.has_warranty) {
        const filterValue = filters?.hasWarranty === "true";
        if (car.has_warranty !== filterValue) {
          console.log(
            `Filtered out by hasWarranty: car.hasWarranty=${car.has_warranty}, filter=${filters?.hasWarranty}`
          );
          return false;
        }
      }

      // Has Insurance Filter
      if (typeof filters?.hasInsurance !== undefined && filters?.hasInsurance !== "all" && car?.has_insurance) {
        const filterValue = filters?.hasInsurance === "true";
        if (car.has_insurance !== filterValue) {
          console.log(
            `Filtered out by hasInsurance: car.hasInsurance=${car.has_insurance}, filter=${filters?.hasInsurance}`
          );
          return false;
        }
      }

      return true;
    });
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => {
      const updatedFilters = {
        ...prev,
        ...newFilters,
        page: 1, // Reset to page 1 when filters change
      };

      // Update URL with new filters
      const params = new URLSearchParams();

      // Add all filters to URL params
      if (updatedFilters.minPrice) params.append("minPrice", updatedFilters.minPrice);
      if (updatedFilters.maxPrice) params.append("maxPrice", updatedFilters.maxPrice);
      if (updatedFilters.year) {
        params.append("minYear", updatedFilters.year[0].toString());
        params.append("maxYear", updatedFilters.year[1].toString());
      }

      if (updatedFilters.make) params.append("make", updatedFilters.make);
      if (updatedFilters.model) params.append("model", updatedFilters.model);
      if (updatedFilters.category) params.append("category", updatedFilters.category);
      
      if (updatedFilters.milesRange?.from) params.append("minMile", updatedFilters.milesRange?.from);
      if (updatedFilters.milesRange?.to) params.append("maxMile", updatedFilters.milesRange?.to);

      if (updatedFilters.fuelType && updatedFilters.fuelType.length > 0) {
        updatedFilters.fuelType.forEach((type) => {
          params.append("fuelType", type);
        });
      }
      if (updatedFilters.transmission && updatedFilters.transmission.length > 0) {
        updatedFilters.transmission.forEach((type) => {
          params.append("transmission", type);
        });
      }
      if (updatedFilters.color && updatedFilters.color.length > 0) {
        updatedFilters.color.forEach((type) => {
          params.append("color", type);
        });
      }
     if (updatedFilters.interiorColor && updatedFilters.interiorColor.length > 0) {
        updatedFilters.interiorColor.forEach((type) => {
          params.append("interior_Color", type);
        });
      }
      if (updatedFilters.tinted) params.append("tinted", updatedFilters.tinted);

      if (updatedFilters.condition) params.append("condition", updatedFilters.condition);
      if (updatedFilters.location) {
        updatedFilters.location.forEach((type: string) => {
          params.append("location", type);
        });
      }

       if (updatedFilters.ownerType && updatedFilters.ownerType.length > 0) {
        updatedFilters.ownerType.forEach((type) => {
          params.append("owner_type", type);
        });
      }
      if (updatedFilters.isFeatured) params.append("is_featured", updatedFilters.isFeatured);
      if (updatedFilters.isImported) params.append("isImported", updatedFilters.isImported);

      // Sort
      if (updatedFilters.sort) params.append("sort", updatedFilters.sort);

      // Update URL without navigating
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({ path: newUrl }, "", newUrl);

      // Update searchParams state
      setSearchParams(params);

      return updatedFilters; // Return the updated filters
    });
  };

  const resetFilters = () => {
    setFilters({
      minPrice: "all",
      maxPrice: "all",
      year: [1900, new Date().getFullYear()],

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
      isFeatured: "all",
      isImported: "all",

      ownerType:[],
      hasWarranty: 'all',
      hasInsurance: 'all',

      sort: "newest",
      page: 1,
      limit: 9,
    });

    // Clear URL params and navigate to /browse
    window.history.pushState({ path: "/browse" }, "", "/browse");
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));

    // Update URL with page
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newUrl }, "", newUrl);

    // Update searchParams state
    setSearchParams(params);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cars = carsData || [];
  const filteredCars = filterCars(cars, filters);
  const totalCars = filteredCars.length;
  const totalPages = Math.ceil(totalCars / filters.limit);

  const sellerMap = useMemo(() => {
    console.log("sellersData:", sellersData); // ✅ Check raw seller data
    const map = new Map<number, UserWithStats>();
    sellersData.forEach((seller) => {
      console.log(
        `Mapping seller ID ${seller.id} to username ${seller.username}`
      ); // ✅ Confirm map entries
      map.set(seller.id, seller);
    });
    console.log("Final sellerMap:", Array.from(map.entries())); // ✅ Log map content as array
    return map;
  }, [sellersData]);

  const carsWithSeller = useMemo(() => {
    console.log("filteredCars:", filteredCars); // ✅ Check what cars are being mapped
    const enriched = filteredCars.map((car) => {
      const seller = sellerMap.get(car.user_id);
      console.log(`Car ID ${car.id} maps to seller ID ${car.user_id}:`, seller);
      return {
        ...car,
        seller: seller || null,
      };
    });
    console.log("carsWithSeller:", enriched); // ✅ Final enriched list
    return enriched;
  }, [filteredCars, sellerMap]);

  // Get only the current page's cars
  const paginatedCars = carsWithSeller.slice(
    (filters.page - 1) * filters.limit,
    filters.page * filters.limit
  );

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {t("common.browseCars")}
          </h1>
          <div className="w-40 h-1 bg-orange-500 mx-auto rounded-full" />
        </div>

        <div className="md:flex md:gap-6">
          {/* Filters sidebar - desktop */}
          <div className=" hidden md:block w-64 flex-shrink-0">
            <div className="bg-neutral-50 border-2 border-orange-500 border-solid rounded-lg shadow p-4 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{t("common.filters")}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <FilterX size={18} />
                </Button>
              </div>

              {/* Condition Filter */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.condition")}
                </Label>
                <Select
                  value={filters.condition}
                  onValueChange={(value) => updateFilters({ condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("car.allConditions")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("car.allConditions")}
                    </SelectItem>
                    <SelectItem value="new">{t("car.new")}</SelectItem>
                    <SelectItem value="used">{t("car.used")}</SelectItem>
                    <SelectItem value="scrap">{t("car.scrap")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Make filter */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.make")}
                </Label>
                <Select
                  value={filters.make}
                  onValueChange={(value) => updateFilters({ make: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("car.allMakes")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("car.allMakes")}</SelectItem>
                    {makes?.map((make: CarMake) => (
                      <SelectItem key={make.id} value={make.id.toString()}>
                        {make.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model filter */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.model")}
                </Label>
                <Select
                  value={filters.model}
                  onValueChange={(value) => updateFilters({ model: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("car.allModels")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("car.allModels")}</SelectItem>
                    {models?.map((model: CarModel) => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category filter */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("common.category")}
                </Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => updateFilters({ category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("car.allCategories")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("car.allCategories")}
                    </SelectItem>
                    {categories?.map((category: CarCategory) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Imported Filter */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.imported")}
                </Label>
                <Select
                  value={filters.isImported ?? "all"}
                  onValueChange={(value) =>
                    updateFilters({ is_imported: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("car.allImports")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("car.allImports")}</SelectItem>
                    <SelectItem value="true">
                      {t("common.isImported")}
                    </SelectItem>
                    <SelectItem value="false">{t("common.local")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year Range */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.year")}
                </Label>
                <div className="mt-2">
                  <Slider
                    value={filters.year}
                    min={1990}
                    max={new Date().getFullYear()}
                    step={1}
                    onValueChange={(value) => updateFilters({ year: value })}
                  />
                  <div className="flex justify-between mt-1 text-sm text-neutral-500">
                    <span>{filters.year ? filters.year[0] : 1990}</span>
                    <span>
                      {filters.year
                        ? filters.year[1]
                        : new Date().getFullYear()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("common.price")}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={filters.minPrice}
                    onValueChange={(value) =>
                      updateFilters({ minPrice: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("car.minPrice")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("car.noMin")}</SelectItem>
                      <SelectItem value="5000">$5,000</SelectItem>
                      <SelectItem value="10000">$10,000</SelectItem>
                      <SelectItem value="20000">$20,000</SelectItem>
                      <SelectItem value="30000">$30,000</SelectItem>
                      <SelectItem value="50000">$50,000</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.maxPrice}
                    onValueChange={(value) =>
                      updateFilters({ maxPrice: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("car.maxPrice")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("car.noMax")}</SelectItem>
                      <SelectItem value="10000">$10,000</SelectItem>
                      <SelectItem value="20000">$20,000</SelectItem>
                      <SelectItem value="30000">$30,000</SelectItem>
                      <SelectItem value="50000">$50,000</SelectItem>
                      <SelectItem value="100000">$100,000</SelectItem>
                      <SelectItem value="200000">$200,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fuel Type */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.fuel_type")}
                </Label>
                <MultiSelect
                  options={[
                    { value: "gasoline", label: t("car.gasoline") },
                    { value: "diesel", label: t("car.diesel") },
                    { value: "electric", label: t("car.electric") },
                    { value: "hybrid", label: t("car.hybrid") },
                  ]}
                  selected={filters.fuelType}
                  onChange={(value) => updateFilters({ fuelType: value })}
                  placeholder={t("car.selectFuelTypes")}
                />
              </div>

              {/* Transmission */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.transmission")}
                </Label>
                <MultiSelect
                  options={[
                    { value: "automatic", label: t("car.automatic") },
                    { value: "manual", label: t("car.manual") },
                  ]}
                  selected={filters.transmission}
                  onChange={(value) => updateFilters({ transmission: value })}
                  placeholder={t("car.selectTransmissions")}
                />
              </div>

              {/* Engine Capacity */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.engineCapacity")}
                </Label>
                <MultiSelect
                  options={engineCapacityOptions}
                  selected={filters.engineCapacity}
                  onChange={(value) => updateFilters({ engineCapacity: value })}
                  placeholder={t("car.selectEngineCapacities")}
                />
              </div>

              {/* Color */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.color")}
                </Label>
                <MultiSelect
                  options={[
                    { value: "black", label: t("car.black") },
                    { value: "beige", label: t("car.beige") },
                    { value: "brown", label: t("car.brown") },
                    { value: "gray", label: t("car.gray") },
                  ]}
                  selected={filters.color}
                  onChange={(value) => updateFilters({ color: value })}
                  placeholder={t("car.selectColors")}
                />
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.interiorcolor")}
                </Label>
                <MultiSelect
                  options={[
                    { value: "black", label: t("car.black") },
                    { value: "white", label: t("car.white") },
                    // Add other colors
                  ]}
                  selected={filters.interiorColor}
                  onChange={(value) => updateFilters({ interiorColor: value })}
                  placeholder={t("car.selectColors")}
                />
              </div>

              {/* Owner Type */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.ownerType")}
                </Label>
                <MultiSelect
                  options={[
                    { value: "first", label: t("car.first") },
                    { value: "second", label: t("car.second") },
                    { value: "third", label: t("car.third") },
                  ]}
                  selected={filters.ownerType}
                  onChange={(value) => updateFilters({ ownerType: value })}
                  placeholder={t("car.selectOwnerTypes")}
                />
              </div>

            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Mobile filter button */}
            <div className="md:hidden mb-4 flex justify-between items-center">
              <Button variant="outline" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal className="mr-2" size={16} />{" "}
                {t("common.filters")}
              </Button>

              <Select
                value={filters.sort}
                onValueChange={(value) => updateFilters({ sort: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("car.sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t("car.newestFirst")}</SelectItem>
                  <SelectItem value="oldest">{t("car.oldestFirst")}</SelectItem>
                  <SelectItem value="price_high">
                    {t("car.priceHighToLow")}
                  </SelectItem>
                  <SelectItem value="price_low">
                    {t("car.priceLowToHigh")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results header */}
            <div className="bg-white rounded-lg p-4 flex justify-between items-center mb-6">
              <div>
                <p className="text-neutral-600">
                  {isLoading ? (
                    <span className="flex items-center">
                      <LoaderCircle className="animate-spin mr-2" size={16} />
                      {t("common.loading")}
                    </span>
                  ) : totalCars > 0 ? (
                    `${totalCars} ${t("common.carsFound")}`
                  ) : (
                    t("common.noResults")
                  )}
                </p>
              </div>

              <div className="flex justify-end mb-4">
                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(value) => {
                    if (value) setViewMode(value as "grid" | "list");
                  }}
                >
                  <ToggleGroupItem value="grid" aria-label="Grid view">
                    <LayoutGrid size={16} />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List view">
                    <List size={16} />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Sort options - desktop */}
              <div className="hidden md:block">
                <Select
                  value={filters.sort}
                  onValueChange={(value) => updateFilters({ sort: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("car.sortBy")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">
                      {t("car.newestFirst")}
                    </SelectItem>
                    <SelectItem value="oldest">
                      {t("car.oldestFirst")}
                    </SelectItem>
                    <SelectItem value="price_high">
                      {t("car.priceHighToLow")}
                    </SelectItem>
                    <SelectItem value="price_low">
                      {t("car.priceLowToHigh")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results grid */}
            {isLoading ? (
              // Loading skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
                    >
                      {/* Skeleton content */}
                    </div>
                  ))}
              </div>
            ) : isError ? (
              // Error state
              <div className="bg-white rounded-lg p-8 text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Error
                </h3>
                <Button
                  onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ["/api/cars"] })
                  }
                >
                  Try Again
                </Button>
              </div>
            ) : cars.length === 0 ? (
              // No results
              <div className="bg-white rounded-lg p-8 text-center">
                <Car className="h-8 w-8 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No cars found
                </h3>
              </div>
            ) : viewMode === "grid" ? (
              // Grid view
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCars.map((car) => {
                  const carWithSeller = carsWithSeller.find(
                    (c) => c.id === car.id
                  );
                  return carWithSeller ? (
                    <CarCard key={car.id} car={carWithSeller} />
                  ) : null;
                })}
              </div>
            ) : (
              // List view
              <div className="space-y-4">
                {paginatedCars.map((car) => {
                  const carWithSeller = carsWithSeller.find(
                    (c) => c.id === car.id
                  );
                  return carWithSeller ? (
                    <CarListItem key={car.id} car={carWithSeller} />
                  ) : null;
                })}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !isError && cars.length > 0 && totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, filters.page - 1))
                      }
                      isActive={filters.page > 1}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    // Show first page, last page, and pages around current page
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= filters.page - 1 && page <= filters.page + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={page === filters.page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    // Show ellipsis for gaps
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, filters.page + 1))
                      }
                      isActive={filters.page < totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {filtersOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-white h-full w-full md:w-80 p-4 ml-auto flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{t("common.filters")}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiltersOpen(false)}
              >
                <XCircle size={18} />
              </Button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Condition Filter */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.condition")}
                </Label>
                <Select
                  value={filters.condition}
                  onValueChange={(value) => updateFilters({ condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("car.allConditions")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("car.allConditions")}
                    </SelectItem>
                    <SelectItem value="new">{t("car.new")}</SelectItem>
                    <SelectItem value="used">{t("car.used")}</SelectItem>
                    <SelectItem value="scrap">{t("car.scrap")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Make filter */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.make")}
                </Label>
                <Select
                  value={filters.make}
                  onValueChange={(value) => updateFilters({ make: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("car.allMakes")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("car.allMakes")}</SelectItem>
                    {makes?.map((make: CarMake) => (
                      <SelectItem key={make.id} value={make.id.toString()}>
                        {make.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model filter */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.model")}
                </Label>
                <Select
                  value={filters.model}
                  onValueChange={(value) => updateFilters({ model: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("car.allModels")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("car.allModels")}</SelectItem>
                    {models?.map((model: CarModel) => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category filter */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("common.category")}
                </Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => updateFilters({ category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.allCategories")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("common.allCategories")}
                    </SelectItem>
                    {categories?.map((category: CarCategory) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Imported Filter */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.imported")}
                </Label>
                <Select
                  value={filters.is_imported ?? "all"}
                  onValueChange={(value) =>
                    updateFilters({ is_imported: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("car.allImports")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("car.allImports")}</SelectItem>
                    <SelectItem value="true">
                      {t("common.isImported")}
                    </SelectItem>
                    <SelectItem value="false">{t("common.local")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year Range */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.year")}
                </Label>
                <div className="mt-2">
                  <Slider
                    value={filters.year}
                    min={1990}
                    max={new Date().getFullYear()}
                    step={1}
                    onValueChange={(value) => updateFilters({ year: value })}
                  />
                  <div className="flex justify-between mt-1 text-sm text-neutral-500">
                    <span>{filters.year[0]}</span>
                    <span>{filters.year[1]}</span>
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("common.price")}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={filters.minPrice}
                    onValueChange={(value) =>
                      updateFilters({ minPrice: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("car.minPrice")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("car.noMin")}</SelectItem>
                      <SelectItem value="5000">$5,000</SelectItem>
                      <SelectItem value="10000">$10,000</SelectItem>
                      <SelectItem value="20000">$20,000</SelectItem>
                      <SelectItem value="30000">$30,000</SelectItem>
                      <SelectItem value="50000">$50,000</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.maxPrice}
                    onValueChange={(value) =>
                      updateFilters({ maxPrice: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("car.maxPrice")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("car.noMax")}</SelectItem>
                      <SelectItem value="10000">$10,000</SelectItem>
                      <SelectItem value="20000">$20,000</SelectItem>
                      <SelectItem value="30000">$30,000</SelectItem>
                      <SelectItem value="50000">$50,000</SelectItem>
                      <SelectItem value="100000">$100,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fuel Type */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.fuel_type")}
                </Label>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center">
                    <Checkbox
                      id="gasoline-mobile"
                      checked={filters.fuel_type.includes("gasoline")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters({
                            fuel_type: [...filters.fuel_type, "gasoline"],
                          });
                        } else {
                          updateFilters({
                            fuel_type: filters.fuel_type.filter(
                              (t: string) => t !== "gasoline"
                            ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor="gasoline-mobile" className="ml-2">
                      {t("car.gasoline")}
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="diesel-mobile"
                      checked={filters.fuel_type.includes("diesel")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters({
                            fuel_type: [...filters.fuel_type, "diesel"],
                          });
                        } else {
                          updateFilters({
                            fuel_type: filters.fuel_type.filter(
                              (t: string) => t !== "diesel"
                            ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor="diesel-mobile" className="ml-2">
                      {t("car.diesel")}
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="electric-mobile"
                      checked={filters.fuel_type.includes("electric")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters({
                            fuel_type: [...filters.fuel_type, "electric"],
                          });
                        } else {
                          updateFilters({
                            fuel_type: filters.fuel_type.filter(
                              (t: string) => t !== "electric"
                            ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor="electric-mobile" className="ml-2">
                      {t("car.electric")}
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="hybrid-mobile"
                      checked={filters.fuel_type.includes("hybrid")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters({
                            fuel_type: [...filters.fuel_type, "hybrid"],
                          });
                        } else {
                          updateFilters({
                            fuel_type: filters.fuel_type.filter(
                              (t: string) => t !== "hybrid"
                            ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor="hybrid-mobile" className="ml-2">
                      {t("car.hybrid")}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Transmission */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.transmission")}
                </Label>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center">
                    <Checkbox
                      id="automatic-mobile"
                      checked={filters.transmission.includes("automatic")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters({
                            transmission: [
                              ...filters.transmission,
                              "automatic",
                            ],
                          });
                        } else {
                          updateFilters({
                            transmission: filters.transmission.filter(
                              (t: string) => t !== "automatic"
                            ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor="automatic-mobile" className="ml-2">
                      {t("car.automatic")}
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="manual-mobile"
                      checked={filters.transmission.includes("manual")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters({
                            transmission: [...filters.transmission, "manual"],
                          });
                        } else {
                          updateFilters({
                            transmission: filters.transmission.filter(
                              (t: string) => t !== "manual"
                            ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor="manual-mobile" className="ml-2">
                      {t("car.manual")}
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex mt-6 gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  resetFilters();
                  setFiltersOpen(false);
                }}
              >
                {t("common.reset")}
              </Button>
              <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
                {t("common.apply")} ({totalCars})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseCars;
