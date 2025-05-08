import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CarMake, CarCategory } from "@shared/schema";
import { AdminCarListing, AdminCarListingAction, AdminCarListingFilters } from "@shared/schema";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasPermission, Permission, roleMapping } from "@shared/permissions";
import { useAuth } from "@/contexts/AuthContext";

export const useCarListingManage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { toast } = useToast();

    // State management
    const [currentTab, setCurrentTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleEditListing = (listing: AdminCarListing) => {
        setCurrentListing(listing);
        setIsEditing(true);
        setFormDialogOpen(true);
    };

    const handleCreateListing = () => {
        setCurrentListing(null);
        setIsEditing(false);
        setFormDialogOpen(true);
    };

    const [filters, setFilters] = useState<AdminCarListingFilters>({
        make: "all",
        model: "all",
        category: "all",
        location: [],
        year: [1900, new Date().getFullYear()],
        fuel_type: [],
        transmission: [],
        isFeatured: false,
        status: "all",
        sort: "newest",
        page: 1, // Typically starts at page 1
        limit: 10, // Default limit
        dateRange: { from: "", to: "" },
        dateRangePreset: "all",
        yearRange: { from: "", to: "" },
        milesRange: { from: "", to: "" },
        user_id: user?.id,
    });
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [currentListing, setCurrentListing] = useState<AdminCarListing | null>(null);
    const [actionType, setActionType] = useState<AdminCarListingAction>("approve");
    const [actionReason, setActionReason] = useState("");
    const [actionInProgress, setActionInProgress] = useState(false);

    // Data fetching
    const { data: categories = [] } = useQuery<CarCategory[]>({
        queryKey: ["/api/car-categories"],
    });

    const { data: makes = [] } = useQuery<CarMake[]>({
        queryKey: ["/api/car-makes"],
    });


    const {
        data: listings = [],
        isLoading,
        refetch,
    } = useQuery<AdminCarListing[]>({
        queryKey: ["/api/car-listings", currentTab, searchQuery, filters, user?.id],
        queryFn: async () => {
            console.log("[DEBUG] Starting listings fetch with params:", {
                currentTab,
                searchQuery,
                filters,
                user_id: user?.id,
                role: user?.role,
            });

            const statusParam = currentTab !== "all" ? currentTab : filters.status;
            const searchParams = new URLSearchParams();

            // Add role-based filtering
            const roleName = roleMapping[user?.roleId];

            if (!roleName) {
                console.warn(`No role mapping found for role ID: ${user.roleId}`);
                return false;
            }

            // For sellers and showrooms, only fetch their own listings
            if (roleName === "SELLER" || roleName === "SHOWROOM_BASIC" || roleName === "SHOWROOM_PREMIUM") {
                console.log("User Id is this:", user.id);
                searchParams.append("user_id", user.id);
            }

            // For buyers, only fetch approved listings
            if (roleName === "BUYER") {
                searchParams.append("status", "active");
            }

            if (searchQuery) searchParams.append("search", searchQuery); // already handled correctly
            if (statusParam && statusParam !== "all") {
                searchParams.append("status", statusParam);
            }
            if (filters.category && filters.category !== "all") {
                searchParams.append("category", filters.category);
            }
            if (filters.make && filters.make !== "all") {
                searchParams.append("make", filters.make);
            }
            if (filters.isFeatured === true) {
                searchParams.append("isFeatured", "true");
            }

            // ✅ Date range
            if (filters.dateRange?.from) {
                searchParams.append("updated_from", `${filters.dateRange.from}T00:00:00`);
            }
            if (filters.dateRange?.to) {
                searchParams.append("updated_to", `${filters.dateRange.to}T23:59:59`);
            }

            // ✅ Year range
            if (filters.yearRange?.from) {
                searchParams.append("year_from", filters.yearRange.from);
            }
            if (filters.yearRange?.to) {
                searchParams.append("year_to", filters.yearRange.to);
            }

            // ✅ Mileage range
            if (filters.milesRange?.from) {
                searchParams.append("miles_from", filters.milesRange.from);
            }
            if (filters.milesRange?.to) {
                searchParams.append("miles_to", filters.milesRange.to);
            }

             // ✅ Price range
             if (filters.priceRange?.from) {
                searchParams.append("price_from", filters.priceRange.from);
            }
            if (filters.priceRange?.to) {
                searchParams.append("price_to", filters.priceRange.to);
            }

            const finalUrl = `/api/car-listings?${searchParams.toString()}`;
            console.log("[DEBUG] Final API URL:", finalUrl);

            // Fetch all listings
            const res = await fetch(finalUrl);

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

            // Get unique IDs needed for relationships
            const uniqueUserIds = [...new Set(listings.map((listing: any) => listing.user_id))];
            const uniqueMakeIds = [...new Set(listings.map((listing: any) => listing.make_id))];
            const uniqueModelIds = [...new Set(listings.map((listing: any) => listing.model_id))];

            console.log("[DEBUG] Unique IDs to fetch:", {
                uniqueUserIds,
                uniqueMakeIds,
                uniqueModelIds,
            });

            // Fetch all related data in parallel
            const [sellerData, makesData, modelsData] = await Promise.all([
                // Fetch sellers
                Promise.all(
                    uniqueUserIds.map(async (id) => {
                        console.log(`[DEBUG] Fetching user ${id}`);
                        try {
                            const res = await fetch(`/api/users/${id}`);
                            if (!res.ok) {
                                console.error(`[ERROR] Failed to fetch user ${id}. Status:`, res.status);
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
                        console.log(`[DEBUG] Fetching models`);
                        try {
                            const res = await fetch(`/api/car-models/${id}`);
                            if (!res.ok) {
                                console.error(`[ERROR] Failed to fetch model ${id}. Status:`, res.status);
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
                        console.log(`[DEBUG] Fetching makes `);
                        try {
                            const res = await fetch(`/api/car-makes/${id}`);
                            if (!res.ok) {
                                console.error(`[ERROR] Failed to fetch make ${id}. Status:`, res.status);
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

            // Create mapping objects
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

            // Attach all related data to each listing
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

            // Check permissions before performing actions
            const roleName = roleMapping[user?.role || 0];
            const isListingOwner = currentListing?.user_id === user?.id;

            if (action === "publish" && currentListing?.status === "draft") {
                if(
                    isListingOwner &&
                    roleName !== "BUYER"
                ){
                    await apiRequest("PUT", `/api/car-listings/${id}`, {
                        action,
                        reason,
                    });
                    return;
                }
                   
                
                
            }

            if (action === "publish") {
                if ( 
                    roleName === "SUPER_ADMIN" ||
                    roleName === "ADMIN" ||
                    roleName === "MODERATOR" ||
                    roleName === "SENIOR_MODERATOR") {
                    await apiRequest("PUT", `/api/car-listings/${id}`, {
                        action: "active",
                    });
                    return;
                }
                throw new Error("Unauthorized to activate listings");
            }

            if (action === "approve" || action === "reject") {
                if (
                    roleName === "SUPER_ADMIN" ||
                    roleName === "ADMIN" ||
                    roleName === "MODERATOR" ||
                    roleName === "SENIOR_MODERATOR"
                ) {
                    await apiRequest("PUT", `/api/car-listings/${id}`, {
                        action,
                        reason,
                        featured,
                    });
                    return;
                }
                throw new Error("Unauthorized to approve/reject listings");
            }

            if (action === "feature") {
                if (
                    roleName === "SUPER_ADMIN" ||
                    roleName === "ADMIN"
                ) {
                    await apiRequest("PUT", `/api/car-listings/${id}`, {
                        action,
                        reason,
                        featured,
                    });
                    return;
                }
                throw new Error("Unauthorized to feature listings");
            }

            if (action === "sold") {
                if (
                    roleName === "SUPER_ADMIN" ||
                    roleName === "ADMIN" ||
                    (roleName === "SELLER" && hasPermission(roleName, Permission.MANAGE_OWN_LISTINGS)) ||
                    (roleName.startsWith("SHOWROOM") && hasPermission(roleName, Permission.MANAGE_SHOWROOM_LISTINGS))
                ) {
                    await apiRequest("PUT", `/api/car-listings/${id}`, {
                        action,
                        reason,
                        featured,
                    });
                    return;
                }
                throw new Error("Unauthorized to feature listings");
            }

            if (action === "delete") {
                if (
                    roleName === "SUPER_ADMIN" ||
                    roleName === "ADMIN" ||
                    (roleName === "SELLER" && hasPermission(roleName, Permission.MANAGE_OWN_LISTINGS)) ||
                    (roleName.startsWith("SHOWROOM") && hasPermission(roleName, Permission.MANAGE_SHOWROOM_LISTINGS))
                ) {
                    await apiRequest("DELETE", `/api/car-listings/${id}`, {});
                    return;
                }
                throw new Error("Unauthorized to delete listings");
            }

        },
        onSuccess: () => {
            let message = "";

            switch (actionType) {
                case "publish":
                    message = t("admin.listingPublished");
                    break;
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
                description: error instanceof Error ? error.message : t("admin.actionFailed"),
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
            make: "all",
            model: "all",
            category: "all",
            location: [],
            year: [1990, new Date().getFullYear()],
            fuel_type: [],
            transmission: [],
            isFeatured: false,
            status: "all",
            sort: "newest",
            page: 1, // Typically starts at page 1
            limit: 10, // Default limit
            dateRange: { from: "", to: "" },
            dateRangePreset: "all",
            yearRange: { from: "", to: "" },
            milesRange: { from: "", to: "" },
            priceRange: { from: "", to: "" },
            user_id: user?.id,
        });
        refetch();
    };

    const handleViewListing = (listing: AdminCarListing) => {
        setCurrentListing(listing);
        setViewDialogOpen(true);
    };

    const handleAction = (listing: AdminCarListing, action: AdminCarListingAction) => {
        setCurrentListing(listing);
        setActionType(action);
        setActionDialogOpen(true);
    };

    const confirmAction = () => {
        if (!currentListing) return;

        switch (actionType) {
            case "publish":
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

    const getStatusBadge = StatusBadge;

    return {
        // State
        currentTab,
        setCurrentTab,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        viewDialogOpen,
        setViewDialogOpen,
        actionDialogOpen,
        setActionDialogOpen,
        currentListing,
        setCurrentListing,
        actionType,
        setActionType,
        actionReason,
        setActionReason,
        actionInProgress,
        setFormDialogOpen,
        formDialogOpen,

        // Data
        categories,
        makes,
        listings,
        isLoading,
        isEditing,

        // Functions
        handleSearch,
        resetFilters,
        handleViewListing,
        handleEditListing,
        handleCreateListing,
        handleAction,
        confirmAction,
        getStatusBadge,
        refetch,
    };
};