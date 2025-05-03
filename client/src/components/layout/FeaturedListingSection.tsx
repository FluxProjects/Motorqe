// components/car/FeaturedListingsSection.tsx

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CarCard from "@/components/car/CarCard";
import { CarListing } from "@shared/schema";

const FeaturedListingsSection = () => {
  const { t } = useTranslation();

  const { data: featuredListings = [], isLoading: isLoadingFeatured } = useQuery<CarListing[]>({
    queryKey: ['/api/car-featured'],
  });

  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900">{t('home.featuredListings')}</h2>
            <p className="mt-2 text-lg text-neutral-600">{t('home.featuredListingsSubtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {isLoadingFeatured ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="aspect-[16/9] bg-neutral-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/4 mb-4 animate-pulse"></div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-5 h-5 bg-neutral-200 rounded-full mb-1 animate-pulse"></div>
                        <div className="h-3 bg-neutral-200 rounded w-10 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-neutral-200 rounded-full mr-2 animate-pulse"></div>
                      <div className="h-4 bg-neutral-200 rounded w-20 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-neutral-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            featuredListings?.slice(0, 4).map((listing: any) => (
              <CarCard key={listing.id} car={listing} />
            ))
          )}
        </div>

        <div className="text-center mt-10">
          <Link href="/browse">
            <Button variant="outline" className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-500/50 hover:text-white transition-colors font-medium">
              {t('common.viewAll')} <ArrowRight className="ml-2" size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListingsSection;
