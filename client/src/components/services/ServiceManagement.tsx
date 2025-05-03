// components/services/ShowroomServiceManager.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data/Datatable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ServiceBookingForm } from "./ServiceBookingForm";
import { ShowroomService, ServicePackage } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";

export function ServiceManager() {
  const { t } = useTranslation();
  const auth = useAuth();
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery<ShowroomService[]>({
    queryKey: ['showroom-services', auth.user?.id],
    queryFn: () => fetch(`/api/showroom-service-subscriptions/${auth.user?.id}`).then(res => res.json())
  });

  const deleteService = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/showroom-service-subscriptions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries(['showroom-services', auth.user?.id])
  });

  const columns = [
    {
      accessorKey: "service.name",
      header: t('service.name'),
    },
    {
      accessorKey: "price",
      header: t('service.price'),
      cell: ({ row }) => `${row.original.price} ${row.original.currency}`,
    },
    {
      accessorKey: "description",
      header: t('service.description'),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Edit size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('service.editService')}</DialogTitle>
              </DialogHeader>
              <ServiceBookingForm 
                service={row.original} 
                showroomId={row.original.showroomId} 
              />
            </DialogContent>
          </Dialog>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => deleteService.mutate(row.original.id)}
          >
            <Trash2 size={16} className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('service.manageServices')}</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              {t('service.addService')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('service.addService')}</DialogTitle>
            </DialogHeader>
            <ServiceForm showroomId={auth.user?.id} />
          </DialogContent>
        </Dialog>
      </div>
      
      <DataTable
        columns={columns}
        data={services}
        emptyMessage={t('service.noServices')}
      />
    </div>
  );
}