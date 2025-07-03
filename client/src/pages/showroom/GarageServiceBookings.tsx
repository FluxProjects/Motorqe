import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Check,
  X,
  MoreHorizontal,
  Phone,
  MessageCircle,
  Ban,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ServiceBooking, serviceBookings } from "@shared/schema";
import GarageNavigation from "@/components/showroom/GarageNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn, formatServiceTimeRange, generateTimeSlots } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";


interface GarageAvailability {
  [key: string]: {
    day: string;
    isOpen: boolean;
    startTime: string;
    endTime: string;
  };
}

export default function GarageServiceBookings() {
  const auth = useAuth();
  const { user } = auth;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed">("pending");
  const [sortBy, setSortBy] = useState("old bookings");
  const [rescheduleBookingId, setRescheduleBookingId] = useState<number | null>(null);
  const [newSchedule, setNewSchedule] = useState<string>("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState<{open: boolean, id: number | null}>({open: false, id: null});
  const [rejectDialogOpen, setRejectDialogOpen] = useState<{open: boolean, id: number | null}>({open: false, id: null});
  const [availability, setAvailability] = useState<GarageAvailability | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(new Date());
  const [rescheduleTime, setRescheduleTime] = useState("10:00");
  const queryClient = useQueryClient();
  

  const { data: bookingsData = [], isLoading } = useQuery({
    queryKey: ["/api/service-bookings", { user_id: user?.id }],
    enabled: !!user?.id,
  });

  console.log("bookingsData", bookingsData);

  // Memoized transformation of bookings data
  const bookings =
  bookingsData
    ?.filter((booking: ServiceBooking) =>
      activeTab === "pending"
        ? booking.status === "pending"
        : booking.status === "confirmed"
    )
    .sort((a: ServiceBooking, b: ServiceBooking) =>
      sortBy === "new bookings"
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) ?? [];

console.log("bookings", bookings);

 useEffect(() => {
  const fetchGarageAvailability = async () => {
    console.log("🔍 Inside fetchGarageAvailability");

    const booking = bookings.find((b) => b.id === rescheduleBookingId);
    console.log("📦 Matched booking:", booking);

    if (!booking?.showroom_id) {
      console.log("⚠️ No showroom_id found for rescheduleBookingId");
      return;
    }

    try {
      const res = await fetch(`/api/garages/${booking?.showroom_id}`);
      console.log("🌐 Fetch status:", res.status);
      if (res) {
        const data = await res.json();
        const availability =
          typeof data?.timing === "string"
            ? JSON.parse(data?.timing)
            : data?.timing;

        console.log("✅ timing:", availability);
        setAvailability(availability);
      } else {
        console.error("❌ Failed fetch with status", res.status);
      }
    } catch (error) {
      console.error("❌ Error fetching availability:", error);
    }
  };

  if (rescheduleBookingId) {
    console.log("📆 useEffect triggered with rescheduleBookingId:", rescheduleBookingId);
    fetchGarageAvailability();
  }
}, [rescheduleBookingId, bookings]);




  const showToast = (title: string, variant: "default" | "destructive" = "default") => {
    toast({
      title,
      variant,
    });
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      action,
      reason,
      scheduledAt,
    }: {
      id: number;
      action: "confirm" | "reschedule" | "complete" | "cancel" | "reject" | "expire";
      reason?: string;
      scheduledAt?: string;
    }) => {
      const response = await fetch(`/api/service-bookings/${id}/actions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason, scheduledAt }),
      });

      if (!response.ok) throw new Error("Failed to update booking");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-bookings"] });
      let message = "";
      switch (variables.action) {
        case "confirm":
          message = "Booking confirmed successfully";
          break;
        case "reschedule":
          message = "Booking rescheduled successfully";
          break;
        case "complete":
          message = "Booking marked as complete";
          break;
        case "cancel":
          message = "Booking cancelled";
          break;
        case "reject":
          message = "Booking rejected";
          break;
      }
      showToast(message);
    },
    onError: () => {
      showToast("Failed to update booking", "destructive");
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/service-bookings/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete booking");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-bookings"] });
      showToast("Booking deleted successfully");
    },
    onError: () => {
      showToast("Failed to delete booking", "destructive");
    },
  });

  const handleConfirm = (id: number) => {
    updateStatusMutation.mutate({ id, action: "confirm" });
  };

  const handleReject = (id: number) => {
    updateStatusMutation.mutate({ id, action: "reject" });
    setRejectDialogOpen({open: false, id: null});
  };

  const handleCancel = (id: number) => {
    updateStatusMutation.mutate({ id, action: "cancel" });
    setCancelDialogOpen({open: false, id: null});
  };

  const handleReschedule = (id: number, scheduledAt: string) => {
    updateStatusMutation.mutate({ id, action: "reschedule", scheduledAt });
    setRescheduleBookingId(null);
    setNewSchedule("");
  };

  const handleComplete = (id: number) => {
    updateStatusMutation.mutate({ id, action: "complete" });
  };

  const handleCall = (mobileNo: string) => {
    window.open(`tel:${mobileNo}`, "_self");
  };

  const handleWhatsapp = (mobileNo: string) => {
    const cleanNumber = mobileNo.replace(/[^\d]/g, "");
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatBookingDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPpp");
    } catch {
      return dateString;
    }
  };

  

const getDayKey = (date: Date): string => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[date.getDay()];
};

const currentDayKey = rescheduleDate ? getDayKey(rescheduleDate) : "mon";
const currentAvailability = availability?.[currentDayKey];

const timeSlots = useMemo(() => {
  if (!currentAvailability?.isOpen) return [];
  return generateTimeSlots(currentAvailability.startTime, currentAvailability.endTime);
}, [currentAvailability]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading bookings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GarageNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Bookings:</h1>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="old bookings">sort by old bookings</SelectItem>
              <SelectItem value="new bookings">sort by new bookings</SelectItem>
              <SelectItem value="date">sort by date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-neutral-50 rounded-2xl shadow-sm border-2 border-orange-500 overflow-hidden">
          <div className="flex border-b border-orange-200">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "pending"
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-orange-500"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 bg-motoroe-orange rounded-full flex items-center justify-center text-white text-xs">
                  📋
                </div>
                <span>Booking Requests</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("confirmed")}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "confirmed"
                  ? "border-blue-900 text-blue-900"
                  : "border-transparent text-blue-900"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 bg-motoroe-blue rounded-full flex items-center justify-center text-white text-xs">
                  📧
                </div>
                <span>Confirmed Bookings</span>
              </div>
            </button>
          </div>

          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No{" "}
                {activeTab === "pending"
                  ? "booking requests"
                  : "confirmed bookings"}{" "}
                found.
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: ServiceBooking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col md:flex-row justify-center pt-4 pb-4 bg-neutral-50 gap-20 border-b-2 border-orange-500/25"
                  >
                    <div className="w-[150px]flex items-center space-x-4">
                      {booking.id}
                    </div>
                    <div className="w-[300px] flex items-start justify-items-start text-left space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gray-300 text-gray-700">
                          {getInitials(
                            `${booking?.user?.first_name || ""} ${
                              booking?.user?.last_name || ""
                            }`
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {booking?.user?.first_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking?.service_name}
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        Booking Date & Time
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatBookingDate(booking?.scheduled_at)}
                      </p>
                    </div>

                    <div className="flex items-center justify-end md:justify-start space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleCall(booking?.user?.phone)}
                          >
                            <Phone className="h-4 w-4 mr-2 text-blue-500" />
                            Call
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleWhatsapp(booking?.user?.phone)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                            Whatsapp
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setCancelDialogOpen({open: true, id: booking?.id})}
                          >
                            <Ban className="h-4 w-4 mr-2 text-red-500" />
                            Cancel
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              if (booking.status === "confirmed") {
                                toast({
                                  title: "Contact Admin to reschedule this booking",
                                  variant: "destructive",
                                });
                                return;
                              }
                              setRescheduleBookingId(booking.id);
                            }}
                          >
                            <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                            Reschedule
                          </DropdownMenuItem>


                         
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                            onClick={() => setRejectDialogOpen({open: true, id: booking.id})}
                            size="sm"
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>

                      {activeTab === "pending" && (
                        <>
                          <Button
                            onClick={() => handleConfirm(booking.id)}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>

                          
                        </>
                      )}

                       {activeTab === "confirmed" && (
                              <>
                          <Button
                            onClick={() => handleComplete(booking.id)}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>

                          
                        </>
                          )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Reschedule Dialog */}
        {rescheduleBookingId && (
          <Dialog open={!!rescheduleBookingId} onOpenChange={() => setRescheduleBookingId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reschedule Booking</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">New Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !rescheduleDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {rescheduleDate ? (
                            format(rescheduleDate, "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={rescheduleDate}
                          onSelect={setRescheduleDate}
                          disabled={(date) => {
                            const dayKey = getDayKey(date);
                            const isDayOpen = availability?.[dayKey]?.isOpen;
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return !isDayOpen || date < today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">New Time</label>
                    <select
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
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

                {!currentAvailability?.isOpen && rescheduleDate && (
                  <p className="text-sm text-red-500">
                    The garage is closed on {format(rescheduleDate, "PPPP")}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    if (rescheduleDate && rescheduleTime) {
                      const scheduledAt = new Date(
                        `${format(rescheduleDate, "yyyy-MM-dd")}T${rescheduleTime}`
                      ).toISOString();
                      handleReschedule(rescheduleBookingId, scheduledAt);
                      setRescheduleDate(new Date());
                      setRescheduleTime("10:00");
                    }
                  }}
                  disabled={!rescheduleDate || !rescheduleTime || !currentAvailability?.isOpen}
                >
                  Confirm Reschedule
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setRescheduleBookingId(null);
                    setRescheduleDate(new Date());
                    setRescheduleTime("10:00");
                  }}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog 
          open={cancelDialogOpen.open} 
          onOpenChange={(open) => setCancelDialogOpen({open, id: null})}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Cancellation</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to cancel this booking?</p>
            <DialogFooter>
              <Button 
                variant="destructive"
                onClick={() => handleCancel(cancelDialogOpen.id!)}
              >
                Cancel Booking
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setCancelDialogOpen({open: false, id: null})}
              >
                Go Back
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Confirmation Dialog */}
        <Dialog 
          open={rejectDialogOpen.open} 
          onOpenChange={(open) => setRejectDialogOpen({open, id: null})}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Rejection</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to reject this booking request?</p>
            <DialogFooter>
              <Button 
                variant="destructive"
                onClick={() => handleReject(rejectDialogOpen.id!)}
              >
                Reject Booking
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setRejectDialogOpen({open: false, id: null})}
              >
                Go Back
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}