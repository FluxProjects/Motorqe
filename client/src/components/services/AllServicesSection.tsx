import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CarService } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Button } from "../ui/button";

interface ServiceWrapper {
  service: CarService;
}

export default function AllServicesSection({ searchQuery }: { searchQuery: string }) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const fetchAllServices = async (): Promise<ServiceWrapper[]> => {
    const response = await apiRequest("GET", "/api/services");
    const data = await response.json();
    return data;
  };

  const { data: allServices = [], isLoading } = useQuery<ServiceWrapper[]>({
    queryKey: ["all-services"],
    queryFn: fetchAllServices,
  });

  const filteredServices = allServices.filter((service) => {
    if (!searchQuery) return true;
    const nameMatch = service.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const nameArMatch = service.nameAr?.includes(searchQuery);
    return nameMatch || nameArMatch;
  });

  const visibleServices = showAll ? filteredServices : filteredServices.slice(0, 20);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (filteredServices.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        {searchQuery ? t("services.noResults") : t("services.noServices")}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {visibleServices.map((service) => (
          <Link
            key={`service-${service.id}`}
            href={`/services/${service.id}`}
            className="flex flex-col items-center bg-white rounded-md border-2 border-neutral-300 p-4 hover:bg-neutral-50 cursor-pointer"
          >
            <Avatar className="h-16 w-16 mb-2 rounded-none overflow-hidden flex items-center justify-center">
              <AvatarImage
                src={service.image}
                alt={service.name}
                className="max-h-24 w-auto object-contain rounded-none"
              />
              <AvatarFallback>{service.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-center">{service.name}</span>
          </Link>
        ))}
      </div>

      {filteredServices.length > 20 && (
        <div className="flex justify-center mt-6">
          <Button className="bg-orange-500 text-white" onClick={() => setShowAll(!showAll)}>
            {showAll ? t("common.showLess") : t("common.loadAll")}
          </Button>
        </div>
      )}
    </>
  );
}

