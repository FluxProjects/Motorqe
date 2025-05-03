import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Button} from "@/components/ui/button"; 
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Loader2, MoreVertical } from "lucide-react";
import { DataTable } from "@/components/data/Datatable";
import { CarListing, InsertCarListing } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ManageCarListings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<CarListing | null>(null);
  const [formData, setFormData] = useState<Partial<InsertCarListing>>({
    status: 'draft',
    isFeatured: false
  });

  // Fetch all listings
  const { data: listings = [], isLoading } = useQuery<CarListing[]>({
    queryKey: ['admin-listings'],
    queryFn: () => fetch('/api/car-listings?include=all').then(res => res.json())
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      fetch(`/api/car-listings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-listings']})
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/car-listings/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey:['showroom-listings']});
      toast({
        title: t('listing.deleteSuccess'),
        variant: 'default', // or 'destructive', 'success' depending on how your toast system handles it
      });
    },
  });

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const columns: ColumnDef<CarListing>[] = [
    {
      accessorKey: "title",
      header: t('listing.title'),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.title}
          {row.original.titleAr && (
            <div className="text-sm text-muted-foreground" dir="rtl">
              {row.original.titleAr}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "seller.username",
      header: t('listing.seller'),
      cell: ({ row }) => row.original.seller?.username || '-'
    },
    {
      accessorKey: "price",
      header: t('listing.price'),
      cell: ({ row }) => `${row.original.price} ${row.original.currency || 'USD'}`
    },
    {
      accessorKey: "status",
      header: t('listing.status'),
      cell: ({ row }) => (
        <Badge variant={
          row.original.status === 'active' ? 'default' : 
          row.original.status === 'pending' ? 'secondary' : 'outline'
        }>
          {t(`listing.statuses.${row.original.status}`)}
        </Badge>
      )
    },
    {
      accessorKey: "isFeatured",
      header: t('listing.featured'),
      cell: ({ row }) => (
        <Badge variant={row.original.isFeatured ? 'default' : 'outline'}>
          {row.original.isFeatured ? t('common.yes') : t('common.no')}
        </Badge>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setEditingListing(row.original)}>
              <Edit className="mr-2" size={14} /> {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusChange(row.original.id, 'active')}
              disabled={row.original.status === 'active'}
            >
              {t('listing.approve')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusChange(row.original.id, 'rejected')}
              disabled={row.original.status === 'rejected'}
            >
              {t('listing.reject')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => {
                if (confirm(t('listing.confirmDelete'))) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
            >
              <Trash2 className="mr-2" size={14} /> {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('listing.manageAllListings')}</h2>
        <div className="flex gap-2">
          <Select onValueChange={(value) => {}}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('listing.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              {['all', 'draft', 'pending', 'active', 'sold', 'rejected'].map(status => (
                <SelectItem key={status} value={status}>
                  {t(`listing.statuses.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={listings}
        isLoading={isLoading}
        emptyMessage={t('listing.noListingsFound')}
      />

      {/* Edit Dialog would go here */}
    </div>
  );
}