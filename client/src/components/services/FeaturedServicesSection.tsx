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
  showroom_nameAr: string;
  showroom_address: string;
  showroom_location: string;
}

export default function FeaturedServicesSection({ searchQuery }: { searchQuery: string }) {
  const { t } = useTranslation();

  const { data: featuredServices = [], isLoading: isLoadingFeatured } = useQuery<ShowroomService[]>({
    queryKey: ["featured-services"],
   queryFn: async () => {
  const res = await fetch("/api/services/featured");
  if (!res.ok) throw new Error("Failed to fetch featured services");

  const data = await res.json();

  console.log("data", res);

  // This check ensures that you get an array
  if (!Array.isArray(data)) {
    console.error("Expected an array, got:", data);
    return [];
  }

  return data;
}

  });

  console.log("featuredServices", featuredServices);

  // Filter featured services
  const filteredServices = featuredServices.filter((service) => {
    if (!searchQuery) return true;
    const nameMatch = service?.service_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const nameArMatch = service?.service_nameAr?.includes(searchQuery);
    const showroomMatch = service?.showroom_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const showroomArMatch = service?.showroom_nameAr?.includes(searchQuery);
    return nameMatch || nameArMatch || showroomMatch || showroomArMatch;
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {filteredServices.map((service) => (
        <FeaturedServiceCard
          key={`featured-${service.service_id}`}
          service={service}
        />
      ))}
    </div>
  );
}
