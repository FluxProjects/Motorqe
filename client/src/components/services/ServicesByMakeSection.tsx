import { useQuery } from "@tanstack/react-query";
import { Car, ChevronRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CarMake, CarService, Showroom } from "@shared/schema";
import GarageServiceCard from "./GarageServiceCard";

interface ServicesByMakeProps {
  searchQuery: string;
  selectedMake: number | null;
  onSelectMake: (makeId: number | null) => void;
}
interface ShowroomService {
    id: number;
    showroomId: number;
    serviceId: number;
    price: number;
    currency: string;
    isFeatured: boolean;
    service: CarService;
    showroom: Showroom;
  }

export default function ServicesByMake({
  searchQuery,
  selectedMake,
  onSelectMake,
}: ServicesByMakeProps) {
  const { t } = useTranslation();

  const { data: makes = [] } = useQuery<CarMake[]>({
    queryKey: ["/api/car-makes"],
  });

  const { data: allServices = [] } = useQuery<CarService[]>({
    queryKey: ["/api/services"],
  });

  const {
    data: servicesByMake = [],
    isLoading: isLoadingByMake,
  } = useQuery<ShowroomService[]>({
    queryKey: [`/api/services/makes/${selectedMake}`],
    enabled: !!selectedMake,
  });

  // Grouped services by make
  const servicesGroupedByMake = makes.reduce(
    (acc, make) => {
      const services = allServices.filter(
        (service) => service.id === make.id
      );
      if (services.length > 0) {
        acc[make.id] = {
          make,
          services,
        };
      }
      return acc;
    },
    {} as Record<number, { make: CarMake; services: CarService[] }>
  );

  const filteredServicesByMake = servicesByMake.filter((service) => {
    if (!searchQuery) return true;
    const nameMatch = service.service.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const nameArMatch = service.service.nameAr?.includes(searchQuery);
    return nameMatch || nameArMatch;
  });
  

  // Selected make view
  if (selectedMake) {
    if (isLoadingByMake) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      );
    }

    const selectedMakeName = makes.find((m) => m.id === selectedMake)?.name;

    return (
      <>
        <div className="mb-4 flex items-center">
          <h2 className="text-xl font-semibold">
            {t("services.servicesFor")} {selectedMakeName}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => onSelectMake(null)}
          >
            {t("common.clear")}
          </Button>
        </div>

        {filteredServicesByMake.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServicesByMake.map((service) => (
              <GarageServiceCard
                key={`make-${service.id}`}
                service={service}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-500">
            {searchQuery
              ? t("services.noResults")
              : t("services.noServicesForMake")}
          </div>
        )}
      </>
    );
  }

  // Grouped view
  return (
    <div className="space-y-8">
      {Object.entries(servicesGroupedByMake).map(
        ([makeId, { make, services }]) => (
          <div key={makeId}>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Car className="h-5 w-5 mr-2 text-primary" />
              {make.name}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {services.slice(0, 5).map((service) => (
                <Link
                  key={`make-${makeId}-service-${service.id}`}
                  href={`/services/${service.id}`}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarImage src={service.image} alt={service.name} />
                    <AvatarFallback>
                      {service.name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-center">
                    {service.name}
                  </span>
                </Link>
              ))}
            </div>

            {services.length > 5 && (
              <div className="mt-4 text-right">
                <Button variant="ghost" onClick={() => onSelectMake(make.id)}>
                  {t("services.viewAll")}{" "}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
