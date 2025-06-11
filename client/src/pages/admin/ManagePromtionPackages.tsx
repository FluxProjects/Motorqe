// PromotionPackages.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import {
  PromotionPackage,
  InsertPromotionPackage,
  ServicePromotionPackage,
  InsertServicePromotionPackage,
} from "@shared/schema";
import {
  ArrowUpDown,
  Check,
  Edit,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  List,
  Zap,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { roleMapping } from "@shared/permissions";

type PromotionType = "listing" | "service";

const ManagePromotionPackages = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [promotionType, setPromotionType] = useState<PromotionType>("listing");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<
    PromotionPackage | ServicePromotionPackage | null
  >(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch promotion packages based on type
  const {
    data: packagesData = [],
    isLoading,
    refetch,
  } = useQuery<(PromotionPackage | ServicePromotionPackage)[]>({
    queryKey: ["promotion-packages", promotionType],
    queryFn: async () => {
      const endpoint = promotionType === "listing" 
        ? "/api/promotion-packages" 
        : "/api/promotion-packages/services";
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch promotion packages");
      return res.json();
    },
  });

  // Create/update mutation
  const saveMutation = useMutation({
    mutationFn: async (
      pkg: InsertPromotionPackage | PromotionPackage | InsertServicePromotionPackage | ServicePromotionPackage
    ) => {
      const isListing = promotionType === "listing";
      const isUpdate = "id" in pkg && pkg.id > 0;
      const endpoint = isListing
        ? isUpdate
          ? `/api/promotion-packages/${pkg.id}`
          : "/api/promotion-packages"
        : isUpdate
        ? `/api/promotion-packages/services/${pkg.id}`
        : "/api/promotion-packages/services";
      
      const method = isUpdate ? "PUT" : "POST";
      
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pkg),
      });
      if (!res.ok) throw new Error("Failed to save promotion package");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-packages", promotionType] });
      setIsDialogOpen(false);
      setCurrentPackage(null);
      setIsEditing(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const endpoint = promotionType === "listing"
        ? `/api/promotion-packages/${id}`
        : `/api/promotion-packages/services/${id}`;
      
      const res = await fetch(endpoint, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete promotion package");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-packages", promotionType] });
      setIsDeleteDialogOpen(false);
      setCurrentPackage(null);
    },
  });

  // Filter packages
  const filteredPackages = packagesData.filter((pkg) => {
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" ? pkg.is_active : !pkg.is_active);
    const matchesSearch =
      searchTerm.trim() === "" ||
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateNew = () => {
    const basePackage = {
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      plan: "",
      price: 0,
      currency: promotionType === "listing" ? "QAR" : "USD",
      durationDays: 7,
      isFeatured: false,
      priority: 0,
      isActive: true,
    };

    if (promotionType === "listing") {
      setCurrentPackage({
        ...basePackage,
        id: 0,
        createdAt: new Date(),
      } as PromotionPackage);
    } else {
      setCurrentPackage({
        ...basePackage,
        id: 0,
        createdAt: new Date(),
      } as ServicePromotionPackage);
    }
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (pkg: PromotionPackage | ServicePromotionPackage) => {
    setCurrentPackage(pkg);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleView = (pkg: PromotionPackage | ServicePromotionPackage) => {
    setCurrentPackage(pkg);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (pkg: PromotionPackage | ServicePromotionPackage) => {
    setCurrentPackage(pkg);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!currentPackage) return;
    saveMutation.mutate(currentPackage);
  };

  const currencyOptions = [
    { value: "QAR", label: "Qatari Riyal (QAR)" },
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="hidden md:block">
              {user?.roleId && (
                <DashboardSidebar type={roleMapping[user?.roleId] || "BUYER"} />
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {t("admin.managePromotionPackages")}
                  </h1>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleCreateNew}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("admin.addPackage")}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-white bg-orange-500 hover:bg-orange-700 hover:text-white"
                      onClick={() => refetch()}
                      disabled={isLoading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          isLoading ? "animate-spin" : ""
                        }`}
                      />
                      {t("common.refresh")}
                    </Button>
                  </div>
                </div>

                {/* Promotion Type Toggle */}
                <div className="mb-6">
                  <Tabs 
                    value={promotionType} 
                    onValueChange={(value: PromotionType) => setPromotionType(value)}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="listing">
                        <List className="h-4 w-4 mr-2" />
                        Listing Promotions
                      </TabsTrigger>
                      <TabsTrigger value="services">
                        <Zap className="h-4 w-4 mr-2" />
                        Service Promotions
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Search & Filters */}
                <div className="mt-4 mb-6 bg-neutral-50 border border-orange-300 rounded-lg shadow p-4">
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex gap-3 mb-4"
                  >
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder={t("admin.searchPackages")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-gray-300 text-gray-800 placeholder:text-gray-400"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-400 text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                    >
                      {t("common.reset")}
                    </Button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Select
                        value={statusFilter}
                        onValueChange={(value: "all" | "active" | "inactive") =>
                          setStatusFilter(value)
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder={t("admin.filterByStatus")} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 text-gray-800">
                          <SelectItem value="all">
                            {t("admin.allStatuses")}
                          </SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Packages Table */}
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-500">
                        {t("common.loading")}
                      </span>
                    </div>
                  ) : filteredPackages.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100 hover:bg-gray-200 border-b">
                          <TableHead className="text-gray-700">
                            <button
                              className="flex items-center"
                              onClick={() => {}}
                            >
                              Name
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </button>
                          </TableHead>
                          <TableHead className="text-gray-700">Plan</TableHead>
                          <TableHead className="text-gray-700">Price</TableHead>
                          <TableHead className="text-gray-700">Duration</TableHead>
                          <TableHead className="text-gray-700">Status</TableHead>
                          <TableHead className="text-right text-gray-600">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPackages.map((pkg) => (
                          <TableRow
                            key={pkg.id}
                            className="hover:bg-gray-50 border-b"
                          >
                            <TableCell className="font-medium text-gray-800">
                              {pkg.name}
                              {pkg.is_featured && (
                                <Badge className="ml-2 bg-purple-100 text-purple-800">
                                  Featured
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-800 capitalize">
                              {pkg.plan}
                            </TableCell>
                            <TableCell className="text-gray-800">
                              {pkg.price} {pkg.currency}
                            </TableCell>
                            <TableCell className="text-gray-800">
                              {pkg.duration_days} days
                            </TableCell>
                            <TableCell>
                              {pkg.is_active ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Active
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">
                                  Inactive
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-white border border-gray-300 text-gray-800"
                                >
                                  <DropdownMenuItem
                                    className="hover:bg-gray-100"
                                    onClick={() => handleView(pkg)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("common.view")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="hover:bg-gray-100"
                                    onClick={() => handleEdit(pkg)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t("common.edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500 hover:bg-red-100"
                                    onClick={() => handleDelete(pkg)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("common.delete")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Zap className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">
                        {t("admin.noPackagesFound")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Editor/Viewer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? currentPackage?.id
                  ? t("admin.editPackage")
                  : t("admin.createPackage")
                : t("admin.viewPackage")}
            </DialogTitle>
          </DialogHeader>
          {currentPackage && (
            <div className="space-y-4">
              <Tabs defaultValue="english" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="english">English</TabsTrigger>
                  <TabsTrigger value="arabic">العربية</TabsTrigger>
                </TabsList>
                
                <TabsContent value="english" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name*</Label>
                    <Input
                      id="name"
                      value={currentPackage.name}
                      onChange={(e) =>
                        setCurrentPackage({
                          ...currentPackage,
                          name: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={currentPackage.description || ""}
                      onChange={(e) =>
                        setCurrentPackage({
                          ...currentPackage,
                          description: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="arabic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">الاسم*</Label>
                    <Input
                      id="nameAr"
                      value={currentPackage.nameAr || ""}
                      onChange={(e) =>
                        setCurrentPackage({
                          ...currentPackage,
                          nameAr: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descriptionAr">الوصف</Label>
                    <Textarea
                      id="descriptionAr"
                      value={currentPackage.descriptionAr || ""}
                      onChange={(e) =>
                        setCurrentPackage({
                          ...currentPackage,
                          descriptionAr: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      dir="rtl"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan</Label>
                  <Input
                    id="plan"
                    value={currentPackage.plan || ""}
                    onChange={(e) =>
                      setCurrentPackage({
                        ...currentPackage,
                        plan: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="basic, premium, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price*</Label>
                  <div className="flex">
                    <Input
                      id="price"
                      type="number"
                      value={currentPackage.price}
                      onChange={(e) =>
                        setCurrentPackage({
                          ...currentPackage,
                          price: Number(e.target.value),
                        })
                      }
                      disabled={!isEditing}
                    />
                    <Select
                      value={currentPackage.currency}
                      onValueChange={(value) =>
                        setCurrentPackage({
                          ...currentPackage,
                          currency: value,
                        })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="w-[120px] ml-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Duration (days)*</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    value={currentPackage.duration_days}
                    onChange={(e) =>
                      setCurrentPackage({
                        ...currentPackage,
                        duration_days: Number(e.target.value),
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={currentPackage.priority}
                    onChange={(e) =>
                      setCurrentPackage({
                        ...currentPackage,
                        priority: Number(e.target.value),
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={currentPackage.is_featured}
                    onCheckedChange={(checked) =>
                      setCurrentPackage({
                        ...currentPackage,
                        is_featured: checked,
                      })
                    }
                    disabled={!isEditing}
                  />
                  <Label htmlFor="isFeatured">Featured Package</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={currentPackage.is_active}
                    onCheckedChange={(checked) =>
                      setCurrentPackage({
                        ...currentPackage,
                        is_active: checked,
                      })
                    }
                    disabled={!isEditing}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={saveMutation.isLoading}
                >
                  {saveMutation.isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {t("common.save")}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsDialogOpen(false)}>
                {t("common.close")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.confirmDeletePackage")}</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            {t("admin.deletePackageWarning", { name: currentPackage?.name })}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (currentPackage) deleteMutation.mutate(currentPackage.id);
              }}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagePromotionPackages;