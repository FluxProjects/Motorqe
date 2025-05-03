// components/services/AdminServiceDashboard.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

import { Plus, Edit, Trash2, Loader2, MoreVertical } from "lucide-react";
import { DataTable } from "@/components/data/Datatable";
import {
  ShowroomService,
  carServices,
  Showroom,
  InsertShowroomService,
} from "@shared/schema";
import { useState } from "react";

export function ManageCarServices() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ShowroomService | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<InsertShowroomService>>({
    price: 0,
    currency: "USD",
    isFeatured: false,
  });

  // Fetch all data needed
  const { data: services = [], isLoading: isLoadingServices } = useQuery<
    ShowroomService[]
  >({
    queryKey: ["admin-services"],
    queryFn: () => fetch("/api/showroom-services").then((res) => res.json()),
  });

  const { data: allServices = [] } = useQuery<ShowroomService[]>({
    queryKey: ["services"],
    queryFn: () => fetch("/api/services").then((res) => res.json()),
  });

  const { data: showrooms = [] } = useQuery<Showroom[]>({
    queryKey: ["showrooms"],
    queryFn: () => fetch("/api/showrooms").then((res) => res.json()),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newService: InsertShowroomService) =>
      fetch("/api/showroom-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-services"]);
      Toast.success(t("service.createSuccess"));
      setIsDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedService: ShowroomService) =>
      fetch(`/api/showroom-services/${updatedService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedService),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-services"]);
      Toast.success(t("service.updateSuccess"));
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/showroom-services/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-services"]);
      Toast.success(t("service.deleteSuccess"));
    },
  });

  const handleEdit = (service: ShowroomService) => {
    setEditingService(service);
    setFormData({
      showroomId: service.showroomId,
      serviceId: service.serviceId,
      price: service.price,
      currency: service.currency,
      description: service.description,
      descriptionAr: service.descriptionAr,
      isActive: service.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.showroomId || !formData.serviceId || !formData.price) {
      Toast.error(t("service.fillRequiredFields"));
      return;
    }

    if (editingService) {
      updateMutation.mutate({
        ...editingService,
        ...formData,
      } as ShowroomService);
    } else {
      createMutation.mutate(formData as InsertShowroomService);
    }
  };

  const columns: ColumnDef<ShowroomService>[] = [
    {
      accessorKey: "service.name",
      header: t("service.service"),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.service?.name}
          {row.original.service?.nameAr && (
            <div className="text-sm text-muted-foreground">
              {row.original.service.nameAr}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "showroom.name",
      header: t("service.showroom"),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.showroom?.name}
          {row.original.showroom?.nameAr && (
            <div className="text-sm text-muted-foreground">
              {row.original.showroom.nameAr}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: t("service.price"),
      cell: ({ row }) => (
        <div>
          {row.original.price} {row.original.currency}
          {row.original.description && (
            <div className="text-sm text-muted-foreground">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: t("service.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "outline"}>
          {row.original.isActive ? t("common.active") : t("common.inactive")}
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
              if (confirm(t("service.confirmDelete"))) {
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
        <h2 className="text-2xl font-bold">{t("service.manageAllServices")}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingService(null);
                setFormData({
                  price: 0,
                  currency: "USD",
                  isActive: true,
                });
              }}
            >
              <Plus className="mr-2" size={16} />
              {t("service.addNew")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingService
                  ? t("service.editService")
                  : t("service.addNewService")}
              </DialogTitle>
              <DialogDescription>
                {t("service.serviceFormDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="showroom">{t("service.showroom")} *</Label>
                  <Select
                    value={formData.showroomId?.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, showroomId: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("service.selectShowroom")} />
                    </SelectTrigger>
                    <SelectContent>
                      {showrooms.map((showroom) => (
                        <SelectItem
                          key={showroom.id}
                          value={showroom.id.toString()}
                        >
                          {showroom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">{t("service.service")} *</Label>
                  <Select
                    value={formData.serviceId?.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, serviceId: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("service.selectService")} />
                    </SelectTrigger>
                    <SelectContent>
                      {allServices.map((service) => (
                        <SelectItem
                          key={service.id}
                          value={service.id.toString()}
                        >
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t("service.price")} *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">{t("service.currency")}</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="SAR">SAR</SelectItem>
                      <SelectItem value="QAR">QAR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{t("service.status")}</Label>
                  <Select
                    value={formData.isActive ? "active" : "inactive"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, isActive: value === "active" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("service.selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        {t("common.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("common.inactive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  {t("service.description")} (EN)
                </Label>
                <Input
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionAr">
                  {t("service.description")} (AR)
                </Label>
                <Input
                  id="descriptionAr"
                  dir="rtl"
                  value={formData.descriptionAr || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionAr: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={createMutation.isLoading || updateMutation.isLoading}
              >
                {createMutation.isLoading || updateMutation.isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editingService ? t("common.update") : t("common.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={services}
        isLoading={isLoadingServices}
        emptyMessage={t("service.noServicesFound")}
      />
    </div>
  );
}