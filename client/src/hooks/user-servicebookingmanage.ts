import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminServiceBooking, ServiceBooking, ServiceBookingAction } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { roleMapping } from "@shared/permissions";

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
    customer_id: undefined,
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

      // Add role-based filtering
      const roleName = roleMapping[user?.roleId ?? 1];

      if (!roleName) {
        console.warn(`No role mapping found for role ID: ${user?.roleId}`);
        return [];
      }

      // For sellers and showrooms, only fetch their own listings
      if ((roleName === "SELLER" || roleName === "DEALER" || roleName === "GARAGE" ) && user?.id) {
  searchParams.append("user_id", user.id.toString());
}

      if (searchQuery) searchParams.append("search", searchQuery);
      if (statusParam && statusParam !== "all") {
        searchParams.append("status", statusParam);
      }

      if (filters.customer_id) {
        searchParams.append("customer_id", filters.customer_id.toString());
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

      console.log("bookings:", res);
      
      const bookings = await res.json();

      console.log("bookings:", bookings);
      
      return bookings;
    },
  });

  
  // Mutation for booking actions with role-based logic and status handling
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

    console.log("Performing booking action:", { id, action });

    const roleName = roleMapping[user?.roleId];
  const isBookingOwner = currentBooking?.userId === user?.id;

    // Define allowed actions and map to API endpoints if needed
    const endpointMap: Record<string, string> = {
      confirm: "confirm",
      reschedule: "reschedule",
      complete: "complete",
      cancel: "cancel",
      reject: "reject",
      expire: "expire",
    };

    if (!endpointMap[action]) {
      throw new Error("Invalid booking action");
    }

    // Example role-based authorization checks
    // Only admins or booking owner can cancel or reschedule
    if (action === "cancel" || action === "reschedule") {
      if (
        !(roleName === "SUPER_ADMIN" ||
          roleName === "ADMIN" ||
          (isBookingOwner && roleName !== "BUYER"))
      ) {
        throw new Error("Unauthorized to cancel or reschedule booking");
      }
    }

    // Confirm action can be done by admins or booking owner
    if (action === "confirm") {
      if (
        !(roleName === "SUPER_ADMIN" ||
          roleName === "ADMIN" ||
          (isBookingOwner && roleName !== "BUYER"))
      ) {
        throw new Error("Unauthorized to confirm booking");
      }
    }

    // Complete action only by admin or assigned staff
    if (action === "complete") {
      if (
        !(roleName === "SUPER_ADMIN" ||
          roleName === "ADMIN" ||
          roleName === "STAFF")
      ) {
        throw new Error("Unauthorized to complete booking");
      }
    }

    // Reject action only by admins/moderators
    if (action === "reject") {
      if (
        !(
          roleName === "SUPER_ADMIN" ||
          roleName === "ADMIN" ||
          roleName === "MODERATOR" ||
          roleName === "SENIOR_MODERATOR"
        )
      ) {
        throw new Error("Unauthorized to reject booking");
      }
    }

    // Expire action only by admins
    if (action === "expire") {
      if (!(roleName === "SUPER_ADMIN" || roleName === "ADMIN")) {
        throw new Error("Unauthorized to expire booking");
      }
    }

    // Make the API call
    const response = await apiRequest(
      "PUT",
      `/api/service-bookings/${id}/${endpointMap[action]}`,
      { reason }
    );

    return { returnedAction: action, response };
  },

  onSuccess: ({ returnedAction }) => {
    let message = "";
    switch (returnedAction) {
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
      case "expire":
        message = t("bookings.bookingExpired");
        break;
      default:
        message = t("bookings.actionSuccess");
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
      description:
        error instanceof Error ? error.message : t("bookings.actionFailed"),
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
    const roleName = roleMapping[user?.roleId ?? 1];
  const isRestrictedRole = roleName === "SELLER" || roleName === "GARAGE";
    setSearchQuery("");
    setFilters({
      status: "all",
      dateRange: { from: "", to: "" },
      dateRangePreset: "all",
      priceRange: { from: "", to: "" },
      user_id: isRestrictedRole ? user?.id : undefined,
    customer_id: undefined,
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