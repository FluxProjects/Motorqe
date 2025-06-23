import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react"; // Added Trash2 icon
import GarageNavigation from "@/components/showroom/GarageNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CarService, ShowroomService } from "@shared/schema";
import { roleMapping } from "@shared/permissions";

interface ServiceFormValues {
  id: number | null;
  serviceId: number | null;
  showroomId: number;
  price: number;
  currency: string;
  description: string;
  descriptionAr: string;
  availability: string;
  status: string; // Kept for backend but not shown in UI
  serviceName?: string;
}

export default function GarageServiceListings() {
  const auth = useAuth();
  const { user } = auth;
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    showroomId: null as number | null,
    status: "all",
    isFeatured: undefined,
    isActive: "all",
    priceRange: { from: undefined, to: undefined },
    dateRange: { from: undefined, to: undefined },
    serviceId: null as number | null,
  });
  const [services, setServices] = useState<ServiceFormValues[]>([]);

  const fetchAllServices = async (): Promise<CarService[]> => {
    const res = await fetch("/api/services");
    if (!res.ok) throw new Error("Failed to fetch car services");
    return res.json();
  };

  const { data: userShowroom } = useQuery({
  queryKey: ["user-showroom", user?.id],
  queryFn: async () => {
    if (!user?.id) return null;
    const res = await fetch(`/api/garages/user/${user.id}`);
    if (!res.ok) throw new Error("Failed to fetch user showroom");
    const showrooms = await res.json();

    // ✅ Return only the first showroom or null
    return showrooms?.[0] ?? null;
  },
  enabled: !!user?.id,
});

  const {
    data: showroomServices = [],
    isLoading: isLoadingServices,
    refetch,
  } = useQuery<ShowroomService[]>({
    queryKey: ["showroom-services", searchQuery, filters, user?.id, user?.roleId],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      // Filter only by the user's showroom ID
    searchParams.append("showroom_id", userShowroom!.id.toString());

      if (searchQuery) searchParams.append("search", searchQuery);
      if (filters.status && filters.status !== "all") searchParams.append("status", filters.status);
      if (filters.isFeatured !== undefined) searchParams.append("is_featured", String(filters.isFeatured));
      if (filters.isActive !== undefined) searchParams.append("is_active", String(filters.isActive));
      if (filters.priceRange?.from) searchParams.append("price_from", filters.priceRange.from.toString());
      if (filters.priceRange?.to) searchParams.append("price_to", filters.priceRange.to.toString());
      if (filters.dateRange?.from) searchParams.append("date_from", filters.dateRange.from.toString());
      if (filters.dateRange?.to) searchParams.append("date_to", filters.dateRange.to.toString());
      if (filters.serviceId) searchParams.append("service_id", filters.serviceId.toString());

      const res = await fetch(`/api/showroom/services?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch listings");
      return res.json();
    },
  });

  const { data: serviceOptions = [], isLoading: isLoadingOptions } = useQuery<CarService[]>({
    queryKey: ["all-services"],
    queryFn: fetchAllServices,
  });

  const currencyOptions = [
    { value: "QAR", label: "QAR" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
  ];

  useEffect(() => {
    if (showroomServices && showroomServices.length > 0) {
      setServices(
        showroomServices.map((service) => ({
          id: service.id,
          serviceId: service.service_id,
          showroomId: userShowroom.id,
          price: service.price || 0,
          currency: service.currency || "QAR",
          description: service.description || "",
          descriptionAr: service.descriptionAr || "",
          availability: service.availability || "",
          status: service.status || "pending", // Still included for backend
          serviceName: service.serviceData?.name || "",
        }))
      );
    }
  }, [showroomServices]);

  const addService = () => {
    const newService: ServiceFormValues = {
      id: null,
      serviceId: null,
      showroomId: userShowroom.id,
      price: 0,
      currency: "QAR",
      description: "",
      descriptionAr: "",
      availability: "",
      status: "pending", // Default status for new services
    };
    setServices([...services, newService]);
  };

  const updateService = (id: number | null, field: keyof ServiceFormValues, value: string) => {
    setServices(
      services.map((service) => {
        if (service.id === id) {
          if (field === "price") return { ...service, price: parseFloat(value) };
          if (field === "currency") return { ...service, currency: value };
          if (field === "serviceId") {
            const selectedService = serviceOptions.find(opt => opt.id === parseInt(value));
            return { 
              ...service, 
              serviceId: parseInt(value), 
              serviceName: selectedService?.name || "" 
            };
          }
          return { ...service, [field]: value };
        }
        return service;
      })
    );
  };

  const deleteService = async (id: number | null) => {
  if (id === null) {
    // Remove the new (unsaved) service with a null ID (if any)
    setServices((prev) => prev.filter(service => service.id !== null));
  } else {
    // Remove from local state
    setServices((prev) => prev.filter(service => service.id !== id));

    try {
      const res = await fetch(`/api/showroom/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service");
      queryClient.invalidateQueries(["showroom-services"]);
    } catch (error) {
      console.error("Delete service failed:", error);
      alert("Failed to delete service. Please try again.");
    }
  }
};


  const handleSave = async () => {
    try {
      // Process each service individually
      for (const service of services) {
        const payload = {
          serviceId: service.serviceId,
          showroomId: userShowroom.id,
          price: service.price,
          currency: service.currency,
          description: service.description,
          descriptionAr: service.descriptionAr,
          availability: service.availability,
          status: service.status, // Still sent to backend
        };

        const method = service.id === null ? "POST" : "PUT";
        const url = service.id === null 
          ? "/api/showroom/services" 
          : `/api/showroom/services/${service.id}`;

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${method === "POST" ? "create" : "update"} service`);
        }
      }
      
      queryClient.invalidateQueries(["showroom-services"]);
      alert(t("services.savedSuccessfully"));
    } catch (error) {
      console.error("Error saving services:", error);
      alert(t("services.saveFailed"));
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilters({
      showroomId: userShowroom.id,
      status: "all",
      isFeatured: undefined,
      isActive: "all",
      priceRange: { from: undefined, to: undefined },
      dateRange: { from: undefined, to: undefined },
      serviceId: null,
    });
    refetch();
  };

  if (isLoadingServices || isLoadingOptions) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <GarageNavigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          {t("common.welcome")}, {user?.name || "GSF"}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Dashboard cards */}
        </div>

        <Card className="bg-neutral-50 rounded-2xl shadow-sm border-2 border-motoroe-orange p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {t("common.servicesAndPrices")}
            </h1>
            <div className="w-24 h-1 bg-motoroe-orange mx-auto rounded-full"></div>
          </div>

          <div className="space-y-6">
            {services.map((service, index) => (
              <div key={service.id || `new-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-40 pr-40 items-center justify-center">
                
                
                
                <div className="flex items-end gap-2">
                  <div className="flex-1">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("common.service")} {index + 1}
                      </label>
                      <Input
                        value={service.description}
                        onChange={(e) => updateService(service.id, "description", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                  </div>
                 
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("common.price")}
                  </label>
                  <div className="flex">
                    <Input
                      type="number"
                      value={service.price}
                      onChange={(e) => updateService(service.id, "price", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("common.category")}
                  </label>
                  <Select
                      value={service.serviceId?.toString() || ""}
                      onValueChange={(value) => updateService(service.id, "serviceId", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("common.selectCategory")} />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id.toString()}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-red-500 hover:bg-red-50"
                    onClick={() => deleteService(service.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>

                

                {/* Status field removed from UI but still exists in data */}

                 
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button
              onClick={addService}
              variant="outline"
              className="border-2 border-motoroe-orange text-motoroe-blue hover:bg-motoroe-orange hover:text-white transition-colors px-6 py-2 rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("common.addService")}
            </Button>
          </div>

          <div className="flex flex-col items-center space-y-4 mt-8">
            <Button
              onClick={handleSave}
              className="bg-motoroe-orange text-white px-12 py-3 rounded-full font-medium hover:bg-orange-600 transition-colors"
              disabled={isLoadingServices}
            >
              {isLoadingServices ? t("common.saving") + "..." : t("common.save")}
            </Button>
            <Button
              onClick={clearSearch}
              variant="link"
              className="text-motoroe-blue hover:text-motoroe-orange text-sm"
            >
              {t("common.clearSearch")}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}