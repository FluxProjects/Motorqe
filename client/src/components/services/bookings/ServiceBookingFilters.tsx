import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminServiceBookingFilters } from "@shared/schema";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

type FilterRange = { from: Number | string; to: Number | string };

interface FiltersSectionProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    status?: string;
    dateRange?: FilterRange;
    dateRangePreset?: string;
    priceRange?: FilterRange;
    user_id?: number;
    customer_id?: number;
  };
  setFilters: (filters: any) => void;
  handleSearch: (e: React.FormEvent) => void;
  resetFilters: () => void;
  refetch: () => void;
  isLoading: boolean;
}

export const ServiceBookingFilters = ({
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
}: FiltersSectionProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const getDateRangeFromKeyword = (preset: string): { from: string; to: string } => {
    const today = new Date();
    const format = (d: Date) => d.toISOString().split("T")[0];
  
    switch (preset) {
      case "today":
        return { from: format(today), to: format(today) };
      case "week":
        const first = new Date(today);
        first.setDate(today.getDate() - today.getDay());
        const last = new Date(first);
        last.setDate(first.getDate() + 6);
        return { from: format(first), to: format(last) };
      case "month":
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { from: format(firstDay), to: format(lastDay) };
      default:
        return { from: "", to: "" };
    }
  };
  
  const handleValueChange = <K extends keyof AdminServiceBookingFilters>(
    key: K,
    value: AdminServiceBookingFilters[K]
  ) => {
    setFilters((prev: AdminServiceBookingFilters) => {
      const updatedFilters = { ...prev };
      updatedFilters.user_id = user?.id;
      
      if (key === "dateRangePreset" && typeof value === "string") {
        const range = getDateRangeFromKeyword(value);
        updatedFilters.dateRange = range;
        updatedFilters.dateRangePreset = value;
      } else {
        updatedFilters[key] = value;
      }
      
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
            {t("admin.allServices")}
          </TabsTrigger>
          <TabsTrigger
            value="draft"
            className="data-[state=active]:bg-blue-900 hover:bg-blue-600 hover:text-white data-[state=active]:text-white"
          >
            {t("admin.draft")}
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-blue-900 hover:bg-blue-600 hover:text-white data-[state=active]:text-white"
          >
            {t("admin.pending")}
          </TabsTrigger>
          <TabsTrigger
            value="confirmed"
            className="data-[state=active]:bg-blue-900 hover:bg-blue-600 hover:text-white data-[state=active]:text-white"
          >
            {t("admin.confirmed")}
          </TabsTrigger>
          <TabsTrigger
            value="complete"
            className="data-[state=active]:bg-blue-900 hover:bg-blue-600 hover:text-white data-[state=active]:text-white"
          >
            {t("admin.completed")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 bg-neutral-50 border-2 border-orange-500 border-solid rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
            <Input
              placeholder={t("admin.searchServices")}
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
                <SelectItem value="draft">
                  {t("admin.draft")}
                </SelectItem>
                <SelectItem value="pending">
                  {t("admin.pending")}
                </SelectItem>
                <SelectItem value="confirmed">
                  {t("admin.confirmed")}
                </SelectItem>
                <SelectItem value="complete">
                  {t("admin.completed")}
                </SelectItem>
                <SelectItem value="expired">
                  {t("admin.expired")}
                </SelectItem>
                <SelectItem value="rejected">
                  {t("admin.rejected")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>


          {/* Price Range Filter */}
          <div className="flex gap-2">
            <Select
              value={filters.priceRange?.from?.toString() || ""}
              onValueChange={(value) =>
              handleValueChange("priceRange", {
                  from: value === "all" ? "" : value,
                  to: filters.priceRange?.to ||"",
                })
              }

            >
              <SelectTrigger>
                <SelectValue placeholder={t("admin.minPrice")} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">{t("admin.any")}</SelectItem>
                <SelectItem value="0">0 QAR</SelectItem>
                <SelectItem value="100">100 QAR</SelectItem>
                <SelectItem value="500">500 QAR</SelectItem>
                <SelectItem value="1000">1,000 QAR</SelectItem>
                <SelectItem value="2000">2,000 QAR</SelectItem>
                <SelectItem value="5000">5,000 QAR</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priceRange?.to?.toString() || ""}
              onValueChange={(value) => 
                handleValueChange("priceRange", {
                  from: filters.priceRange?.from || "",
                  to: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("admin.maxPrice")} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">{t("admin.any")}</SelectItem>
                <SelectItem value="500">500 QAR</SelectItem>
                <SelectItem value="1000">1,000 QAR</SelectItem>
                <SelectItem value="2000">2,000 QAR</SelectItem>
                <SelectItem value="5000">5,000 QAR</SelectItem>
                <SelectItem value="10000">10,000 QAR</SelectItem>
                <SelectItem value="20000">20,000+ QAR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
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
  );
};