import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, MoreHorizontal, Phone, MessageCircle, Ban, Calendar } from "lucide-react";
import type { ServiceBooking } from "@shared/schema";
import GarageNavigation from "@/components/dashboard/GarageNavigation";
import { format } from "date-fns";

export default function ManageServiceBookings() {
  const [activeTab, setActiveTab] = useState<"requests" | "today">("requests");
  const [sortBy, setSortBy] = useState("old bookings");
  const queryClient = useQueryClient();

 const today = format(new Date(), "yyyy-MM-dd");

const { data: bookings = [], isLoading } = useQuery({
  queryKey: ["/api/service-bookings"],
  select: (data: ServiceBooking[]) =>
    data.filter((booking) =>
      activeTab === "requests"
        ? booking.status === "pending"
        : booking.status === "confirmed" && booking.scheduledAt === today
    ),
});

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/service-bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-bookings"] });
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
    },
  });

  const handleConfirm = (id: number) => {
    updateStatusMutation.mutate({ id, status: "confirmed" });
  };

  const handleReject = (id: number) => {
    updateStatusMutation.mutate({ id, status: "rejected" });
  };

  const handleCall = (mobileNo: string) => {
    window.open(`tel:${mobileNo}`, '_self');
  };

  const handleWhatsapp = (mobileNo: string) => {
    const cleanNumber = mobileNo.replace(/[^\d]/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const handleCancel = (id: number) => {
    deleteBookingMutation.mutate(id);
  };

  const handleReschedule = (id: number) => {
    console.log("Reschedule booking:", id);
    // Implement reschedule functionality
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
    <div className="min-h-screen bg-gray-50">
      
      {/* Sub Navigation */}
      <div className="bg-white border-b border-gray-200">
        <GarageNavigation />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Bookings:</h1>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="old bookings">sort by old bookings</SelectItem>
              <SelectItem value="new bookings">sort by new bookings</SelectItem>
              <SelectItem value="date">sort by date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-white rounded-2xl shadow-sm border-2 border-motoroe-orange overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "requests"
                  ? "border-motoroe-orange text-motoroe-orange bg-gray-50"
                  : "border-transparent text-gray-500 hover:text-motoroe-orange"
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
              onClick={() => setActiveTab("today")}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "today"
                  ? "border-motoroe-blue text-motoroe-blue bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-motoroe-blue"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 bg-motoroe-blue rounded-full flex items-center justify-center text-white text-xs">
                  📧
                </div>
                <span>Todays Bookings</span>
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No {activeTab === "requests" ? "booking requests" : "bookings for today"} found.
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gray-300 text-gray-700">
                          {getInitials(booking.user.first_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">{booking.user.first_name}</h3>
                        <p className="text-sm text-gray-600">
                          {booking.vehicleMake} {booking.vehicleModel}
                        </p>
                        <p className="text-xs text-gray-500">{booking.user.phone}</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">Booking Date & Time</p>
                      <p className="text-xs text-gray-500">{booking.scheduledAt}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleCall(booking.user.phone)}>
                            <Phone className="h-4 w-4 mr-2 text-blue-500" />
                            Call
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleWhatsapp(booking.user.phone)}>
                            <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                            Whatsapp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCancel(booking.id)}>
                            <Ban className="h-4 w-4 mr-2 text-red-500" />
                            Cancel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReschedule(booking.id)}>
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            Reschedule
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        onClick={() => handleConfirm(booking.id)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
                        disabled={updateStatusMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>

                      <Button
                        onClick={() => handleReject(booking.id)}
                        size="sm"
                        variant="destructive"
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                        disabled={updateStatusMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}