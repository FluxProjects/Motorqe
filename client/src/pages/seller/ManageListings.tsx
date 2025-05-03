import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import i18n, { resources } from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Eye,
  MoreHorizontal,
  Check,
  X,
  Star,
  Trash2,
  Search,
  Filter,
  Loader2,
  Car,
  MapPin,
  Calendar,
  User,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CarMake, CarCategory } from "@shared/schema";
import { roleMapping } from "@shared/permissions";

const ManageListings = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    make: "",
    dateRange: "",
  });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentListing, setCurrentListing] = useState<any>(null);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "feature" | "delete" | "sold"
  >("approve");
  const [actionReason, setActionReason] = useState("");
  const [actionInProgress, setActionInProgress] = useState(false);

 // Fetch car categories for filters
  const { data: categories = [] } = useQuery<CarCategory>({
    queryKey: ["/api/car-categories"],
  });


  // Fetch car makes for filters
  const { data: makes = [] } = useQuery<CarMake[]>({
    queryKey: ["/api/car-makes"],
  });
  const {
    data: listings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/car-listings", currentTab, searchQuery, filters],
    queryFn: async () => {
      console.log("[DEBUG] Starting listings fetch with params:", {
        currentTab,
        searchQuery,
        filters,
      });

      const statusParam = currentTab !== "all" ? currentTab : filters.status;
      const searchParams = new URLSearchParams();

      if (statusParam) searchParams.append("status", statusParam);
      if (searchQuery) searchParams.append("search", searchQuery);
      if (filters.category) searchParams.append("category", filters.category);
      if (filters.make) searchParams.append("make", filters.make);
      if (filters.dateRange)
        searchParams.append("dateRange", filters.dateRange);

      console.log(
        "[DEBUG] Final API URL:",
        `/api/car-listings?${searchParams.toString()}`
      );

      // 1. Fetch all listings
      const res = await fetch(`/api/car-listings?${searchParams.toString()}`);
      if (!res.ok) {
        console.error("[ERROR] Failed to fetch listings. Status:", res.status);
        const errorText = await res.text();
        console.error("[ERROR] Response text:", errorText);
        throw new Error("Failed to fetch listings");
      }

      const listings = await res.json();
      console.log("[DEBUG] Raw listings from API:", listings);

      if (!listings || listings.length === 0) {
        console.warn("[WARNING] No listings returned from API");
        return [];
      }

      // 2. Get unique IDs needed for relationships
      const uniqueUserIds = [
        ...new Set(listings.map((listing: any) => listing.user_id)),
      ];
      const uniqueMakeIds = [
        ...new Set(listings.map((listing: any) => listing.make_id)),
      ];
      const uniqueModelIds = [
        ...new Set(listings.map((listing: any) => listing.model_id)),
      ];

      console.log("[DEBUG] Unique IDs to fetch:", {
        uniqueUserIds,
        uniqueMakeIds,
        uniqueModelIds,
      });

      // 3. Fetch all related data in parallel
      const [sellerData, makesData, modelsData] = await Promise.all([
        // Fetch sellers
        Promise.all(
          uniqueUserIds.map(async (id) => {
            console.log(`[DEBUG] Fetching user ${id}`);
            try {
              const res = await fetch(`/api/users/${id}`);
              if (!res.ok) {
                console.error(
                  `[ERROR] Failed to fetch user ${id}. Status:`,
                  res.status
                );
                return null;
              }
              return await res.json();
            } catch (error) {
              console.error(`[ERROR] Error fetching user ${id}:`, error);
              return null;
            }
          })
        ),
        // Fetch models
        Promise.all(
          uniqueModelIds.map(async (id) => {
            console.log(`[DEBUG] Fetching model ${id}`);
            try {
              const res = await fetch(`/api/car-models/${id}`);
              if (!res.ok) {
                console.error(
                  `[ERROR] Failed to fetch model ${id}. Status:`,
                  res.status
                );
                return null;
              }
              return await res.json();
            } catch (error) {
              console.error(`[ERROR] Error fetching model ${id}:`, error);
              return null;
            }
          })
        ),
        // Fetch makes
        Promise.all(
          uniqueMakeIds.map(async (id) => {
            console.log(`[DEBUG] Fetching make ${id}`);
            try {
              const res = await fetch(`/api/car-makes/${id}`);
              if (!res.ok) {
                console.error(
                  `[ERROR] Failed to fetch make ${id}. Status:`,
                  res.status
                );
                return null;
              }
              return await res.json();
            } catch (error) {
              console.error(`[ERROR] Error fetching make ${id}:`, error);
              return null;
            }
          })
        ),
      ]);

      console.log("[DEBUG] Related data fetched:", {
        sellerData,
        makesData,
        modelsData,
      });

      // 4. Create mapping objects
      const userMap = new Map();
      sellerData.forEach((user) => {
        if (user) {
          console.log(`[DEBUG] Mapping user ${user.id}`);
          userMap.set(user.id, user);
        }
      });

      const makeMap = new Map();
      makesData.forEach((make) => {
        if (make) {
          console.log(`[DEBUG] Mapping make ${make.id}`);
          makeMap.set(make.id, make);
        }
      });

      const modelMap = new Map();
      modelsData.forEach((model) => {
        if (model) {
          console.log(`[DEBUG] Mapping model ${model.id}`);
          modelMap.set(model.id, model);
        }
      });

      // 5. Attach all related data to each listing
      const enrichedListings = listings.map((listing: any) => {
        const enriched = {
          ...listing,
          seller: userMap.get(listing.user_id) || null,
          make: makeMap.get(listing.make_id) || null,
          model: modelMap.get(listing.model_id) || null,
        };

        console.log(`[DEBUG] Enriched listing ${listing.id}:`, enriched);
        return enriched;
      });

      console.log("[DEBUG] Final enriched listings:", enrichedListings);
      return enrichedListings;
    },
  });

  // Mutation for listing actions
  const performAction = useMutation({
    mutationFn: async ({
      id,
      action,
      reason,
      featured,
    }: {
      id: number;
      action: string;
      reason?: string;
      featured?: boolean;
    }) => {
      setActionInProgress(true);

      if (action === "delete") {
        await apiRequest("DELETE", `/api/car-listings/${id}`, {});
        return;
      }

      await apiRequest("PATCH", `/api/car-listings/${id}`, {
        action,
        reason,
        featured,
      });
    },
    onSuccess: () => {
      let message = "";

      switch (actionType) {
        case "approve":
          message = t("admin.listingApproved");
          break;
        case "reject":
          message = t("admin.listingRejected");
          break;
        case "feature":
          message = t("admin.listingFeatured");
          break;
        case "delete":
          message = t("admin.listingDeleted");
          break;
      }

      toast({
        title: t("common.success"),
        description: message,
      });

      // Reset state
      setActionDialogOpen(false);
      setCurrentListing(null);
      setActionReason("");
      refetch();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error ? error.message : t("admin.actionFailed"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setActionInProgress(false);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "",
      category: "",
      make: "",
      dateRange: "",
    });
    refetch();
  };

  const handleViewListing = (listing: any) => {
    setCurrentListing(listing);
    setViewDialogOpen(true);
  };

  const handleAction = (
    listing: any,
    action: "approve" | "reject" | "feature" | "delete" | "sold"
  ) => {
    setCurrentListing(listing);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!currentListing) return;

    switch (actionType) {
      case "approve":
        performAction.mutate({ id: currentListing.id, action: "approve" });
        break;
      case "reject":
        performAction.mutate({
          id: currentListing.id,
          action: "reject",
          reason: actionReason,
        });
        break;
      case "feature":
        performAction.mutate({
          id: currentListing.id,
          action: "feature",
          featured: true,
        });
        break;
      case "delete":
        performAction.mutate({ id: currentListing.id, action: "delete" });
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            {t("admin.active")}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            {t("admin.pending")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            {t("admin.rejected")}
          </Badge>
        );
      case "sold":
        return (
          <Badge className="bg-blue-100 text-blue-800">{t("admin.sold")}</Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Admin Sidebar */}
            <div className="hidden md:block">
              {user?.roleId && (
                <DashboardSidebar type={roleMapping[user.roleId] || "ADMIN"} />
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {t("admin.manageListings")}
                    </h1>
                    <p className="text-slate-400 mt-1">
                      {t("admin.listingDesc")}
                    </p>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      className="text-slate-200 border-slate-700 bg-slate-700 hover:bg-blue-600 hover:text-white mr-2"
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

                {/* Tabs & Filters */}
                <div className="mb-6">
                  <Tabs
                    defaultValue="all"
                    value={currentTab}
                    onValueChange={setCurrentTab}
                  >
                    <TabsList className="bg-slate-800 text-slate-400">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-slate-700 hover:bg-blue-600 hover:text-white data-[state=active]:text-white"
                      >
                        {t("admin.allListings")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="data-[state=active]:bg-slate-700 hover:bg-blue-600 hover:text-white data-[state=active]:text-white"
                      >
                        {t("admin.pendingListings")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="active"
                        className="data-[state=active]:bg-slate-700 hover:bg-blue-600 hover:text-white data-[state=active]:text-white"
                      >
                        {t("admin.activeListings")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="rejected"
                        className="data-[state=active]:bg-slate-700 hover:bg-blue-600 hover:text-white data-[state=active]:text-white"
                      >
                        {t("admin.rejectedListings")}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Search & Filters */}
                  <div className="mt-4 bg-slate-800 p-4 rounded-lg">
                    <form onSubmit={handleSearch} className="flex gap-3 mb-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          placeholder={t("admin.searchListings")}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="default"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {t("common.search")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-600 text-slate-700 hover:bg-slate-700"
                        onClick={resetFilters}
                      >
                        {t("common.reset")}
                      </Button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <Select
                          value={filters.status}
                          onValueChange={(value) =>
                            setFilters({ ...filters, status: value })
                          }
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white data-[placeholder]:text-white">
                            <SelectValue
                              placeholder={t("admin.filterByStatus")}
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="pending">
                              {t("admin.pending")}
                            </SelectItem>
                            <SelectItem value="active">
                              {t("admin.active")}
                            </SelectItem>
                            <SelectItem value="rejected">
                              {t("admin.rejected")}
                            </SelectItem>
                            <SelectItem value="sold">
                              {t("admin.sold")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Select
                          value={filters.category}
                          onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))
                          }
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white data-[placeholder]:text-white">
                            <SelectValue
                              placeholder={t("admin.filterByCategory")}
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          {Array.isArray(categories) &&
                             categories.map((category: any) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Select
                          value={filters.make}
                          onValueChange={(value) => setFilters((prev) => ({ ...prev, make: value }))
                          }
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white data-[placeholder]:text-white">
                            <SelectValue
                              placeholder={t("admin.filterByMake")}
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            {makes?.map((make: any) => (
                              <SelectItem
                                key={make.id}
                                value={make.id.toString()}
                              >
                                {make.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Select
                          value={filters.dateRange}
                          onValueChange={(value) =>
                            setFilters({ ...filters, dateRange: value })
                          }
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white data-[placeholder]:text-white">
                            <SelectValue
                              placeholder={t("admin.filterByDate")}
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="today">
                              {t("admin.today")}
                            </SelectItem>
                            <SelectItem value="week">
                              {t("admin.thisWeek")}
                            </SelectItem>
                            <SelectItem value="month">
                              {t("admin.thisMonth")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listings Table */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <span className="ml-2 text-slate-400">
                        {t("common.loading")}
                      </span>
                    </div>
                  ) : listings && listings.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-slate-700/70 border-slate-700 text-white">
                          <TableHead className="text-white">
                            {t("car.carDetails")}
                          </TableHead>
                          <TableHead className="text-white">
                            {t("car.makeModel")}
                          </TableHead>
                          <TableHead className="text-white">
                            {t("car.year")}
                          </TableHead>
                          <TableHead className="text-white">
                            {t("car.mileage")}
                          </TableHead>
                          <TableHead className="text-white">
                            {t("car.seller")}
                          </TableHead>
                          <TableHead className="text-white">
                            {t("common.status")}
                          </TableHead>
                          <TableHead className="text-white">
                            {t("admin.featured")}
                          </TableHead>
                          <TableHead className="text-white">
                            {t("admin.listedOn")}
                          </TableHead>
                          <TableHead className="text-white">
                            {t("admin.lastUpdated")}
                          </TableHead>
                          <TableHead className="text-right text-slate-300">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {listings.map((listing: any) => (
                          <TableRow
                            key={listing.id}
                            className="hover:bg-slate-700/50 border-slate-700"
                          >
                            <TableCell>
                              <div className="flex items-center">
                                <div className="h-12 w-12 rounded overflow-hidden bg-slate-700 mr-3 flex-shrink-0">
                                  {listing.images &&
                                    listing.images.length > 0 && (
                                      <img
                                        src={listing.images[0]}
                                        alt={listing.title}
                                        className="h-full w-full object-cover"
                                      />
                                    )}
                                </div>
                                <div>
                                  <div className="font-medium text-white">
                                    {listing.title}
                                  </div>
                                  <div className="text-sm text-slate-400">
                                    ${listing.price.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    {t(`car.fuelTypes.${listing.fuel_type}`)} •{" "}
                                    {t(
                                      `car.transmissions.${listing.transmission}`
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-slate-300">
                                <div>{listing.make?.name || "N/A"}</div>
                                <div className="text-sm text-slate-400">
                                  {listing.model?.name || "N/A"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {listing.year}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {listing.mileage.toLocaleString()}{" "}
                              {t("car.miles")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage
                                    src={
                                      listing.seller?.avatar ||
                                      "/path/to/default-avatar.jpg"
                                    }
                                  />
                                  <AvatarFallback className="bg-slate-600 text-slate-200">
                                    {listing.seller?.username
                                      ?.charAt(0)
                                      .toUpperCase() || "JD"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-slate-300">
                                  {listing.seller?.username || "John Doe"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(listing.status)}
                            </TableCell>
                            <TableCell>
                              {listing.is_featured ? (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Star className="h-3 w-3 mr-1 fill-purple-800" />
                                  {t("admin.featured")}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 text-sm">
                                  -
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-slate-300 text-sm">
                              {new Date(
                                listing.created_at
                              ).toLocaleDateString()}
                              <div className="text-xs text-slate-500">
                                {new Date(
                                  listing.created_at
                                ).toLocaleTimeString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300 text-sm">
                              {listing.updated_at ? (
                                <>
                                  {new Date(
                                    listing.updated_at
                                  ).toLocaleDateString()}
                                  <div className="text-xs text-slate-500">
                                    {new Date(
                                      listing.updated_at
                                    ).toLocaleTimeString()}
                                  </div>
                                </>
                              ) : (
                                <span className="text-slate-400 text-sm">
                                  -
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-white"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-slate-800 border-slate-700 text-slate-300"
                                >
                                  <DropdownMenuLabel>
                                    {t("common.actions")}
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem
                                    className="hover:bg-slate-700 focus:bg-slate-700"
                                    onClick={() => handleViewListing(listing)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("common.view")}
                                  </DropdownMenuItem>

                                  {listing.status === "pending" && (
                                    <>
                                      <DropdownMenuItem
                                        className="hover:bg-slate-700 focus:bg-slate-700"
                                        onClick={() =>
                                          handleAction(listing, "approve")
                                        }
                                      >
                                        <Check className="mr-2 h-4 w-4 text-green-500" />
                                        {t("admin.approve")}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="hover:bg-slate-700 focus:bg-slate-700"
                                        onClick={() =>
                                          handleAction(listing, "reject")
                                        }
                                      >
                                        <X className="mr-2 h-4 w-4 text-red-500" />
                                        {t("admin.reject")}
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {listing.status === "active" && (
                                    <>
                                      {!listing.isFeatured && (
                                        <DropdownMenuItem
                                          className="hover:bg-slate-700 focus:bg-slate-700"
                                          onClick={() =>
                                            handleAction(listing, "feature")
                                          }
                                        >
                                          <Star className="mr-2 h-4 w-4 text-yellow-500" />
                                          {t("admin.featureListing")}
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        className="hover:bg-slate-700 focus:bg-slate-700"
                                        onClick={() =>
                                          handleAction(listing, "sold")
                                        }
                                      >
                                        <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                                        {t("admin.markAsSold")}
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  <DropdownMenuSeparator className="bg-slate-700" />
                                  <DropdownMenuItem
                                    className="text-red-400 hover:bg-red-900/30 focus:bg-red-900/30"
                                    onClick={() =>
                                      handleAction(listing, "delete")
                                    }
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
                      <Car className="h-16 w-16 text-slate-700 mb-4" />
                      <h3 className="text-xl font-medium text-slate-400 mb-2">
                        {t("admin.noListingsFound")}
                      </h3>
                      <p className="text-slate-500 text-center max-w-md mb-4">
                        {t("admin.noListingsFoundDesc")}
                      </p>
                      <Button
                        variant="outline"
                        onClick={resetFilters}
                        className="border-slate-600 text-slate-700 hover:bg-slate-700"
                      >
                        {t("common.resetFilters")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* View Listing Dialog */}
            {currentListing && (
              <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-white">
                      {currentListing.title}
                      {currentListing.titleAr && (
                        <div className="text-sm text-slate-400 mt-1">
                          {currentListing.titleAr}
                        </div>
                      )}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Main Image */}
                    <div>
                      {currentListing.images &&
                        currentListing.images.length > 0 && (
                          <div className="overflow-hidden rounded-lg bg-slate-700 aspect-video">
                            <img
                              src={currentListing.images[0]}
                              alt={currentListing.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                      {/* Image Gallery */}
                      {currentListing.images &&
                        currentListing.images.length > 1 && (
                          <div className="grid grid-cols-4 gap-2 mt-2">
                            {currentListing.images
                              .slice(1, 5)
                              .map((image: string, index: number) => (
                                <div
                                  key={index}
                                  className="overflow-hidden rounded-md bg-slate-700 aspect-video"
                                >
                                  <img
                                    src={image}
                                    alt={`${currentListing.title} ${index + 2}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                          </div>
                        )}
                    </div>

                    {/* Listing Details */}
                    <div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {currentListing.title}
                          </h3>
                          {currentListing.titleAr && (
                            <div className="text-sm text-slate-400">
                              {currentListing.titleAr}
                            </div>
                          )}
                          <div className="flex items-center mt-1 text-slate-400">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{currentListing.location}</span>
                            {currentListing.locationAr && (
                              <span className="mr-2">
                                {" "}
                                / {currentListing.locationAr}
                              </span>
                            )}
                          </div>
                          <div className="text-2xl font-bold text-blue-400 mt-2">
                            ${currentListing.price.toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-slate-700/50 p-3 rounded-lg">
                          <h4 className="font-medium text-slate-300 mb-2">
                            {t("car.carDetails")}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("car.make")}
                              </span>
                              <span className="text-white">
                                {currentListing.make?.name || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("car.model")}
                              </span>
                              <span className="text-white">
                                {currentListing.model?.name || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("car.category")}
                              </span>
                              <span className="text-white">
                                {currentListing.category?.name || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("car.year")}
                              </span>
                              <span className="text-white">
                                {currentListing.year}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("car.mileage")}
                              </span>
                              <span className="text-white">
                                {currentListing.mileage?.toLocaleString() ||
                                  "0"}{" "}
                                mi
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("car.fuelType")}
                              </span>
                              <span className="text-white capitalize">
                                {currentListing.fuel_type}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("car.transmission")}
                              </span>
                              <span className="text-white capitalize">
                                {currentListing.transmission}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("car.color")}
                              </span>
                              <span className="text-white capitalize">
                                {currentListing.color}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("car.condition")}
                              </span>
                              <span className="text-white capitalize">
                                {currentListing.condition}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("car.views")}
                              </span>
                              <span className="text-white">
                                {currentListing.views || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-700/50 p-3 rounded-lg">
                          <h4 className="font-medium text-slate-300 mb-2">
                            {t("admin.sellerInfo")}
                          </h4>
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage
                                src={currentListing.seller?.avatar}
                              />
                              <AvatarFallback className="bg-blue-600">
                                {currentListing.seller?.username
                                  ?.charAt(0)
                                  .toUpperCase() || "J"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-white">
                                {currentListing.seller?.username || "John Doe"}
                              </div>
                              <div className="text-xs text-slate-400">
                                {t("admin.contact")}:{" "}
                                {currentListing.contact_number || "N/A"}
                              </div>
                              <div className="text-xs text-slate-400">
                                {t("admin.memberSince")}:{" "}
                                {currentListing.seller?.created_at
                                  ? new Date(
                                      currentListing.seller.created_at
                                    ).getFullYear()
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-700/50 p-3 rounded-lg">
                          <h4 className="font-medium text-slate-300 mb-2">
                            {t("admin.listingStatus")}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("common.status")}
                              </span>
                              {getStatusBadge(currentListing.status)}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("admin.listedOn")}
                              </span>
                              <span className="text-white">
                                {new Date(
                                  currentListing.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("admin.lastUpdated")}
                              </span>
                              <span className="text-white">
                                {currentListing.updated_at
                                  ? new Date(
                                      currentListing.updated_at
                                    ).toLocaleDateString()
                                  : "Never"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("admin.featured")}
                              </span>
                              <span className="text-white">
                                {currentListing.isFeatured ? (
                                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                                    <Star className="h-3 w-3 mr-1 fill-purple-800" />
                                    {t("common.yes")}
                                  </Badge>
                                ) : (
                                  t("common.no")
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                {t("admin.active")}
                              </span>
                              <span className="text-white">
                                {currentListing.is_active
                                  ? t("common.yes")
                                  : t("common.no")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-4 bg-slate-700/50 p-3 rounded-lg">
                    <h4 className="font-medium text-slate-300 mb-2">
                      {t("car.description")}
                    </h4>
                    <p className="text-slate-300 text-sm whitespace-pre-line">
                      {currentListing.description || t("car.noDescription")}
                    </p>
                    {currentListing.descriptionAr && (
                      <>
                        <h4 className="font-medium text-slate-300 mt-4 mb-2">
                          {t("car.descriptionAr")}
                        </h4>
                        <p
                          className="text-slate-300 text-sm whitespace-pre-line text-right"
                          dir="rtl"
                        >
                          {currentListing.descriptionAr}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setViewDialogOpen(false)}
                      className="border-slate-600 text-slate-700 hover:bg-slate-700"
                    >
                      {t("common.close")}
                    </Button>

                    <div className="space-x-2">
                      {currentListing.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            className="border-red-800 bg-red-900/20 text-red-400 hover:bg-red-900/30"
                            onClick={() => {
                              setViewDialogOpen(false);
                              handleAction(currentListing, "reject");
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            {t("admin.reject")}
                          </Button>

                          <Button
                            className="bg-green-700 hover:bg-green-800 text-white"
                            onClick={() => {
                              setViewDialogOpen(false);
                              handleAction(currentListing, "approve");
                            }}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            {t("admin.approve")}
                          </Button>
                        </>
                      )}

                      {currentListing.status === "active" && (
                        <>
                          {!currentListing.isFeatured && (
                            <Button
                              className="bg-amber-700 hover:bg-amber-800 text-white"
                              onClick={() => {
                                setViewDialogOpen(false);
                                handleAction(currentListing, "feature");
                              }}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              {t("admin.featureListing")}
                            </Button>
                          )}
                          <Button
                            className="bg-blue-700 hover:bg-blue-800 text-white"
                            onClick={() => {
                              setViewDialogOpen(false);
                              handleAction(currentListing, "sold");
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {t("admin.markAsSold")}
                          </Button>
                        </>
                      )}

                      <Button
                        variant="destructive"
                        onClick={() => {
                          setViewDialogOpen(false);
                          handleAction(currentListing, "delete");
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("common.delete")}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Action Dialog */}
            {currentListing && (
              <Dialog
                open={actionDialogOpen}
                onOpenChange={setActionDialogOpen}
              >
                <DialogContent className="bg-slate-800 text-white border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      {actionType === "approve" && t("admin.approveListing")}
                      {actionType === "reject" && t("admin.rejectListing")}
                      {actionType === "feature" && t("admin.featureListing")}
                      {actionType === "delete" && t("admin.deleteListing")}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                      {actionType === "approve" &&
                        t("admin.approveListingDesc")}
                      {actionType === "reject" && t("admin.rejectListingDesc")}
                      {actionType === "feature" &&
                        t("admin.featureListingDesc")}
                      {actionType === "delete" && t("admin.deleteListingDesc")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {actionType === "reject" && (
                      <div className="space-y-2">
                        <Label htmlFor="reason" className="text-slate-300">
                          {t("admin.rejectionReason")}
                        </Label>
                        <Textarea
                          id="reason"
                          placeholder={t("admin.rejectionReasonPlaceholder")}
                          value={actionReason}
                          onChange={(e) => setActionReason(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                        />
                      </div>
                    )}

                    {actionType === "feature" && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="featured"
                            defaultChecked={true}
                            className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <Label htmlFor="featured" className="text-slate-300">
                            {t("admin.markAsFeatured")}
                          </Label>
                        </div>
                        <p className="text-sm text-slate-400">
                          {t("admin.featuredListingInfo")}
                        </p>
                      </div>
                    )}

                    {actionType === "delete" && (
                      <div className="bg-red-900/20 border border-red-800 p-3 rounded-md text-red-300 text-sm">
                        <p>{t("admin.deleteListingWarning")}</p>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setActionDialogOpen(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      disabled={actionInProgress}
                    >
                      {t("common.cancel")}
                    </Button>

                    <Button
                      onClick={confirmAction}
                      disabled={
                        (actionType === "reject" && !actionReason.trim()) ||
                        actionInProgress
                      }
                      className={`
                          ${
                            actionType === "approve"
                              ? "bg-green-700 hover:bg-green-800"
                              : ""
                          }
                          ${
                            actionType === "reject"
                              ? "bg-amber-700 hover:bg-amber-800"
                              : ""
                          }
                          ${
                            actionType === "feature"
                              ? "bg-blue-700 hover:bg-blue-800"
                              : ""
                          }
                          ${
                            actionType === "delete"
                              ? "bg-red-700 hover:bg-red-800"
                              : ""
                          }
                          text-white
                        `}
                    >
                      {actionInProgress ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <>
                          {actionType === "approve" && (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          {actionType === "reject" && (
                            <X className="h-4 w-4 mr-2" />
                          )}
                          {actionType === "feature" && (
                            <Star className="h-4 w-4 mr-2" />
                          )}
                          {actionType === "delete" && (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                        </>
                      )}

                      {actionType === "approve" && t("admin.approveListing")}
                      {actionType === "reject" && t("admin.rejectListing")}
                      {actionType === "feature" && t("admin.featureListing")}
                      {actionType === "delete" && t("admin.deleteListing")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageListings;
