import { useState, useEffect, useMemo } from "react";
import i18n, { resources } from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Car, ChevronDown, ChevronUp } from "lucide-react";
import {
  CarCategory,
  CarEngineCapacity,
  CarMake,
  CarModel,
  CarService,
} from "@shared/schema";
import { fetchModelsByMake } from "@/lib/utils";
import { MultiSelect } from "@/components/ui/multiselect";

// Search form schema
const searchFormSchema = z.object({
  keyword: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minYear: z.string().optional(),
  maxYear: z.string().optional(),
  minMiles: z.string().optional(),
  maxMiles: z.string().optional(),

  make: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),

  fuel_type: z.array(z.string()).optional(),
  transmission: z.array(z.string()).optional(),
  engine_capacity: z.array(z.string()).optional(),
  cylinder_count: z.array(z.string()).optional(),

  color: z.array(z.string()).optional(),
  interior_color: z.array(z.string()).optional(),
  tinted: z.string().optional(),

  location: z.string().optional(),
  condition: z.string().optional(),

  owner_type: z.array(z.string()).optional(),
  is_featured: z.string().optional(),
  is_imported: z.string().optional(),
  has_warranty: z.union([z.boolean(), z.string()]).optional(),
  has_insurance: z.union([z.boolean(), z.string()]).optional(),

  status: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  service: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

type CarSearchFormProps = {
  is_garage?: boolean; // optional or required depending on your need
};

// Options for various select fields
const fuelTypeOptions = [
  { value: "gasoline", label: "Gasoline" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
];

const transmissionOptions = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
  { value: "semi-automatic", label: "Semi-Automatic" },
];

const cylinderCountOptions = [
  { value: "2", label: "2 Cylinders" },
  { value: "3", label: "3 Cylinders" },
  { value: "4", label: "4 Cylinders" },
  { value: "6", label: "6 Cylinders" },
  { value: "8", label: "8 Cylinders" },
];

const colorOptions = [
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
  { value: "silver", label: "Silver" },
  { value: "golden", label: "Golden" },
  { value: "gray", label: "Gray" },
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "pink", label: "Pink" },
];

const interiorColorOptions = [
  { value: "black", label: "Black" },
  { value: "beige", label: "Beige" },
  { value: "brown", label: "Brown" },
  { value: "gray", label: "Gray" },
];

const ownerTypeOptions = [
  { value: "first", label: "third" },
  { value: "second", label: "second" },
  { value: "third", label: "third" },
  { value: "fourth", label: "fourth" },
  { value: "fifth", label: "fifth" },
];

const conditionOptions = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "scrap", label: "Scrap" },
];

const tintedOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const CarSearchForm = ({ is_garage }: CarSearchFormProps) => {
  const { t } = useTranslation();
  const language = i18n.language;
  const direction = language === "ar" ? "rtl" : "ltr";
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<
    "all" | "new" | "scrap" | "garage"
  >(is_garage ? "garage" : "all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { reset } = useForm();

  const handleClearForm = () => {
    reset(); // This clears the entire form to default values
    setShowAdvanced(false); // Optional: hide advanced search when clearing
  };

  // Form with default values from URL
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      status: "all",
    },
  });

  const selectedMakeId = form.watch("make");

  useEffect(() => {
    form.setValue("status", activeTab);
  }, [activeTab]);

  // Fetch car makes
  const { data: makes = [] } = useQuery<CarMake[]>({
    queryKey: ["/api/car-makes"],
  });

  const { data: models = [] } = useQuery({
    queryKey: ["car-models", selectedMakeId],
    queryFn: () => fetchModelsByMake(selectedMakeId),
    enabled: !!selectedMakeId && selectedMakeId !== "all",
  });

  // Fetch car categories for filter
  const { data: categories = [] } = useQuery<CarCategory[]>({
    queryKey: ["/api/car-categories"],
  });

  const { data: carServices = [] } = useQuery<CarService[]>({
    queryKey: ["/api/services"],
  });

  // Engine capacities
  const { data: carEngineCapacities = [] } = useQuery<CarEngineCapacity[]>({
    queryKey: ["/api/car-enginecapacities"],
  });

  const engineCapacityOptions = useMemo(() => {
    if (!Array.isArray(carEngineCapacities)) return [];
    return carEngineCapacities.map((capacity) => ({
      value: capacity.id.toString(),
      label: capacity.size_liters,
    }));
  }, [carEngineCapacities]);

  const totalCount =
    categories?.reduce((sum, category) => sum + (category.count || 0), 0) || 0;

  // Handle search form submission
  const onSubmit = (values: SearchFormValues) => {
    const params = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "all" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return; // skip empty or default 'all' values
      }

      // Arrays: append multiple entries with same key
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== "" && v !== "all") {
            params.append(key, v.toString());
          }
        });
      }
      // Boolean values (like hasWarranty, hasInsurance)
      else if (typeof value === "boolean") {
        params.append(key, value ? "true" : "false");
      }
      // Sometimes boolean might come as string "true" or "false"
      else if (value === "true" || value === "false") {
        params.append(key, value);
      } else {
        params.append(key, value.toString());
      }
    });

    // Determine the base URL based on active tab
    const baseUrl = activeTab === "garage" ? "/browse-garages" : "/browse";
    const queryString = params.toString();
    const url = `${baseUrl}${queryString ? `?${queryString}` : ""}`;
    navigate(url);
  };
  // Determine which default fields to show based on active tab
  const showDefaultField = (fieldName: keyof SearchFormValues) => {
    if (activeTab === "all") {
      // Show these fields by default for "all" tab
      // Hide year only if advanced search is open
      const defaultFields = ["make", "model", "condition"];
      if (!showAdvanced) {
        defaultFields.push("minYear");
      }
      return defaultFields.includes(fieldName);
    }
    if (activeTab === "new") {
      return ["make", "model", "minPrice", "maxPrice", "owner_type"].includes(
        fieldName
      );
    }
    if (activeTab === "scrap") {
      return ["make", "model", "minYear"].includes(fieldName);
    }
    if (activeTab === "garage") {
      return ["make", "model", "minYear", "service"].includes(fieldName);
    }
    return false;
  };

  // Determine which fields to show based on active tab
  const showField = (fieldName: keyof SearchFormValues) => {
    if (activeTab === "all") {
      return !["condition", "keyword", "category"].includes(fieldName);
    }
    if (activeTab === "new") {
      // Hide fields not relevant for new cars
      return ![
        "condition",
        "minPrice",
        "maxPrice",
        "minMiles",
        "maxMiles",
        "keyword",
        "owner_type",
        "engine_capacity",
        "location",
        "tinted",
        "category",
        "is_imported",
      ].includes(fieldName);
    }
    if (activeTab === "scrap") {
      // Hide fields not relevant for scrap cars
      return ![
        "keyword",
        "minPrice",
        "maxPrice",
        "category",
        "minMiles",
        "maxMiles",
        "fuel_type",
        "transmission",
        "engine_capacity",
        "cylinder_count",
        "color",
        "interior_color",
        "tinted",
        "condition",
        "is_featured",
        "is_imported",
        "has_warranty",
        "has_insurance",
      ].includes(fieldName);
    }
    if (activeTab === "garage") {
      // Hide fields not relevant for scrap cars
      return ![
        "keyword",
        "minPrice",
        "maxPrice",
        "category",
        "minMiles",
        "maxMiles",
        "fuel_type",
        "transmission",
        "engine_capacity",
        "cylinder_count",
        "color",
        "interior_color",
        "tinted",
        "condition",
        "is_featured",
        "is_imported",
        "has_warranty",
        "has_insurance",
        "owner_type",
        "location",
        "minYear",
        "maxYear",
      ].includes(fieldName);
    }
    return true;
  };

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
    <Card className="border-2 border-solid rounded-2xl border-neutral-700">
      <CardContent className="p-6">
        {/* Tabs for status */}
        <div className="flex flex-wrap justify-center mb-8 gap-3">
          {(is_garage ? ["garage"] : ["all", "new", "scrap", "garage"]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab as "all" | "new" | "scrap" | "garage")
                }
                className={`px-5 py-2 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "text-orange-500 border-b-4 border-b-orange-500 hover:font-bold"
                    : "text-blue-900"
                }`}
              >
                {t(`common.${tab}cars`)}
              </button>
            )
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Default Fields Section */}
            <div className="w-full flex flex-wrap justify-center gap-4">
              {/* Make */}
              {showDefaultField("make") && (
                <div className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
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
              )}

              {/* Model */}
              {showDefaultField("model") && (
                <div className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
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
              )}

              {/* Category */}
              {showDefaultField("category") && (
                <div className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t("car.category")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={t("car.selectCategory")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">
                              {t("common.all")}
                            </SelectItem>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name} ({category.count})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Condition */}
              {showDefaultField("condition") && (
                <div className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t("car.condition")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={t("car.selectCondition")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">
                              {t("common.all")}
                            </SelectItem>
                            {conditionOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Year */}
              {showDefaultField("minYear") && (
                <div className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                  <FormField
                    control={form.control}
                    name="minYear"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t("car.year")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            type="number"
                            placeholder={t("car.yearPlaceholder")}
                            min={1900}
                            max={new Date().getFullYear()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Min Price */}
              {showDefaultField("minPrice") && (
                <div className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t("car.minPrice")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            type="number"
                            placeholder={t("car.minPricePlaceholder")}
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Max Price */}
              {showDefaultField("maxPrice") && (
                <div className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t("car.maxPrice")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            type="number"
                            placeholder={t("car.maxPricePlaceholder")}
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Location */}
              {showDefaultField("location") && (
                <div className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t("common.location")}</FormLabel>
                        <FormControl>
                          <div className="relative w-full">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              placeholder={t("common.locationPlaceholder")}
                              className="w-full pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Owner Type */}
              {showDefaultField("owner_type") && (
                <div className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                  <FormField
                    control={form.control}
                    name="owner_type"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t("car.ownerType")}</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={ownerTypeOptions}
                            selected={field.value || []}
                            onChange={field.onChange}
                            placeholder={t("car.selectOwnerType")}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Car Service */}
              {showDefaultField("service") && (
                <div className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => {
                      const serviceOptions = [
                        { value: "all", label: t("common.all") },
                        ...(carServices?.map((service) => ({
                          value: String(service.id),
                          label: service.name,
                        })) ?? []),
                      ];

                      return (
                        <FormItem className="w-full">
                          <FormLabel>{t("car.service")}</FormLabel>
                          <MultiSelect
                            options={serviceOptions}
                            selected={field.value ? [String(field.value)] : []}
                            onChange={(val: string[]) => {
                              field.onChange(val.length > 0 ? val[0] : "");
                            }}
                            placeholder={t("car.selectService")}
                          />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              )}
            </div>

            {/* Advanced Filters Section */}
            {showAdvanced && (
              <div className="w-full flex flex-wrap justify-center gap-4">
                {/* Year Range */}
                {showField("minYear") && (
                  <>
                    <FormField
                      control={form.control}
                      name="minYear"
                      render={({ field }) => (
                        <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                          <FormLabel>{t("car.minYear")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder={t("car.minYearPlaceholder")}
                              min={1900}
                              max={new Date().getFullYear()}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {showField("maxYear") && (
                  <>
                    <FormField
                      control={form.control}
                      name="maxYear"
                      render={({ field }) => (
                        <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                          <FormLabel>{t("car.maxYear")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder={t("car.maxYearPlaceholder")}
                              min={1900}
                              max={new Date().getFullYear()}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Min Price */}
                {showField("minPrice") && (
                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.minPrice")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder={t("car.minPricePlaceholder")}
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Max Price */}
                {showField("maxPrice") && (
                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.maxPrice")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder={t("car.maxPricePlaceholder")}
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Miles Range */}
                {showField("minMiles") && showField("maxMiles") && (
                  <>
                    <FormField
                      control={form.control}
                      name="minMiles"
                      render={({ field }) => (
                        <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                          <FormLabel>{t("car.minMiles")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder={t("car.minMilesPlaceholder")}
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxMiles"
                      render={({ field }) => (
                        <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                          <FormLabel>{t("car.maxMiles")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder={t("car.maxMilesPlaceholder")}
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Fuel Type */}
                {showField("fuel_type") && (
                  <FormField
                    control={form.control}
                    name="fuel_type"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.fuelType")}</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={fuelTypeOptions}
                            selected={field.value || []}
                            onChange={field.onChange}
                            placeholder={t("car.selectFuelType")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Transmission */}
                {showField("transmission") && (
                  <FormField
                    control={form.control}
                    name="transmission"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.transmission")}</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={transmissionOptions}
                            selected={field.value || []}
                            onChange={field.onChange}
                            placeholder={t("car.selectTransmission")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Engine Capacity */}
                {showField("engine_capacity") && (
                  <FormField
                    control={form.control}
                    name="engine_capacity"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.engineCapacity")}</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={engineCapacityOptions}
                            selected={field.value || []}
                            onChange={field.onChange}
                            placeholder={t("car.selectEngineCapacity")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Cylinder Count */}
                {showField("cylinder_count") && (
                  <FormField
                    control={form.control}
                    name="cylinder_count"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.cylinderCount")}</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={cylinderCountOptions}
                            selected={field.value || []}
                            onChange={field.onChange}
                            placeholder={t("car.selectCylinderCount")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Color */}
                {showField("color") && (
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.color")}</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={colorOptions}
                            selected={field.value || []}
                            onChange={field.onChange}
                            placeholder={t("car.selectColor")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Interior Color */}
                {showField("interior_color") && (
                  <FormField
                    control={form.control}
                    name="interior_color"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.interiorColor")}</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={interiorColorOptions}
                            selected={field.value || []}
                            onChange={field.onChange}
                            placeholder={t("car.selectInteriorColor")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Tinted */}
                {showField("tinted") && (
                  <FormField
                    control={form.control}
                    name="tinted"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.tinted")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("car.selectTinted")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">
                              {t("common.all")}
                            </SelectItem>
                            {tintedOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Condition */}
                {showField("condition") && (
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.condition")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("car.selectCondition")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">
                              {t("common.all")}
                            </SelectItem>
                            {conditionOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Location */}
                {showField("location") && (
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("common.location")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              placeholder={t("common.locationPlaceholder")}
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Owner Type */}
                {showField("owner_type") && (
                  <FormField
                    control={form.control}
                    name="owner_type"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.ownerType")}</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={ownerTypeOptions}
                            selected={field.value || []}
                            onChange={field.onChange}
                            placeholder={t("car.selectOwnerType")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Featured */}
                {showField("is_featured") && (
                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.featured")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("car.selectFeatured")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">
                              {t("common.all")}
                            </SelectItem>
                            <SelectItem value="true">
                              {t("common.yes")}
                            </SelectItem>
                            <SelectItem value="false">
                              {t("common.no")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Imported */}
                {showField("is_imported") && (
                  <FormField
                    control={form.control}
                    name="is_imported"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.imported")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("car.selectImported")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">
                              {t("common.all")}
                            </SelectItem>
                            <SelectItem value="true">
                              {t("common.yes")}
                            </SelectItem>
                            <SelectItem value="false">
                              {t("common.no")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Warranty */}
                {showField("has_warranty") && (
                  <FormField
                    control={form.control}
                    name="has_warranty"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.warranty")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("car.selectWarranty")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">
                              {t("common.all")}
                            </SelectItem>
                            <SelectItem value="true">
                              {t("common.yes")}
                            </SelectItem>
                            <SelectItem value="false">
                              {t("common.no")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Insurance */}
                {showField("has_insurance") && (
                  <FormField
                    control={form.control}
                    name="hasInsurance"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("car.insurance")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("car.selectInsurance")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">
                              {t("common.all")}
                            </SelectItem>
                            <SelectItem value="true">
                              {t("common.yes")}
                            </SelectItem>
                            <SelectItem value="false">
                              {t("common.no")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Keyword */}
                {showField("keyword") && (
                  <FormField
                    control={form.control}
                    name="keyword"
                    render={({ field }) => (
                      <FormItem className="flex-[1_0_calc(20%-16px)] min-w-[200px] max-w-[calc(20%-16px)]">
                        <FormLabel>{t("common.keyword")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              {...field}
                              placeholder={t("search.keywordPlaceholder")}
                              className="pl-9 bg-slate-50 border-slate-200"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Search and Clear Buttons in a New Row */}
            <div className="col-span-4 flex flex-col md:flex-row justify-center items-center gap-4 mt-4">
              <Button
                type="submit"
                className="bg-orange-500 rounded-full w-full md:w-auto"
              >
                {t("common.search")}
                {activeTab !== "garage" && ` ${totalCount} Cars`}
                {activeTab === "garage" && " Services"}
              </Button>
            </div>

            <div className="col-span-4 flex justify-center mt-2">
              {/* Advanced Search Toggle */}
              {activeTab !== "garage" && (
                <Button
                  variant="link"
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-900 flex items-center gap-1"
                >
                  {showAdvanced ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      {t("common.hideAdvanced")}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      {t("common.showAdvanced")}
                    </>
                  )}
                </Button>
              )}

              <Button
                type="button"
                variant="link"
                className="text-blue-900 w-full md:w-auto"
                onClick={handleClearForm} // Ensure you define this function
              >
                {t("common.clearForm")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CarSearchForm;
