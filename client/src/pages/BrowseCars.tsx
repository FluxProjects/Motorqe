import { useState, useEffect, useMemo } from "react";
import i18n, { resources } from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
  Filters,
  CarCategory,
  CarMake,
  CarsData,
  CarListing,
  UserWithStats,
  User
} from "@shared/schema";

const BrowseCars = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // Default to grid view
  const [searchParams, setSearchParams] = useState<URLSearchParams>();
  const [filters, setFilters] = useState<Filters>({
    make: "all",
    model: "all",
    minPrice: "all",
    maxPrice: "all",
    category: "all",
    location: [],
    year: [1990, new Date().getFullYear()],
    fuel_type: [],
    transmission: [],
    isFeatured: null,
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
    if (params.has("make")) {
      const makeValue = params.get("make") || "all";
      setFilters((prev) => ({ ...prev, make: makeValue }));
    }
    if (params.has("category")) {
      const categoryValue = params.get("category") || "all";
      setFilters((prev) => ({ ...prev, category: categoryValue }));
    }
    if (params.has("model")) {
      const modelValue = params.get("model") || "";
      setFilters((prev) => ({ ...prev, model: modelValue }));
    }
    if (params.has("minPrice")) {
      const minPriceValue = params.get("minPrice") || "";
      setFilters((prev) => ({ ...prev, minPrice: minPriceValue }));
    }
    if (params.has("maxPrice")) {
      const maxPriceValue = params.get("maxPrice") || "";
      setFilters((prev) => ({ ...prev, maxPrice: maxPriceValue }));
    }

    if (params.has("page"))
      setFilters((prev) => ({
        ...prev,
        page: parseInt(params.get("page") || "1"),
      }));

    // Handle fuel types array
    if (params.has("fuel_type")) {
      const fuel_types = params.getAll("fuel_type");
      setFilters((prev) => ({ ...prev, fuel_type: fuel_types }));
    }

    // Handle transmissions array
    if (params.has("transmission")) {
      const transmissions = params.getAll("transmission");
      setFilters((prev) => ({ ...prev, transmission: transmissions }));
    }

    // Handle location array
    if (params.has("location")) {
      const locations = params.getAll("location");
      setFilters((prev) => ({ ...prev, location: locations }));
    }

    // Handle year range
    if (params.has("minYear") && params.has("maxYear")) {
      setFilters((prev) => ({
        ...prev,
        year: [
          parseInt(params.get("minYear") || "1990"),
          parseInt(params.get("maxYear") || "2023"),
        ],
      }));
    }

    // Handle sort
    if (params.has("sort")) {
      setFilters((prev) => ({ ...prev, sort: params.get("sort")! }));
    }

    if (params.has("isFeatured")) {
      const val = params.get("isFeatured");
      setFilters((prev) => ({
        ...prev,
        isFeatured: val === "true" ? true : val === "false" ? false : null,
      }));
    }

  }, []);

  // Fetch available makes for filter
  const { data: makes = [] } = useQuery<CarMake[]>({
    queryKey: ["/api/car-makes"],
  });

  // Fetch car categories for filter
  const { data: categories = [] } = useQuery<CarCategory[]>({
    queryKey: ["/api/car-categories"],
  });

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
   const {
    data: sellersData = [],
  } = useQuery<User[]>({
    queryKey: ['car-sellers', carsData?.map(c => c.user_id).sort().join(',')], // Use user_id here
    enabled: !!carsData?.length,
    queryFn: async () => {
      if (!carsData || carsData.length === 0) return []; // Early return if no cars
      
      // Debugging the structure of carsData and user_id mapping
      console.log('Cars Data:', carsData);
      const userIds = Array.from(new Set(carsData.map(car => car.user_id))); // Use user_id
      console.log('User IDs:', userIds); // Debug the user IDs
      
      const res = await fetch(`/api/get-users?ids=${userIds.join(',')}`);
      console.log('Response Status:', res.status); // Log the response status
    const responseBody = await res.json();
    console.log('Response Body:', responseBody); // Log the response body

    return responseBody;
    },
  });
  

  const filterCars = (
    allCars: CarListing[],
    filters: Filters
  ): CarListing[] => {
    return allCars.filter((car) => {
      console.log("Evaluating car:", car);
  
      if (filters.make && filters.make !== "all") {
        if (car.make_id !== Number(filters.make)) {
          console.log(`Filtered out by make: car.make_id=${car.make_id}, filter=${filters.make}`);
          return false;
        }
      }
  
      if (
        filters.model &&
        filters.model !== "all" &&
        car.modelId !== Number(filters.model)
      ) {
        console.log(`Filtered out by model: car.modelId=${car.modelId}, filter=${filters.model}`);
        return false;
      }
  
      if (filters.category && filters.category !== "all") {
        if (car.category_id !== Number(filters.category)) {
          console.log(`Filtered out by category: car.category_id=${car.category_id}, filter=${filters.category}`);
          return false;
        }
      }
  
      const minPrice =
        filters.minPrice === "all" ? 0 : parseFloat(filters.minPrice);
      const maxPrice =
        filters.maxPrice === "all" ? Infinity : parseFloat(filters.maxPrice);
  
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
  
      if (car.year < filters.year[0] || car.year > filters.year[1]) {
        console.log(
          `Filtered out by year: ${car.year} not in ${filters.year[0]}-${filters.year[1]}`
        );
        return false;
      }
  
      if (
        filters.fuel_type.length > 0 &&
        !filters.fuel_type.some(
          (type) => car.fuel_type.toLowerCase() === type.toLowerCase()
        )
      ) {
        console.log(`Filtered out by fuel_type: ${car.fuel_type}`);
        return false;
      }
  
      if (
        filters.transmission.length > 0 &&
        !filters.transmission.includes(car.transmission)
      ) {
        console.log(`Filtered out by transmission: ${car.transmission}`);
        return false;
      }

      if (
        filters.location.length > 0 &&
        !filters.location.some(
          (type) => car.location.toLowerCase() === type.toLowerCase()
        )
      ) {
        console.log(`Filtered out by location: ${car.location}`);
        return false;
      }
  
      if (
        filters.isFeatured !== null &&
        filters.isFeatured !== undefined &&
        car.is_featured !== filters.isFeatured
      ) {
        console.log(`Filtered out by isFeatured: ${car.is_featured}`);
        return false;
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
      if (updatedFilters.make) params.append("make", updatedFilters.make);
      if (updatedFilters.model) params.append("model", updatedFilters.model);
      if (updatedFilters.minPrice)
        params.append("minPrice", updatedFilters.minPrice);
      if (updatedFilters.maxPrice)
        params.append("maxPrice", updatedFilters.maxPrice);
      if (updatedFilters.category)
        params.append("category", updatedFilters.category);

      // Handle arrays
      updatedFilters.fuel_type.forEach((type: string) => {
        params.append("fuel_type", type);
      });

      updatedFilters.transmission.forEach((type: string) => {
        params.append("transmission", type);
      });

      updatedFilters.location.forEach((type: string) => {
        params.append("location", type);
      });

      // Handle year range
      if (updatedFilters.year) {
        params.append("minYear", updatedFilters.year[0].toString());
        params.append("maxYear", updatedFilters.year[1].toString());
      }

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
      make: "all",
      model: "all",
      minPrice: "all",
      maxPrice: "all",
      category: "all",
      location: [],
      year: [1990, new Date().getFullYear()],
      fuel_type: [],
      transmission: [],
      isFeatured: null,
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
      console.log(`Mapping seller ID ${seller.id} to username ${seller.username}`); // ✅ Confirm map entries
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
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">
          {t("common.browseCars")}
        </h1>

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
                <div className="space-y-2 mt-1">
                  {["gasoline", "diesel", "electric", "hybrid"].map(
                    (fuel_type) => (
                      <div key={fuel_type} className="flex items-center">
                        <Checkbox
                          id={fuel_type}
                          checked={filters.fuel_type.includes(fuel_type)}
                          onCheckedChange={(checked) => {
                            const updatedFuel_types = checked
                              ? [...filters.fuel_type, fuel_type]
                              : filters.fuel_type.filter(
                                  (type) => type !== fuel_type
                                );
                            updateFilters({ fuel_type: updatedFuel_types });
                          }}
                        />
                        <Label htmlFor={fuel_type} className="ml-2">
                          {t(`car.${fuel_type}`)}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Transmission */}
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  {t("car.transmission")}
                </Label>
                <div className="space-y-2 mt-1">
                  {["automatic", "manual"].map((transmissionType) => (
                    <div key={transmissionType} className="flex items-center">
                      <Checkbox
                        id={transmissionType}
                        checked={filters.transmission.includes(
                          transmissionType
                        )}
                        onCheckedChange={(checked) => {
                          const updatedTransmission = checked
                            ? [...filters.transmission, transmissionType]
                            : filters.transmission.filter(
                                (type) => type !== transmissionType
                              );
                          updateFilters({ transmission: updatedTransmission });
                        }}
                      />
                      <Label htmlFor={transmissionType} className="ml-2">
                        {t(`car.${transmissionType}`)}
                      </Label>
                    </div>
                  ))}
                </div>
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
                  const carWithSeller = carsWithSeller.find((c) => c.id === car.id);
                  return carWithSeller ? (
                    <CarCard key={car.id} car={carWithSeller} />
                  ) : null;
                })}
              </div>
            ) : (
              // List view
              <div className="space-y-4">
                {paginatedCars.map((car) => {
                  const carWithSeller = carsWithSeller.find((c) => c.id === car.id);
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
