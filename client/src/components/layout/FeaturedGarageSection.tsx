// components/car/FeaturedServices Section.tsx

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Skeleton } from "../ui/skeleton";
import { GarageCard } from "../showroom/GarageCard";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

const FeaturedGaragesSection = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
    const [selectedMake, setSelectedMake] = useState("all");
    const [selectedTab, setSelectedTab] = useState("all");

  const { data: showrooms, isLoading } = useQuery({
      queryKey: ["/api/showrooms"],
      queryFn: () =>
        apiRequest("GET", "/api/showrooms").then((res) => res.json()),
    });
  
    const { data: makes } = useQuery({
      queryKey: ["/api/car-makes"],
      queryFn: () =>
        apiRequest("GET", "/api/car-makes").then((res) => res.json()),
    });
  
    const { data: showroomMakes } = useQuery({
      queryKey: ["/api/showrooms/service/makes"],
      queryFn: () =>
        apiRequest("GET", "/api/showrooms/service/makes").then((res) =>
          res.json()
        ),
    });
  
    const { data: services } = useQuery({
      queryKey: ["/api/services"],
      queryFn: () => apiRequest("GET", "/api/services").then((res) => res.json()),
    });
  
    // Fetch services for each showroom in parallel
    const { data: showroomsWithListings } = useQuery({
      queryKey: ["showrooms-with-services"],
      queryFn: async () => {
        if (!showrooms) return [];
  
        const showroomsData = await Promise.all(
          showrooms.map(async (showroom: any) => {
            try {
              const listingResponse = await apiRequest(
                "GET",
                `/api/showrooms/${showroom.id}/cars`
              ).then((res) => res.json());
  
              console.log("listingResponse", listingResponse);
              // Transform services to match expected structure
              const uniqueListings = Array.from(
                new Map(
                  listingResponse.map((item: any) => [
                    item.id,
                    {
                      id: item.id,
                      image: item.image,
                      name: item.name,
                      nameAr: item.name_ar,
                      price: item.price,
                    },
                  ])
                ).values()
              );
  
              return {
                ...showroom,
                listings: uniqueListings,
              };
            } catch (error) {
              console.error(
                `Failed to fetch listings for showroom ${showroom.id}`,
                error
              );
              return {
                ...showroom,
                listings: [],
              };
            }
          })
        );
  
        return showroomsData;
      },
      enabled: !!showrooms,
    });
  
    console.log("showroomsWithListings", showroomsWithListings);
    const filteredShowrooms = showroomsWithListings?.filter((showroom: any) => {
      const matchesSearch =
        showroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        showroom.nameAr?.toLowerCase().includes(searchTerm.toLowerCase());
  
      // Filter by make
      const matchesMake =
        selectedTab !== "makes" ||
        selectedMake === "all" ||
        (showroomMakes &&
          showroomMakes.some(
            (sm: any) =>
              sm.showroom_id === showroom.id &&
              sm.make_id.toString() === selectedMake
          ));
  
  
      return matchesSearch && matchesMake;
    });
  
    const renderShowrooms = () =>
      isLoading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full rounded-lg" />
        ))
      ) : filteredShowrooms && filteredShowrooms?.length > 0 ? (
        filteredShowrooms.map((showroom: any) => (
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
     find your favourite car Service Provider on our website that includes service, tires, Detailing, and many more services. 
  </p>
</div>


        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Left big card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {renderShowrooms()}
          </div>
      </div>

        {/* View More Button */}
        <div className="flex flex-col items-end mt-10">
          <Link href="/browse">
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
