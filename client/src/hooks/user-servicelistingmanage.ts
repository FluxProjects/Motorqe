import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ServiceListing, ServiceListingAction } from "@shared/schema";
import { StatusBadge } from "@/components/ui/status-badge";
import { Permission } from "@shared/permissions";
import { useAuth } from "@/contexts/AuthContext";

export const useServiceListingManage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceListing | null>(null);

  const [filters, setFilters] = useState({
    isActive: null,
    isFeatured: null,
    priceRange: { from: "", to: "" },
    showroomId: user?.showroomId,
  });

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<ServiceListingAction>("feature");
  const [actionInProgress, setActionInProgress] = useState(false);

  // Data fetching
  const {
    data: services = [],
    isLoading,
    refetch,
  } = useQuery<ServiceListing[]>({
    queryKey: ["showroom-services", searchQuery, filters, user?.showroomId],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (searchQuery) searchParams.append("search", searchQuery);
      if (filters.isActive !== null) {
        searchParams.append("is_active", filters.isActive.toString());
      }
      if (filters.isFeatured !== null) {
        searchParams.append("is_featured", filters.isFeatured.toString());
      }
      if (filters.priceRange?.from) {
        searchParams.append("price_from", filters.priceRange.from);
      }
      if (filters.priceRange?.to) {
        searchParams.append("price_to", filters.priceRange.to);
      }
      if (filters.showroomId) {
        searchParams.append("showroom_id", filters.showroomId.toString());
      }

      const res = await fetch(`/api/showroom-services?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch services");
      
      const services = await res.json();
      
      // Fetch related service and showroom data
      const enrichedServices = await Promise.all(
        services.map(async (service: any) => {
          const [carService, showroom] = await Promise.all([
            fetch(`/api/car-services/${service.service_id}`).then(res => res.ok ? res.json() : null),
            fetch(`/api/showrooms/${service.showroom_id}`).then(res => res.ok ? res.json() : null),
          ]);
          
          return {
            ...service,
            service: carService,
            showroom,
          };
        })
      );

      return enrichedServices;
    },
  });

  // Mutation for service actions
  const performAction = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: number;
      action: string;
    }) => {
      setActionInProgress(true);

      const endpointMap: Record<string, string> = {
        feature: "feature",
        activate: "activate",
        deactivate: "deactivate",
        delete: "",
      };

      if (!endpointMap[action]) {
        throw new Error("Invalid service action");
      }

      const method = action === "delete" ? "DELETE" : "PUT";
      const endpoint = action === "delete" 
        ? `/api/showroom-services/${id}`
        : `/api/showroom-services/${id}/${endpointMap[action]}`;

      const response = await apiRequest(method, endpoint);

      return { action, response };
    },
    onSuccess: ({ action }) => {
      let message = "";
      switch (action) {
        case "feature":
          message = t("services.serviceFeatured");
          break;
        case "activate":
          message = t("services.serviceActivated");
          break;
        case "deactivate":
          message = t("services.serviceDeactivated");
          break;
        case "delete":
          message = t("services.serviceDeleted");
          break;
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
      isActive: null,
      isFeatured: null,
      priceRange: { from: "", to: "" },
      showroomId: user?.showroomId,
    });
    refetch();
  };

  const handleViewService = (service: ServiceListing) => {
    setCurrentService(service);
    setViewDialogOpen(true);
  };

  const handleEditService = (service: ServiceListing) => {
    setCurrentService(service);
    setIsEditing(true);
    setFormDialogOpen(true);
  };

  const handleCreateService = () => {
    setCurrentService(null);
    setIsEditing(false);
    setFormDialogOpen(true);
  };

  const handleAction = (service: ServiceListing, action: ServiceListingAction) => {
    setCurrentService(service);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!currentService) return;
    performAction.mutate({
      id: currentService.id,
      action: actionType,
    });
  };

  return {
    // State
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    viewDialogOpen,
    setViewDialogOpen,
    actionDialogOpen,
    setActionDialogOpen,
    currentService,
    formDialogOpen,
    setFormDialogOpen,
    isEditing,
    actionType,
    actionInProgress,

    // Data
    services,
    isLoading,

    // Functions
    handleSearch,
    resetFilters,
    handleViewService,
    handleEditService,
    handleCreateService,
    handleAction,
    confirmAction,
    refetch,
  };
};