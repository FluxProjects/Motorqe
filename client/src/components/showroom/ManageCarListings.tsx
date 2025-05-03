import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { DataTable } from "@/components/data/Datatable";
import { CarListing } from "@shared/schema";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function ShowroomCarListings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch showroom listings
  const { data: listings = [], isLoading } = useQuery<CarListing[]>({
    queryKey: ["showroom-listings", user?.id],
    queryFn: () =>
      fetch(`/api/car-listings?showroomId=${user?.showroomId}`).then((res) =>
        res.json()
      ),
    enabled: !!user?.showroomId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/car-listings/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showroom-listings"] });
      toast({
        title: t("listing.deleteSuccess"),
        variant: "default", // or 'destructive', 'success' depending on how your toast system handles it
      });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/car-listings/${id}/promote`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
      toast({
        title: t("listing.promoteSuccess"),
        variant: "default",
      });
    },
  });

  const columns: ColumnDef<CarListing>[] = [
    {
      accessorKey: "title",
      header: t("listing.title"),
      cell: ({ row }) => row.original.title,
    },
    {
      accessorKey: "status",
      header: t("listing.status"),
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "active"
              ? "default"
              : row.original.status === "pending"
              ? "secondary"
              : "outline"
          }
        >
          {t(`listing.statuses.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: t("listing.price"),
      cell: ({ row }) =>
        `${row.original.price} ${row.original.currency || "USD"}`,
    },
    {
      accessorKey: "createdAt",
      header: t("listing.datePosted"),
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        return createdAt ? new Date(createdAt).toLocaleDateString() : '-';
      }
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              (window.location.href = `/listings/edit/${row.original.id}`)
            }
          >
            <Edit size={16} />
          </Button>
          {row.original.status === "active" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => promoteMutation.mutate(row.original.id)}
              disabled={row.original.isFeatured}
            >
              {t("listing.promote")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm(t("listing.confirmDelete"))) {
                deleteMutation.mutate(row.original.id);
              }
            }}
          >
            <Trash2 size={16} className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("listing.showroomInventory")}</h2>
        <Button
          onClick={() => (window.location.href = "/showroom/add-listing")}
        >
          <Plus className="mr-2" size={16} />
          {t("listing.addVehicle")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">
            {t("listing.totalVehicles")}
          </h3>
          <p className="text-2xl">{listings.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">{t("listing.available")}</h3>
          <p className="text-2xl">
            {listings.filter((l) => l.status === "active").length}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">{t("listing.sold")}</h3>
          <p className="text-2xl">
            {listings.filter((l) => l.status === "sold").length}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={listings}
        isLoading={isLoading}
        emptyMessage={t("listing.noListingsFound")}
      />
    </div>
  );
}
