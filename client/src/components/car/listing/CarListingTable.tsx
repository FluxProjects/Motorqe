import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Car } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminCarListing, AdminCarListingAction } from "@shared/schema";
import { CarListingRows } from "./CarListingRows";
import { NoListingsFound } from "../../listings/NoListingFound";

interface ListingsTableProps {
  listings?: AdminCarListing[];
  isLoading: boolean;
  resetFilters: () => void;
  handleViewListing: (listing: AdminCarListing) => void;
  handleEditListing: (listing: AdminCarListing) => void;
  handleAction: (listing: AdminCarListing, action: AdminCarListingAction) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const CarListingTable = ({
  listings = [],
  isLoading,
  resetFilters,
  handleViewListing,
  handleEditListing,
  handleAction,
  getStatusBadge,
}: ListingsTableProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-slate-400">{t("common.loading")}</span>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return <NoListingsFound resetFilters={resetFilters} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-neutral-500 hover:bg-neutral-700 border-neutral-50">
          <TableHead className="text-white">{t("car.carDetails")}</TableHead>
          <TableHead className="text-white">{t("car.price")}</TableHead>
          <TableHead className="text-white">{t("car.makeModel")}</TableHead>
          <TableHead className="text-white">{t("car.year")}</TableHead>
          <TableHead className="text-white">{t("car.mileage")}</TableHead>
          <TableHead className="text-white">{t("car.seller")}</TableHead>
          <TableHead className="text-white">{t("admin.status")}</TableHead>
          <TableHead className="text-white">{t("admin.featured")}</TableHead>
          <TableHead className="text-white">{t("admin.listedOn")}</TableHead>
          <TableHead className="text-white">{t("admin.lastUpdated")}</TableHead>
          <TableHead className="text-right text-white">{t("common.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {listings.map((listing) => (
          <CarListingRows
            key={listing.id}
            listing={listing}
            handleViewListing={handleViewListing}
            handleEditListing={handleEditListing}
            handleAction={handleAction}
            getStatusBadge={getStatusBadge}
          />
        ))}
      </TableBody>
    </Table>
  );
};