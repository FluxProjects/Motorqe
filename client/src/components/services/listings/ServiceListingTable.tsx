import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Wrench, Star, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NoListingsFound } from "../../listings/NoListingFound";
import { ShowroomService } from "@shared/schema";

interface ServiceListingTableProps {
  services?: ShowroomService[];
  isLoading: boolean;
  resetFilters: () => void;
  handleViewService: (service: ShowroomService) => void;
  handleEditService: (service: ShowroomService) => void;
  handleAction: (service: ShowroomService, action: 'feature' | 'activate' | 'deactivate' | 'edit' | 'delete') => void;
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

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-neutral-500 hover:bg-neutral-700 border-neutral-50">
          <TableHead className="text-white">{t("services.serviceName")}</TableHead>
          <TableHead className="text-white">{t("services.description")}</TableHead>
          <TableHead className="text-white">{t("services.price")}</TableHead>
          <TableHead className="text-white">{t("services.showroom")}</TableHead>
          <TableHead className="text-white">{t("services.status")}</TableHead>
          <TableHead className="text-white">{t("services.featured")}</TableHead>
          <TableHead className="text-right text-white">{t("common.actions")}</TableHead>
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
              {service.isActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  {t("services.active")}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <X className="h-3 w-3 mr-1" />
                  {t("services.inactive")}
                </span>
              )}
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
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => handleViewService(service)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {t("common.view")}
                </button>
                <button 
                  onClick={() => handleEditService(service)}
                  className="text-green-600 hover:text-green-800"
                >
                  {t("common.edit")}
                </button>
                <button 
                  onClick={() => handleAction(service, service.isFeatured ? "deactivate": "activate")}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  {service.isFeatured ? t("services.unfeature") : t("services.feature")}
                </button>
                <button 
                  onClick={() => handleAction(service, service.isActive ? 'deactivate' : 'activate')}
                  className={service.isActive ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}
                >
                  {service.isActive ? t("services.deactivate") : t("services.activate")}
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};