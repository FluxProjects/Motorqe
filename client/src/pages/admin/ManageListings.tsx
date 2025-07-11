import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
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
  Star,
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
  DialogDescription,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { roleMapping } from "@shared/permissions";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ListingStatus =
  | "draft"
  | "pending"
  | "active"
  | "sold"
  | "expired"
  | "rejected";

const ManageListings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState<
    ListingStatus | "all" | "upgrade-requests"
  >("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentListing, setCurrentListing] = useState<any>(null);
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [remarks, setRemarks] = useState("");

  // Fetch listings with counts for each status
  const {
    data: listingsData = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["car-listings", currentTab, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (currentTab !== "all" && currentTab !== "upgrade-requests") {
        params.append("status", currentTab);
      }

      params.append("is_admin", "true");

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const res = await fetch(`/api/car-listings?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch listings");
      return res.json();
    },
  });

  // Fetch upgrade requests
  const {
    data: upgradeRequests = [],
    isLoading: isLoadingRequests,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["listing-upgrade-requests"],
    queryFn: async () => {
      const [packageRes, featureRes] = await Promise.all([
        fetch("/api/listing-package-upgrade?status=pending"),
        fetch("/api/listing-feature-upgrade?status=pending"),
      ]);

      if (!packageRes.ok || !featureRes.ok) {
        throw new Error("Failed to fetch upgrade requests");
      }

      const packageRequests = await packageRes.json();
      const featureRequests = await featureRes.json();

      return [
        ...packageRequests.map((req: any) => ({ ...req, type: "package" })),
        ...featureRequests.map((req: any) => ({ ...req, type: "feature" })),
      ];
    },
    enabled: currentTab === "upgrade-requests",
  });

  // Fetch promotion packages
  const { data: promotionPackages = [] } = useQuery({
    queryKey: ["promotion-packages"],
    queryFn: async () => {
      const res = await fetch("/api/promotion-packages");
      if (!res.ok) throw new Error("Failed to fetch promotion packages");
      return res.json();
    },
  });

  // Fetch status counts
  const { data: statusCounts } = useQuery({
    queryKey: ["listing-status-counts"],
    queryFn: async () => {
      const res = await fetch("/api/car-listings/status-counts");
      if (!res.ok) throw new Error("Failed to fetch status counts");
      return res.json();
    },
  });

  // Mutation for status changes
  const statusMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: string }) => {
      const res = await fetch(`/api/car-listings/${id}/actions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to update listing status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["car-listings"]);
    },
  });

  // Mutation for featuring
  const featureMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      const res = await fetch(`/api/car-listings/${id}/actions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "feature", featured }),
      });
      if (!res.ok) throw new Error("Failed to update featured status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["car-listings"]);
      setIsFeatureDialogOpen(false);
    },
  });

  // Mutation for promotion package
  const promotionMutation = useMutation({
    mutationFn: async ({
      id,
      packageId,
    }: {
      id: number;
      packageId: number;
    }) => {
      const res = await fetch(`/api/car-listings/${id}/actions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "upgrade",
          package_id: packageId,
        }),
      });
      if (!res.ok) throw new Error("Failed to apply promotion package");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["car-listings"]);
      setIsPromotionDialogOpen(false);
    },
  });

  // Mutation for handling upgrade requests
  const upgradeRequestMutation = useMutation({
    mutationFn: async ({
      requestId,
      status,
      type,
      remarks,
    }: {
      requestId: number;
      status: "approved" | "rejected";
      type: "package" | "feature";
      remarks?: string;
    }) => {
      const endpoint =
        type === "package"
          ? `/api/listing-package-upgrade/${requestId}/approve`
          : `/api/listing-feature-upgrade/${requestId}/approve`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, remarks, adminId: user?.id }),
      });

      if (!res.ok) throw new Error(`Failed to ${status} ${type} upgrade`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["listing-upgrade-requests"]);
      queryClient.invalidateQueries(["car-listings"]);
      setCurrentListing(null);
      setRemarks("");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/car-listings/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete listing");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["car-listings"]);
      setIsDeleteDialogOpen(false);
    },
  });

  // Add these utility functions at the top of your component
  const fetchListingDetails = async (id: number) => {
    const res = await fetch(`/api/car-listings/${id}`);
    if (!res.ok) throw new Error("Failed to fetch listing details");
    return res.json();
  };

  const fetchUserDetails = async (id: number) => {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error("Failed to fetch user details");
    return res.json();
  };

  const ListingTitle = ({ id }: { id: number }) => {
    const {
      data: listing,
      isLoading,
      error,
    } = useQuery({
      queryKey: ["listing", id],
      queryFn: () => fetchListingDetails(id),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

    if (isLoading) return <span>Loading...</span>;
    if (error) return <span>Listing #{id}</span>;

    return <span>{listing?.title || `Listing #${id}`}</span>;
  };

  const UserDetails = ({ id }: { id: number }) => {
    const {
      data: user,
      isLoading,
      error,
    } = useQuery({
      queryKey: ["user", id],
      queryFn: () => fetchUserDetails(id),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

    if (isLoading) return <span>Loading...</span>;
    if (error) return <span>User #{id}</span>;

    return (
      <span>
        {user?.first_name} {user?.last_name}
      </span>
    );
  };

  // Handle status change
  const handleStatusChange = (id: number, status: string) => {
    statusMutation.mutate({ id, action: status });
  };

  // Handle feature toggle
  const handleFeatureToggle = (id: number, featured: boolean) => {
    featureMutation.mutate({ id, featured });
  };

  // Handle promotion package apply
  const handlePromotionApply = (id: number) => {
    if (!selectedPackage) return;
    promotionMutation.mutate({ id, packageId: parseInt(selectedPackage) });
  };

  // Handle upgrade request approval/rejection
  const handleUpgradeRequest = (
    requestId: number,
    type: "package" | "feature",
    status: "approved" | "rejected"
  ) => {
    upgradeRequestMutation.mutate({
      requestId,
      status,
      type,
      remarks: remarks || undefined,
    });
  };

  // Handle delete
  const handleDelete = (listing: any) => {
    setCurrentListing(listing);
    setIsDeleteDialogOpen(true);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: ListingStatus }) => {
    const statusMap = {
      draft: { label: "Draft", color: "bg-gray-500" },
      pending: { label: "Pending", color: "bg-yellow-500" },
      active: { label: "Active", color: "bg-green-500" },
      sold: { label: "Sold", color: "bg-purple-500" },
      expired: { label: "Expired", color: "bg-red-500" },
      rejected: { label: "Rejected", color: "bg-red-500" },
    };

      const badge = statusMap[status] || { label: status || "Unknown", color: "bg-gray-400" };


    return (
      <Badge className={`${badge.color} text-white`}>
      {badge.label}
    </Badge>
    );
  };

  // Get user type display
  const getUserTypeDisplay = (listing: any) => {
    if (listing.is_business && listing.showroom_id) {
      return (
        <div className="flex items-center">
          <span className="font-medium">Showroom:</span>
          <span className="ml-2">{listing.showroom_name}</span>
          {listing.showroom_logo && (
            <img
              src={listing.showroom_logo}
              alt="Showroom Logo"
              className="w-6 h-6 ml-2 rounded-full"
            />
          )}
        </div>
      );
    }
    return <span>Private Seller</span>;
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
                    {t("admin.manageCarListings")}
                  </h1>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="text-white bg-orange-500 hover:bg-orange-700 hover:text-white"
                      onClick={() => {
                        refetch();
                        if (currentTab === "upgrade-requests") {
                          refetchRequests();
                        }
                      }}
                      disabled={isLoading || isLoadingRequests}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          isLoading || isLoadingRequests ? "animate-spin" : ""
                        }`}
                      />
                      {t("common.refresh")}
                    </Button>
                  </div>
                </div>

                {/* Tabs for status filtering */}
                <Tabs
                  value={currentTab}
                  onValueChange={(value) =>
                    setCurrentTab(
                      value as ListingStatus | "all" | "upgrade-requests"
                    )
                  }
                >
                  <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="all">
                      All ({statusCounts?.total || 0})
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                      Pending ({statusCounts?.pending || 0})
                    </TabsTrigger>
                    <TabsTrigger value="active">
                      Active ({statusCounts?.active || 0})
                    </TabsTrigger>
                    <TabsTrigger value="sold">
                      Sold ({statusCounts?.sold || 0})
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                      Rejected ({statusCounts?.rejected || 0})
                    </TabsTrigger>
                    <TabsTrigger value="expired">
                      Expired ({statusCounts?.expired || 0})
                    </TabsTrigger>
                    <TabsTrigger value="upgrade-requests">
                      Upgrade Requests ({upgradeRequests.length || 0})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Search & Filters */}
                <div className="mt-4 mb-6 bg-neutral-50 border border-orange-300 rounded-lg shadow p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      refetch();
                    }}
                    className="flex gap-3 mb-4"
                  >
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder={t("admin.searchListings")}
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
                        setCurrentTab("all");
                      }}
                    >
                      {t("common.reset")}
                    </Button>
                  </form>
                </div>

                {/* Content based on current tab */}
                {currentTab === "upgrade-requests" ? (
                  <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                    {isLoadingRequests ? (
                      <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        <span className="ml-2 text-gray-500">
                          {t("common.loading")}
                        </span>
                      </div>
                    ) : upgradeRequests.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100 hover:bg-gray-200 border-b">
                            <TableHead className="text-gray-700">
                              Request ID
                            </TableHead>
                            <TableHead className="text-gray-700">
                              Listing
                            </TableHead>
                            <TableHead className="text-gray-700">
                              Type
                            </TableHead>
                            <TableHead className="text-gray-700">
                              Details
                            </TableHead>
                            <TableHead className="text-gray-700">
                              Requested By
                            </TableHead>
                            <TableHead className="text-gray-700">
                              Date
                            </TableHead>
                            <TableHead className="text-right text-gray-600">
                              {t("common.actions")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upgradeRequests.map((request: any) => (
                            <TableRow
                              key={`${request.type}-${request.id}`}
                              className="border-b"
                            >
                              <TableCell>{request.id}</TableCell>
                              <TableCell>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto"
                                  onClick={() =>
                                    navigate(`/sell-car/${request.listing_id}`)
                                  }
                                >
                                  <ListingTitle id={request.listing_id} />
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "capitalize",
                                    request.type === "feature"
                                      ? "bg-blue-100 text-blue-800"
                                      : "",
                                    request.type === "package"
                                      ? "bg-green-100 text-green-800"
                                      : ""
                                  )}
                                >
                                  {request.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {request.type === "package" ? (
                                  <div>
                                    <span className="font-medium">
                                      Package:
                                    </span>{" "}
                                    {promotionPackages.find(
                                      (pkg) =>
                                        pkg.id === request.requested_package_id
                                    )?.name || "Unknown"}{" "}
                                    <span className="font-medium">Price:</span>{" "}
                                    {request.price} {request.currency || "QAR"}
                                  </div>
                                ) : (
                                  <div>
                                    <span className="font-medium">Days:</span>{" "}
                                    {request.requested_days}
                                    {request.price && (
                                      <span className="ml-2">
                                        <span className="font-medium">
                                          Price:
                                        </span>{" "}
                                        {request.price}{" "}
                                        {request.currency || "QAR"}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <UserDetails id={request.requested_by} />
                              </TableCell>
                              <TableCell>
                                {request.created_at
                                  ? format(
                                      new Date(request.created_at),
                                      "MMM dd, yyyy"
                                    )
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => {
                                    setCurrentListing(request);
                                    setRemarks("");
                                  }}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No upgrade requests found
                      </div>
                    )}
                  </div>
                ) : (
                  /* Regular listings table */
                  <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                    {isLoading ? (
                      <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        <span className="ml-2 text-gray-500">
                          {t("common.loading")}
                        </span>
                      </div>
                    ) : listingsData.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100 hover:bg-gray-200 border-b">
                            <TableHead className="text-gray-700">ID</TableHead>
                            <TableHead className="text-gray-700">
                              Title
                            </TableHead>
                            <TableHead className="text-gray-700">
                              Owner
                            </TableHead>
                            <TableHead className="text-gray-700">
                              Price
                            </TableHead>
                            <TableHead className="text-gray-700">
                              Status
                            </TableHead>
                            <TableHead className="text-gray-700">
                              Featured
                            </TableHead>
                            <TableHead className="text-gray-700">
                              Created
                            </TableHead>
                            <TableHead className="text-right text-gray-600">
                              {t("common.actions")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {listingsData.map((listing: any) => (
                            <TableRow key={listing.id} className="border-b">
                              <TableCell>{listing.id}</TableCell>
                              <TableCell className="font-medium">
                                {listing.title}
                              </TableCell>
                              <TableCell>
                                {getUserTypeDisplay(listing)}
                              </TableCell>
                              <TableCell>
                                {listing.currency || "QAR"} {listing.price}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={listing.status} />
                              </TableCell>
                              <TableCell>
                                {listing.is_featured ? (
                                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                ) : (
                                  <Star className="h-5 w-5 text-gray-300" />
                                )}
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(listing.created_at),
                                  "MMM dd, yyyy"
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(`/sell-car/${listing.id}`)
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setCurrentListing(listing);
                                        setIsFeatureDialogOpen(true);
                                      }}
                                    >
                                      <Star className="mr-2 h-4 w-4" />
                                      {listing.is_featured
                                        ? "Unfeature"
                                        : "Feature"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setCurrentListing(listing);
                                        setIsPromotionDialogOpen(true);
                                      }}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Promotion
                                    </DropdownMenuItem>
                                    {listing.status === "pending" && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleStatusChange(
                                              listing.id,
                                              "approve"
                                            )
                                          }
                                        >
                                          <Check className="mr-2 h-4 w-4" />
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleStatusChange(
                                              listing.id,
                                              "reject"
                                            )
                                          }
                                        >
                                          <X className="mr-2 h-4 w-4" />
                                          Reject
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {listing.status === "active" && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleStatusChange(listing.id, "sold")
                                        }
                                      >
                                        <Check className="mr-2 h-4 w-4" />
                                        Mark as Sold
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(listing)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No listings found matching your criteria
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this listing? This action cannot be
            undone.
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (currentListing) {
                  deleteMutation.mutate(currentListing.id);
                }
              }}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feature Dialog */}
      <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentListing?.is_featured
                ? "Unfeature Listing"
                : "Feature Listing"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {currentListing?.is_featured ? (
              <p>Are you sure you want to remove this listing from featured?</p>
            ) : (
              <p>Are you sure you want to feature this listing?</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFeatureDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (currentListing) {
                  handleFeatureToggle(
                    currentListing.id,
                    !currentListing.is_featured
                  );
                }
              }}
              disabled={featureMutation.isLoading}
            >
              {featureMutation.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promotion Package Dialog */}
      <Dialog
        open={isPromotionDialogOpen}
        onOpenChange={setIsPromotionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Promotion Package</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>Select Promotion Package</Label>
              <Select
                value={selectedPackage}
                onValueChange={setSelectedPackage}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {promotionPackages
                    .filter((pkg: any) => pkg.is_active)
                    .map((pkg: any) => (
                      <SelectItem key={pkg.id} value={pkg.id.toString()}>
                        {pkg.name} - {pkg.price} {pkg.currency} -{" "}
                        {pkg.duration_days} days
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPackage && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2">
                  {
                    promotionPackages.find(
                      (pkg: any) => pkg.id.toString() === selectedPackage
                    )?.name
                  }
                </h4>
                <p className="text-sm text-gray-600">
                  {
                    promotionPackages.find(
                      (pkg: any) => pkg.id.toString() === selectedPackage
                    )?.description
                  }
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Duration:</span>{" "}
                    {
                      promotionPackages.find(
                        (pkg: any) => pkg.id.toString() === selectedPackage
                      )?.duration_days
                    }{" "}
                    days
                  </div>
                  <div>
                    <span className="font-medium">Refreshes:</span>{" "}
                    {
                      promotionPackages.find(
                        (pkg: any) => pkg.id.toString() === selectedPackage
                      )?.no_of_refresh
                    }
                  </div>
                  <div>
                    <span className="font-medium">Featured:</span>{" "}
                    {promotionPackages.find(
                      (pkg: any) => pkg.id.toString() === selectedPackage
                    )?.is_featured
                      ? "Yes"
                      : "No"}
                  </div>
                  <div>
                    <span className="font-medium">Photo Limit:</span>{" "}
                    {
                      promotionPackages.find(
                        (pkg: any) => pkg.id.toString() === selectedPackage
                      )?.photo_limit
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPromotionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (currentListing && selectedPackage) {
                  handlePromotionApply(currentListing.id);
                }
              }}
              disabled={promotionMutation.isLoading || !selectedPackage}
            >
              {promotionMutation.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Apply Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Request Action Dialog */}
{currentListing && currentTab === "upgrade-requests" && (
  <Dialog
    open={!!currentListing}
    onOpenChange={(open) => !open && setCurrentListing(null)}
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {currentListing.type === "package"
            ? "Package Upgrade Request"
            : "Feature Upgrade Request"}
        </DialogTitle>
        <DialogDescription>
          Request ID: <span className="font-medium">{currentListing.id}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 space-y-6">
        {/* Listing Reference */}
        <div className="space-y-1">
          <Label>Listing Information</Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="link"
              className="p-0 h-auto text-primary"
              onClick={() =>
                navigate(`/sell-car/${currentListing?.listing_id}`)
              }
            >
              Listing #{currentListing.listing_id}
            </Button>
            <p><ListingTitle id={currentListing.listing_id} /></p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Request Details */}
        <div className="space-y-1">
          <Label>Request Details</Label>
          <div className="space-y-2 text-sm text-muted-foreground">
            {currentListing.type === "package" ? (
              <>
                <div>
                  <span className="font-medium text-foreground">Package:</span>{" "}
                  {promotionPackages.find(
                    (pkg) => pkg.id === currentListing.requested_package_id
                  )?.name || "Unknown"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Requested By:</span>{" "}
                  <UserDetails id={currentListing.requested_by} />
                </div>
                <div>
                  <span className="font-medium text-foreground">Date:</span>{" "}
                  {format(
                    new Date(currentListing.created_at),
                    "MMM dd, yyyy"
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="font-medium text-foreground">Days:</span>{" "}
                  {currentListing.requested_days}
                </div>
                {currentListing.price && (
                  <div>
                    <span className="font-medium text-foreground">Price:</span>{" "}
                    {currentListing.currency} {currentListing.price}
                  </div>
                )}
                <div>
                  <span className="font-medium text-foreground">Requested By:</span>{" "}
                  User #{currentListing.requested_by}
                </div>
                <div>
                  <span className="font-medium text-foreground">Date:</span>{" "}
                  {currentListing.created_at
                    ? format(
                        new Date(currentListing.created_at),
                        "MMM dd, yyyy"
                      )
                    : "N/A"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Remarks */}
        <div className="space-y-1">
          <Label htmlFor="remarks">Remarks (Optional)</Label>
          <Textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any remarks for this decision"
          />
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button
          variant="destructive"
          onClick={() =>
            handleUpgradeRequest(
              currentListing.id,
              currentListing.type,
              "rejected"
            )
          }
          disabled={upgradeRequestMutation.isLoading}
        >
          {upgradeRequestMutation.isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <X className="mr-2 h-4 w-4" />
          )}
          Reject
        </Button>
        <Button
          onClick={() =>
            handleUpgradeRequest(
              currentListing.id,
              currentListing.type,
              "approved"
            )
          }
          disabled={upgradeRequestMutation.isLoading}
        >
          {upgradeRequestMutation.isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Approve
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}

    </div>
  );
};

export default ManageListings;
