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
import { Eye, MoreHorizontal, Star, Check, X, Wrench, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ShowroomService } from "@shared/schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { Permission } from "@shared/permissions";
import { PermissionGuard } from "@/components/PermissionGuard";

interface ServiceListingRowsProps {
  service: ShowroomService;
  handleViewService: (service: ShowroomService) => void;
  handleEditService: (service: ShowroomService) => void;
  handleAction: (service: ShowroomService, action: 'feature' | 'activate' | 'deactivate' | 'delete') => void;
}

export const ServiceListingRows = ({
  service,
  handleViewService,
  handleEditService,
  handleAction,
}: ServiceListingRowsProps) => {
  const { t } = useTranslation();

  return (
    <TableRow key={service.id} className="border-neutral-300">
      <TableCell>
        <div className="flex items-center font-medium">
          <Wrench className="h-4 w-4 mr-2" />
          {service.service?.name || t("services.unknownService")}
        </div>
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {service.description || t("services.noDescription")}
      </TableCell>
      <TableCell>
        {service.price} {service.currency}
      </TableCell>
      <TableCell>
        {service.showroom?.name || t("services.unknownShowroom")}
      </TableCell>
      <TableCell>
        {service.isActive ? (
          <Badge className="bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            {t("services.active")}
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-800">
            <X className="h-3 w-3 mr-1" />
            {t("services.inactive")}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        {service.isFeatured ? (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Star className="h-3 w-3 mr-1" />
            {t("services.featured")}
          </Badge>
        ) : (
          <span className="text-slate-400 text-sm">-</span>
        )}
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
              onClick={() => handleViewService(service)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t("common.view")}
            </DropdownMenuItem>
            
            <PermissionGuard permission={Permission.MANAGE_SHOWROOM_SERVICES}>
              <DropdownMenuItem
                className="hover:bg-slate-700 focus:bg-slate-700"
                onClick={() => handleEditService(service)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>

              {!service.isFeatured && (
                <DropdownMenuItem
                  className="hover:bg-slate-700 focus:bg-slate-700"
                  onClick={() => handleAction(service, 'feature')}
                >
                  <Star className="mr-2 h-4 w-4 text-yellow-500" />
                  {t("services.feature")}
                </DropdownMenuItem>
              )}


              <DropdownMenuItem
                className="hover:bg-slate-700 focus:bg-slate-700"
                onClick={() => handleAction(service, service.isActive ? 'deactivate' : 'activate')}
              >
                {service.isActive ? (
                  <>
                    <X className="mr-2 h-4 w-4 text-red-500" />
                    {t("services.deactivate")}
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    {t("services.activate")}
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                className="text-red-400 hover:bg-red-900/30 focus:bg-red-900/30"
                onClick={() => handleAction(service, 'delete')}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            </PermissionGuard>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};