import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ServiceBooking, ServiceBookingAction } from "@shared/schema";
import { StatusBadge } from "@/components/ui/status-badge";
import { Permission } from "@shared/permissions";
import { useAuth } from "@/contexts/AuthContext";

export const useServiceBookingManage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();

  // State management
  const [currentTab, setCurrentTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<ServiceBooking | null>(null);

  const [filters, setFilters] = useState({
    status: "all",
    dateRange: { from: "", to: "" },
    dateRangePreset: "all",
    priceRange: { from: "", to: "" },
    user_id: user?.id,
  });

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<ServiceBookingAction>("confirm");
  const [actionReason, setActionReason] = useState("");
  const [actionInProgress, setActionInProgress] = useState(false);

  // Data fetching
  const {
    data: bookings = [],
    isLoading,
    refetch,
  } = useQuery<ServiceBooking[]>({
    queryKey: ["service-bookings", currentTab, searchQuery, filters, user?.id],
    queryFn: async () => {
      const statusParam = currentTab !== "all" ? currentTab : filters.status;
      const searchParams = new URLSearchParams();

      if (searchQuery) searchParams.append("search", searchQuery);
      if (statusParam && statusParam !== "all") {
        searchParams.append("status", statusParam);
      }

      // Date range
      if (filters.dateRange?.from) {
        searchParams.append("from_date", `${filters.dateRange.from}T00:00:00`);
      }
      if (filters.dateRange?.to) {
        searchParams.append("to_date", `${filters.dateRange.to}T23:59:59`);
      }

      // Price range
      if (filters.priceRange?.from) {
        searchParams.append("price_from", filters.priceRange.from);
      }
      if (filters.priceRange?.to) {
        searchParams.append("price_to", filters.priceRange.to);
      }

      const res = await fetch(`/api/service-bookings?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      
      const bookings = await res.json();
      
      // Fetch related service and user data
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking: any) => {
          const [service, customer] = await Promise.all([
            fetch(`/api/showroom-services/${booking.service_id}`).then(res => res.ok ? res.json() : null),
            fetch(`/api/users/${booking.user_id}`).then(res => res.ok ? res.json() : null),
          ]);
          
          return {
            ...booking,
            service,
            user: customer,
          };
        })
      );

      return enrichedBookings;
    },
  });

  // Mutation for booking actions
  const performAction = useMutation({
    mutationFn: async ({
      id,
      action,
      reason,
    }: {
      id: number;
      action: string;
      reason?: string;
    }) => {
      setActionInProgress(true);

      const endpointMap: Record<string, string> = {
        confirm: "confirm",
        reschedule: "reschedule",
        complete: "complete",
        cancel: "cancel",
        reject: "reject",
      };

      if (!endpointMap[action]) {
        throw new Error("Invalid booking action");
      }

      const response = await apiRequest(
        "PUT",
        `/api/service-bookings/${id}/${endpointMap[action]}`,
        { reason }
      );

      return { action, response };
    },
    onSuccess: ({ action }) => {
      let message = "";
      switch (action) {
        case "confirm":
          message = t("bookings.bookingConfirmed");
          break;
        case "reschedule":
          message = t("bookings.bookingRescheduled");
          break;
        case "complete":
          message = t("bookings.bookingCompleted");
          break;
        case "cancel":
          message = t("bookings.bookingCancelled");
          break;
        case "reject":
          message = t("bookings.bookingRejected");
          break;
      }

      toast({
        title: t("common.success"),
        description: message,
      });

      setActionDialogOpen(false);
      setCurrentBooking(null);
      setActionReason("");
      refetch();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("bookings.actionFailed"),
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
    });
    refetch();
  };

  const handleViewBooking = (booking: ServiceBooking) => {
    setCurrentBooking(booking);
    setViewDialogOpen(true);
  };

  const handleEditBooking = (booking: ServiceBooking) => {
    setCurrentBooking(booking);
    setIsEditing(true);
    setFormDialogOpen(true);
  };

  const handleCreateBooking = () => {
    setCurrentBooking(null);
    setIsEditing(false);
    setFormDialogOpen(true);
  };

  const handleAction = (booking: ServiceBooking, action: ServiceBookingAction) => {
    setCurrentBooking(booking);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!currentBooking) return;
    performAction.mutate({
      id: currentBooking.id,
      action: actionType,
      reason: actionReason,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { color: "bg-gray-100 text-gray-800", text: t("bookings.draft") },
      pending: { color: "bg-yellow-100 text-yellow-800", text: t("bookings.pending") },
      confirmed: { color: "bg-blue-100 text-blue-800", text: t("bookings.confirmed") },
      complete: { color: "bg-green-100 text-green-800", text: t("bookings.complete") },
      expired: { color: "bg-red-100 text-red-800", text: t("bookings.expired") },
      rejected: { color: "bg-red-100 text-red-800", text: t("bookings.rejected") },
    };

    return (
      '<Badge className={statusMap[status as keyof typeof statusMap]?.color || "bg-gray-100 text-gray-800"}>{statusMap[status as keyof typeof statusMap]?.text || status}</Badge>'
    );
  };

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
    currentBooking,
    formDialogOpen,
    setFormDialogOpen,
    isEditing,
    actionType,
    actionReason,
    setActionReason,
    actionInProgress,

    // Data
    bookings,
    isLoading,

    // Functions
    handleSearch,
    resetFilters,
    handleViewBooking,
    handleEditBooking,
    handleCreateBooking,
    handleAction,
    confirmAction,
    getStatusBadge,
    refetch,
  };
};