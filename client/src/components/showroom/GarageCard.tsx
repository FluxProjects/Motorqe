import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Car, Phone, ArrowRight, LocateFixed, Ruler } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

interface GarageCardProps {
  garage: {
    id: number;
    name: string;
    nameAr?: string;
    address: string;
    addressAr?: string;
    location: string;
    phone: string;
    logo?: string;
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
    review_count?: number;
  };
  distance?: number;
  isList?: boolean;
  showDistance?: boolean;
  selectedServiceId?: number | number[];
}

export function GarageCard({ garage, distance, isList = false, showDistance = false, selectedServiceId }: GarageCardProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const name = language === "ar" && garage.name_ar ? garage.name_ar : garage.name;
  const address = language === "ar" && garage.address_ar ? garage.address_ar : garage.address;
  const { data: garageMakes = [], isLoading: isLoadingMakes } = useQuery<any[]>({
    queryKey: [`/api/garages/${garage?.id}/makes`],
    enabled: !!garage?.id,
  });


let selectedPrices: number[] = [];

if (Array.isArray(selectedServiceId)) {
  selectedPrices = garage.services
    .filter(service => selectedServiceId.includes(service.id))
    .map(service => service.price);
} else if (typeof selectedServiceId === "number") {
  const service = garage.services.find(s => s.id === selectedServiceId);
  if (service) selectedPrices = [service.price];
}

let priceDisplay: string | null = null;
if (selectedPrices.length === 1) {
  priceDisplay = `QAR ${selectedPrices[0]}`;
} else if (selectedPrices.length > 1) {
  const min = Math.min(...selectedPrices);
  const max = Math.max(...selectedPrices);
  priceDisplay = `QAR ${min} - ${max}`;
}




  if (isList) {
    return (
      <Card
        className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 border-solid rounded-2xl ${
          garage.is_featured ? "border-orange-500" : "border-gray-200"
        }`}
      >
        <div className="flex flex-col md:flex-row">
          {/* Column 1 - Name + Image */}
          <div className="w-full md:w-1/3 p-4 flex flex-col">
            <Link href={`/garages/${garage.id}`}>
              <h3 className="text-lg font-bold mb-3 hover:text-blue-600 transition-colors">
                {name}
              </h3>
            </Link>
            
            <div className="relative flex-1 mb-3">
              <Link href={`/garages/${garage.id}`}>
                <div className="h-[100px] w-full overflow-hidden rounded-lg group cursor-pointer min-h-[100px]">
                  <img
                    src={garage.logo}
                    alt={name}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = "/src/assets/showroom-image.png";
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <h3 className="text-md font-bold text-gray-900 mb-2">
                  {t('common.carSpecialist')}
              </h3>
             <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-wrap gap-3">
                    {garageMakes.map((make) => (
                      <div key={make.id} className="flex items-center gap-2">
                        <img
                          src={make.make_image}
                          alt={make.make_name}
                          className="h-auto w-auto max-h-10 max-w-10 object-contain"
                        />
                        </div>
                    ))}

                  </div>
                </div>
            </div>
          </div>

          {/* Column 2 - Details */}
          <div className="w-full md:w-1/3 p-4 border-t md:border-t-0 flex flex-col items-start justify-center">
            {/* Address */}
            <div className="text-sm text-gray-600 mb-3 space-y-1">
              <div className="flex items-start">
                <MapPin size={16} className="mr-1 mt-0.5 flex-shrink-0 text-blue-900" />
                <div>
                  {address.split(",").map((line, index) => (
                    <p key={index}>{line.trim()}</p>
                  ))}
                </div>
              </div>
            </div>

             {/* Distance */}
            {isList && (
              <div className="text-sm text-gray-600 mb-3 flex items-center">
                <LocateFixed size={16} className="mr-1 mt-0.5 flex-shrink-0 text-blue-900" />
                {distance} km away
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center mb-2">
              <div className="flex items-center px-2 py-1">
                <div className="flex mr-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={
                        star <= Math.round(garage.rating || 0)
                          ? "text-amber-500 fill-amber-500"
                          : "text-white fill-white"
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
              <div className="mt-2">
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  {t("garage.mainBranch")}
                </Badge>
              </div>
            )}
          </div>

          {/* Column 3 - Featured Badge + View Details */}
          <div className="w-full md:w-1/3 p-4 border-t md:border-t-0 border-gray-200 flex flex-col items-end justify-center">
            {/* Featured Badge */}
            {garage.is_featured && (
              <Badge className="bg-blue-900 text-white mb-4">
                FEATURED
              </Badge>
            )}

            {priceDisplay && (
              <div className="text-sm text-gray-800 font-medium mb-2">
               {priceDisplay}
              </div>
            )}



            {/* View Details Button */}
            <Link href={`/garages/${garage.id}`} className="w-full md:w-auto">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full md:w-auto">
                {t("common.viewDetails")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // Original 2-column layout
  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 border-solid rounded-2xl ${
        garage.is_featured ? "border-orange-500" : "border-gray-200"
      }`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Left Column - Name + Image */}
        <div className="w-full md:w-2/4 p-4 flex flex-col">
          <Link href={`/garages/${garage.id}`}>
            <h3 className="text-lg font-bold mb-3 hover:text-blue-600 transition-colors">
              {name}
            </h3>
          </Link>

          <div className="relative flex-1 mb-3">
            <Link href={`/garages/${garage.id}`}>
              <div className="h-full w-full overflow-hidden rounded-lg group cursor-pointer min-h-[85px]">
                <img
                  src={garage.logo || "/src/assets/showroom-image.png"}
                  alt={name}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = "/src/assets/showroom-image.png";
                  }}
                  className="w-full h-auto object-cover object-center group-hover:scale-105 transition-transform duration-300 min-h-[85px]"
                />
              </div>
            </Link>
          </div>

          <Link href={`/garages/${garage.id}`} className="w-full">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              {t("common.viewDetails")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Right Column - Details */}
        <div className="w-full md:w-2/4 p-4 border-t md:border-t-0 md:border-l border-gray-200">
          <div className="mb-3 min-h-[24px]">
            {garage.is_featured ? (
              <Badge className="bg-blue-900 text-white">
                FEATURED
              </Badge>
            ) : (
              <div className="invisible h-[24px]">Placeholder</div>
            )}
          </div>

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

          <div className="text-sm text-gray-600 mb-4">{garage.phone}</div>

          <div className="flex items-center">
            <div className="flex items-center bg-amber-100 px-2 py-1 rounded">
              <div className="flex mr-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= Math.round(garage.rating || 0)
                        ? "text-amber-500 fill-amber-500"
                        : "text-white fill-white"
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

          {garage.is_main_branch && (
            <div className="mt-3">
              <Badge variant="outline" className="border-blue-500 text-blue-600">
                {t("garage.mainBranch")}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}