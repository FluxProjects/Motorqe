import { useState, useEffect } from "react";
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
import { Search, MapPin, Car } from "lucide-react";

// Search form schema
const searchFormSchema = z.object({
  keyword: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  is_imported: z.string().optional(),
  condition: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

const CarSearchForm = () => {
  const { t } = useTranslation();
  const language = i18n.language;
  const direction = language === "ar" ? "rtl" : "ltr";
  const [, navigate] = useLocation();

  // Get URL search params
  const getURLParams = () => {
    if (typeof window === "undefined") return {};

    const params = new URLSearchParams(window.location.search);
    const values: any = {};

    if (params.has("keyword")) values.keyword = params.get("keyword");
    if (params.has("location")) values.location = params.get("location");
    if (params.has("category")) values.category = params.get("category");
    if (params.has("condition")) values.condition = params.get("condition");
    if (params.has("is_imported")) values.is_imported = params.get("is_imported");
    if (params.has("make")) values.make = params.get("make");
    if (params.has("model")) values.model = params.get("model");
    if (params.has("minPrice")) values.minPrice = params.get("minPrice");
    if (params.has("maxPrice")) values.maxPrice = params.get("maxPrice");

    return values;
  };

  // Form with default values from URL
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: getURLParams(),
  });

  // Fetch car makes
  const { data: makes } = useQuery({
    queryKey: ["/api/car-makes"],
  });

  const fetchModelsByMake = async (makeId: string) => {
    const res = await fetch(`/api/car-models?makeId=${makeId}`);
    if (!res.ok) throw new Error("Failed to fetch models");
    return res.json();
  };

  const selectedMakeId = form.watch("make");

  // Fetch car models based on selected make
  const { data: models } = useQuery({
    queryKey: ["/api/car-models", selectedMakeId],
    queryFn: () => fetchModelsByMake(selectedMakeId!),
    enabled: !!selectedMakeId && selectedMakeId !== "all",
  });

  // Fetch car categories
  const { data: categories } = useQuery({
    queryKey: ["/api/car-categories"],
  });

  const totalCount = categories?.reduce((sum, category) => sum + (category.count || 0), 0) || 0;

  // Handle search form submission
  const onSubmit = (values: SearchFormValues) => {
    // Build query string
    const params = new URLSearchParams();

    if (values.keyword) params.append("keyword", values.keyword);
    if (values.location) params.append("location", values.location);
    if (values.category) params.append("category", values.category);
    if (values.condition) params.append("condition", values.condition);
    if (values.is_imported) params.append("is_imported", values.is_imported);
    if (values.make) params.append("make", values.make);
    if (values.model) params.append("model", values.model);
    if (values.minPrice) params.append("minPrice", values.minPrice);
    if (values.maxPrice) params.append("maxPrice", values.maxPrice);

    // Navigate to browse page with search params
    const queryString = params.toString();
    const url = `/browse${queryString ? `?${queryString}` : ""}`;
    navigate(url);
  };

  return (
    <Card className="border-2 border-solid rounded-2xl border-neutral-700">
      <CardContent className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-4"
            dir={direction}
          >
            {/* Keyword search */}
            <FormField
              control={form.control}
              name="keyword"
              render={({ field }) => (
                <FormItem className="col-span-4 md:col-span-1">
                  <FormLabel className="text-slate-500">
                    {t("common.keyword")}
                  </FormLabel>
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

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="col-span-4 md:col-span-1">
                  <FormLabel className="text-slate-500">
                    {t("common.location")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        {...field}
                        placeholder={t("search.locationPlaceholder")}
                        className="pl-9 bg-slate-50 border-slate-200"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="col-span-4 md:col-span-1">
                  <FormLabel className="text-slate-500">
                    {t("common.category")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder={t("search.selectCategory")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("common.allCategories")}
                      </SelectItem>
                      {Array.isArray(categories) &&
                        categories.map((category: any) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {language === "ar" && category.nameAr
                              ? category.nameAr
                              : category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Make */}
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem className="col-span-4 md:col-span-1">
                  <FormLabel className="text-slate-500">
                    {t("car.make")}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("model", ""); // Reset model when make changes
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder={t("search.selectMake")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">{t("car.allMakes")}</SelectItem>
                      {Array.isArray(makes) &&
                        makes.map((make: any) => (
                          <SelectItem key={make.id} value={make.id.toString()}>
                            {make.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Model (only shown if make is selected) */}
            {form.watch("make") && (
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem className="col-span-4 md:col-span-1">
                    <FormLabel className="text-slate-500">
                      {t("car.model")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue placeholder={t("search.selectModel")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("car.allModels")}
                        </SelectItem>
                        {Array.isArray(models) &&
                          models.map((model: any) => (
                            <SelectItem
                              key={model.id}
                              value={model.id.toString()}
                            >
                              {model.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Price range */}
            <FormField
              control={form.control}
              name="minPrice"
              render={({ field }) => (
                <FormItem className="col-span-4 md:col-span-1">
                  <FormLabel className="text-slate-500">
                    {t("car.minPrice")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder={t("car.noMin")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-min">{t("car.noMin")}</SelectItem>
                      <SelectItem value="5000">$5,000</SelectItem>
                      <SelectItem value="10000">$10,000</SelectItem>
                      <SelectItem value="20000">$20,000</SelectItem>
                      <SelectItem value="30000">$30,000</SelectItem>
                      <SelectItem value="50000">$50,000</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxPrice"
              render={({ field }) => (
                <FormItem className="col-span-4 md:col-span-1">
                  <FormLabel className="text-slate-500">
                    {t("car.maxPrice")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder={t("car.noMax")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-max">{t("car.noMax")}</SelectItem>
                      <SelectItem value="10000">$10,000</SelectItem>
                      <SelectItem value="20000">$20,000</SelectItem>
                      <SelectItem value="30000">$30,000</SelectItem>
                      <SelectItem value="50000">$50,000</SelectItem>
                      <SelectItem value="100000">$100,000</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Search button */}
            <div className="col-span-4 flex justify-center mt-4">
              <Button
                type="submit"
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 font-semibold px-6 py-2 rounded-full"
              >
                <Search className="mr-2 h-4 w-4" />
                {t("common.search")} {totalCount || '0'} Cars
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CarSearchForm;
