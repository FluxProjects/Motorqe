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
import {
  Eye,
  MoreHorizontal,
  Check,
  X,
  Star,
  Trash2,
  CheckCircle,
  Pencil,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminCarListing, AdminCarListingAction } from "@shared/schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { Permission } from "@shared/permissions";
import { PermissionGuard } from "@/components/PermissionGuard";

interface ListingRowProps {
  listing: AdminCarListing;
  handleViewListing: (listing: AdminCarListing) => void;
  handleEditListing: (listing: AdminCarListing) => void;
  handleAction: (listing: AdminCarListing, action: AdminCarListingAction, options?: { unfeature?: boolean }) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const CarListingRows = ({
  listing,
  handleViewListing,
  handleEditListing,
  handleAction,
  getStatusBadge,
}: ListingRowProps) => {
  const { t } = useTranslation();

  return (
    <TableRow key={listing.id} className="border-neutral-300">
      <TableCell>
        <div className="flex items-center">
          <div className="h-12 w-12 rounded overflow-hidden bg-slate-700 mr-3 flex-shrink-0">
            {listing.images && listing.images.length > 0 && (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <div className="font-medium">{listing.title}</div>
            
            <div className="text-xs text-slate-500 mt-1">
              {t(`car.fuelTypes.${listing.fuel_type}`)} •{" "}
              {t(`car.transmissions.${listing.transmission}`)}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
        <div className="text-sm">${listing.price.toLocaleString()}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="">
          <div>{listing.make?.name || "N/A"}</div>
          <div className="text-sm text-slate-400">
            {listing.model?.name || "N/A"}
          </div>
        </div>
      </TableCell>
      <TableCell className="">{listing.year}</TableCell>
      <TableCell className="">
        {listing?.mileage.toLocaleString()} {t("car.miles")}
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage
              src={listing.seller?.avatar || "/path/to/default-avatar.jpg"}
            />
            <AvatarFallback className="bg-slate-600 text-slate-200">
              {listing.seller?.username?.charAt(0).toUpperCase() || "JD"}
            </AvatarFallback>
          </Avatar>
          <span className="">{listing.seller?.username || "John Doe"}</span>
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(listing.status)}</TableCell>
      <TableCell>
        {listing.is_featured ? (
          <Badge className="bg-purple-100 text-purple-800">
            <Star className="h-3 w-3 mr-1 fill-purple-800" />
            {t("admin.featured")}
          </Badge>
        ) : (
          <span className="text-slate-400 text-sm">-</span>
        )}
      </TableCell>
      <TableCell className="text-sm">
        {new Date(listing.created_at).toLocaleDateString()}
        <div className="text-xs text-slate-500">
          {new Date(listing.created_at).toLocaleTimeString()}
        </div>
      </TableCell>
      <TableCell className="text-sm">
        {listing.updated_at ? (
          <>
            {new Date(listing.updated_at).toLocaleDateString()}
            <div className="text-xs text-slate-500">
              {new Date(listing.updated_at).toLocaleTimeString()}
            </div>
          </>
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
              onClick={() => handleViewListing(listing)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t("common.view")}
            </DropdownMenuItem>
            <PermissionGuard permission={Permission.MANAGE_OWN_LISTINGS}>
              <DropdownMenuItem
                className="hover:bg-slate-700 focus:bg-slate-700"
                onClick={() => handleEditListing(listing)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
            </PermissionGuard>

            {listing.status === "pending" && (
              <>
                <PermissionGuard permission={Permission.APPROVE_LISTINGS}>
                  <DropdownMenuItem
                    className="hover:bg-slate-700 focus:bg-slate-700"
                    onClick={() => handleAction(listing, "approve")}
                  >
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    {t("admin.approve")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-slate-700 focus:bg-slate-700"
                    onClick={() => handleAction(listing, "reject")}
                  >
                    <X className="mr-2 h-4 w-4 text-red-500" />
                    {t("admin.reject")}
                  </DropdownMenuItem>
                </PermissionGuard>
              </>
            )}

            {listing.status === "active" && (
              <>
               <PermissionGuard permission={Permission.MANAGE_PROMOTIONS}>
                <DropdownMenuItem
                  className="hover:bg-slate-700 focus:bg-slate-700"
                  onClick={() =>
                    handleAction(listing, "feature", {
                      unfeature: listing.is_featured === "true",
                    })
                  }
                >
                  <Star className="mr-2 h-4 w-4 text-yellow-500" />
                  {listing.is_featured === "true"
                    ? t("admin.unfeatureListing")
                    : t("admin.featureListing")}
                </DropdownMenuItem>
              </PermissionGuard>


                <PermissionGuard permission={Permission.MANAGE_OWN_LISTINGS}>
                  <DropdownMenuItem
                    className="hover:bg-slate-700 focus:bg-slate-700"
                    onClick={() => handleAction(listing, "sold")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    {t("admin.markAsSold")}
                  </DropdownMenuItem>
                </PermissionGuard>
              </>
            )}

            {listing.status === "draft" && (
              <>
                <PermissionGuard permission={Permission.MANAGE_OWN_LISTINGS}>
                  <DropdownMenuItem
                    className="hover:bg-slate-700 focus:bg-slate-700"
                    onClick={() => handleAction(listing, "publish")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    {t("admin.publishListing")}
                  </DropdownMenuItem>
                </PermissionGuard>
              </>
            )}
            <PermissionGuard permission={Permission.MANAGE_OWN_LISTINGS}>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                className="text-red-400 hover:bg-red-900/30 focus:bg-red-900/30"
                onClick={() => handleAction(listing, "delete")}
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
