import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Car, Phone, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ShowroomCardProps {
  showroom: {
    id: number;
    name: string;
    nameAr?: string;
    address: string;
    addressAr?: string;
    location: string;
    phone: string;
    image?: string;
    isMainBranch: boolean;
    services: {
      id: number;
      image: string;
      name: string;
      price: number;
    }[];
    makes: {
      id: number;
      name: string;
    }[];
    rating?: number;
  };
}

export function ShowroomCard({ showroom }: ShowroomCardProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const name =
    language === "ar" && showroom.nameAr ? showroom.nameAr : showroom.name;
  const address =
    language === "ar" && showroom.addressAr
      ? showroom.addressAr
      : showroom.address;

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 border-solid rounded-2xl ${
        showroom.isMainBranch ? "border-orange-500" : "border-gray-200"
      }`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Left Column - Name + Image */}
        <div className="w-full md:w-2/4 p-4 flex flex-col">
          {/* Showroom Name */}
          <Link href={`/showrooms/${showroom.id}`}>
            <h3 className="text-lg font-bold mb-3 hover:text-blue-600 transition-colors">
              {name}
            </h3>
          </Link>

          {/* Image */}
          <div className="relative flex-1 mb-3">
            <Link href={`/showrooms/${showroom.id}`}>
              <div className="h-full w-full overflow-hidden rounded-lg group cursor-pointer min-h-[100px]">
                {showroom.image ? (
                  <img
                    src={showroom.image}
                    alt={name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 min-h-[100px]"
                  />
                ) : (
                  <div className="h-full w-full bg-slate-200 flex items-center justify-center rounded-lg min-h-[100px]">
                    <Car size={40} className="text-slate-400" />
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Orange View Details Button */}
          <Link href={`/showrooms/${showroom.id}`} className="w-full">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              {t("common.viewDetails")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Right Column - Details */}
        <div className="w-full md:w-2/4 p-4 border-t md:border-t-0 md:border-l border-gray-200">
          {/* Featured Badge - With consistent spacing */}
          <div className="mb-3 min-h-[24px]">
            {showroom.is_featured ? (
              <Badge className="bg-red-600 hover:bg-red-700 text-white">
                FEATURED
              </Badge>
            ) : (
              <div className="invisible h-[24px]">Placeholder</div>
            )}
          </div>

          {/* Address */}
          <div className="text-sm text-gray-600 mb-3 space-y-1">
            <div className="flex items-start">
              <MapPin size={16} className="mr-1 mt-0.5 flex-shrink-0" />
              <div>
                {address.split(",").map((line, index) => (
                  <p key={index}>{line.trim()}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Distance */}
          <div className="text-sm text-gray-600 mb-4">{showroom.phone}</div>

          {/* Rating */}
          <div className="flex items-center">
            <div className="flex items-center bg-amber-100 px-2 py-1 rounded">
              {/* 5-star rating display */}
              <div className="flex mr-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= Math.round(showroom.rating || 0)
                        ? "text-amber-500 fill-amber-500" // Filled yellow star
                        : "text-white fill-white" // Light gray empty star
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-amber-900">
                {showroom.rating ? showroom.rating.toFixed(1) : ""}
              </span>
            </div>
            <span className="text-sm text-gray-500 ml-2">
              ({showroom.reviewCount || 0} reviews)
            </span>
          </div>

          {/* Main Branch Badge */}
          {showroom.isMainBranch && (
            <div className="mt-3">
              <Badge
                variant="outline"
                className="border-blue-500 text-blue-600"
              >
                {t("showroom.mainBranch")}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
