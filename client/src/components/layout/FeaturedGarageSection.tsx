// components/car/FeaturedServicesSection.tsx
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Skeleton } from "../ui/skeleton";
import { GarageCard } from "../showroom/GarageCard";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Star } from "lucide-react";

const FeaturedGaragesSection = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMake, setSelectedMake] = useState("all");
  const [activeTab, setActiveTab] = useState("featured");

  const { data: garages, isLoading } = useQuery({
    queryKey: ["/api/garages"],
    queryFn: () =>
      apiRequest("GET", "/api/garages").then((res) => res.json()),
  });

  console.log("garages", garages);
  
  const filteredShowrooms = garages?.filter((showroom: any) => {
    const matchesSearch =
      showroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      showroom.nameAr?.toLowerCase().includes(searchTerm.toLowerCase());


    return matchesSearch;
  });

  // Sort showrooms by creation date for recently added
  const recentlyAddedShowrooms = [...(filteredShowrooms || [])]
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  .slice(0, 6); // <-- limit to 6


  // Filter featured showrooms (assuming there's a 'is_featured' property)
  const featuredShowrooms = filteredShowrooms?.filter((showroom: any) => showroom.is_featured);

  const renderShowrooms = (showroomsToRender: any[]) =>
    isLoading ? (
      Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-80 w-full rounded-lg" />
      ))
    ) : showroomsToRender && showroomsToRender.length > 0 ? (
      showroomsToRender.map((showroom: any) => (
        <GarageCard key={showroom.id} garage={showroom} />
      ))
    ) : (
      <div className="col-span-full text-center py-12">
        <p className="text-slate-500">{t("showroom.noShowroomsFound")}</p>
      </div>
    );

  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Featured Service Providers in Qatar
          </h2>
          <div className="w-40 h-1 bg-orange-500 mb-4 rounded-full" />
          <p className="text-lg text-neutral-600 mb-10 mt-10">
            Find your favourite car Service Provider on our website that includes service, tires, Detailing, and many more services.
          </p>
        </div>

        {/* Tabs */}
        <div className="w-full flex justify-center mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap justify-center gap-3 bg-transparent p-0">
              <TabsTrigger 
                value="featured"
                className="px-5 py-2 text-blue-900 text-sm border-2 border-orange-500 font-medium transition-all data-[state=active]:text-white data-[state=active]:bg-blue-900 hover:bg-blue-900 hover:text-white data-[state=active]:hover:text-white"
              >
                <Star className="w-4 h-4 mr-1" />
                Featured Providers
              </TabsTrigger>
              <TabsTrigger 
                value="recent"
                className="px-5 py-2 text-blue-900 text-sm border-2 border-orange-500 font-medium transition-all data-[state=active]:text-white data-[state=active]:bg-blue-900 hover:bg-blue-900 hover:text-white data-[state=active]:hover:text-white"
              >
                Recently Added Service Providers
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Showrooms grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {activeTab === "featured" 
              ? renderShowrooms(featuredShowrooms || []) 
              : renderShowrooms(recentlyAddedShowrooms || [])
            }
          </div>
        </div>

        {/* View More Button */}
        <div className="flex flex-col items-end mt-10">
          <Link href="/browse-garages">
            <a className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full transition">
              View More
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGaragesSection;