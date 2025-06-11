// BannerAds.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import { BannerAd, InsertBannerAd } from "@shared/schema";
import {
  ArrowUpDown,
  Check,
  Edit,
  Eye,
  ImageIcon,
  LinkIcon,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { roleMapping } from "@shared/permissions";
import ImageUpload from "@/components/ui/image-upload";

const ManageBannerAds = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<BannerAd | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch banner ads
  const {
    data: bannerData = [],
    isLoading,
    refetch,
  } = useQuery<BannerAd[]>({
    queryKey: ["banner-ads"],
    queryFn: async () => {
      const res = await fetch("/api/banner-ads");
      if (!res.ok) throw new Error("Failed to fetch banner ads");
      return res.json();
    },
  });

  // Create/update mutation
  const saveMutation = useMutation({
    mutationFn: async (banner: InsertBannerAd | BannerAd) => {
      const isUpdate = "id" in banner && banner.id > 0;
      const url = isUpdate ? `/api/banner-ads/${banner.id}` : "/api/banner-ads";
      const method = isUpdate ? "PUT" : "POST";

      const payload = {
        title: banner.title,
        titleAr: banner.title_ar,
        link: banner.link,
        imageUrl: banner.image_url,
        position: banner.position,
        isActive: banner.is_active,
        startDate: banner.start_date,
        endDate: banner.end_date,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save banner ad");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-ads"] });
      setIsDialogOpen(false);
      setCurrentBanner(null);
      setIsEditing(false);
      setImagePreview(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/banner-ads/${id}`, {
        method: "DELETE",
      });
      
      if (res.status === 404) {
        throw new Error("Banner not found");
      }
      
      if (res.status === 400) {
        throw new Error("Invalid banner ID");
      }
      
      if (!res.ok) {
        // For 500 errors, we'll get the error message from the response
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete banner ad");
      }
      
      // Successful deletion returns 204 No Content
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-ads"] });
      setIsDeleteDialogOpen(false);
      setCurrentBanner(null);
      toast.success("Banner ad deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
      console.error("Delete error:", error);
    }
});

  // Filter banners
  const filteredBanners = bannerData.filter((banner) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? banner.is_active : !banner.is_active);
    const matchesSearch =
      searchTerm.trim() === "" ||
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (banner.title_ar &&
        banner.title_ar.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleCreateNew = () => {
    setCurrentBanner({
      id: 0,
      title: "",
      title_ar: "",
      image_url: "",
      link: "",
      position: "top",
      is_active: true,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      created_at: new Date(),
      updated_at: new Date(),
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (banner: BannerAd) => {
    setCurrentBanner(banner);
    setIsEditing(true);
    setIsDialogOpen(true);
    if (banner.image_url) {
      setImagePreview(banner.image_url);
    }
  };

  const handleView = (banner: BannerAd) => {
    setCurrentBanner(banner);
    setIsEditing(false);
    setIsDialogOpen(true);
    if (banner.image_url) {
      setImagePreview(banner.image_url);
    }
  };

  const handleDelete = (banner: BannerAd) => {
    setCurrentBanner(banner);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!currentBanner) return;
    saveMutation.mutate(currentBanner);
  };
  const handleImageUpload = (url: string) => {
    console.log("url", url);
    if (currentBanner) {
      const updatedBanner = {
        ...currentBanner,
        image_url: url,
      };
      setCurrentBanner(updatedBanner);
      console.log("updatedBanner", updatedBanner); // log the updated object
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
                    {t("admin.manageBannerAds")}
                  </h1>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleCreateNew}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("admin.newBannerAd")}
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
                        placeholder={t("admin.searchBanners")}
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
                          <SelectValue
                            placeholder={t("admin.filterByStatus")}
                          />
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

                {/* Banners Table */}
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-500">
                        {t("common.loading")}
                      </span>
                    </div>
                  ) : filteredBanners.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100 hover:bg-gray-200 border-b">
                          <TableHead className="text-gray-700">
                            Preview
                          </TableHead>
                          <TableHead className="text-gray-700">Title</TableHead>
                          <TableHead className="text-gray-700">
                            Position
                          </TableHead>
                          <TableHead className="text-gray-700">
                            Status
                          </TableHead>
                          <TableHead className="text-gray-700">Dates</TableHead>
                          <TableHead className="text-right text-gray-600">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBanners.map((banner) => (
                          <TableRow
                            key={banner.id}
                            className="hover:bg-gray-50 border-b"
                          >
                            <TableCell>
                              {banner.image_url && (
                                <div className="w-20 h-12 relative">
                                  <img
                                    src={banner.image_url}
                                    alt={banner.title}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-800">
                              {banner.title}
                            </TableCell>
                            <TableCell className="text-gray-800">
                              {banner.position}
                            </TableCell>
                            <TableCell>
                              {banner.is_active ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Active
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Inactive
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm">
                              {new Date(banner.start_date).toLocaleDateString()}{" "}
                              - {new Date(banner.end_date).toLocaleDateString()}
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
                                    onClick={() => handleView(banner)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("common.view")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="hover:bg-gray-100"
                                    onClick={() => handleEdit(banner)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t("common.edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500 hover:bg-red-100"
                                    onClick={() => handleDelete(banner)}
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
                        {t("admin.noBannersFound")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Editor/Viewer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? currentBanner?.id
                  ? t("admin.editBannerAd")
                  : t("admin.createBannerAd")
                : t("admin.viewBannerAd")}
            </DialogTitle>
          </DialogHeader>
          {currentBanner && (
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
                      value={currentBanner.title}
                      onChange={(e) =>
                        setCurrentBanner({
                          ...currentBanner,
                          title: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link">Link URL</Label>
                    <div className="flex gap-2">
                      <LinkIcon className="h-5 w-5 text-gray-400 mt-2" />
                      <Input
                        id="link"
                        value={currentBanner.link}
                        onChange={(e) =>
                          setCurrentBanner({
                            ...currentBanner,
                            link: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="arabic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title_ar">العنوان</Label>
                    <Input
                      id="title_ar"
                      value={currentBanner.title_ar || ""}
                      onChange={(e) =>
                        setCurrentBanner({
                          ...currentBanner,
                          title_ar: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      dir="rtl"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Banner Image</Label>
                {isEditing ? (
                  <ImageUpload
                    currentImage={currentBanner.image_url}
                    onUploadComplete={handleImageUpload}
                  />
                ) : currentBanner.image_url ? (
                  <div className="mt-2 rounded-md overflow-hidden border">
                    <img
                      src={currentBanner.image_url}
                      alt="Banner preview"
                      className="w-full h-64 object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
                    <span className="text-gray-500">No banner image</span>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <select
                    id="position"
                    value={currentBanner.position}
                    onChange={(e) =>
                      setCurrentBanner({
                        ...currentBanner,
                        position: e.target.value as
                          | "top"
                          | "middle"
                          | "bottom"
                          | "sidebar",
                      })
                    }
                    className="border rounded px-3 py-2 w-full"
                    disabled={!isEditing}
                  >
                    <option value="top">Top Banner</option>
                    <option value="middle">Middle Banner</option>
                    <option value="bottom">Bottom Banner</option>
                    <option value="sidebar">Sidebar Banner</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={currentBanner.is_active}
                    onCheckedChange={(checked) =>
                      setCurrentBanner({
                        ...currentBanner,
                        is_active: checked,
                      })
                    }
                    disabled={!isEditing}
                  />
                  <Label htmlFor="is_active">
                    {currentBanner.is_active ? "Active" : "Inactive"}
                  </Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={
                        currentBanner.start_date
                          ? new Date(currentBanner.start_date)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setCurrentBanner({
                          ...currentBanner,
                          start_date: new Date(e.target.value).toISOString(),
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={
                        currentBanner.end_date
                          ? new Date(currentBanner.end_date)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setCurrentBanner({
                          ...currentBanner,
                          end_date: new Date(e.target.value).toISOString(),
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
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
            <DialogTitle>{t("admin.confirmDeleteBanner")}</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            {t("admin.deleteBannerWarning", { title: currentBanner?.title })}
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
                if (currentBanner) deleteMutation.mutate(currentBanner.id);
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

export default ManageBannerAds;
