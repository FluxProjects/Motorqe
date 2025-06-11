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
import {
  Eye,
  MoreHorizontal,
  Star,
  Check,
  X,
  Wrench,
  Pencil,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminServiceListing, ServiceListingAction } from "@shared/schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { Permission } from "@shared/permissions";
import { PermissionGuard } from "@/components/PermissionGuard";
import { formatAvailability } from "@/lib/utils";

interface ServiceListingRowsProps {
  service: AdminServiceListing;
  handleViewService: (service: AdminServiceListing) => void;
  handleEditService: (service: AdminServiceListing) => void;
  handleAction: (
    service: AdminServiceListing,
    action: ServiceListingAction
  ) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const ServiceListingRows = ({
  service,
  handleViewService,
  handleEditService,
  handleAction,
  getStatusBadge,
}: ServiceListingRowsProps) => {
  const { t } = useTranslation();

  console.log("servicelisting", service);

  return (
    <TableRow key={service.id} className="border-neutral-300">
      <TableCell>
        <div className="flex items-center font-medium">
          <Wrench className="h-4 w-4 mr-2" />
          {service?.service?.name || t("services.unknownService")}
        </div>
      </TableCell>
      <TableCell>
        {service?.showroom_name}
      </TableCell>
      <TableCell>
        {service?.description || t("services.unknownShowroom")}
      </TableCell>
      <TableCell>
        {service?.price} {service?.currency || "QAR"}
      </TableCell>

      <TableCell>{getStatusBadge(service.status)}</TableCell>
      <TableCell>
        {service?.is_featured ? (
          <Badge className="bg-purple-100 text-purple-800">
            <Star className="h-3 w-3 mr-1 fill-purple-800" />
            {t("admin.featured")}
          </Badge>
        ) : (
          <span className="text-slate-400 text-sm">-</span>
        )}
      </TableCell>
      <TableCell>
  {service?.created_at ? new Date(service.created_at).toLocaleString() : "—"}
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

            <PermissionGuard permission={Permission.MANAGE_OWN_SERVICES}>
              <DropdownMenuItem
                className="hover:bg-slate-700 focus:bg-slate-700"
                onClick={() => handleEditService(service)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
            </PermissionGuard>
            {service.status === "pending" && (
              <>
                <PermissionGuard permission={Permission.APPROVE_LISTINGS}>
                  <DropdownMenuItem
                    className="hover:bg-slate-700 focus:bg-slate-700"
                    onClick={() => handleAction(service, "approve")}
                  >
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    {t("admin.approve")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-slate-700 focus:bg-slate-700"
                    onClick={() => handleAction(service, "reject")}
                  >
                    <X className="mr-2 h-4 w-4 text-red-500" />
                    {t("admin.reject")}
                  </DropdownMenuItem>
                </PermissionGuard>
              </>
            )}

            {service.status === "active" && (
              <>
                <PermissionGuard permission={Permission.MANAGE_PROMOTIONS}>
                  {!service.is_featured && (
                    <DropdownMenuItem
                      className="hover:bg-slate-700 focus:bg-slate-700"
                      onClick={() => handleAction(service, "feature")}
                    >
                      <Star className="mr-2 h-4 w-4 text-yellow-500" />
                      {t("admin.featureservice")}
                    </DropdownMenuItem>
                  )}
                </PermissionGuard>
              </>
            )}

            {service.status === "draft" && (
              <>
                <PermissionGuard permission={Permission.MANAGE_OWN_SERVICES}>
                  <DropdownMenuItem
                    className="hover:bg-slate-700 focus:bg-slate-700"
                    onClick={() => handleAction(service, "publish")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    {t("admin.publishService")}
                  </DropdownMenuItem>
                </PermissionGuard>
              </>
            )}

            <PermissionGuard permission={Permission.MANAGE_OWN_SERVICES}>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                className="text-red-400 hover:bg-red-900/30 focus:bg-red-900/30"
                onClick={() => handleAction(service, "delete")}
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
