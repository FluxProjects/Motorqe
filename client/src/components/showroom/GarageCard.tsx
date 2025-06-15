import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Car, Phone, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface GarageCardProps {
  garage: {
    id: number;
    name: string;
    nameAr?: string;
    address: string;
    addressAr?: string;
    location: string;
    phone: string;
    image?: string;
    isMainBranch: boolean;
    isFeatured: boolean;
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

export function GarageCard({ garage }: GarageCardProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const name = language === "ar" && garage.nameAr ? garage.nameAr : garage.name;
  const address =
    language === "ar" && garage.addressAr ? garage.addressAr : garage.address;

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 border-solid rounded-2xl ${
        garage.is_featured ? "border-orange-500" : "border-gray-200"
      }`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Left Column - Name + Image */}
        <div className="w-full md:w-2/4 p-4 flex flex-col">
          {/* Garage Name */}
          <Link href={`/garages/${garage.id}`}>
            <h3 className="text-lg font-bold mb-3 hover:text-blue-600 transition-colors">
              {name}
            </h3>
          </Link>

          {/* Image */}
          <div className="relative flex-1 mb-3">
            <Link href={`/garages/${garage.id}`}>
              <div className="h-full w-full overflow-hidden rounded-lg group cursor-pointer min-h-[85px]">
                <img
                  src={garage.image || "/src/assets/showroom-image.png"}
                  alt={name}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null; // prevent infinite loop if default fails
                    target.src = "/src/assets/showroom-image.png";
                  }}
                  className="w-full h-auto object-cover object-center group-hover:scale-105 transition-transform duration-300 min-h-[85px]"
                />

              </div>
            </Link>
          </div>

          {/* Orange View Details Button */}
          <Link href={`/garages/${garage.id}`} className="w-full">
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
            {garage.is_featured ? (
              <Badge className="bg-blue-900 text-white">
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
          <div className="text-sm text-gray-600 mb-4">{garage.phone}</div>

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
                      star <= Math.round(garage.rating || 0)
                        ? "text-amber-500 fill-amber-500" // Filled yellow star
                        : "text-white fill-white" // Light gray empty star
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-amber-900">
                {garage.rating ? garage.rating.toFixed(1) : ""}
              </span>
            </div>
            <span className="text-sm text-gray-500 ml-2">
              ({garage.review_count || 0} reviews)
            </span>
          </div>

          {/* Main Branch Badge */}
          {garage.is_main_branch && (
            <div className="mt-3">
              <Badge
                variant="outline"
                className="border-blue-500 text-blue-600"
              >
                {t("garage.mainBranch")}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
