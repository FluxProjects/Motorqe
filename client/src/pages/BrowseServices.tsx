import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import AllServicesSection from "@/components/services/AllServicesSection";
import ServicesByMake from "@/components/services/ServicesByMakeSection";
import FeaturedServicesSection from "@/components/services/FeaturedServicesSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const BrowseServices = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMake, setSelectedMake] = useState<number | null>(null);

  return (
  <div className="bg-white min-h-screen py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Updated header with orange underline */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {t("common.browseServices")}
        </h1>
        <div className="w-40 h-1 bg-orange-500 mx-auto rounded-full" />
      </div>

      <div className="md:flex md:gap-6">
        <Tabs defaultValue="all" className="w-full">
          {/* Updated tabs container with new styling */}
          <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
            {/* Tabs with new styling */}
            <div className="w-full flex justify-left">
              <TabsList className="flex flex-wrap justify-center gap-3 bg-transparent p-0">
                <TabsTrigger 
                  value="all"
                  className="px-5 py-2 text-sm font-medium transition-all data-[state=active]:text-orange-500 data-[state=active]:border-b-4 data-[state=active]:border-b-orange-500 data-[state=active]:hover:font-bold text-blue-900"
                >
                  {t("services.allServices")}
                </TabsTrigger>
                <TabsTrigger 
                  value="byMake"
                  className="px-5 py-2 text-sm font-medium transition-all data-[state=active]:text-orange-500 data-[state=active]:border-b-4 data-[state=active]:border-b-orange-500 data-[state=active]:hover:font-bold text-blue-900"
                >
                  {t("services.byMake")}
                </TabsTrigger>
                <TabsTrigger 
                  value="featured"
                  className="px-5 py-2 text-sm font-medium transition-all data-[state=active]:text-orange-500 data-[state=active]:border-b-4 data-[state=active]:border-b-orange-500 data-[state=active]:hover:font-bold text-blue-900"
                >
                  <Star className="w-4 h-4 mr-1" />
                  {t("services.featured")}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Search and filter - unchanged */}
            <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:items-center">
              <div className="relative flex-1 md:w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder={t("services.searchPlaceholder")}
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select
                onValueChange={(value) =>
                  setSelectedMake(value === "all" ? null : parseInt(value))
                }
                value={selectedMake ? selectedMake.toString() : "all"}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={t("services.filterByMake")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("services.allMakes")}</SelectItem>
                  {/* Makes will be loaded in ByMakeTab */}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs content remains unchanged */}
          <TabsContent value="all" className="mt-6">
            <AllServicesSection searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="byMake" className="mt-6">
            <ServicesByMake
              searchQuery={searchQuery}
              selectedMake={selectedMake}
              onSelectMake={setSelectedMake}
            />
          </TabsContent>

          <TabsContent value="featured" className="mt-6">
            <FeaturedServicesSection searchQuery={searchQuery} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
);
};

export default BrowseServices;
