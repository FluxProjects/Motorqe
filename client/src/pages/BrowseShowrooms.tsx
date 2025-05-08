import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Wrench, Car, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { CarMake, ShowroomService } from "@shared/schema";

interface ShowroomCardProps {
  showroom: {
    id: number;
    name: string;
    nameAr?: string;
    address: string;
    addressAr?: string;
    location: string;
    phone: string;
    image?: string;
    isMainBranch: boolean;
    services: {
      id: number;
      image: string;
      name: string;
      price: number;
    }[];
    makes: {
      id: number;
      name: string;
    }[];
    rating?: number;
  };
}

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
    ) : filteredShowrooms?.length > 0 ? (
      filteredShowrooms.map((showroom: any) => (
        <ShowroomCard key={showroom.id} showroom={showroom} />
      ))
    ) : (
      <div className="col-span-full text-center py-12">
        <p className="text-slate-500">{t("showroom.noShowroomsFound")}</p>
      </div>
    );

  const ShowroomCard = ({ showroom }: ShowroomCardProps) => {
    const { t, i18n } = useTranslation();
    const language = i18n.language;

    const name =
      language === "ar" && showroom.nameAr ? showroom.nameAr : showroom.name;
    const address =
      language === "ar" && showroom.addressAr
        ? showroom.addressAr
        : showroom.address;

        console.log("Services", services);

    return (
      <Card
        className={`overflow-hidden hover:shadow-md transition-shadow duration-300 ${
          showroom.isMainBranch ? "border-2 border-orange-500 border-solid" : ""
        }`}
      >
        <Link href={`/showrooms/${showroom.id}`}>
          <div className="relative h-48 overflow-hidden group cursor-pointer">
            {showroom.image ? (
              <img
                src={showroom.image}
                alt={name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                <Car size={40} className="text-slate-400" />
              </div>
            )}

            {showroom.isMainBranch && (
              <Badge className="absolute top-2 left-2 bg-blue-500">
                {t("showroom.mainBranch")}
              </Badge>
            )}

            {showroom.rating && (
              <Badge className="absolute top-2 right-2 bg-amber-500 flex items-center">
                <Star size={14} className="mr-1 fill-white" />
                {showroom.rating.toFixed(1)}
              </Badge>
            )}
          </div>
        </Link>

        <CardContent className="pt-4">
          <Link href={`/showrooms/${showroom.id}`}>
            <h3 className="text-lg font-semibold line-clamp-2 mb-1 hover:text-blue-600 transition-colors">
              {name}
            </h3>
          </Link>

          <div className="flex items-center text-slate-500 text-sm mb-3">
            <MapPin size={16} className="mr-1" />
            <span className="line-clamp-1">{address}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {Array.isArray(showroom.makes) &&
              showroom.makes.slice(0, 3).map((make) => (
                <Badge key={make.id} variant="outline">
                  {make.name}
                </Badge>
              ))}
            {Array.isArray(showroom.makes) && showroom.makes.length > 3 && (
              <Badge variant="outline">+{showroom.makes.length - 3}</Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {Array.isArray(showroom?.services) &&
              showroom.services.slice(0, 3).map((service, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1.5 max-w-[120px] truncate"
                >
                  {service.image && (
                    <img
                      src={service.image || "https://placehold.co/24x24"}
                      alt=""
                      className="h-3 w-3 object-contain"
                    />
                  )}
                  <span className="truncate">{service.name}</span>
                </Badge>
              ))}
            {Array.isArray(showroom?.services) &&
              showroom.services.length > 3 && (
                <Badge variant="secondary">
                  +{showroom.services.length - 3} {t("showroom.moreServices")}
                </Badge>
              )}
          </div>
        </CardContent>

        <CardFooter className="border-t pt-4 flex justify-between items-center">
          <div className="flex items-center">
            <Phone size={16} className="mr-2 text-slate-500" />
            <span className="text-sm text-slate-600">{showroom.phone}</span>
          </div>

          <Link href={`/showrooms/${showroom.id}`}>
            <Button size="sm" variant="outline">
              {t("common.viewDetails")}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">
          {t("common.browseShowrooms")}
        </h1>

        <div className="md:flex md:gap-6">
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            defaultValue="all"
            className="w-full"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <TabsList className="grid w-full md:w-auto grid-cols-3">
                <TabsTrigger value="all">
                  {t("showroom.allShowrooms")}
                </TabsTrigger>
                <TabsTrigger value="makes">{t("showroom.byMake")}</TabsTrigger>
                <TabsTrigger value="services">
                  {t("showroom.byService")}
                </TabsTrigger>
              </TabsList>

              <Input
                placeholder={t("showroom.searchPlaceholder")}
                className="max-w-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <TabsContent value="all">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {renderShowrooms()}
              </div>
            </TabsContent>

            <TabsContent value="makes">
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge
                  variant={selectedMake === "all" ? "default" : "outline"}
                  onClick={() => setSelectedMake("all")}
                  className="cursor-pointer"
                >
                  {t("showroom.allMakes")}
                </Badge>
                {makes?.map((make: CarMake) => (
                  <Badge
                    key={make.id}
                    role="button"
                    tabIndex={0}
                    variant={
                      selectedMake === make.id.toString()
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      setSelectedMake(
                        selectedMake === make.id.toString()
                          ? "all"
                          : make.id.toString()
                      );
                      setSelectedService("all");
                    }}
                    className="cursor-pointer select-none flex items-center gap-2"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {renderShowrooms()}
              </div>
            </TabsContent>

            <TabsContent value="services">
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge
                  variant={selectedService === "all" ? "default" : "outline"}
                  onClick={() => setSelectedService("all")}
                  className="cursor-pointer"
                >
                  {t("showroom.allServices")}
                </Badge>
                {services?.map((service: any) => (
                  <Badge
                    key={service.id}
                    variant={
                      selectedService === service.id.toString()
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      setSelectedService(
                        selectedService === service.id.toString()
                          ? "all"
                          : service.id.toString()
                      );
                      setSelectedMake("all");
                    }}
                    className="cursor-pointer"
                  >
                    <Wrench size={14} className="mr-1" />
                    {service.name}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
