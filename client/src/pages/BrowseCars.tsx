import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { CarCard, CarListItem } from "@/components/car";
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
  BannerAd,
} from "@shared/schema";
import { fetchModelsByMake } from "@/lib/utils";
import { MultiSelect } from "@/components/ui/multiselect";
import { useBannerAds } from "@/hooks/use-bannerAds";
import { PriceInputCombobox } from "@/components/ui/priceinput";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CompareTool from "@/components/car/CompareTool";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Search form schema
const searchFormSchema = z.object({
  minYear: z.string().optional(),
  maxYear: z.string().optional(),

  make: z.string().optional(),
  model: z.string().optional(),
  condition: z.string().optional(),

  owner_type: z.array(z.string()).optional(),
  sort: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

const BrowseCars = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // Default to grid view
  const [comparisonList, setComparisonList] = useState<CarListing[]>([]);

  const handleAddToCompare = (car: CarListing) => {
    setComparisonList(prev => [...prev, car]);
  };

  const handleRemoveFromCompare = (id: number) => {
    setComparisonList(prev => prev.filter(c => c.id !== id));
  };

  const handleClearComparison = () => {
    setComparisonList([]);
  };
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    () => new URLSearchParams(window.location.search)
  );
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {},
  });
  const [filters, setFilters] = useState<CarListingFilters>({
    search: searchParams?.get("search") || "",
    minPrice: "all",
    maxPrice: "all",
    minYear: "",
    maxYear: "",

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
    isInspected: "all",

    ownerType: [],
    hasWarranty: "all",
    hasInsurance: "all",
    userId: "all",

    sort: "newest",
    page: 1,
    limit: 9,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Extract query params on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);

    setFilters((prev) => ({ ...prev, status: "active" }));

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

    if (params.has("user_id")) {
      // Match backend expectation
      const userIdValue = params.get("user_id") || "all";
      setFilters((prev) => ({ ...prev, userId: userIdValue }));
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
          from: prev.milesRange?.from ?? "0",
          to: maxMileValue,
        },
      }));
    }

    if (params.has("fuelType")) {
      const fuelTypes = params.getAll("fuelType");
      setFilters((prev) => ({ ...prev, fuelType: fuelTypes }));
    }
    if (params.has("transmission")) {
      const transmissions = params.getAll("transmission");
      setFilters((prev) => ({ ...prev, transmission: transmissions }));
    }
    if (params.has("engineCapacity")) {
      const engineCapacityVal = params.getAll("engineCapacity");
      setFilters((prev) => ({ ...prev, engineCapacity: engineCapacityVal }));
    }
    if (params.has("engineCapacity")) {
      const engineCapacitys = params.getAll("engineCapacity");
      setFilters((prev) => ({ ...prev, engineCapacity: engineCapacitys }));
    }
    if (params.has("cylinderCount")) {
      const cylinderCount = params.getAll("cylinderCount");
      setFilters((prev) => ({ ...prev, cylinderCount: cylinderCount }));
    }

    if (params.has("color")) {
      const colors = params.getAll("color");
      setFilters((prev) => ({ ...prev, color: colors }));
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

    if (params.has("ownerType")) {
      const ownerTypes = params.getAll("ownerType");
      setFilters((prev) => ({ ...prev, ownerType: ownerTypes }));
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

    if (params.has("isImported")) {
      const val = params.get("isImported");
      if (val === "true" || val === "false" || val === "all") {
        setFilters((prev) => ({
          ...prev,
          isImported: val,
        }));
      }
    }
    if (params.has("isInspected")) {
      const val = params.get("isInspected");
      if (val === "true" || val === "false" || val === "all") {
        setFilters((prev) => ({
          ...prev,
          isImported: val,
        }));
      }
    }
    if (params.has("hasWarranty")) {
      const val = params.get("hasWarranty");
      if (val === "true" || val === "false" || val === "all") {
        setFilters((prev) => ({
          ...prev,
          isImported: val,
        }));
      }
    }

    if (params.has("hasInsurance")) {
      const val = params.get("hasInsurance");
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

  const selectedMakeId = form.watch("make");

  // Fetch available makes for filter
  const { data: makes = [] } = useQuery<CarMake[]>({
    queryKey: ["/api/car-makes"],
  });

  const { data: models = [] } = useQuery<CarModel[]>({
    queryKey: ["car-models", selectedMakeId],
    queryFn: () => fetchModelsByMake(selectedMakeId),
    enabled: !!selectedMakeId && selectedMakeId !== "all",
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

  const { data: bannerAds = [], isLoadingBannerAds, refetch } = useBannerAds();

  // Filter banners
  const activeTopBanners = bannerAds.find(
    (b: BannerAd) => b.is_active && b.position === "top"
  );
  const activeMiddleBanners = bannerAds.filter(
    (b: BannerAd) => b.is_active && b.position === "middle"
  );
  const activeBottomBanners = bannerAds.find(
    (b: BannerAd) => b.is_active && b.position === "bottom"
  );

  // Helper to render banner
  const renderBanner = (banner: BannerAd, key: string) => (
    <div key={key} className="col-span-1 md:col-span-2 lg:col-span-3">
      <a href={banner?.link} target="_blank" rel="noopener noreferrer">
        <img
          src={banner?.image_url}
          alt={`Ad banner ${banner?.id}`}
          className="w-full max-h-[292px] object-cover rounded-3xl shadow-sm"
        />
      </a>
    </div>
  );

  const filterCars = (
    allCars: CarListing[],
    filters: CarListingFilters
  ): CarListing[] => {
    return allCars.filter((car) => {
      console.log("Evaluating car:", car);

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchFields = [
          car.title?.toLowerCase(),
          car.description?.toLowerCase(),
        ].filter(Boolean); // Remove undefined/null values

        if (!searchFields.some((field) => field?.includes(searchTerm))) {
          console.log(`Filtered out by search: ${filters.search}`);
          return false;
        }
      }

      // Price Filter
      const minPrice =
        filters?.minPrice === "all" ? 0 : parseFloat(filters?.minPrice || "0");
      const maxPrice =
        filters?.maxPrice === "all"
          ? Infinity
          : parseFloat(filters?.maxPrice || "0");
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
      const minYear =
        filters?.minYear === "all" ? 0 : parseFloat(filters?.minYear || "1900");
      const maxYear =
        filters?.maxYear === "all"
          ? Infinity
          : parseFloat(filters?.maxYear || "2025");
      const carYear = car.year;
      if (isNaN(carYear)) {
        console.warn("Invalid car year:", car.year, "for car ID:", car.id);
        return false;
      }

      if (carYear < minYear || carYear > maxYear) {
        console.log(
          `Filtered out by price: ${carYear} not in ${minYear}-${maxYear}`
        );
        return false;
      }

      // User Filter
      if (filters?.userId && filters?.userId !== "all") {
        // Convert both to string for consistent comparison
        if (car.user_id.toString() !== filters.userId.toString()) {
          console.log(
            `Filtered out by userId: car.user_id=${
              car.user_id
            } (${typeof car.user_id}), filter=${
              filters.userId
            } (${typeof filters.userId})`
          );
          return false;
        }
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
      if (
        filters?.model &&
        filters?.model !== "all" &&
        car.model_id !== Number(filters?.model)
      ) {
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
      const minMile =
        filters?.milesRange?.from === "all"
          ? 0
          : parseFloat(filters?.milesRange?.from || "0");
      const maxMile =
        filters?.milesRange?.to === "all"
          ? Infinity
          : parseFloat(filters?.milesRange?.to || "0");
      const carMile = car.mileage;

      if (isNaN(carMile)) {
        console.warn(
          "Invalid car mileage:",
          car.mileage,
          "for car ID:",
          car.id
        );
        return false;
      }

      if (carMile < minMile || carMile > maxMile) {
        console.log(
          `Filtered out by price: ${carMile} not in ${minMile}-${maxMile}`
        );
        return false;
      }

      // Fuel Type Filter
      if (
        filters.fuelType &&
        filters.fuelType.length > 0 &&
        !filters.fuelType.includes(car.fuel_type)
      ) {
        return false;
      }

      // Transmission Filter
      if (
        filters.transmission &&
        filters.transmission.length > 0 &&
        !filters.transmission.includes(car.transmission)
      ) {
        return false;
      }

      // Engine Capacity Filter
      if (
        filters.engineCapacity &&
        filters.engineCapacity.length > 0 &&
        car?.engine_capacity_id &&
        !filters.engineCapacity.includes(car.engine_Capacity_id)
      ) {
        return false;
      }
      // Cylinder Count Filter
      if (
        filters?.cylinderCount &&
        filters.cylinderCount.length > 0 &&
        car?.cylinder_count &&
        !filters.cylinderCount.includes(car.cylinder_count)
      ) {
        console.log(`Filtered out by Cylinder Count: ${car.cylinder_count}`);
        return false;
      }

      // Color Filter
      if (
        filters?.color &&
        filters?.color.length > 0 &&
        car?.color &&
        !filters.color.includes(car.color)
      ) {
        console.log(`Filtered out by Color: ${car.color}`);
        return false;
      }

      // Interior Color Filter
      if (
        filters?.interiorColor &&
        filters?.interiorColor.length > 0 &&
        car?.interior_color &&
        !filters.interiorColor.includes(car.interior_color)
      ) {
        console.log(`Filtered out by Interior Color: ${car.interior_color}`);
        return false;
      }

      // Tinted Filter
      if (filters?.tinted !== undefined && filters?.tinted !== "all") {
        const filterValue = filters?.tinted === "true";
        if (car.tinted !== filterValue) {
          console.log(
            `Filtered out by tinted: car.tinted=${car.tinted}, filter=${filters?.tinted}`
          );
          return false;
        }
      }

      // Condition Filter
      if (
        filters?.condition &&
        filters?.condition !== "all" &&
        car?.condition
      ) {
        if (car.condition !== filters?.condition) {
          console.log(
            `Filtered out by condition: car.condition_id=${car.condition}, filter=${filters?.condition}`
          );
          return false;
        }
      }

      // Location Filter
      if (
        filters?.location &&
        filters?.location.length > 0 &&
        car?.location &&
        !filters?.location.includes(car.location)
      ) {
        console.log(`Filtered out by location: ${car.location}`);
        return false;
      }

      // Featured Filter
      if (filters?.isFeatured !== undefined && filters?.isFeatured !== "all") {
        const filterValue = filters?.isFeatured === "true";
        if (car.is_featured !== filterValue) {
          console.log(
            `Filtered out by isFeatured: car.is_featured=${car.is_featured}, filter=${filters?.isFeatured}`
          );
          return false;
        }
      }

      // Imported Filter
      if (filters?.isImported !== undefined && filters?.isImported !== "all") {
        const filterValue = filters?.isImported === "true";
        if (car.is_imported !== filterValue) {
          console.log(
            `Filtered out by isImported: car.is_imported=${car.is_imported}, filter=${filters?.isImported}`
          );
          return false;
        }
      }

      // Inspected Filter
      if (
        filters?.isInspected !== undefined &&
        filters?.isInspected !== "all"
      ) {
        const filterValue = filters?.isInspected === "true";
        if (car.is_inspected !== filterValue) {
          console.log(
            `Filtered out by isInspected: car.is_inspected=${car.is_inspected}, filter=${filters?.isInspected}`
          );
          return false;
        }
      }

      // Owner Type Filter
      if (
        filters?.ownerType &&
        filters?.ownerType.length > 0 &&
        car.owner_type
      ) {
        if (car.owner_type !== filters?.ownerType) {
          console.log(
            `Filtered out by condition: car.owner_type=${car.owner_type}, filter=${filters?.ownerType}`
          );
          return false;
        }
      }

      // Has Warranty Filter
      if (
        filters?.hasWarranty !== undefined &&
        filters?.hasWarranty !== "all"
      ) {
        const filterValue = filters?.hasWarranty === "true";
        if (car.has_warranty !== filterValue) {
          console.log(
            `Filtered out by hasWarranty: car.has_warranty=${car.has_warranty}, filter=${filters?.hasWarranty}`
          );
          return false;
        }
      }

      // Has Insurance Filter
      if (
        filters?.hasInsurance !== undefined &&
        filters?.hasInsurance !== "all"
      ) {
        const filterValue = filters?.hasInsurance === "true";
        if (car.has_insurance !== filterValue) {
          console.log(
            `Filtered out by hasInsurance: car.has_insurance=${car.has_insurance}, filter=${filters?.hasInsurance}`
          );
          return false;
        }
      }

      // Status Filter
      if (filters?.status && filters?.status.length > 0 && car.status) {
        if (car.status !== filters?.status) {
          console.log(
            `Filtered out by condition: car.status=${car.status}, filter=${filters?.status}`
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

      // Add search term if it exists
      if (updatedFilters.search) params.append("search", updatedFilters.search);

      // Add all filters to URL params
      if (updatedFilters.minPrice)
        params.append("minPrice", updatedFilters.minPrice);
      if (updatedFilters.maxPrice)
        params.append("maxPrice", updatedFilters.maxPrice);
      if (updatedFilters.minYear)
        params.append("minYear", updatedFilters.minYear);
      if (updatedFilters.maxYear)
        params.append("maxYear", updatedFilters.maxYear);

      if (updatedFilters.userId)
        params.append("user_id", updatedFilters.userId); // Use user_id consistently
      if (updatedFilters.make) params.append("make", updatedFilters.make);
      if (updatedFilters.model) params.append("model", updatedFilters.model);
      if (updatedFilters.category)
        params.append("category", updatedFilters.category);

      if (updatedFilters.milesRange?.from)
        params.append("minMile", updatedFilters.milesRange?.from);
      if (updatedFilters.milesRange?.to)
        params.append("maxMile", updatedFilters.milesRange?.to);

      if (updatedFilters.fuelType && updatedFilters.fuelType.length > 0) {
        updatedFilters.fuelType.forEach((type) => {
          params.append("fuelType", type);
        });
      }
      if (
        updatedFilters.transmission &&
        updatedFilters.transmission.length > 0
      ) {
        updatedFilters.transmission.forEach((type) => {
          params.append("transmission", type);
        });
      }
      if (updatedFilters.color && updatedFilters.color.length > 0) {
        updatedFilters.color.forEach((type) => {
          params.append("color", type);
        });
      }
      if (
        updatedFilters.interiorColor &&
        updatedFilters.interiorColor.length > 0
      ) {
        updatedFilters.interiorColor.forEach((type) => {
          params.append("interiorColor", type);
        });
      }
      if (updatedFilters.tinted) params.append("tinted", updatedFilters.tinted);

      if (updatedFilters.condition)
        params.append("condition", updatedFilters.condition);

      if (updatedFilters.location) {
        updatedFilters.location.forEach((type: string) => {
          params.append("location", type);
        });
      }

      if (updatedFilters.ownerType && updatedFilters.ownerType.length > 0) {
        updatedFilters.ownerType.forEach((type) => {
          params.append("ownerType", type);
        });
      }
      if (updatedFilters.isFeatured)
        params.append("isFeatured", updatedFilters.isFeatured);

      if (updatedFilters.isImported)
        params.append("isImported", updatedFilters.isImported);
      if (updatedFilters.isInspected)
        params.append("isInspected", updatedFilters.isInspected);
      if (updatedFilters.hasWarranty)
        params.append("hasWarranty", updatedFilters.hasWarranty);
      if (updatedFilters.hasInsurance)
        params.append("hasInsurance", updatedFilters.hasInsurance);

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
      minYear: "",
      maxYear: "",

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
      isInspected: "all",

      ownerType: [],
      hasWarranty: "all",
      hasInsurance: "all",

      userId: "all",

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

  console.log("Creating sellerMap from:", sellersData);
  const sellerMap = new Map<number, UserWithStats>();
  sellersData.forEach((seller) => {
    console.log(`Mapping ${seller.id} -> ${seller.username}`);
    sellerMap.set(seller.id, seller);
  });
  console.log("Resulting map:", Object.fromEntries(sellerMap));

  const carsWithSeller = (() => {
    console.log("filteredCars:", filteredCars);
    const result = filteredCars.map((car) => {
      const seller = sellerMap.get(car.user_id);
      console.log(`Car ID ${car.id} maps to seller ID ${car.user_id}:`, seller);
      return {
        ...car,
        seller: seller || null,
      };
    });
    console.log("carsWithSeller:", result);
    return result;
  })();
  // Get only the current page's cars
  const paginatedCars = carsWithSeller.slice(
    (filters.page - 1) * filters.limit,
    filters.page * filters.limit
  );

  const currentYear = new Date().getFullYear();
  const yearSteps = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, idx) => 1900 + idx
  );

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

  return (
    <>
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {t("common.browseCars")}
          </h1>
          <div className="w-40 h-1 bg-orange-500 mx-auto rounded-full" />
        </div>

        <div className="">
          {/* Filters sidebar - desktop */}
          <div className="hidden md:block md:flex-1">
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
              <Form {...form}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Make Filter */}
                  <div>
                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>{t("car.make")}</FormLabel>
                          <MultiSelect
                            options={makeOptions}
                            selected={field.value ? [String(field.value)] : []}
                            onChange={(val: string[]) => {
                              field.onChange(val.length > 0 ? val[0] : ""); // For single-select
                            }}
                            placeholder={t("car.selectMake")}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Model Filter */}
                  <div>
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>{t("car.model")}</FormLabel>
                          <MultiSelect
                            options={modelOptions}
                            selected={field.value ? [String(field.value)] : []}
                            onChange={(val: string[]) => {
                              field.onChange(val.length > 0 ? val[0] : ""); // Single select
                            }}
                            placeholder={t("car.selectModel")}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Year Filter */}
                  <div>
                    <Label className="block text-sm font-medium mb-1">
                      {t("car.year")}
                    </Label>
                    <div className="mt-2">
                      <PriceInputCombobox
                        value={filters.minYear}
                        onChange={(value) =>
                          updateFilters({ minYear: value, maxYear: value })
                        }
                        placeholder={t("car.allYears")}
                        options={yearSteps}
                      />
                    </div>
                  </div>

                  {/* Condition Filter */}
                  <div>
                    <Label className="block text-sm font-medium mb-1">
                      {t("car.condition")}
                    </Label>
                    <Select
                      value={filters.condition}
                      onValueChange={(value) =>
                        updateFilters({ condition: value })
                      }
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

                  {/* Owner Type Filter */}
                  <div>
                    <Label className="block text-sm font-medium mb-1">
                      {t("car.ownerType")}
                    </Label>
                    <MultiSelect
                      options={[
                        { value: "first", label: t("car.first") },
                        { value: "second", label: t("car.second") },
                        { value: "third", label: t("car.third") },
                        { value: "fourth", label: t("car.fourth") },
                        { value: "fifth", label: t("car.fifth") },
                      ]}
                      selected={filters.ownerType}
                      onChange={(value) => updateFilters({ ownerType: value })}
                      placeholder={t("car.selectOwnerTypes")}
                    />
                  </div>
                </div>
              </Form>
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
                  <SelectItem value="year_high">
                    {t("car.yearHighToLow")}
                  </SelectItem>
                  <SelectItem value="year_low">
                    {t("car.yearLowToHigh")}
                  </SelectItem>
                  <SelectItem value="price_high">
                    {t("car.priceHighToLow")}
                  </SelectItem>
                  <SelectItem value="price_low">
                    {t("car.priceLowToHigh")}
                  </SelectItem>
                  <SelectItem value="mileage_high">
                    {t("car.mileageHighToLow")}
                  </SelectItem>
                  <SelectItem value="mileage_low">
                    {t("car.mileageLowToHigh")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results header */}
            <div className="bg-white rounded-lg pt-4 pb-4 flex justify-between items-center mb-6 flex-wrap gap-4">
              {/* Left: Listing count */}
              <div>
                <p className="text-neutral-600">
                  {isLoading ? (
                    <span className="flex items-center">
                      <LoaderCircle className="animate-spin mr-2" size={16} />
                      {t("common.loading")}
                    </span>
                  ) : totalCars > 0 ? (
                    filters.userId && filters.userId !== "all" ? (
                      <>
                        {totalCars} {t("common.carsFound")} from{" "}
                        <span className="font-semibold text-orange-500">
                          {filteredCars[0]?.showroom_name ||
                            carsWithSeller[0]?.seller?.first_name}
                        </span>
                      </>
                    ) : (
                      `${totalCars} ${t("common.carsFound")}`
                    )
                  ) : (
                    t("common.noResults")
                  )}
                </p>
              </div>

              {/* Right: Toggle view + Sort options */}
              <div className="flex items-center gap-4 ml-auto">
                {/* Toggle view options */}
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

                {/* Sort options */}
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
                    <SelectItem value="year_high">
                      {t("car.yearHighToLow")}
                    </SelectItem>
                    <SelectItem value="year_low">
                      {t("car.yearLowToHigh")}
                    </SelectItem>
                    <SelectItem value="price_high">
                      {t("car.priceHighToLow")}
                    </SelectItem>
                    <SelectItem value="price_low">
                      {t("car.priceLowToHigh")}
                    </SelectItem>
                    <SelectItem value="mileage_high">
                      {t("car.mileageHighToLow")}
                    </SelectItem>
                    <SelectItem value="mileage_low">
                      {t("car.mileageLowToHigh")}
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
              <>
                {/* Top Banner */}
                {activeTopBanners &&
                  renderBanner(activeTopBanners, `top-${activeTopBanners.id}`)}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-7 mb-7">
                  {paginatedCars.flatMap((car, index) => {
                    const carWithSeller = carsWithSeller.find(
                      (c) => c.id === car.id
                    );
                    const elements = [];

                    if (carWithSeller) {
                      elements.push(
                        <CarCard
                          key={`car-${car.id}`}
                          car={carWithSeller}
                          onAddToCompare={handleAddToCompare}
                          onRemoveFromCompare={handleRemoveFromCompare}
                          isCompared={comparisonList.some(
                            (c) => c.id === car.id
                          )}
                        />
                      );
                    }

                    // After every 2 items (not rows, unless you control row count)
                    if ((index + 1) % 3 === 0) {
                      const bannerIndex =
                        Math.floor(index / 2) % activeMiddleBanners.length;
                      const banner = activeMiddleBanners[bannerIndex];
                      if (banner) {
                        elements.push(
                          renderBanner(banner, `middle-${banner.id}-${index}`)
                        );
                      }
                    }

                    return elements;
                  })}
                </div>

                {/* Bottom Banner */}
                {activeBottomBanners &&
                  renderBanner(
                    activeBottomBanners,
                    `bottom-${activeBottomBanners.id}`
                  )}
              </>
            ) : (
              <>
                {/* Top Banner */}
                {activeTopBanners &&
                  renderBanner(activeTopBanners, `top-${activeTopBanners.id}`)}

                <div className="w-full mt-7 mb-7 space-y-6">
                  {paginatedCars.flatMap((car, index) => {
                    const carWithSeller = carsWithSeller.find(
                      (c) => c.id === car.id
                    );
                    const elements: JSX.Element[] = [];

                    if (carWithSeller) {
                      elements.push(
                        <CarListItem
                          key={`car-${car.id}`}
                          car={carWithSeller}
                        />
                      );
                    }

                    // After every 3 items
                    if ((index + 1) % 3 === 0) {
                      const bannerIndex =
                        Math.floor(index / 3) % activeMiddleBanners.length;
                      const banner = activeMiddleBanners[bannerIndex];
                      if (banner) {
                        elements.push(
                          <div
                            key={`middle-${banner.id}-${index}`}
                            className="w-full"
                          >
                            <a
                              href={banner.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={banner.image_url}
                                alt={`Ad banner ${banner.id}`}
                                className="w-full max-h-[350px] object-cover rounded-xl shadow-sm"
                              />
                            </a>
                          </div>
                        );
                      }
                    }

                    return elements;
                  })}
                </div>

                {/* Bottom Banner */}
                {activeBottomBanners &&
                  renderBanner(
                    activeBottomBanners,
                    `bottom-${activeBottomBanners.id}`
                  )}
              </>
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
          <div className="bg-white h-full w-full p-4 ml-auto flex flex-col animate-in slide-in-from-right">
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
                  value={filters.isImported ?? "all"}
                  onValueChange={(value) =>
                    updateFilters({ isImported: value })
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
            </div>
          </div>
        </div>
      )}

<CompareTool 
        comparisonList={comparisonList}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearComparison}
      />     
    </div>
     {/* Compare dialog in parent */}

    </>
  );
};

export default BrowseCars;
