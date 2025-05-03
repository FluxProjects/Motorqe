// components/showroom/SubscriptionPackageEditor.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { 
  ServicePackage,
  InsertServicePackage,
  insertServicePackageSchema 
} from "@shared/schema";
import { DataTable } from "@/components/data/Datatable";
import { ColumnDef } from "@tanstack/react-table";

export function ServicePackageEditor({ showroomId }: { showroomId: number }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing service packages
  const { data: servicePackages = [], isLoading } = useQuery<ServicePackage[]>({
    queryKey: ['service-packages', showroomId],
    queryFn: () => fetch(`/api/service-packages?showroomId=${showroomId}`).then(res => res.json()),
  });

  // Form setup
  const form = useForm<InsertServicePackage>({
    resolver: zodResolver(insertServicePackageSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      price: 0,
      currency: 'USD',
      durationDays: 30,
      serviceLimit: 1,
      isActive: true,
    }
  });

  // Create/Update mutation
  const { mutate: savePackage, isPending: isSaving } = useMutation({
    mutationFn: (data: InsertServicePackage) => 
      fetch('/api/service-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, showroomId })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-packages', showroomId] });
      toast({ title: t('services.packageSaved') });
      form.reset();
    },
    onError: () => toast({ title: t('services.saveError'), variant: 'destructive' }),
  });

  // Delete mutation
  const { mutate: deletePackage } = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/service-packages/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-packages', showroomId] });
      toast({ title: t('services.packageDeleted') });
    },
    onError: () => toast({ title: t('services.deleteError'), variant: 'destructive' }),
  });

  // Table columns
  const columns: ColumnDef<ServicePackage>[] = [
    {
      accessorKey: "name",
      header: t('services.name'),
    },
    {
      accessorKey: "price",
      header: t('services.price'),
      cell: ({ row }) => `${row.original.price} ${row.original.currency}`,
    },
    {
      accessorKey: "durationDays",
      header: t('services.duration'),
      cell: ({ row }) => `${row.original.durationDays} ${t('common.days')}`,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Pencil size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('services.editPackage')}</DialogTitle>
              </DialogHeader>
              <ServicePackageForm 
                initialData={row.original}
                onSubmit={savePackage}
                isSubmitting={isSaving}
              />
            </DialogContent>
          </Dialog>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => deletePackage(row.original.id)}
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
        <h3 className="text-lg font-medium">{t('services.servicePackages')}</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              {t('services.addPackage')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('services.addPackage')}</DialogTitle>
            </DialogHeader>
            <ServicePackageForm 
              onSubmit={savePackage}
              isSubmitting={isSaving}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={servicePackages}
        isLoading={isLoading}
        emptyMessage={t('services.noPackages')}
      />
    </div>
  );
}

// Reusable form component
function ServicePackageForm({
  initialData,
  onSubmit,
  isSubmitting,
}: {
  initialData?: ServicePackage;
  onSubmit: (data: InsertServicePackage) => void;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();
  const form = useForm<InsertServicePackage>({
    resolver: zodResolver(insertServicePackageSchema),
    defaultValues: initialData || {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      price: 0,
      currency: 'USD',
      durationDays: 30,
      serviceLimit: 1,
      isActive: true,
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('services.name')} (EN)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nameAr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('services.name')} (AR)</FormLabel>
              <FormControl>
                <Input {...field} dir="rtl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('services.price')}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="durationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('services.durationDays')}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('services.description')} (EN)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descriptionAr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('services.description')} (AR)</FormLabel>
              <FormControl>
                <Input {...field} dir="rtl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? t('common.update') : t('common.create')}
        </Button>
      </form>
    </Form>
  );
}