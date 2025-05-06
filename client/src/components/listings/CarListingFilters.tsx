import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CarMake, CarCategory, AdminCarListingFilters } from "@shared/schema";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

type DateRange = { from: Number | string; to: Number | string };

interface FiltersSectionProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    status: string;
    category: string;
    make: string;
    isFeatured: boolean;
    dateRange?: DateRange;
    dateRangePreset?: string;
    yearRange?: DateRange;
    milesRange?: DateRange;
    user_id?: number;
  };
  setFilters: (filters: any) => void;
  handleSearch: (e: React.FormEvent) => void;
  resetFilters: () => void;
  refetch: () => void;
  isLoading: boolean;
  categories: CarCategory[];
  makes: CarMake[];
}

export const CarListingFilters = ({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  handleSearch,
  resetFilters,
  refetch,
  isLoading,
  categories,
  makes,
}: FiltersSectionProps) => {
  const { t } = useTranslation();

 

  const getDateRangeFromKeyword = (preset: string): { from: string; to: string } => {
    const today = new Date();
    const format = (d: Date) => d.toISOString().split("T")[0];
  
    switch (preset) {
      case "today":
        return { from: format(today), to: format(today) };
      case "week":  // Changed from "thisWeek" to match the value in Select
        const first = new Date(today);
        first.setDate(today.getDate() - today.getDay()); // Sunday
        const last = new Date(first);
        last.setDate(first.getDate() + 6); // Saturday
        return { from: format(first), to: format(last) };
      case "month":  // Changed from "thisMonth" to match the value in Select
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { from: format(firstDay), to: format(lastDay) };
      default:
        return { from: "", to: "" };
    }
  };
  
  const handleValueChange = <K extends keyof AdminCarListingFilters>(
    key: K,
    value: AdminCarListingFilters[K]
  ) => {
    setFilters((prev: AdminCarListingFilters) => {
      const { user } = useAuth();
      const updatedFilters = { ...prev };
      updatedFilters.user_id = user?.id;
      if (key === "dateRangePreset" && typeof value === "string") {
        const range = getDateRangeFromKeyword(value);
        updatedFilters.dateRange = range;
        updatedFilters.dateRangePreset = value;
        // Don't update yearRange and milesRange with date values
      } else {
        updatedFilters[key] = value;
      }
      
      console.log("Updated Filters:");
      Object.entries(updatedFilters).forEach(([k, v]) => {
        console.log(`${k}:`, v);
      });
  
      return updatedFilters;
    });
  
    if (key === "dateRangePreset") {
      refetch();
    }
  };

  return (
    <div className="mb-6">
      <Tabs
        defaultValue="all"
        value={currentTab}
        onValueChange={setCurrentTab}
      >
        <TabsList className="bg-neutral-50">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-blue-900 hover:bg-blue-600 hover:text-white data-[state=active]:text-white"
          >
            {t("admin.allListings")}
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-blue-900 hover:bg-blue-600 hover:text-white data-[state=active]:text-white"
          >
            {t("admin.pendingListings")}
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-blue-900 hover:bg-blue-600 hover:text-white data-[state=active]:text-white"
          >
            {t("admin.activeListings")}
          </TabsTrigger>
          <TabsTrigger
            value="reject"
            className="data-[state=active]:bg-blue-900 hover:bg-blue-600 hover:text-white data-[state=active]:text-white"
          >
            {t("admin.rejectedListings")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 bg-neutral-50 border-2 border-orange-500 border-solid rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
            <Input
              placeholder={t("admin.searchListings")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 placeholder:text-slate-400"
            />
          </div>
          <Button
            type="submit"
            variant="default"
            className="bg-blue-500 hover:bg-blue-900 text-white"
          >
            {t("common.search")}
          </Button>
          <Button
            type="button"
            variant="default"
            className="bg-blue-900 text-white hover:bg-blue-500"
            onClick={resetFilters}
          >
            {t("common.reset")}
          </Button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Status Filter */}
          <div>
            <Select
              value={filters.status || undefined}
              onValueChange={(value) => handleValueChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("admin.filterByStatus")} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">
                  {t("admin.allStatuses")}
                </SelectItem>
                <SelectItem value="pending">
                  {t("admin.pending")}
                </SelectItem>
                <SelectItem value="active">
                  {t("admin.active")}
                </SelectItem>
                <SelectItem value="reject">
                  {t("admin.rejected")}
                </SelectItem>
                <SelectItem value="sold">
                  {t("admin.sold")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <Select
              value={filters.category || undefined}
              onValueChange={(value) => handleValueChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("admin.filterByCategory")} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">
                  {t("admin.allCategories")}
                </SelectItem>
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

          {/* Make Filter */}
          <div>
            <Select
              value={filters.make || undefined}
              onValueChange={(value) => handleValueChange("make", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("admin.filterByMake")} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">
                  {t("admin.allMakes")}
                </SelectItem>
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

            {/* Is Featured Filter */}
            <div>
            <Select
              value={filters.isFeatured !== undefined ? String(filters.isFeatured) : ""}
              onValueChange={(value) => handleValueChange("isFeatured", value === "true")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Featured?" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="true">{t("admin.featuredOnly")}</SelectItem>
                <SelectItem value="false">{t("admin.nonFeatured")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Year Range Dropdown - Fixed */}
          <div>
            <select
              value={(filters.yearRange?.from)?.toString() ?? 1900}
              onChange={(e) =>
                handleValueChange("yearRange", {
                  from: e.target.value,
                  to: filters.yearRange?.to.toString() ?? new Date().getFullYear().toString(),
                })
              }
            >
              <option value="">Select Year From</option>
              <option value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>

            <select
              value={(filters.yearRange?.to)?.toString() ?? Number(new Date().getFullYear())}
              onChange={(e) =>
                handleValueChange("yearRange", {
                  from: filters.yearRange?.from.toString() ?? "1900",
                  to: e.target.value,
                })
              }
            >
              <option value="">Select Year To</option>
              <option value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {/* Miles Range Dropdown - Fixed */}
          <div>
            <select
              value={(filters.milesRange?.from)?.toString() ?? "0"}
              onChange={(e) =>
                handleValueChange("milesRange", {
                  from: e.target.value,
                  to: filters.milesRange?.to.toString() ?? "",
                })
              }
            >
              <option value="">Select Min Miles</option>
              <option value="0">0</option>
              <option value="1000">1,000</option>
              <option value="5000">5,000</option>
              <option value="10000">10,000</option>
              <option value="20000">20,000</option>
              <option value="50000">50,000</option>
              <option value="100000">100,000</option>
            </select>

            <select
              value={(filters.milesRange?.to)?.toString() ?? ""}
              onChange={(e) =>
                handleValueChange("milesRange", {
                  from: filters.milesRange?.from.toString() ?? "",
                  to: e.target.value,
                })
              }
            >
              <option value="">Select Max Miles</option>
              <option value="1000">1,000</option>
              <option value="5000">5,000</option>
              <option value="10000">10,000</option>
              <option value="20000">20,000</option>
              <option value="50000">50,000</option>
              <option value="100000">100,000</option>
              <option value="200000">200,000+</option>
            </select>
          </div>

          {/* Date Range Filter - Fixed */}
          <div>
            <Select
              value={filters.dateRangePreset || "all"}
              onValueChange={(value) => handleValueChange("dateRangePreset", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("admin.filterByDate")} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">
                  {t("admin.allDates")}
                </SelectItem>
                <SelectItem value="today">
                  {t("admin.today")}
                </SelectItem>
                <SelectItem value="week">  {/* Changed from "thisWeek" */}
                  {t("admin.thisWeek")}
                </SelectItem>
                <SelectItem value="month">  {/* Changed from "thisMonth" */}
                  {t("admin.thisMonth")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>
    </div>
  );
};