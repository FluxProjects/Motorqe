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
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">
          {t("common.browseServices")}
        </h1>

        <div className="md:flex md:gap-6">

          {/* Services tabs */}
          <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
  {/* Tabs - full width on mobile, auto width on desktop */}
  <div className="w-full md:w-auto">
    <TabsList className="grid w-full grid-cols-3 md:w-auto">
      <TabsTrigger value="all">
        {t("services.allServices")}
      </TabsTrigger>
      <TabsTrigger value="byMake">{t("services.byMake")}</TabsTrigger>
      <TabsTrigger value="featured">
        <Star className="w-4 h-4 mr-1" />
        {t("services.featured")}
      </TabsTrigger>
    </TabsList>
  </div>

  {/* Search and filter - stacks on mobile, inline on desktop */}
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
