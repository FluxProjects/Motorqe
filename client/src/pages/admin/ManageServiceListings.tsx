import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { AdminServiceListing, AdminServiceListingFilters, CarService, ServiceListingAction, ServicePromotionPackage, Showroom, ShowroomService, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import GarageNavigation from "@/components/dashboard/GarageNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { roleMapping } from "@shared/permissions";

interface Service {
  id: number;
  name: string;
  price: string;
  category: string;
}

export default function ManageServiceListings() {
  const { user } = useAuth();
    const { t } = useTranslation();
    const { toast } = useToast();
    const navigate = useNavigate();
  
    // State management
    const [currentTab, setCurrentTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

  const [filters, setFilters] = useState<AdminServiceListingFilters>({
      status: "all",
      dateRange: { from: "", to: "" },
      dateRangePreset: "all",
      priceRange: { from: "", to: "" },
      user_id: user?.id,
      isFeatured: undefined,
      isActive: undefined,
  
      showroomId: undefined,
      serviceId: undefined
    });

    const [currentService, setCurrentService] = useState<AdminServiceListing | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<ServiceListingAction>("approve");
    const [actionReason, setActionReason] = useState("");
    const [actionInProgress, setActionInProgress] = useState(false);

  const {
    data: services = [],
    isLoading,
    refetch,
  } = useQuery<AdminServiceListing[]>({
    queryKey: ["showroom-services", searchQuery, filters, user?.id, user?.roleId],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
  
      // Add role-based filtering
      const roleName = roleMapping[user?.roleId];
  
      if (!roleName) {
        console.warn(`No role mapping found for role ID: ${user?.roleId}`);
        return [];
      }
  
      // For admins (roleId >= 7), don't filter by user_id - show all services
      // For non-admins (roleId < 7), filter by their user_id to get all their showroom's services
      if (user?.roleId < 7) {
        searchParams.append("user_id", String(user?.id));
      }
  
      // If a specific showroom filter is applied, use that instead
      if (filters.showroomId) {
        searchParams.append("showroom_id", filters.showroomId.toString());
        // Remove user_id filter if showroom_id is specified to avoid conflicts
        searchParams.delete("user_id");
      }
  
      if (searchQuery) searchParams.append("search", searchQuery);
      if (filters.status && filters.status !== "all") {
        searchParams.append("status", filters.status);
      }
      if (filters.isFeatured !== undefined) {
        searchParams.append("is_featured", String(filters.isFeatured));
      }
      if (filters.isActive !== undefined) {
        searchParams.append("is_active", String(filters.isActive));
      }
      if (filters.priceRange?.from) {
        searchParams.append("price_from", filters.priceRange.from.toString());
      }
      if (filters.priceRange?.to) {
        searchParams.append("price_to", filters.priceRange.to.toString());
      }
      if (filters.dateRange?.from) {
        searchParams.append("date_from", filters.dateRange.from.toString());
      }
      if (filters.dateRange?.to) {
        searchParams.append("date_to", filters.dateRange.to.toString());
      }
  
      if (filters.serviceId) {
        searchParams.append("service_id", filters.serviceId.toString());
      }
  
      const finalUrl = `/api/showroom/services?${searchParams.toString()}`;
      console.log("[DEBUG] Final API URL:", finalUrl);
  
      // Fetch all service listings
      const res = await fetch(finalUrl);
  
      if (!res.ok) {
        console.error("[ERROR] Failed to fetch listings. Status:", res.status);
        const errorText = await res.text();
        console.error("[ERROR] Response text:", errorText);
        throw new Error("Failed to fetch listings");
      }
  
      const services = await res.json();
      console.log("[DEBUG] Raw services from API:", services);
  
      if (!services || services.length === 0) {
        console.warn("[WARNING] No services returned from API");
        return [];
      }
  
      // Get unique IDs for batch fetching
      const uniqueShowroomIds = [...new Set(services.map((service: any) => service.showroom_id))];
      const uniqueServiceIds = [...new Set(services.map((service: any) => service.service_id))];
  
      console.log("[DEBUG] Unique IDs to fetch:", {
        uniqueShowroomIds,
        uniqueServiceIds
      });
  
      // Fetch all related data in parallel
      const [showroomsResponse, serviceDetailsResponse] = await Promise.all([
        // Fetch all showrooms at once if there are any
        uniqueShowroomIds.length > 0 
          ? fetch(`/api/showrooms?ids=${uniqueShowroomIds.join(',')}`)
          : Promise.resolve({ ok: false }),
        
        // Fetch all services at once if there are any
        uniqueServiceIds.length > 0
          ? fetch(`/api/services?ids=${uniqueServiceIds.join(',')}`)
          : Promise.resolve({ ok: false })
      ]);
  
      // Process showrooms response
      let showrooms = [];
      if ('ok' in showroomsResponse && showroomsResponse.ok) {
        const response = showroomsResponse as Response;
        showrooms = await response.json();
        console.log("[DEBUG] Fetched showrooms:", showrooms);
      } else {
        console.warn("[WARNING] Failed to fetch showrooms");
      }
  
      // Process services response
     let serviceDetails: any[] = [];
  
  if ('ok' in serviceDetailsResponse && serviceDetailsResponse.ok) {
    const response = serviceDetailsResponse as Response;
    serviceDetails = await response.json();
    console.log("[DEBUG] Fetched service details:", serviceDetails);
  } else {
    console.warn("[WARNING] Failed to fetch service details");
  }
      // Get user IDs from showrooms
      const userIdsFromShowrooms = showrooms
    .filter((showroom: any) => showroom.user_id !== undefined)
    .map((showroom: any) => showroom.user_id);
  
      // Fetch users in batch if there are any
      let users = [];
      if (userIdsFromShowrooms.length > 0) {
        try {
          const usersResponse = await fetch(`/api/users/${userIdsFromShowrooms.join(',')}`);
          if (usersResponse.ok) {
            users = await usersResponse.json();
            console.log("[DEBUG] Fetched users:", users);
          }
  
        } catch (error) {
          console.error("[ERROR] Failed to fetch users:", error);
        }
      }
  
      // Create lookup maps for faster access
      const showroomsMap = new Map(showrooms.map((showroom: Showroom) => [showroom.id, showroom]));
      const servicesMap = new Map(serviceDetails.map(service => [service.id, service]));
      const usersMap = new Map(users.map((user: User) => [user.id, user]));
  
      // Enrich services with related data
      const enrichedServices = services.map((service: CarService) => {
        const showroom = showroomsMap.get(service.showroom_id);
        const serviceDetail = servicesMap.get(service.service_id);
        const user = showroom && showroom.user_id ? usersMap.get(showroom.user_id) : null;
  
        return {
          ...service,
          serviceData: serviceDetail,
          showroom: showroom,
          user: user,
        };
      });
  
      console.log("[DEBUG] Enriched Services:", enrichedServices);
      return enrichedServices;
    },
  });

  const {
      data: promotionPackages = [],
      isLoading: isLoadingPackages
    } = useQuery<ServicePromotionPackage[]>({
      queryKey: ['promotion-packages'],
      queryFn: async () => {
        const res = await fetch('/api/promotion-packages/services');
        if (!res.ok) throw new Error('Failed to fetch packages');
        return res.json();
      }
    });
  
     // Fetch user's showrooms for selection
      const { data: userShowrooms = [] } = useQuery({
        queryKey: ["user-showrooms", user?.id],
        queryFn: async () => {
          if (!user?.id) return [];
          const res = await fetch(`/api/garages/user/${user.id}`);
          if (!res.ok) throw new Error("Failed to fetch user showrooms");
          return res.json();
        },
        enabled: !!user?.id,
      });
  

  const serviceOptions = [
    "Body Repair & Paint",
    "Tinting & PPF", 
    "Car Wash & Detailing",
    "Engine Repair",
    "Brake Service",
    "Oil Change",
    "Tire Service",
    "AC Service"
  ];

  const categoryOptions = [
    "Maintenance",
    "Repair",
    "Cosmetic",
    "Performance",
    "Safety"
  ];

  const addService = () => {
    const newService: Service = {
      id: services.length + 1,
      name: "",
      price: "QR 500.00",
      category: ""
    };
    setServices([...services, newService]);
  };

  const updateService = (id: number, field: keyof Service, value: string) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    ));
  };

  const handleSave = () => {
    console.log("Saving services:", services);
    // Here you would typically send the data to your backend
  };

  const clearSearch = () => {
    setServices([
      { id: 1, name: "Body Repair & Paint", price: "QR 500.00", category: "" },
      { id: 2, name: "Tinting & PPF", price: "QR 500.00", category: "" },
      { id: 3, name: "Car Wash & Detailing", price: "QR 500.00", category: "" },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Sub Navigation */}
      <GarageNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Welcome, GSF !</h1>
        
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-motoroe rounded-lg p-6 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">101</div>
                <div className="text-sm opacity-90">Today's Bookings</div>
              </div>
              <div className="text-2xl opacity-80">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h8v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="gradient-motoroe rounded-lg p-6 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">0</div>
                <div className="text-sm opacity-90">Upcoming Bookings</div>
              </div>
              <div className="text-2xl opacity-80">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="gradient-motoroe rounded-lg p-6 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">72</div>
                <div className="text-sm opacity-90">Pending Bookings</div>
              </div>
              <div className="text-2xl opacity-80">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="gradient-motoroe rounded-lg p-6 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">101</div>
                <div className="text-sm opacity-90">Total Visits</div>
              </div>
              <div className="text-2xl opacity-80">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-white rounded-2xl shadow-sm border-2 border-motoroe-orange p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Services & Prices</h1>
            <div className="w-24 h-1 bg-motoroe-orange mx-auto rounded-full"></div>
          </div>

          <div className="space-y-6">
            {services.map((service, index) => (
              <div key={service.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service {index + 1}
                  </label>
                  <Select 
                    value={service.name} 
                    onValueChange={(value) => updateService(service.id, 'name', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <Input
                    type="text"
                    value={service.price}
                    onChange={(e) => updateService(service.id, 'price', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select 
                    value={service.category} 
                    onValueChange={(value) => updateService(service.id, 'category', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              ADD SERVICE
            </Button>
          </div>

          <div className="flex flex-col items-center space-y-4 mt-8">
            <Button
              onClick={handleSave}
              className="bg-motoroe-orange text-white px-12 py-3 rounded-full font-medium hover:bg-orange-600 transition-colors"
            >
              Save
            </Button>
            <Button
              onClick={clearSearch}
              variant="link"
              className="text-motoroe-blue hover:text-motoroe-orange text-sm"
            >
              Clear search
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}