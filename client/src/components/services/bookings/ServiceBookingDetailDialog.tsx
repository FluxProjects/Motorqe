import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Check, X, Calendar, Clock, Wrench, User, MapPin, Trash2, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminServiceBooking } from "@shared/schema";

interface ServiceBookingDetailDialogProps {
  booking: AdminServiceBooking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleAction: (booking: AdminServiceBooking, action: 'confirm' | 'reschedule' | 'complete' | 'cancel' | 'reject') => void;
}

export const ServiceBookingDetailDialog = ({
  booking,
  open,
  onOpenChange,
  handleAction,
}: ServiceBookingDetailDialogProps) => {
  const { t } = useTranslation();

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
      <Badge className={statusMap[status as keyof typeof statusMap]?.color || "bg-gray-100 text-gray-800"}>
        {statusMap[status as keyof typeof statusMap]?.text || status}
      </Badge>
    );
  };

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-white text-gray-900 border-gray-200 max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl text-gray-900">
          {t("bookings.bookingDetails")} #{booking.id}
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Service Details */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-lg flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            {t("services.serviceDetails")}
          </h3>

          <div className="mt-3 space-y-3">
            <div>
              <h4 className="text-gray-500 text-sm">{t("services.serviceName")}</h4>
              <p>{booking?.service_name || t("services.unknownService")}</p>
            </div>

            <div>
              <h4 className="text-gray-500 text-sm">{t("services.description")}</h4>
              <p>{booking?.service?.description || t("services.noDescription")}</p>
            </div>

            <div>
              <h4 className="text-gray-500 text-sm">{t("services.price")}</h4>
              <p className="text-2xl font-bold text-blue-600">
                {booking?.currency} {booking.price}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {t("bookings.bookingInfo")}
          </h3>

          <div className="mt-3 space-y-3">
            <div>
              <h4 className="text-gray-500 text-sm">{t("bookings.scheduledTime")}</h4>
              <p className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {new Date(booking?.scheduled_at).toLocaleString()}
              </p>
            </div>

            <div>
              <h4 className="text-gray-500 text-sm">{t("bookings.status")}</h4>
              <div>{getStatusBadge(booking?.status)}</div>
            </div>

            <div>
              <h4 className="text-gray-500 text-sm">{t("bookings.createdAt")}</h4>
              <p>{new Date(booking?.created_at).toLocaleString()}</p>
            </div>

            {booking?.notes && (
              <div>
                <h4 className="text-gray-500 text-sm">{t("bookings.notes")}</h4>
                <p className="whitespace-pre-line">{booking?.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-lg flex items-center">
            <User className="h-5 w-5 mr-2" />
            {t("bookings.customerInfo")}
          </h3>

          <div className="mt-3 flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={booking.user?.avatar} />
              <AvatarFallback className="bg-blue-500 text-white">
                {booking.user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <h4 className="font-medium">
                {booking.user?.first_name} {booking.user?.last_name}
              </h4>
              <p className="text-gray-500 text-sm">{booking.user?.email || "N/A"}</p>
              <p className="text-gray-500 text-sm flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {booking.user?.location || t("bookings.locationUnknown")}
              </p>
            </div>
          </div>
        </div>

        {/* Showroom Details */}
        {booking.showroom && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              {t("bookings.showroomInfo")}
            </h3>

            <div className="mt-3">
              <h4 className="font-medium">{booking?.showroom_name}</h4>
              <p className="text-gray-500 text-sm">
                {booking?.services?.showroom.address}
              </p>
              <p className="text-gray-500 text-sm">
                {booking?.services?.showroom.contactNumber}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          {t("common.close")}
        </Button>

        <div className="space-x-2">
          {booking.status === "pending" && (
            <>
              <Button
                variant="outline"
                className="border-red-300 bg-red-100 text-red-600 hover:bg-red-200"
                onClick={() => {
                  onOpenChange(false);
                  handleAction(booking, "reject");
                }}
              >
                <X className="mr-2 h-4 w-4" />
                {t("bookings.reject")}
              </Button>

              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  onOpenChange(false);
                  handleAction(booking, "confirm");
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                {t("bookings.confirm")}
              </Button>
            </>
          )}

          {booking.status === "confirmed" && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                onOpenChange(false);
                handleAction(booking, "complete");
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {t("bookings.complete")}
            </Button>
          )}

          {["pending", "confirmed"].includes(booking.status) && (
            <Button
              variant="outline"
              className="border-blue-300 bg-blue-100 text-blue-600 hover:bg-blue-200"
              onClick={() => {
                onOpenChange(false);
                handleAction(booking, "reschedule");
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {t("bookings.reschedule")}
            </Button>
          )}

          {["pending", "confirmed"].includes(booking.status) && (
            <Button
              variant="destructive"
              onClick={() => {
                onOpenChange(false);
                handleAction(booking, "cancel");
              }}
            >
              <X className="mr-2 h-4 w-4" />
              {t("bookings.cancel")}
            </Button>
          )}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

};