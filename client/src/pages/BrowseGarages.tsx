import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { CarMake } from "@shared/schema";
import { GarageCard } from "@/components/showroom/GarageCard";
import CarSearchForm from "@/components/car/CarSearchForm";
import { MultiSelect } from "@/components/ui/multiselect";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom"; // or `next/router` for Next.js
import { fetchModelsByMake } from "@/lib/utils";

const BrowseGarages = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [isMobileService, setIsMobileService] = useState<boolean | null>(null);
  const [maxDistance, setMaxDistance] = useState<string>("0");
  const [carYear, setCarYear] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [searchParams] = useSearchParams();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigate = useNavigate();

  const makesParam = searchParams.getAll("make");
  const modelsParam = searchParams.getAll("model");
  const servicesParam = searchParams.getAll("service");

  useEffect(() => {
    const distanceParam = searchParams.get("distance");
    const mobileParam = searchParams.get("mobile");
    const yearParam = searchParams.get("minYear");
    const sortParam = searchParams.get("sort");
    const searchParam = searchParams.get("search")?.trim();

    // Only update state if URL params exist
    if (makesParam.length) setSelectedMakes(makesParam);
    if (modelsParam.length) setSelectedModels(modelsParam);
    if (servicesParam.length) setSelectedServices(servicesParam);
    if (distanceParam) setMaxDistance(distanceParam);
    if (mobileParam) setIsMobileService(mobileParam === "true");
    if (yearParam) setCarYear(yearParam);
    if (sortParam) setSortBy(sortParam);
    if (searchParam) setSearchTerm(searchParam);

    setIsInitialLoad(false);
  }, [searchParams]);

  const distanceOptions = [
    { value: "0", label: t("common.showAll") }, // Add this as the first option
    { value: "5", label: "5 km" },
    { value: "10", label: "10 km" },
    { value: "25", label: "25 km" },
    { value: "50", label: "50 km" },
    { value: "100", label: "100 km" },
    { value: "200", label: "200 km" },
  ];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError(error.message);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  const { data: showrooms, isLoading } = useQuery({
    queryKey: ["/api/garages"],
    queryFn: () => apiRequest("GET", "/api/garages").then((res) => res.json()),
  });

  const { data: makes } = useQuery({
    queryKey: ["/api/car-makes"],
    queryFn: () =>
      apiRequest("GET", "/api/car-makes").then((res) => res.json()),
  });

  const { data: models = [] } = useQuery({
    queryKey: ["car-models", makesParam[0]],
    queryFn: () => fetchModelsByMake(makesParam[0]),
    enabled: !!makesParam[0],
  });

  const { data: showroomMakes } = useQuery({
    queryKey: ["/api/showrooms/service/makes"],
    queryFn: () =>
      apiRequest("GET", "/api/showrooms/service/makes").then((res) =>
        res.json()
      ),
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
    queryFn: () => apiRequest("GET", "/api/services").then((res) => res.json()),
  });

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    },
    []
  );

  // Fetch services and geocode addresses
  const { data: showroomsWithServices } = useQuery({
    queryKey: ["showrooms-with-services"],
    queryFn: async () => {
      if (!showrooms) return [];

      setIsGeocoding(true);
      let processedCount = 0;

      const showroomsData = await Promise.all(
        showrooms.map(async (showroom: any) => {
          try {
            const servicesResponse = await apiRequest(
              "GET",
              `/api/showrooms/${showroom.id}/services`
            ).then((res) => res.json());

            // Transform services
            const uniqueServices = Array.from(
              new Map(
                servicesResponse.map((item: any) => [
                  item.id,
                  {
                    id: item.id,
                    image: item.image,
                    name: item.name,
                    nameAr: item.name_ar,
                    price: item.price,
                  },
                ])
              ).values()
            );

            // Calculate distance if user location is available and showroom has address
            let distance = null;
            if (userLocation && showroom.location) {
              const [lat, lng] = showroom.location.split(",").map(Number);
              if (!isNaN(lat) && !isNaN(lng)) {
                distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  lat,
                  lng
                );
              }
            }

            return {
              ...showroom,
              services: uniqueServices,
              distance,
            };
          } catch (error) {
            console.error(`Failed to process showroom ${showroom.id}`, error);
            processedCount++;
            setGeocodingProgress(
              Math.round((processedCount / showrooms.length) * 100)
            );
            return {
              ...showroom,
              services: [],
              distance: null,
            };
          }
        })
      );

      setIsGeocoding(false);
      return showroomsData;
    },
    enabled: !!showrooms && !!userLocation,
  });

  const filteredShowrooms = showroomsWithServices
    ?.filter((showroom: any) => {
      const matchesSearch =
        searchTerm === "" ||
        showroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        showroom.nameAr?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by makes
      const matchesMakes =
        selectedMakes.length === 0 ||
        (showroomMakes &&
          showroomMakes.some(
            (sm: any) =>
              sm.showroom_id === showroom.id &&
              selectedMakes.includes(sm.make_id.toString())
          ));

      // Filter by services
      const matchesServices =
        selectedServices.length === 0 ||
        (showroom.services &&
          showroom.services.some((service: any) =>
            selectedServices.includes(service.id.toString())
          ));

      // Only filter by distance if maxDistance is explicitly set and userLocation exists
      const matchesDistance =
        !userLocation ||
        maxDistance === "0" || // Add a "0" option for "Show all"
        !showroom.distance ||
        showroom.distance <= Number(maxDistance);

      // Filter by mobile service
      const matchesMobileService =
        isMobileService === null ||
        showroom.is_mobile_service === isMobileService;

      return (
        matchesSearch &&
        matchesMakes &&
        matchesServices &&
        matchesDistance &&
        matchesMobileService
      );
    })
    ?.sort((a: any, b: any) => {
      switch (sortBy) {
        case "distance":
          // Only sort by distance if userLocation exists
          if (!userLocation) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        case "featured":
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        case "availability":
          return (b.availability ? 1 : 0) - (a.availability ? 1 : 0);
        default:
          return 0;
      }
    });

  // Handle service checkbox changes
  const handleServiceChange = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const renderGarages = () => {
    if (isLoading || isGeocoding) {
      return (
        <div className="space-y-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-lg" />
          ))}
          {isGeocoding && (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Geocoding addresses... {geocodingProgress}%</span>
            </div>
          )}
        </div>
      );
    }

    if (!filteredShowrooms || filteredShowrooms.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <p className="text-slate-500">{t("common.noGarageFound")}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {filteredShowrooms.map((garage: any) => (
          <GarageCard
            key={garage.id}
            garage={garage}
            isList={true}
            distance={garage.distance}
            showDistance={sortBy === "distance"}
            selectedServiceId={selectedServices.map(Number)}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (isInitialLoad) return;

    const params = new URLSearchParams();

    selectedMakes.forEach((make) => params.append("make", make));
    selectedModels.forEach((model) => params.append("model", model));
    if (maxDistance !== "0") params.set("distance", maxDistance);
    if (isMobileService !== null)
      params.set("mobile", isMobileService.toString());
    selectedServices.forEach((service) => params.append("service", service));
    if (searchTerm) params.set("search", searchTerm);
    if (sortBy) params.set("sort", sortBy);

    navigate({ search: params.toString() }, { replace: true });
  }, [
    selectedMakes,
    selectedModels,
    selectedServices,
    maxDistance,
    isMobileService,
    sortBy,
    searchTerm,
  ]);

  const displayCarInfo = () => {
    const carParts = [];
    // Year
    const year = searchParams.get("minYear") || carYear;
    if (year) carParts.push(year);

    // Make - use URL param first, then state
    const makeIds = makesParam.length ? makesParam : selectedMakes;
    if (makeIds.length && makes) {
      const makeNames = makeIds
        .map((id) => makes.find((m) => m.id.toString() === id)?.name)
        .filter(Boolean);
      if (makeNames.length) carParts.push(makeNames.join(", "));
    }

    // Model - use URL param first, then state
    const modelIds = modelsParam.length ? modelsParam : selectedModels;
    if (modelIds.length && models) {
      const modelNames = modelIds
        .map((id) => {
          const model = models.find((m) => m.id.toString() === id);
          return model?.name;
        })
        .filter(Boolean);
      if (modelNames.length) carParts.push(modelNames.join(", "));
    }

    // Services - show loading state if services aren't loaded yet
    if (!services) {
      return "Loading services...";
    }

    // Services - use URL param first, then state
    const serviceIds = searchParams.getAll("service").length
      ? searchParams.getAll("service")
      : selectedServices;
    let servicesString = "All Services";
    if (serviceIds.length) {
      const serviceNames = serviceIds
        .map((id) => services.find((s) => s.id.toString() === id)?.name)
        .filter(Boolean);
      if (serviceNames.length) servicesString = serviceNames.join(", ");
    }

    return carParts.length
      ? `Selected Car: ${carParts.join(" ")} | Service: ${servicesString}`
      : `Service: ${servicesString}`;
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {t("common.browseGarages")}
          </h1>
          <div className="w-40 h-1 bg-orange-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Filters */}
          <div className="bg-neutral-50 p-5 rounded-lg lg:col-span-1 space-y-6">
            <div className="p-4 mb-4 rounded-lg text-sm text-neutral-800">
              <h2 className="text-blue-900 font-bold text-lg">Your Car:</h2>
              <p className="font-semibold">{displayCarInfo()}</p>
            </div>

            {/* Search Results Count */}
            <div className="p-4 rounded-lg">
              <p className="font-medium">
                {filteredShowrooms?.length || 0} {t("common.resultsFound")}
              </p>
              {locationError && (
                <p className="text-sm text-red-500 mt-1">{locationError}</p>
              )}
            </div>

            {/* Search Bar */}
            <div>
              <Label className="block mb-2 font-medium">
                {t("common.search")}
              </Label>
              <Input
                placeholder={t("common.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Distance Filter - Dropdown version */}
            {userLocation && (
              <div>
                <Label className="block mb-2 font-medium">
                  {t("common.distance")}
                </Label>
                <Select value={maxDistance} onValueChange={setMaxDistance}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select distance" />
                  </SelectTrigger>
                  <SelectContent>
                    {distanceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Car Makes Multi-Select */}
            <div>
              <Label className="block mb-2 font-medium">
                {t("common.makes")}
              </Label>
              <MultiSelect
                options={
                  makes?.map((make: CarMake) => ({
                    value: make.id.toString(),
                    label: make.name,
                    icon: (
                      <img
                        src={make.image || "https://placehold.co/24x24"}
                        alt={make.name}
                        className="w-6 h-6 mr-2"
                      />
                    ),
                  })) || []
                }
                selected={selectedMakes}
                onChange={setSelectedMakes}
                placeholder={t("common.selectMakes")}
              />
            </div>

            {/* Services Checkboxes */}
            <div>
              <Label className="block mb-2 font-medium">
                {t("common.service")}
              </Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-services"
                    checked={selectedServices.length === 0}
                    onCheckedChange={() => setSelectedServices([])}
                  />
                  <Label htmlFor="all-services">
                    {t("common.allServices")}
                  </Label>
                </div>

                {services?.map((service: any) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={selectedServices.includes(service.id.toString())}
                      onCheckedChange={() =>
                        handleServiceChange(service.id.toString())
                      }
                    />
                    <Label
                      htmlFor={`service-${service.id}`}
                      className="flex items-center gap-2"
                    >
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-5 h-5 object-contain"
                      />
                      {service.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Service Filter */}
            <div className="space-y-3">
              <Label className="block font-medium">Mobile Service</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mobile-service-all"
                  checked={isMobileService === null}
                  onCheckedChange={() => setIsMobileService(null)}
                />
                <Label htmlFor="mobile-service-all">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mobile-service-yes"
                  checked={isMobileService === true}
                  onCheckedChange={() => setIsMobileService(true)}
                />
                <Label htmlFor="mobile-service-yes">Mobile Service Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mobile-service-no"
                  checked={isMobileService === false}
                  onCheckedChange={() => setIsMobileService(false)}
                />
                <Label htmlFor="mobile-service-no">
                  Non-Mobile Service Only
                </Label>
              </div>
            </div>

            {/* Clear Filters Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSelectedMakes([]);
                setSelectedModels([]);
                setSelectedServices([]);
                setSearchTerm("");
                setMaxDistance("50");
                setSortBy("distance");
                setIsMobileService(null);
              }}
            >
              {t("common.clearFilters")}
            </Button>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-3 space-y-6">
            <CarSearchForm is_garage={true} />
            <div className="space-y-2 w-fit ml-auto">
              {/* Sort Options */}
              <div className="flex items-center gap-2 w-fit ml-auto">
                <Label className="font-medium">{t("common.sortBy")}</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    {" "}
                    {/* Optional: set width */}
                    <SelectValue placeholder="Select sort option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">
                      {t("common.distance")}
                    </SelectItem>
                    <SelectItem value="featured">
                      {t("common.featured")}
                    </SelectItem>
                    <SelectItem value="availability">
                      {t("common.availability")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {renderGarages()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseGarages;
