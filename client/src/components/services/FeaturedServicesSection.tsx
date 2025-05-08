import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import FeaturedServiceCard from "./FeaturedServiceCard";
import { apiRequest } from "@/lib/queryClient";

export interface ShowroomService {
  showroom_service_id: number;
  is_featured: boolean;
  price: number;
  currency: string;
  service_id: number;
  service_name: string;
  service_nameAr: string;
  showroom_id: number;
  showroom_name: string;
  showroom_location: string;
}

export default function FeaturedServicesSection({ searchQuery }: { searchQuery: string }) {
  const { t } = useTranslation();

  const { data: featuredServices = [], isLoading: isLoadingFeatured } = useQuery<ShowroomService[]>({
    queryKey: ["featured-services"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/services/featured");
      const data = await response.json();
      return data;
    },
  });

  // Filter featured services
  const filteredServices = featuredServices.filter((service) => {
    if (!searchQuery) return true;
    const nameMatch = service?.service_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const nameArMatch = service?.service_nameAr?.includes(searchQuery);
    const showroomMatch = service?.showroom_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || nameArMatch || showroomMatch;
  });

  if (isLoadingFeatured) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (filteredServices.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        {t("services.noFeatured")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredServices.map((service) => (
        <FeaturedServiceCard
          key={`featured-${service.service_id}`}
          service={service}
        />
      ))}
    </div>
  );
}
