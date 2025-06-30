import { Check, Phone, MessageCircle, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { CarService, Showroom, ShowroomService, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getServiceNames } from "@/lib/utils";

interface ServicePrice {
  serviceId: string;
  price: number;
  currency: string;
}

interface BookingPayload {
  id?: string;
  showroomId?: string;
  showroomServiceIds: string[];
  userId?: string;
  user?: User[];
  scheduledAt?: string;
  notes?: string;
  servicePrices?: ServicePrice[];
  totalPrice?: number;
}

export default function ServiceBookingConfirmation() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [payloadWithId, setPayloadWithId] = useState<BookingPayload | null>(
    null
  );
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get("data");
    if (dataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(dataParam));
        setPayloadWithId(parsed);
      } catch (error) {
        console.error("Failed to parse booking data:", error);
        toast({
          title: "Error",
          description: "Failed to load booking details",
          variant: "destructive",
        });
      }
    }
  }, []);

  const {
    data: showroom,
    isLoading: isLoadingShowroom,
    isError: isErrorShowroom,
  } = useQuery<Showroom>({
    queryKey: [`/api/garages/${payloadWithId?.showroomId}`],
    enabled: !!payloadWithId?.showroomId,
  });

  const { data: showroomServices = [], isLoading: isLoadingShowroomServices } =
    useQuery<ShowroomService[]>({
      queryKey: [`/api/showrooms/${payloadWithId?.showroomId}/services`],
      enabled: !!payloadWithId?.showroomId,
    });

  const { data: carServices = [], isLoading: isLoadingCarServices } = useQuery<
    CarService[]
  >({
    queryKey: [`/api/services`],
  });

  const { data: garageMakes = [], isLoading: isLoadingMakes } = useQuery<any[]>(
    {
      queryKey: [`/api/garages/${payloadWithId?.showroomId}/makes`],
      enabled: !!payloadWithId?.showroomId,
    }
  );

  const handlePhoneCall = () => {
    if (!showroom?.phone) {
      toast({
        title: "Phone number unavailable",
        description: "No phone number found for this showroom.",
        variant: "destructive",
      });
      return;
    }

    window.open(`tel:${showroom?.phone}`, "_self");
  };

  const handleMessage = () => {
    if (!showroom?.phone) {
      toast({
        title: "Phone number unavailable",
        description: "No phone number found for this showroom.",
        variant: "destructive",
      });
      return;
    }

    window.open(`https://wa.me/${showroom?.phone}`, "_blank");
  };

  const handleLocation = () => {
    toast({
      title: "Opening Maps",
      description:
        "Showing location: 12A Workshop Industrial Area, Doha, Qatar",
    });
    window.open(
      "https://maps.google.com/?q=12A+Workshop+Industrial+Area+Doha+Qatar",
      "_blank"
    );
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async () => {
    try {
      if (!payloadWithId?.id) {
        toast({
          title: "Error",
          description: "Booking ID not found.",
          variant: "destructive",
        });
        return;
      }
      if (!cancelReason.trim()) {
        toast({
          title: "Reason required",
          description: "Please provide a reason for cancellation.",
          variant: "destructive",
        });
        return;
      }

      setIsCancelling(true);
      await apiRequest(
        "PUT",
        `/api/service-bookings/${payloadWithId.id}/cancel`,
        { reason: cancelReason }
      );

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });

      setShowCancelDialog(false);
      setCancelReason("");
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error?.message || "Could not cancel booking.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleBackToGarage = () => {
    if (showroom?.id) {
      setLocation(`/garages/${showroom.id}`);
    }
  };

  const serviceNames = getServiceNames(
    payloadWithId?.showroomServiceIds,
    carServices
  );
  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-gray-900">
            Car Service Booking
          </h3>
          <p className="text-neutral-500 text-center">
            Service your car in seconds with just few clicks
          </p>
        </div>
        {/* Success Message */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-900">
            Your Booking Has Been Successful!
          </h3>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden w-full mx-auto">
          {/* Company Logo/Header */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="mb-4">
              {/* Large GSF Logo */}
              <div className="bg-neutral-50 text-white w-full rounded-t-lg p-4 flex items-center justify-center">
  {showroom?.logo && (
    <img
      src={showroom.logo}
      alt="Showroom Logo"
      className="max-h-[200px] object-contain"
    />
  )}
</div>

            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-700 mb-1">
                {showroom?.name || showroom?.nameAr}
              </h2>
              <p className="text-gray-700 text-base">
                {showroom?.address || showroom?.addressAr}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-4">
              <Button
                onClick={handlePhoneCall}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm font-bold rounded-lg min-w-[120px]"
              >
                <Phone className="w-4 h-4 mr-2" />
                {showroom?.phone || "Call"}
              </Button>
              <Button
                onClick={handleMessage}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-sm font-bold rounded-lg min-w-[120px]"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {showroom?.phone || "Message"}
              </Button>
              <Button
                onClick={handleLocation}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-sm font-bold rounded-lg min-w-[120px]"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Location
              </Button>
              <Button
                onClick={handleCancel}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 text-sm font-bold rounded-lg min-w-[120px]"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6 space-y-3">
            <div className="flex justify-between text-base">
              <span className="font-bold text-gray-900">Booking Made For:</span>
              <span className="text-gray-900">
                {user.firstName} {user.lastName}
                {payloadWithId?.user?.phone && (
                  <> ({payloadWithId.user.phone})</>
                )}
              </span>
            </div>

            <div className="flex justify-between text-base">
              <span className="font-bold text-gray-900">Category:</span>
              <span className="text-gray-900">{serviceNames}</span>
            </div>

            <div className="flex justify-between text-base">
              <span className="font-bold text-gray-900">Date:</span>
              <span className="text-gray-900">
                {payloadWithId?.scheduledAt
                  ? new Date(payloadWithId.scheduledAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>

            <div className="flex justify-between text-base">
              <span className="font-bold text-gray-900">Time:</span>
              <span className="text-gray-900">
                {payloadWithId?.scheduledAt
                  ? new Date(payloadWithId.scheduledAt).toLocaleTimeString()
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Payment Note & Selected Work Section */}
          <div className="px-6 pb-4">
            <p className="text-base font-bold text-gray-900 mb-4">
              <span className="font-bold">Note:</span>{" "}
              {payloadWithId?.notes || "No notes provided"}
            </p>

            {/* Selected Work Box */}
            <div className="border-2 border-gray-400 rounded-md overflow-hidden">
              {/* Header */}
              <div className="bg-white p-4 border-b border-gray-300">
                <h3 className="text-center text-xl font-medium text-blue-600">
                  Selected Work
                </h3>
                <div className="w-20 h-1 bg-orange-500 mx-auto mt-1"></div>
              </div>

              {/* Work Items */}
              <div className="bg-white p-4 space-y-3">
                {payloadWithId?.servicePrices?.map((service, idx) => {
                  // Find the matching service details
                  const serviceDetails = showroomServices?.find(
                    (s) => s.id === service.serviceId
                  );

                  return (
                    <div
                      key={`${service.serviceId}-${idx}`}
                      className="flex justify-between text-base"
                    >
                      <span className="text-neutral-800 font-bold">
                        {idx + 1} -{" "}
                        {serviceDetails?.description ||
                          `Service ID: ${service.serviceId}`}
                      </span>
                      <span className="text-neutral-800 font-medium">
                        {service.currency} {service?.price != null
                ? Number(service?.price).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })
                : "0"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total Price */}
              <div className="bg-blue-900 text-white p-4 text-center">
                <div className="text-xl justify-end items-end text-right font-bold">
                  Total Price:{" "}
                  {payloadWithId?.servicePrices?.[0]?.currency || "QR"}{" "}
                  {payloadWithId?.totalPrice != null
                ? Number(payloadWithId?.totalPrice).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })
                : "0"}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Information */}
          <div className="p-6 bg-white">
            <h4 className="font-bold text-gray-900 mb-2 text-base underline">
              Important Information
            </h4>
            <p className="text-gray-700 mb-4 text-base">
              Terms & Conditions & Policies Apply.
            </p>
            <p className="text-gray-900 text-base">
              <span className="font-bold underline">
                Copyright © 2025 Motorqe.com. All Rights Reserved.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking?</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Please provide a reason for cancelling this booking.
              </p>
            </DialogHeader>

            <div className="space-y-2 mt-2">
              <Label htmlFor="cancelReason">Cancellation Reason</Label>
              <Input
                id="cancelReason"
                placeholder="Enter reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <DialogFooter className="mt-4 flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowCancelDialog(false)}
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancelBooking}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
