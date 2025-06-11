import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CarMake, CarCategory, PromotionPackage } from "@shared/schema";
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
        console.log("create listing clicked");
        setCurrentListing(null);
        setIsEditing(false);
        setFormDialogOpen(true);
         console.log("create listing clicked - after state updates", { 
        formDialogOpen, 
        isEditing 
    });
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
        isImported: false,
        status: "all",
        sort: "newest",
        page: 1, // Typically starts at page 1
        limit: 100, // Default limit
        dateRange: { from: "", to: "" },
        dateRangePreset: "all",
        yearRange: { from: "", to: "" },
        milesRange: { from: "", to: "" },
        user_id: user?.id,
        hasPromotion: false,
        packageType: 'all',
        promotionStatus: 'all',
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
        data: promotionPackages = [],
        isLoading: isLoadingPackages
    } = useQuery<PromotionPackage[]>({
        queryKey: ['promotion-packages'],
        queryFn: async () => {
            const res = await fetch('/api/promotion-packages');
            if (!res.ok) throw new Error('Failed to fetch packages');
            return res.json();
        }
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
                role: roleMapping[user?.roleId ?? 1] || "BUYER",
            });

            const statusParam = currentTab !== "all" ? currentTab : filters.status;
            const searchParams = new URLSearchParams();

            // Add role-based filtering
            const roleName = roleMapping[user?.roleId ?? 1];

            if (!roleName) {
                console.warn(`No role mapping found for role ID: ${user?.roleId}`);
                return false;
            }

            // For sellers and showrooms, only fetch their own listings
            if (roleName === "SELLER" || roleName === "DEALER") {
                console.log("User Id is this:", user?.id);
                searchParams.append("user_id", user?.id);
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
            if (filters.isImported === true) {
                searchParams.append("isImported", "true");
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

                // Fetch models by model ID (not by makeId!)
                Promise.all(
                    uniqueModelIds.map(async (id) => {
                        console.log(`[DEBUG] Fetching model ${id}`);
                        try {
                            const res = await fetch(`/api/car-model/${id}`);
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

            // Flatten makesData and modelsData
            const flatMakesData = makesData.filter(Boolean); // handles null
            const flatModelsData = modelsData.filter(Boolean); // handles null


            const modelMap = new Map();
            flatModelsData.forEach((model) => {
                if (model?.id != null) {
                    console.log(`[DEBUG] Mapping model ${model.id}`);
                    modelMap.set(model.id, model);
                }
            });

            const makeMap = new Map();
            flatMakesData.forEach((make) => {
                if (make?.id != null) {
                    console.log(`[DEBUG] Mapping make ${make.id} with name ${make.name}`);
                    makeMap.set(make.id, make);
                }
            });


            // Attach all related data to each listing
            const enrichedListings = listings.map((listing: any) => {
                const make = makeMap.get(listing.make_id);
                const model = modelMap.get(listing.model_id);

                console.log(`[DEBUG] Listing ${listing.id} - Model ID: ${listing.model_id}, Model: ${model?.name}, Make: ${make?.name}`);

                const enriched = {
                    ...listing,
                    seller: userMap.get(listing.user_id) || null,
                    make: make ? { id: make.id, name: make.name, name_ar: make.name_ar } : null,
                    model: model ? { id: model.id, name: model.name, name_ar: model.name_ar } : null,
                    package_id: listing.package_id,
                    package_name: listing.package_name,
                    package_price: listing.package_price,
                    package_description: listing.package_description,
                    start_date: listing.start_date,
                    end_date: listing.end_date,
                    is_active: listing.is_active,
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

            console.log("inside perform action");

            const roleName = roleMapping[user?.roleId];
            const isListingOwner = currentListing?.user_id === user?.id;

            console.log("Performing action:", { id, action });

            // Allow listing owner to publish if listing is in draft and user is not a buyer
            if (action === "publish" && currentListing?.status === "draft") {
                if (isListingOwner && roleName !== "BUYER") {
                    await apiRequest("PUT", `/api/car-listings/${id}/actions`, {
                        action: "pending",
                        reason,
                        featured,
                    });
                    return action;
                }
            }

            // Admin/mod roles can forcefully publish listing (set to active)
            if (action === "publish") {
                if (
                    roleName === "SUPER_ADMIN" ||
                    roleName === "ADMIN" ||
                    roleName === "MODERATOR" ||
                    roleName === "SENIOR_MODERATOR"
                ) {
                    await apiRequest("PUT", `/api/car-listings/${id}/actions`, {
                        action: "active",
                        reason,
                        featured,
                    });
                    return action;
                }
                throw new Error("Unauthorized to publish listing");
            }

            // Approve or reject
            if (action === "approve" || action === "reject") {
                if (
                    roleName === "SUPER_ADMIN" ||
                    roleName === "ADMIN" ||
                    roleName === "MODERATOR" ||
                    roleName === "SENIOR_MODERATOR"
                ) {
                    await apiRequest("PUT", `/api/car-listings/${id}/actions`, {
                        action,
                        reason,
                        featured,
                    });
                    return action;
                }
                throw new Error("Unauthorized to approve/reject listings");
            }

            // Feature
            if (action === "feature") {
                console.log("🔍 Feature action check");
                console.log("roleName:", roleName);
                console.log("roleName === 'SUPER_ADMIN':", roleName === "SUPER_ADMIN");
                console.log("roleName === 'ADMIN':", roleName === "ADMIN");
                if (
                    roleName === "SUPER_ADMIN" ||
                    roleName === "ADMIN"
                ) {
                    console.log("role is satisfied", roleName);
                    await apiRequest("PUT", `/api/car-listings/${id}/actions`, {
                        action,
                        reason,
                        featured,
                    });
                    return action;
                }
                throw new Error("Unauthorized to feature listings");
            }

            // Mark as sold
            if (action === "sold") {
                if (
                    roleName === "SUPER_ADMIN" ||
                    roleName === "ADMIN" ||
                    (roleName === "SELLER" && hasPermission(roleName, Permission.MANAGE_OWN_LISTINGS)) ||
                    (roleName.startsWith("DEALER") && hasPermission(roleName, Permission.MANAGE_SHOWROOM_LISTINGS))
                ) {
                    await apiRequest("PUT", `/api/car-listings/${id}/actions`, {
                        action,
                        reason,
                        featured,
                    });
                    return action;
                }
                throw new Error("Unauthorized to mark listing as sold");
            }

            // Delete
            if (action === "delete") {
                if (
                    roleName === "SUPER_ADMIN" ||
                    roleName === "ADMIN" ||
                    (roleName === "SELLER" && hasPermission(roleName, Permission.MANAGE_OWN_LISTINGS)) ||
                    (roleName.startsWith("DEALER") && hasPermission(roleName, Permission.MANAGE_SHOWROOM_LISTINGS))
                ) {
                    await apiRequest("DELETE", `/api/car-listings/${id}`, {});
                    return action;
                }
                throw new Error("Unauthorized to delete listing");
            }

            // If no condition matched
            throw new Error("Unsupported action or insufficient permissions");
        },

        onSuccess: (returnedAction) => {
            let message = "";

            switch (returnedAction) {
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
                case "sold":
                    message = t("admin.listingSold");
                    break;
                case "delete":
                    message = t("admin.listingDeleted");
                    break;
                default:
                    message = t("admin.actionSuccess");
            }

            toast({
                title: t("common.success"),
                description: message,
            });

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
            isImported: true,
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
            hasPromotion: false,
            packageType: 'all',
            promotionStatus: 'all',
        });
        refetch();
    };

    const handleViewListing = (listing: AdminCarListing) => {
        setCurrentListing(listing);
        setViewDialogOpen(true);
    };

    const handleAction = (listing: AdminCarListing, action: AdminCarListingAction) => {
        console.log("Action triggered:", action, "for listing:", listing.id);
        setActionDialogOpen(true);
        setCurrentListing(listing);
        setActionType(action);

    };

    const confirmAction = () => {
        if (!currentListing) return;

        console.log("ABOUT TO MUTATE", { id: currentListing.id, action: actionType, reason: actionReason });

        switch (actionType) {
            case "publish":
                performAction.mutate({
                    id: currentListing.id,
                    action: "publish", // Correct action type for publish
                    reason: actionReason,
                });
                break;
            case "approve":
                performAction.mutate({
                    id: currentListing.id,
                    action: "approve", // Correct action type for approve
                    reason: actionReason,
                });
                break;
            case "reject":
                performAction.mutate({
                    id: currentListing.id,
                    action: "reject",
                    reason: actionReason,
                });
                break;
            case "sold":
                performAction.mutate({
                    id: currentListing.id,
                    action: "sold",
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
                performAction.mutate({
                    id: currentListing.id,
                    action: "delete",
                });
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
        promotionPackages,
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