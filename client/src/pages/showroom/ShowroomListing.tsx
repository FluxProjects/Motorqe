import { useQuery } from "@tanstack/react-query";
import CarStatistics from "@/components/car/CarStatistics";
import CarFilters from "@/components/car/CarFilters";
import CarGrid from "@/components/car/CarGrid";
import { useMemo, useState } from "react";
import type {
  AdminCarListing,
  AdminCarListingFilters,
  CarStatistic,
} from "@shared/schema";
import ShowroomNavigation from "@/components/showroom/ShowroomNavigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { roleMapping } from "@shared/permissions";
import { Link } from "wouter";

export default function ShowroomListings() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();

  // State management
  const [currentTab, setCurrentTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState<AdminCarListingFilters>({
    make: "all",
    model: "all",
    category: "all",
    location: [],
    year: [1900, new Date().getFullYear()],
    fuelType: [],
    transmission: [],
    isFeatured: "all",
    isImported: "all",
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
    packageType: "all",
    promotionStatus: "all",
  });

  const {
    data: cars = [],
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
        role: roleMapping[user?.roleId ?? 1] || "SELLER",
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
        searchParams.append(
          "updated_from",
          `${filters.dateRange.from}T00:00:00`
        );
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

      // Fetch all related data in parallel
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

        // Fetch makes
        Promise.all(
          uniqueMakeIds.map(async (id) => {
            console.log(`[DEBUG] Fetching makes `);
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

        // Fetch models by model ID (not by makeId!)
        Promise.all(
          uniqueModelIds.map(async (id) => {
            console.log(`[DEBUG] Fetching model ${id}`);
            try {
              const res = await fetch(`/api/car-model/${id}`);
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

        console.log(
          `[DEBUG] Listing ${listing.id} - Model ID: ${listing.model_id}, Model: ${model?.name}, Make: ${make?.name}`
        );

        const enriched = {
          ...listing,
          seller: userMap.get(listing.user_id) || null,
          make: make
            ? { id: make.id, name: make.name, name_ar: make.name_ar }
            : null,
          model: model
            ? { id: model.id, name: model.name, name_ar: model.name_ar }
            : null,
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

// Extract unique makes
const availableMakes = Array.from(
  new Map(
    cars
      .filter((car) => car.make?.id)
      .map((car) => [car.make.id, car.make])
  ).values()
);

// Extract unique models (optionally filter by selected make)
const availableModels = Array.from(
  new Map(
    cars
      .filter((car) => car.model?.id)
      .filter((car) => {
        if (!filters.make || filters.make === "all") return true;
        return car.make?.id === Number(filters.make);
      })
      .map((car) => [car.model.id, car.model])
  ).values()
);

const filteredCars = cars.filter((car) => {
  // Make filter
  if (filters.make && filters.make !== "all") {
    if (car.make?.id !== Number(filters.make)) return false;
  }

  // Model filter
  if (filters.model && filters.model !== "all") {
    if (car.model?.id !== Number(filters.model)) return false;
  }

  // Status filter
  if (filters.status && filters.status !== "all") {
    if (car.status !== filters.status) return false;
  }

  // Category filter
  if (filters.category && filters.category !== "all") {
    if (car.category_id !== filters.category) return false;
  }

  return true;
});


  const statistics: CarStatistic = {
    publishedCars: cars.filter((car) => car.status === "active").length,
    pendingListings: cars.filter(
      (car) => car.status === "pending" || car.status === "draft"
    ).length,
    featuredCars: cars.filter((car) => car.is_featured).length,
    expiredCarAds: cars.filter((car) => {
      if (!car.end_date) return false;
      return new Date(car.end_date) < new Date();
    }).length,
  };


  return (
    <div className="bg-gray-50 min-h-screen">
      <ShowroomNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <div className="flex items-center justify-end gap-3 mb-4">
            <Link
                to="/sell-car"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
                Add Car
            </Link>
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, listing: e.target.value }))
                }
              >
                <option>Filter by listing</option>
                <option>All Listings</option>
                <option>Active Listings</option>
                <option>Sold Listings</option>
              </select>
              <i className="fas fa-chevron-down absolute right-3 top-3 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
        </div>

        <CarStatistics statistics={statistics} isLoading={isLoading} />
        <CarFilters 
          filters={filters} 
          onFiltersChange={setFilters}
          availableMakes={availableMakes}
          availableModels={availableModels}
          />

        {/* Results Count */}
        <div className="text-sm text-gray-600 mb-6">
          1 - {cars.length} of {cars.length} cars
        </div>

        <CarGrid cars={cars} isLoading={isLoading} />
      </main>
    </div>
  );
}
