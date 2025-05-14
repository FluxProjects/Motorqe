import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Calendar, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NoListingsFound } from "@/components/listings/NoListingFound";
import { AdminServiceBooking } from "@shared/schema";

interface ServiceBookingTableProps {
  bookings?: AdminServiceBooking[];
  isLoading: boolean;
  resetFilters: () => void;
  handleViewBooking: (booking: AdminServiceBooking) => void;
  handleEditBooking: (booking: AdminServiceBooking) => void;
  handleAction: (booking: AdminServiceBooking, action: 'confirm' | 'reschedule' | 'complete' | 'cancel' | 'reject') => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const ServiceBookingTable = ({
  bookings = [],
  isLoading,
  resetFilters,
  handleViewBooking,
  handleEditBooking,
  handleAction,
  getStatusBadge,
}: ServiceBookingTableProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-slate-400">{t("common.loading")}</span>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return <NoListingsFound resetFilters={resetFilters} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-neutral-500 hover:bg-neutral-700 border-neutral-50">
          <TableHead className="text-white">{t("services.bookingId")}</TableHead>
          <TableHead className="text-white">{t("services.service")}</TableHead>
          <TableHead className="text-white">{t("services.customer")}</TableHead>
          <TableHead className="text-white">{t("services.scheduledAt")}</TableHead>
          <TableHead className="text-white">{t("services.price")}</TableHead>
          <TableHead className="text-white">{t("services.status")}</TableHead>
          <TableHead className="text-white">{t("services.createdAt")}</TableHead>
          <TableHead className="text-right text-white">{t("common.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id} className="hover:bg-neutral-50">
            <TableCell>#{booking.id}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                {booking.service?.name || t("services.unknownService")}
              </div>
            </TableCell>
            <TableCell>{booking.user?.name || t("services.unknownCustomer")}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(booking.scheduledAt).toLocaleString()}
              </div>
            </TableCell>
            <TableCell>{booking.price} {booking.currency}</TableCell>
            <TableCell>{getStatusBadge(booking.status)}</TableCell>
            <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => handleViewBooking(booking)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {t("common.view")}
                </button>
                <button 
                  onClick={() => handleEditBooking(booking)}
                  className="text-green-600 hover:text-green-800"
                >
                  {t("common.edit")}
                </button>
                {booking.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleAction(booking, 'confirm')}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      {t("services.confirm")}
                    </button>
                    <button 
                      onClick={() => handleAction(booking, 'reject')}
                      className="text-red-600 hover:text-red-800"
                    >
                      {t("services.reject")}
                    </button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <button 
                    onClick={() => handleAction(booking, 'complete')}
                    className="text-green-600 hover:text-green-800"
                  >
                    {t("services.complete")}
                  </button>
                )}
                {['pending', 'confirmed'].includes(booking.status) && (
                  <button 
                    onClick={() => handleAction(booking, 'reschedule')}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    {t("services.reschedule")}
                  </button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};