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
            <div className="w-full flex justify-center">
              <TabsList className="flex flex-wrap justify-center gap-3 bg-transparent p-0">
                <TabsTrigger 
                  value="all"
                  className="px-5 py-2 text-blue-900 text-sm border-2 border-orange-500 font-medium transition-all data-[state=active]:text-white data-[state=active]:bg-blue-900 hover:bg-blue-900 hover:text-white data-[state=active]:hover:text-white"
                >
                  {t("services.carServices")}
                </TabsTrigger>
                <TabsTrigger 
                  value="byMake"
                  className="px-5 py-2 text-blue-900 text-sm border-2 border-orange-500 font-medium transition-all data-[state=active]:text-white data-[state=active]:bg-blue-900 hover:bg-blue-900 hover:text-white data-[state=active]:hover:text-white"
                >
                  {t("services.brands")}
                </TabsTrigger>
                <TabsTrigger 
                  value="featured"
                  className="px-5 py-2 text-blue-900 text-sm border-2 border-orange-500 font-medium transition-all data-[state=active]:text-white data-[state=active]:bg-blue-900 hover:bg-blue-900 hover:text-white data-[state=active]:hover:text-white"
                >
                  <Star className="w-4 h-4 mr-1" />
                  {t("services.promotions")}
                </TabsTrigger>
              </TabsList>
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
