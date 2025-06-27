import { FileText, Clock, Zap, History } from "lucide-react";
import type { CarStatistic } from "@shared/schema";

interface CarStatisticsProps {
  statistics?: CarStatistic;
  isLoading: boolean;
}

export default function CarStatistics({ statistics, isLoading }: CarStatisticsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-blue-600 rounded-lg p-6 text-white animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-12 h-10 bg-blue-400 rounded mb-2"></div>
                <div className="w-20 h-4 bg-blue-300 rounded"></div>
              </div>
              <div className="w-8 h-8 bg-blue-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      value: statistics?.publishedCars || 0,
      label: "Published Cars",
      icon: FileText,
    },
    {
      value: statistics?.pendingListings || 0,
      label: "Pending Listings",
      icon: Clock,
    },
    {
      value: statistics?.featuredCars || 0,
      label: "Featured Cars",
      icon: Zap,
    },
    {
      value: statistics?.expiredCarAds || 0,
      label: "Expired Car Ads",
      icon: History,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-blue-100 text-sm font-medium">{stat.label}</div>
            </div>
            <stat.icon className="h-8 w-8 text-blue-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
