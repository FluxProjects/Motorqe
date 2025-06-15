import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Navigation, Star } from "lucide-react";

export interface ShowroomService {
  showroom_service_id: number;
  is_featured: boolean;
  price: number;
  currency: string;
  service_id: number;
  service_name: string;
  service_nameAr: string;
  showroom_id: number;
  showroom_name: string;
  showroom_logo: string;
  showroom_location: string;
  showroom_address: string;
}

export default function FeaturedServiceCard({ service }: { service: ShowroomService }) {
  const { t } = useTranslation();

  return (
    <Card
  className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 border-solid rounded-2xl ${
    service.is_featured ? 'border-orange-500' : 'border-gray-200'
  }`}
>
  <div className="flex flex-col md:flex-row">
    {/* Left Column - Service Name + Image */}
    <div className="w-full md:w-2/4 p-4 flex flex-col">
      {/* Service Name */}
      <Link href={`/showroom-services/${service.showroom_service_id}`}>
        <h3 className="text-lg font-bold mb-3 hover:text-blue-600 transition-colors">
          {service.service_name}
        </h3>
      </Link>

      {/* Image */}
      <div className="relative flex-1 mb-3">
        <Link href={`/showroom-services/${service.showroom_service_id}`}>
          <div className="h-[100px] w-full overflow-hidden rounded-lg group cursor-pointer">
  <img
                src={service.showroom_logo || "/src/assets/showroom-image.png"}
                alt={service.showroom_name}
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
      <Link href={`/showroom-services/${service.showroom_service_id}`} className="w-full">
        <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
          {t("common.viewDetails")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>

    {/* Right Column - Details */}
    <div className="w-full md:w-2/4 p-4 border-t md:border-t-0 md:border-l border-gray-200">
      {/* Featured Badge */}
      <div className="mb-3 min-h-[24px]">
        {service.is_featured ? (
          <Badge className="bg-red-600 hover:bg-red-700 text-white">
            {t("services.featured")}
          </Badge>
        ) : (
          <div className="invisible h-[24px]">Placeholder</div>
        )}
      </div>

      {/* Offered By */}
      <div className="text-sm text-gray-600 mb-2">
  <div className="flex items-center flex-wrap gap-2">
    <span className="font-semibold">{service.showroom_name}</span>
    {service.showroom_location &&
      (() => {
        const [lat, lng] = service.showroom_location
          .split(",")
          .map(Number);
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

        return (
          <div className="flex items-center gap-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View on map"
              className="text-gray-500 hover:text-gray-700"
            >
              <MapPin size={16} />
            </a>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Get directions"
              className="text-gray-500 hover:text-gray-700"
            >
              <Navigation size={16} />
            </a>
          </div>
        );
      })()}
  </div>

</div>



      {/* Price */}
      <div className="text-lg text-gray-600 mb-4">
  <span className="font-bold text-primary">
    {service.price} {service.currency}
  </span>
</div>


    </div>
  </div>
</Card>

  );
}
