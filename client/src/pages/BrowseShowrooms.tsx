import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { CarMake, ShowroomService } from "@shared/schema";
import { ShowroomCard } from "@/components/showroom/ShowroomCard";
import { Wrench } from "lucide-react";

type ServiceItem = {
  id: number;
  showroom_id: number;
  service_id: number;
  price: number;
  currency: string;
  description: string;
  description_ar: string;
  is_featured: boolean;
  service: {
    id: number;
    name: string;
    nameAr: string;
    price: string;
    description: string;
    descriptionAr: string;
    image: string;
  };
  showrooms: {
    id: number;
    name: string;
    nameAr: string;
    logo: string;
    description: string;
    descriptionAr: string;
  }[];
};

const BrowseShowrooms = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMake, setSelectedMake] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedTab, setSelectedTab] = useState("all");

  const { data: showrooms, isLoading } = useQuery({
    queryKey: ["/api/showrooms"],
    queryFn: () =>
      apiRequest("GET", "/api/showrooms").then((res) => res.json()),
  });

  const { data: makes } = useQuery({
    queryKey: ["/api/car-makes"],
    queryFn: () =>
      apiRequest("GET", "/api/car-makes").then((res) => res.json()),
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

  // Fetch services for each showroom in parallel
  const { data: showroomsWithServices } = useQuery({
    queryKey: ["showrooms-with-services"],
    queryFn: async () => {
      if (!showrooms) return [];

      const showroomsData = await Promise.all(
        showrooms.map(async (showroom: any) => {
          try {
            const servicesResponse = await apiRequest(
              "GET",
              `/api/showrooms/${showroom.id}/services`
            ).then((res) => res.json());

            console.log("servicesResponse", servicesResponse);
            // Transform services to match expected structure
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

            return {
              ...showroom,
              services: uniqueServices,
            };
          } catch (error) {
            console.error(
              `Failed to fetch services for showroom ${showroom.id}`,
              error
            );
            return {
              ...showroom,
              services: [],
            };
          }
        })
      );

      return showroomsData;
    },
    enabled: !!showrooms,
  });

  console.log("showroomsWithServices", showroomsWithServices);
  const filteredShowrooms = showroomsWithServices?.filter((showroom: any) => {
    const matchesSearch =
      showroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      showroom.nameAr?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by make
    const matchesMake =
      selectedTab !== "makes" ||
      selectedMake === "all" ||
      (showroomMakes &&
        showroomMakes.some(
          (sm: any) =>
            sm.showroom_id === showroom.id &&
            sm.make_id.toString() === selectedMake
        ));

    // Filter by service
    const matchesService =
      selectedTab !== "services" ||
      selectedService === "all" ||
      (showroom.services &&
        showroom.services.some(
          (service: any) => service.id.toString() === selectedService
        ));

    return matchesSearch && matchesMake && matchesService;
  });

  const renderShowrooms = () =>
    isLoading ? (
      Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-80 w-full rounded-lg" />
      ))
    ) : filteredShowrooms && filteredShowrooms?.length > 0 ? (
      filteredShowrooms.map((showroom: any) => (
        <ShowroomCard key={showroom.id} showroom={showroom} />
      ))
    ) : (
      <div className="col-span-full text-center py-12">
        <p className="text-slate-500">{t("showroom.noShowroomsFound")}</p>
      </div>
    );

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {t("common.browseShowrooms")}
          </h1>
          <div className="w-40 h-1 bg-orange-500 mx-auto rounded-full" />
        </div>

        <div className="md:flex md:gap-6">
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            defaultValue="all"
            className="w-full"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
              {/* Updated TabsList with new styling */}
              <div className="flex flex-wrap justify-left gap-3 w-full">
                <TabsList className="flex flex-wrap justify-center gap-3 bg-transparent p-0">
                  <TabsTrigger
                    value="all"
                    className={`px-5 py-2 text-sm font-medium transition-all ${
                      selectedTab === "all"
                        ? "text-orange-500 border-b-4 border-b-orange-500 hover:font-bold"
                        : "text-blue-900"
                    }`}
                  >
                    {t("showroom.allShowrooms")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="makes"
                    className={`px-5 py-2 text-sm font-medium transition-all ${
                      selectedTab === "makes"
                        ? "text-orange-500 border-b-4 border-b-orange-500 hover:font-bold"
                        : "text-blue-900"
                    }`}
                  >
                    {t("showroom.byMake")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="services"
                    className={`px-5 py-2 text-sm font-medium transition-all ${
                      selectedTab === "services"
                        ? "text-orange-500 border-b-4 border-b-orange-500 hover:font-bold"
                        : "text-blue-900"
                    }`}
                  >
                    {t("showroom.byService")}
                  </TabsTrigger>
                </TabsList>
              </div>

              <Input
                placeholder={t("showroom.searchPlaceholder")}
                className="max-w-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Rest of your existing TabsContent components remain the same */}
            <TabsContent value="all">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {renderShowrooms()}
              </div>
            </TabsContent>

            <TabsContent value="makes">
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge
  onClick={() => setSelectedMake("all")}
  className={`cursor-pointer ${
    selectedMake === "all"
      ? "bg-blue-900 text-white"
      : "border border-blue-900 text-blue-900 bg-transparent hover:bg-blue-900 hover:text-white"
  }`}
>
  {t("showroom.allMakes")}
</Badge>

{makes?.map((make: CarMake) => (
  <Badge
    key={make.id}
    role="button"
    tabIndex={0}
    onClick={() => {
      setSelectedMake(
        selectedMake === make.id.toString()
          ? "all"
          : make.id.toString()
      );
      setSelectedService("all");
    }}
    className={`cursor-pointer select-none flex items-center gap-2 ${
      selectedMake === make.id.toString()
        ? "bg-blue-900 text-white"
        : "border border-blue-900 text-blue-900 bg-transparent hover:bg-blue-900 hover:text-white"
    }`}
  >
    <img
      src={make.image || "https://placehold.co/24x24"}
      alt={make.name}
      className="w-6 h-6"
    />
    {make.name}
  </Badge>
))}

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {renderShowrooms()}
              </div>
            </TabsContent>

            <TabsContent value="services">
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge
  onClick={() => setSelectedService("all")}
  className={`cursor-pointer ${
    selectedService === "all"
      ? "bg-blue-900 text-white"
      : "border border-blue-900 text-blue-900 bg-transparent hover:bg-blue-900 hover:text-white"
  }`}
>
  {t("showroom.allServices")}
</Badge>

{services?.map((service: any) => (
  <Badge
    key={service.id}
    onClick={() => {
      setSelectedService(
        selectedService === service.id.toString()
          ? "all"
          : service.id.toString()
      );
      setSelectedMake("all");
    }}
    className={`cursor-pointer flex items-center gap-1 ${
      selectedService === service.id.toString()
        ? "bg-blue-900 text-white"
        : "border border-blue-900 text-blue-900 bg-transparent hover:bg-blue-900 hover:text-white"
    }`}
  >
    <Wrench size={14} />
    {service.name}
  </Badge>
))}

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {renderShowrooms()}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BrowseShowrooms;
