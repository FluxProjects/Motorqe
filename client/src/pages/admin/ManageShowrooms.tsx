// ManageShowrooms.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import { Showroom, InsertShowroom } from "@shared/schema";
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
  MapPin,
  Phone,
  Clock,
  Star,
  Home,
  Wrench,
  Truck,
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
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const ManageShowrooms = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "showroom" | "garage" | "mobile">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentShowroom, setCurrentShowroom] = useState<Showroom | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Fetch showrooms
  const {
    data: showroomsData = [],
    isLoading,
    refetch,
  } = useQuery<Showroom[]>({
    queryKey: ["showrooms"],
    queryFn: async () => {
      const res = await fetch("/api/showroomsgarages");
      if (!res.ok) throw new Error("Failed to fetch showrooms");
      return res.json();
    },
  });

  // Fetch parent showrooms for branches
  const { data: parentShowrooms = [] } = useQuery<Showroom[]>({
    queryKey: ["parent-showrooms"],
    queryFn: async () => {
      const res = await fetch("/api/showroomsgarages?main=true");
      if (!res.ok) throw new Error("Failed to fetch parent showrooms");
      return res.json();
    },
    enabled: isDialogOpen && isEditing,
  });

  // Create/update mutation
  const saveMutation = useMutation({
    mutationFn: async (showroom: InsertShowroom | Showroom) => {
      const isUpdate = "id" in showroom && showroom.id > 0;
      const url = isUpdate ? `/api/showrooms/${showroom.id}` : "/api/showrooms";
      const method = isUpdate ? "PUT" : "POST";

      const payload = {
        userId: showroom.userId,
        name: showroom.name,
        nameAr: showroom.nameAr,
        description: showroom.description,
        descriptionAr: showroom.descriptionAr,
        isMainBranch: showroom.isMainBranch,
        parentId: showroom.parentId,
        address: showroom.address,
        addressAr: showroom.addressAr,
        location: showroom.location,
        timing: showroom.timing,
        phone: showroom.phone,
        logo: showroom.logo,
        images: showroom.images,
        isFeatured: showroom.isFeatured,
        isGarage: showroom.isGarage,
        isMobileService: showroom.isMobileService,
        rating: showroom.rating,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save showroom");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showrooms"] });
      queryClient.invalidateQueries({ queryKey: ["parent-showrooms"] });
      setIsDialogOpen(false);
      setCurrentShowroom(null);
      setIsEditing(false);
      setLogoPreview(null);
      setImagePreviews([]);
      toast({
        title: "Success",
        description: isEditing && currentShowroom?.id ? "Showroom updated successfully" : "Showroom created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/showrooms/${id}`, {
        method: "DELETE",
      });
      
      if (res.status === 404) {
        throw new Error("Showroom not found");
      }
      
      if (res.status === 400) {
        throw new Error("Invalid showroom ID");
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete showroom");
      }
      
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showrooms"] });
      queryClient.invalidateQueries({ queryKey: ["parent-showrooms"] });
      setIsDeleteDialogOpen(false);
      setCurrentShowroom(null);
      toast({
        title: "Success",
        description: "Showroom deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter showrooms
const filteredShowrooms = showroomsData.filter((showroom) => {
  // First apply the search filter
  const matchesSearch =
    searchTerm.trim() === "" ||
    showroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (showroom.nameAr && showroom.nameAr.toLowerCase().includes(searchTerm.toLowerCase())) ||
    showroom.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    showroom.phone?.toLowerCase().includes(searchTerm.toLowerCase());

  // Then apply the type filter
  switch (typeFilter) {
    case "all":
      return matchesSearch; // Show all regardless of type
    case "showroom":
      return matchesSearch && !showroom.isGarage && !showroom.isMobileService;
    case "garage":
      return matchesSearch && showroom.isGarage;
    case "mobile":
      return matchesSearch && showroom.isMobileService;
    default:
      return matchesSearch;
  }
});

  const handleCreateNew = () => {
    setCurrentShowroom({
      id: 0,
      userId: user?.id || 0,
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      isMainBranch: true,
      parentId: null,
      address: "",
      addressAr: "",
      location: "",
      timing: "",
      phone: "",
      logo: "",
      images: [],
      isFeatured: false,
      isGarage: false,
      isMobileService: false,
      rating: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (showroom: Showroom) => {
    setCurrentShowroom(showroom);
    setIsEditing(true);
    setIsDialogOpen(true);
    if (showroom.logo) {
      setLogoPreview(showroom.logo);
    }
    if (showroom.images && showroom.images.length > 0) {
      setImagePreviews(showroom.images);
    }
  };

  const handleView = (showroom: Showroom) => {
    setCurrentShowroom(showroom);
    setIsEditing(false);
    setIsDialogOpen(true);
    if (showroom.logo) {
      setLogoPreview(showroom.logo);
    }
    if (showroom.images && showroom.images.length > 0) {
      setImagePreviews(showroom.images);
    }
  };

  const handleDelete = (showroom: Showroom) => {
    setCurrentShowroom(showroom);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!currentShowroom) return;
    saveMutation.mutate(currentShowroom);
  };

  const handleLogoUpload = (url: string) => {
    if (currentShowroom) {
      setCurrentShowroom({
        ...currentShowroom,
        logo: url,
      });
      setLogoPreview(url);
    }
  };

  const handleImagesUpload = (urls: string[]) => {
    if (currentShowroom) {
      setCurrentShowroom({
        ...currentShowroom,
        images: urls,
      });
      setImagePreviews(urls);
    }
  };

  const addImage = (url: string) => {
    if (currentShowroom) {
      const updatedImages = [...(currentShowroom.images || []), url];
      setCurrentShowroom({
        ...currentShowroom,
        images: updatedImages,
      });
      setImagePreviews(updatedImages);
    }
  };

  const removeImage = (index: number) => {
    if (currentShowroom && currentShowroom.images) {
      const updatedImages = [...currentShowroom.images];
      updatedImages.splice(index, 1);
      setCurrentShowroom({
        ...currentShowroom,
        images: updatedImages,
      });
      setImagePreviews(updatedImages);
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
                    {t("admin.manageShowrooms")}
                  </h1>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleCreateNew}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("admin.newShowroom")}
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
                        placeholder={t("admin.searchShowrooms")}
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
                        setTypeFilter("all");
                      }}
                    >
                      {t("common.reset")}
                    </Button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Select
                        value={typeFilter}
                        onValueChange={(value: "all" | "showroom" | "garage" | "mobile") =>
                          setTypeFilter(value)
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue
                            placeholder={t("admin.filterByType")}
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 text-gray-800">
                          <SelectItem value="all">
                            {t("admin.allTypes")}
                          </SelectItem>
                          <SelectItem value="showroom">Showroom</SelectItem>
                          <SelectItem value="garage">Garage</SelectItem>
                          <SelectItem value="mobile">Mobile Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Showrooms Table */}
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-500">
                        {t("common.loading")}
                      </span>
                    </div>
                  ) : filteredShowrooms.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100 hover:bg-gray-200 border-b">
                          <TableHead className="text-gray-700">
                            Logo
                          </TableHead>
                          <TableHead className="text-gray-700">Name</TableHead>
                          <TableHead className="text-gray-700">
                            Type
                          </TableHead>
                          <TableHead className="text-gray-700">
                            Contact
                          </TableHead>
                          <TableHead className="text-gray-700">
                            Status
                          </TableHead>
                          <TableHead className="text-right text-gray-600">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredShowrooms.map((showroom) => (
                          <TableRow
                            key={showroom.id}
                            className="hover:bg-gray-50 border-b"
                          >
                            <TableCell>
                              {showroom.logo ? (
                                <div className="w-12 h-12 relative">
                                  <img
                                    src={showroom.logo}
                                    alt={showroom.name}
                                    className="object-cover w-full h-full rounded-full"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Home className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-800">
                              <div className="font-medium">{showroom.name}</div>
                              {showroom.isMainBranch ? (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  Main Branch
                                </Badge>
                              ) : showroom.parentId ? (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  Branch
                                </Badge>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {showroom.is_garage ? (
                                  <>
                                    <Wrench className="h-4 w-4 text-yellow-600" />
                                    <span>Garage</span>
                                  </>
                                ) : showroom.isMobileService ? (
                                  <>
                                    <Truck className="h-4 w-4 text-blue-600" />
                                    <span>Mobile Service</span>
                                  </>
                                ) : (
                                  <>
                                    <Home className="h-4 w-4 text-green-600" />
                                    <span>Showroom</span>
                                  </>
                                )}
                                {showroom.isFeatured && (
                                  <Star className="h-4 w-4 text-yellow-500 ml-1" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm">
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {showroom.phone || "N/A"}
                              </div>
                              {showroom.address && (
                                <div className="flex items-start gap-1 mt-1">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span className="line-clamp-1">{showroom.address}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {showroom.rating ? (
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < showroom.rating
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">No ratings</span>
                                )}
                              </div>
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
                                    onClick={() => handleView(showroom)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("common.view")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="hover:bg-gray-100"
                                    onClick={() => handleEdit(showroom)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t("common.edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500 hover:bg-red-100"
                                    onClick={() => handleDelete(showroom)}
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
                      <Home className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">
                        {t("admin.noShowroomsFound")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showroom Editor/Viewer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? currentShowroom?.id
                  ? t("admin.editShowroom")
                  : t("admin.createShowroom")
                : t("admin.viewShowroom")}
            </DialogTitle>
          </DialogHeader>
          {currentShowroom && (
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="english" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="english">English</TabsTrigger>
                  <TabsTrigger value="arabic">العربية</TabsTrigger>
                </TabsList>

                <TabsContent value="english" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={currentShowroom.name}
                      onChange={(e) =>
                        setCurrentShowroom({
                          ...currentShowroom,
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
                      value={currentShowroom.description || ""}
                      onChange={(e) =>
                        setCurrentShowroom({
                          ...currentShowroom,
                          description: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={currentShowroom.address || ""}
                      onChange={(e) =>
                        setCurrentShowroom({
                          ...currentShowroom,
                          address: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="arabic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">الاسم</Label>
                    <Input
                      id="nameAr"
                      value={currentShowroom.nameAr || ""}
                      onChange={(e) =>
                        setCurrentShowroom({
                          ...currentShowroom,
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
                      value={currentShowroom.descriptionAr || ""}
                      onChange={(e) =>
                        setCurrentShowroom({
                          ...currentShowroom,
                          descriptionAr: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      dir="rtl"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressAr">العنوان</Label>
                    <Input
                      id="addressAr"
                      value={currentShowroom.addressAr || ""}
                      onChange={(e) =>
                        setCurrentShowroom({
                          ...currentShowroom,
                          addressAr: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      dir="rtl"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Logo Upload */}
              <div className="space-y-2 mt-4">
                <Label>Logo</Label>
                {isEditing ? (
                  <ImageUpload
                    currentImage={currentShowroom.logo}
                    onUploadComplete={handleLogoUpload}
                  />
                ) : currentShowroom.logo ? (
                  <div className="mt-2 rounded-full overflow-hidden border w-24 h-24">
                    <img
                      src={currentShowroom.logo}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full">
                    <span className="text-gray-500">No logo</span>
                  </div>
                )}
              </div>

              {/* Images Upload */}
              <div className="space-y-2 mt-4">
                <Label>Gallery Images</Label>
                {isEditing ? (
                  <ImageUpload
                    multiple
                    currentImages={currentShowroom.images || []}
                    onUploadComplete={handleImagesUpload}
                  />
                ) : (currentShowroom.images && currentShowroom.images.length > 0) ? (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {currentShowroom.images.map((img, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={img}
                          alt={`Showroom image ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md">
                    <span className="text-gray-500">No gallery images</span>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <Phone className="h-5 w-5 text-gray-400 mt-2" />
                      <Input
                        id="phone"
                        value={currentShowroom.phone || ""}
                        onChange={(e) =>
                          setCurrentShowroom({
                            ...currentShowroom,
                            phone: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="+966 12 345 6789"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Coordinates)</Label>
                    <div className="flex gap-2">
                      <MapPin className="h-5 w-5 text-gray-400 mt-2" />
                      <Input
                        id="location"
                        value={currentShowroom.location || ""}
                        onChange={(e) =>
                          setCurrentShowroom({
                            ...currentShowroom,
                            location: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="25.123456, 39.123456"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timing">Working Hours</Label>
                    <div className="flex gap-2">
                      <Clock className="h-5 w-5 text-gray-400 mt-2" />
                      <Input
                        id="timing"
                        value={currentShowroom.timing || ""}
                        onChange={(e) =>
                          setCurrentShowroom({
                            ...currentShowroom,
                            timing: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="9:00 AM - 6:00 PM"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      value={currentShowroom.rating || 0}
                      onChange={(e) =>
                        setCurrentShowroom({
                          ...currentShowroom,
                          rating: parseInt(e.target.value) || 0,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isMainBranch">Branch Type</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isMainBranch"
                        checked={currentShowroom.isMainBranch}
                        onCheckedChange={(checked) =>
                          setCurrentShowroom({
                            ...currentShowroom,
                            isMainBranch: checked,
                            parentId: checked ? null : currentShowroom.parentId,
                          })
                        }
                        disabled={!isEditing}
                      />
                      <Label htmlFor="isMainBranch">
                        {currentShowroom.isMainBranch ? "Main Branch" : "Sub Branch"}
                      </Label>
                    </div>
                  </div>

                  {!currentShowroom.isMainBranch && (
                    <div className="space-y-2">
                      <Label htmlFor="parentId">Parent Showroom</Label>
                      <select
                        id="parentId"
                        value={currentShowroom.parentId || ""}
                        onChange={(e) =>
                          setCurrentShowroom({
                            ...currentShowroom,
                            parentId: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        className="border rounded px-3 py-2 w-full"
                        disabled={!isEditing}
                      >
                        <option value="">Select parent showroom</option>
                        {parentShowrooms
                          .filter(s => s.id !== currentShowroom.id) // Exclude self
                          .map((showroom) => (
                            <option key={showroom.id} value={showroom.id}>
                              {showroom.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isGarage">Service Type</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isGarage"
                        checked={currentShowroom.isGarage}
                        onCheckedChange={(checked) =>
                          setCurrentShowroom({
                            ...currentShowroom,
                            isGarage: checked,
                            isMobileService: checked ? false : currentShowroom.isMobileService,
                          })
                        }
                        disabled={!isEditing}
                      />
                      <Label htmlFor="isGarage">Garage</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isMobileService">&nbsp;</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isMobileService"
                        checked={currentShowroom.isMobileService}
                        onCheckedChange={(checked) =>
                          setCurrentShowroom({
                            ...currentShowroom,
                            isMobileService: checked,
                            isGarage: checked ? false : currentShowroom.isGarage,
                          })
                        }
                        disabled={!isEditing}
                      />
                      <Label htmlFor="isMobileService">Mobile Service</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isFeatured">&nbsp;</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isFeatured"
                        checked={currentShowroom.isFeatured}
                        onCheckedChange={(checked) =>
                          setCurrentShowroom({
                            ...currentShowroom,
                            isFeatured: checked,
                          })
                        }
                        disabled={!isEditing}
                      />
                      <Label htmlFor="isFeatured">Featured</Label>
                    </div>
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
            <DialogTitle>{t("admin.confirmDeleteShowroom")}</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            {t("admin.deleteShowroomWarning", { name: currentShowroom?.name })}
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
                if (currentShowroom) deleteMutation.mutate(currentShowroom.id);
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

export default ManageShowrooms;