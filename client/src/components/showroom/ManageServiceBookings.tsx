// components/bookings/AdminBookingDashboard.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { 
  Button, 
  Badge, 
  Dialog, 
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  toast,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Calendar as CalendarIcon
} from "lucide-react";
import { DataTable } from "@/components/data/Datatable";
import { 
  ServiceBooking,
  InsertServiceBooking,
  ShowroomService,
  User,
  BookingStatus
} from "@shared/schema";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export function ManageServiceBookings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<ServiceBooking | null>(null);
  const [formData, setFormData] = useState<Partial<InsertServiceBooking>>({
    scheduledAt: new Date().toISOString(),
    status: 'pending'
  });

  // Fetch all data needed
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery<ServiceBooking[]>({
    queryKey: ['admin-bookings'],
    queryFn: () => fetch('/api/service-bookings').then(res => res.json())
  });

  const { data: showroomServices = [] } = useQuery<ShowroomService[]>({
    queryKey: ['showroom-services'],
    queryFn: () => fetch('/api/showroom-services').then(res => res.json())
  });

  const { data: customers = [] } = useQuery<User[]>({
    queryKey: ['customers'],
    queryFn: () => fetch('/api/customers').then(res => res.json())
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newBooking: InsertServiceBooking) => 
      fetch('/api/service-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-bookings']);
      toast.success(t('booking.createSuccess'));
      setIsDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updatedBooking: ServiceBooking) => 
      fetch(`/api/service-bookings/${updatedBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-bookings']);
      toast.success(t('booking.updateSuccess'));
      setIsDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/service-bookings/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-bookings']);
      toast.success(t('booking.deleteSuccess'));
    }
  });

  const handleEdit = (booking: ServiceBooking) => {
    setEditingBooking(booking);
    setFormData({
      serviceId: booking.serviceId,
      userId: booking.userId,
      scheduledAt: booking.createdAt,
      notes: booking.notes,
      status: booking.status
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.serviceId || !formData.userId || !formData.scheduledAt) {
      toast.error(t('booking.fillRequiredFields'));
      return;
    }

    if (editingBooking) {
      updateMutation.mutate({
        ...editingBooking,
        ...formData
      } as ServiceBooking);
    } else {
      createMutation.mutate(formData as InsertServiceBooking);
    }
  };

  const statusBadgeVariant = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const columns: ColumnDef<ServiceBooking>[] = [
    {
      accessorKey: "customer",
      header: t('booking.customer'),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.customer?.name}
          {row.original.customer?.phone && (
            <div className="text-sm text-muted-foreground">
              {row.original.customer.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "service",
      header: t('booking.service'),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.showroomService?.service?.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.showroomService?.showroom?.name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "bookingDate",
      header: t('booking.dateTime'),
      cell: ({ row }) => (
        <div>
          {format(parseISO(row.original.bookingDate), 'PPp')}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t('booking.status'),
      cell: ({ row }) => (
        <Badge variant={statusBadgeVariant(row.original.status)}>
          {t(`booking.statuses.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Edit size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              if (confirm(t('booking.confirmDelete'))) {
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
        <h2 className="text-2xl font-bold">{t('booking.manageBookings')}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingBooking(null);
              setFormData({
                scheduledAt: new Date().toISOString(),
                status: 'pending'
              });
            }}>
              <Plus className="mr-2" size={16} />
              {t('booking.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingBooking ? t('booking.editBooking') : t('booking.addNewBooking')}
              </DialogTitle>
              <DialogDescription>
                {t('booking.bookingFormDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">{t('booking.customer')} *</Label>
                  <Select
                    value={formData.userId?.toString()}
                    onValueChange={(value) => 
                      setFormData({...formData, userId: parseInt(value)})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('booking.selectCustomer')} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem 
                          key={customer.id} 
                          value={customer.id.toString()}
                        >
                          {customer.firstName} ({customer.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">{t('booking.service')} *</Label>
                  <Select
                    value={formData.serviceId?.toString()}
                    onValueChange={(value) => 
                      setFormData({...formData, serviceId: parseInt(value)})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('booking.selectService')} />
                    </SelectTrigger>
                    <SelectContent>
                      {showroomServices.map(service => (
                        <SelectItem 
                          key={service.id} 
                          value={service.id.toString()}
                        >
                          {service.service?.name} - {service.showroom?.name} ({service.price} {service.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingDate">{t('booking.bookingDate')} *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.scheduledAt && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduledAt ? (
                          format(parseISO(formData.scheduledAt), 'PPP'
                        )) : (
                          <span>{t('booking.selectDate')}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.scheduledAt ? new Date(formData.scheduledAt) : undefined}
                        onSelect={(date) => 
                          setFormData({...formData, scheduledAt: date?.toISOString()})
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{t('booking.status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => 
                      setFormData({...formData, status: value as BookingStatus})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('booking.selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t('booking.statuses.pending')}</SelectItem>
                      <SelectItem value="confirmed">{t('booking.statuses.confirmed')}</SelectItem>
                      <SelectItem value="cancelled">{t('booking.statuses.cancelled')}</SelectItem>
                      <SelectItem value="completed">{t('booking.statuses.completed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('booking.notes')}</Label>
                <Input
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => 
                    setFormData({...formData, notes: e.target.value})
                  }
                  placeholder={t('booking.notesPlaceholder')}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="submit"
                onClick={handleSubmit}
                disabled={createMutation.isLoading || updateMutation.isLoading}
              >
                {(createMutation.isLoading || updateMutation.isLoading) ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editingBooking ? t('common.update') : t('common.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        isLoading={isLoadingBookings}
        emptyMessage={t('booking.noBookingsFound')}
      />
    </div>
  );
}