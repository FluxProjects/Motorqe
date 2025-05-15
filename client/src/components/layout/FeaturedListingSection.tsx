// components/car/FeaturedListingsSection.tsx

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeaturedCarCard from "@/components/car/FeaturedCarCard";
import { CarListing } from "@shared/schema";

const FeaturedListingsSection = () => {
  const { t } = useTranslation();

  const { data: featuredListings = [], isLoading: isLoadingFeatured } =
    useQuery<CarListing[]>({
      queryKey: ["/api/car-featured"],
    });

  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-8 text-center">
  <h2 className="text-3xl font-bold text-neutral-900 mb-2">
    {t("home.featuredListings")}
  </h2>
  <div className="w-40 h-1 bg-orange-500 mb-4 rounded-full" />
  <p className="text-lg text-neutral-600 mb-10 mt-10">
    {t("home.featuredListingsSubtitle")}
  </p>
</div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left big card */}
          <div className="lg:col-span-1">
            {featuredListings[0] && (
              <FeaturedCarCard
                car={featuredListings[0]}
                cardSize="large"
                className="h-full border-[3px] border-orange-500 rounded-2xl shadow-lg"
              />
            )}
          </div>

          {/* Right side cards (2x2 grid) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {featuredListings.slice(1, 5).map((listing: any) => (
              <FeaturedCarCard key={listing.id} car={listing} />
            ))}
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

export default FeaturedListingsSection;
