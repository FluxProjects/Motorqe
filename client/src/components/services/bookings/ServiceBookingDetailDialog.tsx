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
      <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            {t("bookings.bookingDetails")} #{booking.id}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Service Details */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center">
              <Wrench className="h-5 w-5 mr-2" />
              {t("services.serviceDetails")}
            </h3>
            
            <div className="mt-3 space-y-3">
              <div>
                <h4 className="text-slate-400 text-sm">{t("services.serviceName")}</h4>
                <p className="text-white">
                  {booking.service?.name || t("services.unknownService")}
                </p>
              </div>
              
              <div>
                <h4 className="text-slate-400 text-sm">{t("services.description")}</h4>
                <p className="text-white">
                  {booking.service?.description || t("services.noDescription")}
                </p>
              </div>
              
              <div>
                <h4 className="text-slate-400 text-sm">{t("services.price")}</h4>
                <p className="text-2xl font-bold text-blue-400">
                  {booking.price} {booking.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {t("bookings.bookingInfo")}
            </h3>
            
            <div className="mt-3 space-y-3">
              <div>
                <h4 className="text-slate-400 text-sm">{t("bookings.scheduledTime")}</h4>
                <p className="text-white flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {new Date(booking.scheduledAt).toLocaleString()}
                </p>
              </div>
              
              <div>
                <h4 className="text-slate-400 text-sm">{t("bookings.status")}</h4>
                <div className="text-white">
                  {getStatusBadge(booking.status)}
                </div>
              </div>
              
              <div>
                <h4 className="text-slate-400 text-sm">{t("bookings.createdAt")}</h4>
                <p className="text-white">
                  {new Date(booking?.createdAt).toLocaleString()}
                </p>
              </div>
              
              {booking.notes && (
                <div>
                  <h4 className="text-slate-400 text-sm">{t("bookings.notes")}</h4>
                  <p className="text-white whitespace-pre-line">
                    {booking.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center">
              <User className="h-5 w-5 mr-2" />
              {t("bookings.customerInfo")}
            </h3>
            
            <div className="mt-3 flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={booking.user?.avatar} />
                <AvatarFallback className="bg-blue-600">
                  {booking.user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h4 className="text-white font-medium">
                  {booking.user?.name || t("bookings.unknownCustomer")}
                </h4>
                <p className="text-slate-400 text-sm">
                  {booking.user?.email || "N/A"}
                </p>
                <p className="text-slate-400 text-sm flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {booking.user?.location || t("bookings.locationUnknown")}
                </p>
              </div>
            </div>
          </div>

          {/* Showroom Details */}
          {booking.showroom && (
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {t("bookings.showroomInfo")}
              </h3>
              
              <div className="mt-3">
                <h4 className="text-white font-medium">
                  {booking.showroom.name}
                </h4>
                <p className="text-slate-400 text-sm">
                  {booking.showroom.address}
                </p>
                <p className="text-slate-400 text-sm">
                  {booking.showroom.contactNumber}
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
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {t("common.close")}
          </Button>

          <div className="space-x-2">
            {booking.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  className="border-red-800 bg-red-900/20 text-red-400 hover:bg-red-900/30"
                  onClick={() => {
                    onOpenChange(false);
                    handleAction(booking, 'reject');
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  {t("bookings.reject")}
                </Button>

                <Button
                  className="bg-green-700 hover:bg-green-800 text-white"
                  onClick={() => {
                    onOpenChange(false);
                    handleAction(booking, 'confirm');
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {t("bookings.confirm")}
                </Button>
              </>
            )}

            {booking.status === 'confirmed' && (
              <Button
                className="bg-blue-700 hover:bg-blue-800 text-white"
                onClick={() => {
                  onOpenChange(false);
                  handleAction(booking, 'complete');
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {t("bookings.complete")}
              </Button>
            )}

            {['pending', 'confirmed'].includes(booking.status) && (
              <Button
                variant="outline"
                className="border-blue-800 bg-blue-900/20 text-blue-400 hover:bg-blue-900/30"
                onClick={() => {
                  onOpenChange(false);
                  handleAction(booking, 'reschedule');
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {t("bookings.reschedule")}
              </Button>
            )}

            {['pending', 'confirmed'].includes(booking.status) && (
              <Button
                variant="destructive"
                onClick={() => {
                  onOpenChange(false);
                  handleAction(booking, 'cancel');
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