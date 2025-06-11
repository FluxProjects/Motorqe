// ManageSliders.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import { HeroSlider, InsertHeroSlider } from "@shared/schema";
import {
  ArrowUpDown,
  Check,
  Edit,
  Eye,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
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
import ImageUpload from "@/components/ui/image-upload";
import { roleMapping } from "@shared/permissions";

type SliderType = 'home' | 'garage';

const ManageSliders = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<SliderType | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentSlider, setCurrentSlider] = useState<HeroSlider | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch hero sliders
  const {
    data: sliderData = [],
    isLoading,
    refetch,
  } = useQuery<HeroSlider[]>({
    queryKey: ["hero-sliders"],
    queryFn: async () => {
      const res = await fetch("/api/hero-sliders");
      if (!res.ok) throw new Error("Failed to fetch hero sliders");
      return res.json();
    },
  });

  // Create/update mutation
  const saveMutation = useMutation({
    mutationFn: async (slider: InsertHeroSlider | HeroSlider) => {
      const isUpdate = "id" in slider && slider.id > 0;
      const url = isUpdate 
        ? `/api/hero-sliders/${slider.id}`
        : "/api/hero-sliders";
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slider),
      });
      if (!res.ok) throw new Error("Failed to save slider");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-sliders"] });
      setIsDialogOpen(false);
      setCurrentSlider(null);
      setIsEditing(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/hero-sliders/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete slider");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-sliders"] });
      setIsDeleteDialogOpen(false);
      setCurrentSlider(null);
    },
  });

  // Filter sliders
  const filteredSliders = sliderData.filter((slider) => {
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" ? slider.isActive : !slider.isActive);
    const matchesType = typeFilter === "all" || slider.slide_type === typeFilter;
    const matchesSearch =
      searchTerm.trim() === "" ||
      slider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slider.subtitle?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleCreateNew = (type: SliderType) => {
    setCurrentSlider({
      id: 0,
      title: "",
      titleAr: "",
      subtitle: "",
      subtitleAr: "",
      imageUrl: "",
      buttonText: "",
      buttonTextAr: "",
      buttonUrl: "",
      type,
      isActive: true,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (slider: HeroSlider) => {
    setCurrentSlider(slider);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleView = (slider: HeroSlider) => {
    setCurrentSlider(slider);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (slider: HeroSlider) => {
    setCurrentSlider(slider);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!currentSlider) return;
    saveMutation.mutate(currentSlider);
  };

  const handleImageUpload = (url: string) => {
    if (currentSlider) {
      setCurrentSlider({
        ...currentSlider,
        imageUrl: url,
      });
    }
  };

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
                    {t("admin.manageHeroSliders")}
                  </h1>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleCreateNew('home')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("admin.newHomeSlider")}
                    </Button>
                    <Button
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleCreateNew('garage')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("admin.newGarageSlider")}
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

                {/* Search & Filters */}
                <div className="mt-4 mb-6 bg-neutral-50 border border-orange-300 rounded-lg shadow p-4">
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex gap-3 mb-4"
                  >
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder={t("admin.searchSliders")}
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
                        setTypeFilter("all");
                      }}
                    >
                      {t("common.reset")}
                    </Button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    <div>
                      <Select
                        value={typeFilter}
                        onValueChange={(value: SliderType | "all") =>
                          setTypeFilter(value)
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder={t("admin.filterByType")} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 text-gray-800">
                          <SelectItem value="all">
                            {t("admin.allTypes")}
                          </SelectItem>
                          <SelectItem value="home">Home Page</SelectItem>
                          <SelectItem value="garage">Garage Page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Sliders Table */}
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-500">
                        {t("common.loading")}
                      </span>
                    </div>
                  ) : filteredSliders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100 hover:bg-gray-200 border-b">
                          <TableHead className="text-gray-700">Image</TableHead>
                          <TableHead className="text-gray-700">
                            <button
                              className="flex items-center"
                              onClick={() => {}}
                            >
                              Title
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </button>
                          </TableHead>
                          <TableHead className="text-gray-700">Type</TableHead>
                          <TableHead className="text-gray-700">Status</TableHead>
                          <TableHead className="text-gray-700">Order</TableHead>
                          <TableHead className="text-right text-gray-600">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSliders.map((slider) => (
                          <TableRow
                            key={slider.id}
                            className="hover:bg-gray-50 border-b"
                          >
                            <TableCell>
                              {slider.imageUrl ? (
                                <div className="w-16 h-16 rounded-md overflow-hidden">
                                  <img
                                    src={slider.imageUrl}
                                    alt={slider.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-gray-800">
                              {slider.title}
                            </TableCell>
                            <TableCell className="text-gray-800">
                              <Badge
                                variant={slider.slide_type === 'home' ? 'default' : 'secondary'}
                                className="capitalize"
                              >
                                {slider.slide_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {slider.isActive ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Active
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Inactive
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {slider.slide_order}
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
                                    onClick={() => handleView(slider)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("common.view")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="hover:bg-gray-100"
                                    onClick={() => handleEdit(slider)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t("common.edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500 hover:bg-red-100"
                                    onClick={() => handleDelete(slider)}
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
                      <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">
                        {t("admin.noSlidersFound")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Editor/Viewer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? currentSlider?.id
                  ? t("admin.editSlider")
                  : t("admin.createSlider")
                : t("admin.viewSlider")}
            </DialogTitle>
          </DialogHeader>
          {currentSlider && (
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="english" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="english">English</TabsTrigger>
                  <TabsTrigger value="arabic">العربية</TabsTrigger>
                </TabsList>
                
                <TabsContent value="english" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={currentSlider.title}
                      onChange={(e) =>
                        setCurrentSlider({
                          ...currentSlider,
                          title: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Textarea
                      id="subtitle"
                      value={currentSlider.subtitle || ""}
                      onChange={(e) =>
                        setCurrentSlider({
                          ...currentSlider,
                          subtitle: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={currentSlider.buttonText || ""}
                      onChange={(e) =>
                        setCurrentSlider({
                          ...currentSlider,
                          buttonText: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buttonUrl">Button URL</Label>
                    <Input
                      id="buttonUrl"
                      value={currentSlider.buttonUrl || ""}
                      onChange={(e) =>
                        setCurrentSlider({
                          ...currentSlider,
                          buttonUrl: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="arabic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleAr">العنوان</Label>
                    <Input
                      id="titleAr"
                      value={currentSlider.titleAr || ""}
                      onChange={(e) =>
                        setCurrentSlider({
                          ...currentSlider,
                          titleAr: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subtitleAr">العنوان الفرعي</Label>
                    <Textarea
                      id="subtitleAr"
                      value={currentSlider.subtitleAr || ""}
                      onChange={(e) =>
                        setCurrentSlider({
                          ...currentSlider,
                          subtitleAr: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buttonTextAr">نص الزر</Label>
                    <Input
                      id="buttonTextAr"
                      value={currentSlider.buttonTextAr || ""}
                      onChange={(e) =>
                        setCurrentSlider({
                          ...currentSlider,
                          buttonTextAr: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      dir="rtl"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Slider Image</Label>
                  {isEditing ? (
                    <ImageUpload
                      currentImage={currentSlider.imageUrl}
                      onUploadComplete={handleImageUpload}
                    />
                  ) : currentSlider.imageUrl ? (
                    <div className="mt-2 rounded-md overflow-hidden border">
                      <img
                        src={currentSlider.imageUrl}
                        alt="Slider preview"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
                      <span className="text-gray-500">No image uploaded</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={currentSlider.isActive}
                    onCheckedChange={(checked) =>
                      setCurrentSlider({
                        ...currentSlider,
                        isActive: checked,
                      })
                    }
                    disabled={!isEditing}
                  />
                  <Label htmlFor="isActive">
                    {currentSlider.isActive ? "Active" : "Inactive"}
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Slider Type</Label>
                  <select
                    id="type"
                    value={currentSlider.slide_type}
                    onChange={(e) =>
                      setCurrentSlider({
                        ...currentSlider,
                        type: e.target.value as SliderType,
                      })
                    }
                    className="border rounded px-3 py-2 w-full"
                    disabled={!isEditing || currentSlider.id > 0}
                  >
                    <option value="home">Home Page</option>
                    <option value="garage">Garage Page</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={currentSlider.slide_order}
                    onChange={(e) =>
                      setCurrentSlider({
                        ...currentSlider,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={!isEditing}
                    min="0"
                  />
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
            <DialogTitle>{t("admin.confirmDeleteSlider")}</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            {t("admin.deleteSliderWarning", { title: currentSlider?.title })}
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
                if (currentSlider) deleteMutation.mutate(currentSlider.id);
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

export default ManageSliders;