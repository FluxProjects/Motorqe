import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/lib/queryClient";
import {
  CarListingFilters,
  CarCategory,
  CarMake,
  CarModel,
} from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterX } from "lucide-react";
import { fetchModelsByMake } from "@/lib/utils";

export function CarSearchFilters() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useState<URLSearchParams>();
  
  const [filters, setFilters] = useState<CarListingFilters>({
    make: "all",
    model: "all",
    minPrice: "all",
    maxPrice: "all",
    category: "all",
    condition: "all",
    location: [],
    year: [1990, new Date().getFullYear()],
    fuel_type: [],
    transmission: [],
    is_featured: "all",
    is_imported: "all",
    sort: "newest",
    page: 1,
    limit: 10,
    status: "active",
  });

  const [filtersOpen, setFiltersOpen] = useState(false);

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
      if (updatedFilters.condition)
        params.append("condition", updatedFilters.condition);
      if (updatedFilters.is_imported)
        params.append("is_imported", updatedFilters.is_imported);
      if (updatedFilters.is_featured)
        params.append("is_featured", updatedFilters.is_featured);
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
      condition: "all",
      location: [],
      year: [1990, new Date().getFullYear()],
      fuel_type: [],
      transmission: [],
      is_imported: "all",
      is_featured: "all",
      sort: "newest",
      page: 1,
      limit: 10,
      status: "active",
    });

    // Clear URL params and navigate to /browse
    window.history.pushState({ path: "/browse" }, "", "/browse");
    setSearchParams(new URLSearchParams());
  };

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
      if (params.has("condition")) {
        const conditionValue = params.get("condition") || "";
        setFilters((prev) => ({ ...prev, condition: conditionValue }));
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
  
      if (params.has("is_featured")) {
        const val = params.get("is_featured");
        if (val === "true" || val === "false" || val === "all") {
          setFilters((prev) => ({
            ...prev,
            is_featured: val,
          }));
        }
      }
  
      if (params.has("is_imported")) {
        const val = params.get("is_imported");
        if (val === "true" || val === "false" || val === "all") {
          setFilters((prev) => ({
            ...prev,
            is_imported: val,
          }));
        }
      }
    }, []);

  return (
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
              <SelectItem value="all">{t("car.allConditions")}</SelectItem>
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
              <SelectItem value="all">{t("car.allCategories")}</SelectItem>
              {categories?.map((category: CarCategory) => (
                <SelectItem key={category.id} value={category.id.toString()}>
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
            onValueChange={(value) => updateFilters({ is_imported: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("car.allImports")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("car.allImports")}</SelectItem>
              <SelectItem value="true">{t("common.isImported")}</SelectItem>
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
                {filters.year ? filters.year[1] : new Date().getFullYear()}
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
              onValueChange={(value) => updateFilters({ minPrice: value })}
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
              onValueChange={(value) => updateFilters({ maxPrice: value })}
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
            {["gasoline", "diesel", "electric", "hybrid"].map((fuel_type) => (
              <div key={fuel_type} className="flex items-center">
                <Checkbox
                  id={fuel_type}
                  checked={filters.fuel_type.includes(fuel_type)}
                  onCheckedChange={(checked) => {
                    const updatedFuel_types = checked
                      ? [...filters.fuel_type, fuel_type]
                      : filters.fuel_type.filter((type) => type !== fuel_type);
                    updateFilters({ fuel_type: updatedFuel_types });
                  }}
                />
                <Label htmlFor={fuel_type} className="ml-2">
                  {t(`car.${fuel_type}`)}
                </Label>
              </div>
            ))}
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
                  checked={filters.transmission.includes(transmissionType)}
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
  );
}
