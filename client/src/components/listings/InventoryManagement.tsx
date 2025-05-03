// components/listings/InventoryManager.tsx
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data/Datatable";
import { CarListing } from "@shared/schema";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

export function InventoryManager() {
  const { t } = useTranslation();
  const auth = useAuth();

  const columns: ColumnDef<CarListing>[] = [
    {
      accessorKey: "title",
      header: t('listing.title'),
    },
    {
      accessorKey: "status",
      header: t('listing.status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "price",
      header: t('listing.price'),
      cell: ({ row }) => `${row.original.price} ${row.original.currency}`,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 size={16} className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<CarListing>
      columns={columns}
      queryKey={['seller-listings', auth.user?.id]}
      queryFn={() => fetch(`/api/car-listings?sellerId=${auth.user?.id}`).then(res => res.json())}
      emptyMessage={t('listing.noListingsFound')}
    />
  );
}