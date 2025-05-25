import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Wrench,
  Star,
  Check,
  X,
  MoreHorizontal,
  Eye,
  Pencil,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { NoListingsFound } from "../../listings/NoListingFound";
import { ShowroomService } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Permission } from "@shared/permissions";

interface ServiceListingTableProps {
  services?: ShowroomService[];
  isLoading: boolean;
  resetFilters: () => void;
  handleViewService: (service: ShowroomService) => void;
  handleEditService: (service: ShowroomService) => void;
  handleAction: (
    service: ShowroomService,
    action:
      | "feature"
      | "activate"
      | "pending"
      | "deactivate"
      | "edit"
      | "delete"
  ) => void;
}

export const ServiceListingTable = ({
  services = [],
  isLoading,
  resetFilters,
  handleViewService,
  handleEditService,
  handleAction,
}: ServiceListingTableProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-slate-400">{t("common.loading")}</span>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return <NoListingsFound resetFilters={resetFilters} />;
  }

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
    <Table>
      <TableHeader>
        <TableRow className="bg-neutral-500 hover:bg-neutral-700 border-neutral-50">
          <TableHead className="text-white">
            {t("services.serviceName")}
          </TableHead>
          <TableHead className="text-white">
            {t("services.description")}
          </TableHead>
          <TableHead className="text-white">{t("services.price")}</TableHead>
          <TableHead className="text-white">{t("services.showroom")}</TableHead>
          <TableHead className="text-white">{t("services.status")}</TableHead>
          <TableHead className="text-white">{t("services.featured")}</TableHead>
          <TableHead className="text-right text-white">
            {t("common.actions")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.isArray(services) &&
          services.map((service) => (
            <TableRow key={service.id} className="hover:bg-neutral-50">
              <TableCell>
                <div className="flex items-center gap-2 font-medium">
                  <Wrench className="h-4 w-4" />
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {getStatusBadge(service?.status)}
                </span>
              </TableCell>
              <TableCell>
                {service.isFeatured ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    {t("services.featured")}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {t("services.standard")}
                  </span>
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
                    <DropdownMenuItem
                      className="hover:bg-slate-700 focus:bg-slate-700"
                      onClick={() => handleViewService(service)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t("common.view")}
                    </DropdownMenuItem>
                    <PermissionGuard
                      permission={Permission.MANAGE_OWN_SERVICES}
                    >
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
                        <PermissionGuard
                          permission={Permission.APPROVE_LISTINGS}
                        >
                          <DropdownMenuItem
                            className="hover:bg-slate-700 focus:bg-slate-700"
                            onClick={() => handleAction(service, "activate")}
                          >
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            {t("admin.approve")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-slate-700 focus:bg-slate-700"
                            onClick={() => handleAction(service, "deactivate")}
                          >
                            <X className="mr-2 h-4 w-4 text-red-500" />
                            {t("admin.reject")}
                          </DropdownMenuItem>
                        </PermissionGuard>
                      </>
                    )}

                    {service.status === "active" && (
                      <>
                        <PermissionGuard
                          permission={Permission.MANAGE_PROMOTIONS}
                        >
                          {!service.isFeatured && (
                            <DropdownMenuItem
                              className="hover:bg-slate-700 focus:bg-slate-700"
                              onClick={() => handleAction(service, "feature")}
                            >
                              <Star className="mr-2 h-4 w-4 text-yellow-500" />
                              {t("admin.featureListing")}
                            </DropdownMenuItem>
                          )}
                        </PermissionGuard>
                        <PermissionGuard
                          permission={Permission.MANAGE_OWN_SERVICES}
                        >
                          <DropdownMenuItem
                            className="hover:bg-slate-700 focus:bg-slate-700"
                            onClick={() => handleAction(service, "deactivate")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                            {t("admin.markAsSold")}
                          </DropdownMenuItem>
                        </PermissionGuard>
                      </>
                    )}

                    {service.status === "draft" && (
                      <>
                        <PermissionGuard
                          permission={Permission.MANAGE_OWN_SERVICES}
                        >
                          <DropdownMenuItem
                            className="hover:bg-slate-700 focus:bg-slate-700"
                            onClick={() => handleAction(service, "pending")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                            {t("admin.publishListing")}
                          </DropdownMenuItem>
                        </PermissionGuard>
                      </>
                    )}

                    <PermissionGuard
                      permission={Permission.MANAGE_OWN_SERVICES}
                    >
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
          ))}
      </TableBody>
    </Table>
  );
};
