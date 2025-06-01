import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NoListingsFound } from "../../listings/NoListingFound";
import { AdminServiceListing, ServiceListingAction } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { ServiceListingRows } from "./ServiceListingRows";

interface ServiceListingTableProps {
  services?: AdminServiceListing[];
  isLoading: boolean;
  resetFilters: () => void;
  handleViewService: (service: AdminServiceListing) => void;
  handleEditService: (service: AdminServiceListing) => void;
  handleAction: (
    service: AdminServiceListing,
    action: ServiceListingAction  ) => void;
  getStatusBadge: (status: string) => React.ReactNode;
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
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        text: t("services.pending"),
      },
      active: {
        color: "bg-blue-100 text-blue-800",
        text: t("services.active"),
      },
      complete: {
        color: "bg-green-100 text-green-800",
        text: t("services.complete"),
      },
      expired: {
        color: "bg-red-100 text-red-800",
        text: t("services.expired"),
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        text: t("services.rejected"),
      },
    };

    return (
      <Badge
        className={statusMap[status]?.color || "bg-gray-100 text-gray-800"}
      >
        {statusMap[status]?.text || status}
      </Badge>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-neutral-500 hover:bg-neutral-700 border-neutral-50">
          <TableHead className="text-white">{t("services.serviceName")}</TableHead>
          <TableHead className="text-white">{t("services.showroom")}</TableHead>
          <TableHead className="text-white">{t("services.description")}</TableHead>
          <TableHead className="text-white">{t("services.price")}</TableHead>
          <TableHead className="text-white">{t("services.status")}</TableHead>
          <TableHead className="text-white">{t("services.featured")}</TableHead>
          <TableHead className="text-right text-white">
            {t("common.actions")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <ServiceListingRows
            key={service.id}
            service={service}
            handleViewService={handleViewService}
            handleEditService={handleEditService}
            handleAction={handleAction}
            getStatusBadge={getStatusBadge}
          />
        ))}
      </TableBody>
    </Table>
  );
};
