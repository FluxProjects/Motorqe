import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, MoreHorizontal, Check, X, Calendar, Clock, Wrench, CheckCircle, Trash2, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminServiceBooking } from "@shared/schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { Permission } from "@shared/permissions";
import { PermissionGuard } from "@/components/PermissionGuard";

interface ServiceBookingRowsProps {
  booking: AdminServiceBooking;
  handleViewBooking: (booking: AdminServiceBooking) => void;
  handleEditBooking: (booking: AdminServiceBooking) => void;
  handleAction: (booking: AdminServiceBooking, action: 'confirm' | 'reschedule' | 'complete' | 'cancel' | 'reject') => void;
}

export const ServiceBookingRows = ({
  booking,
  handleViewBooking,
  handleEditBooking,
  handleAction,
}: ServiceBookingRowsProps) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      draft: { color: "bg-gray-100 text-gray-800", text: t("services.draft") },
      pending: { color: "bg-yellow-100 text-yellow-800", text: t("services.pending") },
      confirmed: { color: "bg-blue-100 text-blue-800", text: t("services.confirmed") },
      complete: { color: "bg-green-100 text-green-800", text: t("services.complete") },
      expired: { color: "bg-red-100 text-red-800", text: t("services.expired") },
      rejected: { color: "bg-red-100 text-red-800", text: t("services.rejected") },
    };

    return (
      <Badge className={statusMap[status]?.color || "bg-gray-100 text-gray-800"}>
        {statusMap[status]?.text || status}
      </Badge>
    );
  };

  return (
    <TableRow key={booking.id} className="border-neutral-300">
      <TableCell>#{booking.id}</TableCell>
      <TableCell>
        <div className="flex items-center">
          <Wrench className="h-4 w-4 mr-2" />
          {booking.service?.name || t("services.unknownService")}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={booking.user?.avatar} />
            <AvatarFallback className="bg-slate-600 text-slate-200">
              {booking.user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {booking.user?.name || t("services.unknownCustomer")}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date(booking.scheduledAt).toLocaleDateString()}
          <Clock className="h-4 w-4 ml-3 mr-1" />
          {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </TableCell>
      <TableCell>
        {booking.price} {booking.currency}
      </TableCell>
      <TableCell>{getStatusBadge(booking.status)}</TableCell>
      <TableCell>
        {new Date(booking.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-slate-800 border-slate-700 text-slate-300"
          >
            <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
            <DropdownMenuItem
              className="hover:bg-slate-700 focus:bg-slate-700"
              onClick={() => handleViewBooking(booking)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t("common.view")}
            </DropdownMenuItem>
            
            <PermissionGuard permission={Permission.MANAGE_SERVICE_BOOKINGS}>
              <DropdownMenuItem
                className="hover:bg-slate-700 focus:bg-slate-700"
                onClick={() => handleEditBooking(booking)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>

              {booking.status === 'pending' && (
                <>
                  <DropdownMenuItem
                    className="hover:bg-slate-700 focus:bg-slate-700"
                    onClick={() => handleAction(booking, 'confirm')}
                  >
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    {t("services.confirm")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-slate-700 focus:bg-slate-700"
                    onClick={() => handleAction(booking, 'reject')}
                  >
                    <X className="mr-2 h-4 w-4 text-red-500" />
                    {t("services.reject")}
                  </DropdownMenuItem>
                </>
              )}

              {booking.status === 'confirmed' && (
                <DropdownMenuItem
                  className="hover:bg-slate-700 focus:bg-slate-700"
                  onClick={() => handleAction(booking, 'complete')}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  {t("services.complete")}
                </DropdownMenuItem>
              )}

              {['pending', 'confirmed'].includes(booking.status) && (
                <DropdownMenuItem
                  className="hover:bg-slate-700 focus:bg-slate-700"
                  onClick={() => handleAction(booking, 'reschedule')}
                >
                  <Clock className="mr-2 h-4 w-4 text-blue-500" />
                  {t("services.reschedule")}
                </DropdownMenuItem>
              )}

              {['pending', 'confirmed'].includes(booking.status) && (
                <DropdownMenuItem
                  className="hover:bg-slate-700 focus:bg-slate-700"
                  onClick={() => handleAction(booking, 'cancel')}
                >
                  <X className="mr-2 h-4 w-4 text-red-500" />
                  {t("services.cancel")}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                className="text-red-400 hover:bg-red-900/30 focus:bg-red-900/30"
                onClick={() => handleAction(booking, 'cancel')}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.cancel")}
              </DropdownMenuItem>
            </PermissionGuard>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};