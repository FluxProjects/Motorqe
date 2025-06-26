import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Clock, DollarSign, Filter, Search, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { roleMapping } from "@shared/permissions";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn, formatServiceTimeRange, generateTimeSlots } from "@/lib/utils";
import { format } from "date-fns";
import React from "react";

interface ServiceBooking {
  id: number;
  serviceName: string;
  customerName: string;
  scheduledAt: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rejected" | "rescheduled";
  price: number;
  userId: number;
  // Add other booking properties as needed
}

interface GarageAvailability {
  [key: string]: {
    day: string;
    isOpen: boolean;
    startTime: string;
    endTime: string;
  };
}

const statusTabs = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "rejected", label: "Rejected" },
];

export default function ServiceBookingsManagement() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // State for filters and search
  const [currentTab, setCurrentTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: { from: undefined, to: undefined } as DateRange,
    priceRange: { from: "", to: "" },
    customer_id: undefined as number | undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionReason, setActionReason] = useState("");
  const [actionInProgress, setActionInProgress] = useState(false);
  const [newScheduledDate, setNewScheduledDate] = useState<string>("");
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [availability, setAvailability] = useState<GarageAvailability | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("10:00");

  // Fetch all bookings for count calculation
const { data: allBookings = [] } = useQuery<ServiceBooking[]>({
  queryKey: ["all-service-bookings", user?.id],
  queryFn: async () => {
    const searchParams = new URLSearchParams();
    
    // Add role-based filtering
    const roleName = roleMapping[user.roleId];
    if ((roleName === "SELLER" || roleName === "DEALER" || roleName === "GARAGE") && user?.id) {
      searchParams.append("user_id", user.id.toString());
    }
    
    const res = await fetch(`/api/service-bookings?${searchParams.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch all bookings");
    return res.json();
  },
});

// Then use this for your status counts
const statusCounts = allBookings.reduce(
  (acc, booking) => {
    acc[booking?.status] = (acc[booking?.status] || 0) + 1;
    acc.all++;
    return acc;
  },
  { all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, rejected: 0, rescheduled: 0 }
);

  // Data fetching
  // Update your query function to properly handle filters
const {
  data: bookings = [],
  isLoading,
  refetch,
} = useQuery<ServiceBooking[]>({
  queryKey: ["service-bookings", currentTab, searchQuery, filters, user?.id],
  queryFn: async () => {
    const searchParams = new URLSearchParams();

    // Add role-based filtering
    const roleName = roleMapping[user.roleId];
    if ((roleName === "SELLER" || roleName === "DEALER" || roleName === "GARAGE") && user?.id) {
      searchParams.append("user_id", user.id.toString());
    }

    // Search query
    if (searchQuery) {
      searchParams.append("search", searchQuery);
    }

    // Status filtering - prioritize tab selection over filter status
    const statusFilter = currentTab !== "all" ? currentTab : filters.status;
    if (statusFilter && statusFilter !== "all") {
      searchParams.append("status", statusFilter);
    }

    // Customer filter
    if (filters.customer_id) {
      searchParams.append("customer_id", filters.customer_id.toString());
    }

    // Date range filter - properly format dates
    if (filters.dateRange?.from) {
      const fromDate = new Date(filters.dateRange.from);
      searchParams.append("from_date", fromDate.toISOString());
    }
    if (filters.dateRange?.to) {
      const toDate = new Date(filters.dateRange.to);
      // Set to end of day
      toDate.setHours(23, 59, 59, 999);
      searchParams.append("to_date", toDate.toISOString());
    }

    // Price range filter - validate numbers
    if (filters.priceRange.from && !isNaN(Number(filters.priceRange.from))) {
      searchParams.append("price_from", filters.priceRange.from);
    }
    if (filters.priceRange.to && !isNaN(Number(filters.priceRange.to))) {
      searchParams.append("price_to", filters.priceRange.to);
    }

    console.log("Fetching with params:", searchParams.toString());

    const res = await fetch(`/api/service-bookings?${searchParams.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch bookings");
    return res.json();
  },
});

useEffect(() => {
  const fetchGarageAvailability = async () => {
    try {
      const res = await fetch(`/api/garages/${selectedBooking?.showroom_id}`);
      if (res.ok) {
        const data = await res.json();
        const availability = typeof data?.timing === "string" ? JSON.parse(data?.timing): data?.timing;
        console.log("timing", availability);
        setAvailability(availability);
      }
    } catch (error) {
      console.error("Failed to fetch garage availability:", error);
    }
  };

  if (selectedBooking?.showroom_id) {
    fetchGarageAvailability();
  }
}, [selectedBooking]);

const getDayKey = (date: Date): string => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[date.getDay()];
};

const currentDayKey = date ? getDayKey(date) : "mon";
const currentAvailability = availability?.[currentDayKey];

const timeSlots = React.useMemo(() => {
  if (!currentAvailability?.isOpen) return [];
  return generateTimeSlots(currentAvailability.startTime, currentAvailability.endTime);
}, [currentAvailability]);

  // Mutation for booking actions with role-based logic and status handling
  const performAction = useMutation({
    mutationFn: async ({
      id,
      action,
      reason,
      scheduledAt,
    }: {
      id: number;
      action: string;
      reason?: string;
      scheduledAt?: string;
    }) => {
      setActionInProgress(true);

      const roleName = roleMapping[user?.roleId ?? 1];
      const isBookingOwner = selectedBooking?.userId === user?.id;

      // Define allowed actions and map to API endpoints
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

      // Role-based authorization checks
      if (action === "cancel" || action === "reschedule") {
        if (
          !(roleName === "SUPER_ADMIN" ||
            roleName === "ADMIN" ||
            (isBookingOwner && roleName !== "BUYER"))
        ) {
          throw new Error("Unauthorized to cancel or reschedule booking");
        }
      }

      if (action === "confirm") {
        if (
          !(roleName === "SUPER_ADMIN" ||
            roleName === "ADMIN" ||
            (isBookingOwner && roleName !== "BUYER"))
        ) {
          throw new Error("Unauthorized to confirm booking");
        }
      }

      if (action === "complete") {
        if (
          !(roleName === "SUPER_ADMIN" ||
            roleName === "ADMIN" ||
            roleName === "MODERATOR")
        ) {
          throw new Error("Unauthorized to complete booking");
        }
      }

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

      if (action === "expire") {
        if (!(roleName === "SUPER_ADMIN" || roleName === "ADMIN")) {
          throw new Error("Unauthorized to expire booking");
        }
      }

      const payload: any = { action };
      if (reason) payload.reason = reason;
      if (action === "reschedule" && scheduledAt) payload.scheduledAt = scheduledAt;

      // Make the API call
      const response = await fetch(`/api/service-bookings/${id}/actions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });


      if (!response.ok) {
        throw new Error("Failed to perform action");
      }

      return { returnedAction: action, response: await response.json() };
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
      setSelectedBooking(null);
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
    setSearchQuery("");
  setCurrentTab("all");
  setFilters({
    status: "all",
    dateRange: { from: undefined, to: undefined },
    priceRange: { from: "", to: "" },
    customer_id: undefined,
  });
    refetch();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "rejected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatForDateTimeInput = (dateString: string) => {
  const date = new Date(dateString);
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

  const handleActionDialogOpen = (booking: ServiceBooking) => {
  setSelectedBooking(booking);
  setActionDialogOpen(true);
  // Initialize with current booking time
  setNewScheduledDate(formatForDateTimeInput(booking?.scheduled_at));
};

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="hidden md:block">
              {user?.roleId && (
                <DashboardSidebar type={roleMapping[user?.roleId] || "SELLER"} />
              )}
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Service Bookings Management
                </h1>
              </div>

              {/* Filters and Search */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <form onSubmit={handleSearch} className="flex-1 w-full">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search bookings..."
                        className="pl-10 w-full"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          // Remove the form submission handler
                        }}
                      />
                    </div>
                  </form>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                    <Button variant="outline" onClick={resetFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) =>
                          setFilters({ ...filters, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Range
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="date"
                          value={filters.dateRange.from?.toString() || ""}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              dateRange: {
                                ...filters.dateRange,
                                from: e.target.value,
                              },
                            })
                          }
                          className="w-full"
                        />
                        <span>to</span>
                        <Input
                          type="date"
                          value={filters.dateRange.to?.toString() || ""}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              dateRange: {
                                ...filters.dateRange,
                                to: e.target.value,
                              },
                            })
                          }
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Range
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.priceRange.from}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              priceRange: {
                                ...filters.priceRange,
                                from: e.target.value,
                              },
                            })
                          }
                          className="w-full"
                        />
                        <span>to</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.priceRange.to}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              priceRange: {
                                ...filters.priceRange,
                                to: e.target.value,
                              },
                            })
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Tabs */}
              <div className="flex overflow-x-auto pb-2 mb-6">
                <div className="flex space-x-1">
                  {statusTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${
                      currentTab === tab.id
                        ? "bg-orange-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {statusCounts[tab.id as keyof typeof statusCounts] > 0 && (
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          currentTab === tab.id
                            ? "bg-white text-orange-500"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {statusCounts[tab.id as keyof typeof statusCounts]}
                      </span>
                    )}
                  </button>
                ))}
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Garage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.length > 0 ? (
                        bookings.map((booking) => (
                          <tr
                            key={booking?.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {booking?.service?.service.name}
                                <p className="text-sm text-neutral-500">{booking?.service?.service.nameAr}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {booking?.showroom_name}
                                {booking?.showroom_name_ar && (
                                  <p className="text-sm text-neutral-500">{booking?.showroom_name_ar}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {booking?.customer_first_name} {booking?.customer_last_name}
                                <p className="text-sm text-neutral-500">{booking?.customer_name}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 text-gray-500 mr-1" />
                                <span className="text-sm text-gray-900">
                                  {formatDate(booking?.scheduled_at)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                                <span className="text-sm text-gray-900">
                                  {booking?.price}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                                  booking?.status
                                )}`}
                              >
                                {booking?.status?.charAt(0).toUpperCase() +
                                  booking?.status?.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBooking(booking);
                                  setActionDialogOpen(true);
                                }}
                              >
                                Actions
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No bookings found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Booking Details Modal */}
              {selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Booking Details
                        </h2>
                        <button
                          onClick={() => setSelectedBooking(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Service Information
                          </h3>
                          <div className="mt-2 space-y-2">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Service:</span>{" "}
                              {selectedBooking?.service?.service.name} ({selectedBooking?.service?.service.nameAr})
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Price:</span> $
                              {selectedBooking?.price}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Customer Information
                          </h3>
                          <div className="mt-2 space-y-2">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Name:</span>{" "}
                              {selectedBooking?.customer_first_name} {selectedBooking?.customer_last_name}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Booking Information
                          </h3>
                          <div className="mt-2 space-y-2">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Date & Time:</span>{" "}
                              {formatDate(selectedBooking?.scheduled_at)}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Status:</span>{" "}
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                                  selectedBooking?.status
                                )}`}
                              >
                                {selectedBooking?.status?.charAt(0).toUpperCase() +
                                  selectedBooking?.status?.slice(1)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedBooking(null)}
                        >
                          Close
                        </Button>
                        <Button
                          onClick={() => setActionDialogOpen(true)}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          Take Action
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Dialog */}
              {actionDialogOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                    <div className="px-6 py-5 border-b flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Manage Booking</h2>
                      <button
                        onClick={() => {
                          setActionDialogOpen(false);
                          setCurrentAction(null);
                          setNewScheduledDate("");
                        }}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="p-6 space-y-6">
                      <div>
                        <p className="text-sm text-gray-600">
                          Choose an action to perform for the selected booking.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {selectedBooking?.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => {
                                setCurrentAction("confirm");
                                performAction.mutate({
                                  id: selectedBooking.id,
                                  action: "confirm",
                                });
                              }}
                              disabled={actionInProgress}
                            >
                              ✅ Confirm Booking
                            </Button>

                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => {
                                setCurrentAction("reject");
                                performAction.mutate({
                                  id: selectedBooking.id,
                                  action: "reject",
                                  reason: actionReason,
                                });
                              }}
                              disabled={actionInProgress}
                            >
                              ❌ Reject Booking
                            </Button>
                          </>
                        )}

                        {selectedBooking?.status === "confirmed" && (
                          <>
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => {
                                setCurrentAction("complete");
                                performAction.mutate({
                                  id: selectedBooking.id,
                                  action: "complete",
                                });
                              }}
                              disabled={actionInProgress}
                            >
                              ✅ Mark as Completed
                            </Button>

                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => {
                                setCurrentAction("cancel");
                                performAction.mutate({
                                  id: selectedBooking.id,
                                  action: "cancel",
                                  reason: actionReason,
                                });
                              }}
                              disabled={actionInProgress}
                            >
                              ❌ Cancel Booking
                            </Button>
                          </>
                        )}

                        {(selectedBooking?.status === "pending" ||
                          selectedBooking?.status === "confirmed") && (
                          <>
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => {
                                if (currentAction === "reschedule" && newScheduledDate) {
                                  performAction.mutate({
                                    id: selectedBooking.id,
                                    action: "reschedule",
                                    reason: actionReason,
                                    scheduledAt: newScheduledDate,
                                  });
                                } else {
                                  setCurrentAction("reschedule");
                                }
                              }}
                              disabled={
                                actionInProgress ||
                                (currentAction === "reschedule" && !newScheduledDate)
                              }
                            >
                              📅 {currentAction === "reschedule"
                                ? "Confirm Reschedule"
                                : "Reschedule Booking"}
                            </Button>

                            {currentAction === "reschedule" && (
                              <div className="mt-4 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-gray-700">
                                    New Date
                                  </label>
                                  <Popover>
                                              <PopoverTrigger asChild>
                                                <Button
                                                  variant="outline"
                                                  className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                  )}
                                                >
                                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                                  {date ? (
                                                    format(date, "PPP")
                                                  ) : (
                                                    <span>{t("services.pickDate")}</span>
                                                  )}
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                  mode="single"
                                                  selected={date}
                                                  onSelect={setDate}
                                                  disabled={(date) => {
                                                    const dayKey = getDayKey(date); // safely get "mon", "tue", etc.
                                                    const isDayOpen = availability?.[dayKey]?.isOpen;
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0); // normalize to midnight
                                  
                                                    return !isDayOpen || date < today;
                                                  }}
                                                  initialFocus
                                                />
                                              </PopoverContent>
                                            </Popover>
                                </div>

                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-gray-700">
                                    New Time
                                  </label>
                                  <select
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                    required
                                  >
                                    <option value="" disabled>Select time</option>
                                    {timeSlots.map((slot) => (
                                      <option key={slot} value={slot}>
                                        {formatServiceTimeRange(slot)}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {!currentAvailability?.isOpen && date && (
                                <p className="text-sm text-red-500">
                                  The garage is closed on {format(date, "PPPP")}
                                </p>
                              )}
                            </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Reason (optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter reason for this action..."
                          value={actionReason}
                          onChange={(e) => setActionReason(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t flex justify-end space-x-3">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setActionDialogOpen(false);
                          setCurrentAction(null);
                          setNewScheduledDate("");
                        }}
                        disabled={actionInProgress}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            </main>

        </div>
      </div>
    </div>
  </div>
  );
}