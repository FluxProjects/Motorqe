import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminServiceListing, AdminServiceListingFilters, CarService, ServiceListingAction, ServicePromotionPackage, Showroom, User } from "@shared/schema";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasPermission, Permission, roleMapping } from "@shared/permissions";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const useServiceListingManage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State management
  const [currentTab, setCurrentTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


  const handleEditService = (service: AdminServiceListing) => {
    setCurrentService(service);
    setIsEditing(true);
    setFormDialogOpen(true);
  };

  const handleCreateService = () => {
    console.log("create listing clicked");
    setCurrentService(null);
    setIsEditing(false);
    setFormDialogOpen(true);
    console.log("create service clicked - after state updates", {
      formDialogOpen,
      isEditing
    });

    navigate("/sell-service"); 
  };

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


  // Data fetching
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

  // Mutation for service actions
  const performAction = useMutation({
    mutationFn: async ({
      id,
      action,
      reason,
      featured,
    }: {
      id: number;
      action: string;
      reason?: string;
      featured?: boolean;
    }) => {
      setActionInProgress(true);

      console.log("inside perform action");

      const roleName = roleMapping[user?.roleId];
      const isListingOwner = currentService?.user?.id === user?.id;

      console.log("Performing action:", { id, action });

      // Allow listing owner to publish if listing is in draft and user is not a buyer
      if (action === "publish" && currentService?.status === "draft") {
        if (isListingOwner && roleName !== "BUYER") {
          await apiRequest("PUT", `/api/showroom/services/${id}/actions`, {
            action: "pending",
            reason,
            featured,
          });
          return action;
        }
      }

      // Admin/mod roles can forcefully publish listing (set to active)
      if (action === "publish") {
        if (
          roleName === "SUPER_ADMIN" ||
          roleName === "ADMIN" ||
          roleName === "MODERATOR" ||
          roleName === "SENIOR_MODERATOR"
        ) {
          await apiRequest("PUT", `/api/showroom/services/${id}/actions`, {
            action: "active",
            reason,
            featured,
          });
          return action;
        }
        throw new Error("Unauthorized to publish listing");
      }

      // Approve or reject
      if (action === "approve" || action === "reject") {
        if (
          roleName === "SUPER_ADMIN" ||
          roleName === "ADMIN" ||
          roleName === "MODERATOR" ||
          roleName === "SENIOR_MODERATOR"
        ) {
          await apiRequest("PUT", `/api/showroom/services/${id}/actions`, {
            action,
            reason,
            featured,
          });
          return action;
        }
        throw new Error("Unauthorized to approve/reject listings");
      }

      // Feature
      if (action === "feature") {
        console.log("🔍 Feature action check");
        console.log("roleName:", roleName);
        console.log("roleName === 'SUPER_ADMIN':", roleName === "SUPER_ADMIN");
        console.log("roleName === 'ADMIN':", roleName === "ADMIN");
        if (
          roleName === "SUPER_ADMIN" ||
          roleName === "ADMIN"
        ) {
          console.log("role is satisfied", roleName);
          await apiRequest("PUT", `/api/showroom/services/${id}/actions`, {
            action,
            reason,
            featured,
          });
          return action;
        }
        throw new Error("Unauthorized to feature listings");
      }

      // Delete
      if (action === "delete") {
        if (
          roleName === "SUPER_ADMIN" ||
          roleName === "ADMIN" ||
          (roleName === "SELLER" && hasPermission(roleName, Permission.MANAGE_OWN_SERVICES)) ||
          (roleName.startsWith("GARAGE") && hasPermission(roleName, Permission.MANAGE_SHOWROOM_SERVICES))
        ) {
          await apiRequest("DELETE", `/api/showroom/services/${id}`, {});
          return action;
        }
        throw new Error("Unauthorized to delete listing");
      }

      // If no condition matched
      throw new Error("Unsupported action or insufficient permissions");
    },
    onSuccess: ({ returnedAction }) => {
      let message = "";

      switch (returnedAction) {
        case "publish":
          message = t("admin.listingPublished");
          break;
        case "approve":
          message = t("admin.listingApproved");
          break;
        case "reject":
          message = t("admin.listingRejected");
          break;
        case "feature":
          message = t("admin.listingFeatured");
          break;
        case "delete":
          message = t("admin.listingDeleted");
          break;
        default:
          message = t("admin.actionSuccess");
      }


      toast({
        title: t("common.success"),
        description: message,
      });

      setActionDialogOpen(false);
      setCurrentService(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("services.actionFailed"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setActionInProgress(false);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
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
    refetch();
  };

  const handleViewService = (service: AdminServiceListing) => {
    setCurrentService(service);
    setViewDialogOpen(true);
  };

  const handleAction = (service: AdminServiceListing, action: ServiceListingAction) => {
    console.log("Action triggered:", action, "for listing:", service.id);
    setActionDialogOpen(true);
    setCurrentService(service);
    setActionType(action);
    
  };

  const confirmAction = () => {
    if (!currentService) return;

    console.log("ABOUT TO MUTATE", { id: currentService.id, action: actionType, reason: actionReason });

    switch (actionType) {
      case "publish":
        performAction.mutate({
          id: currentService.id,
          action: "publish", // Correct action type for publish
          reason: actionReason,
        });
        break;
      case "approve":
        performAction.mutate({
          id: currentService.id,
          action: "approve", // Correct action type for approve
          reason: actionReason,
        });
        break;
      case "reject":
        performAction.mutate({
          id: currentService.id,
          action: "reject",
          reason: actionReason,
        });
        break;
      case "feature":
        performAction.mutate({
          id: currentService.id,
          action: "feature",
          featured: true,
        });
        break;
        case "unfeature":
        performAction.mutate({
          id: currentService.id,
          action: "feature",
          featured: false,
        });
        break;
      case "delete":
        performAction.mutate({
          id: currentService.id,
          action: "delete",
        });
        break;
    }
  };

  const getStatusBadge = StatusBadge;

  return {
    // State
    currentTab,
    setCurrentTab,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    viewDialogOpen,
    setViewDialogOpen,
    actionDialogOpen,
    setActionDialogOpen,
    currentService,
    setCurrentService,
    actionType,
    setActionType,
    actionReason,
    setActionReason,
    actionInProgress,
    setFormDialogOpen,
    formDialogOpen,

    // Data
    services,
    userShowrooms, // Added user's showrooms to the return value
    promotionPackages,
    isLoading,
    isEditing,

    // Functions
    handleSearch,
    resetFilters,
    handleViewService,
    handleEditService,
    handleCreateService,
    handleAction,
    confirmAction,
    getStatusBadge,
    refetch,
  };
};