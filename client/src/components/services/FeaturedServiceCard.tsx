import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, MapPin } from "lucide-react";

export interface ShowroomService {
  showroom_service_id: number;
  is_featured: boolean;
  price: number;
  currency: string;
  service_id: number;
  service_name: string;
  service_nameAr: string;
  service_image: string;
  showroom_id: number;
  showroom_name: string;
  showroom_logo: string;
  showroom_location: string;
  showroom_address: string;
}

export default function FeaturedServiceCard({
  service,
}: {
  service: ShowroomService;
}) {
  const { t } = useTranslation();

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 border-solid rounded-2xl ${
        service.is_featured ? "border-orange-500" : "border-gray-200"
      }`}
    >
      {/* Top Section: Image + Service Name */}
      <div className="bg-white p-4 h-[200px] relative flex flex-col items-center justify-center text-center">
        {/* Featured Badge */}
        {service.is_featured && (
          <div className="absolute top-10 -left-12 -rotate-45 bg-red-700 text-white font-black px-20 py-1 text-sm shadow-lg z-10">
            {t("common.featured")}
          </div>
        )}

        <Link
          href={`/showroom-services/${service.showroom_service_id}`}
          className="flex flex-col items-center"
        >
          <div className="w-auto h-[80px] overflow-hidden rounded-lg">
            <img
              src={service.service_image}
              alt={service.showroom_name}
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = "/src/assets/showroom-image.png";
              }}
              className="w-auto h-[75px] object-center"
            />
          </div>

          <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors">
            {service.service_name}
          </h3>
        </Link>
      </div>

      {/* Bottom Section: Showroom Info + Button */}
      <div className="bg-blue-900 text-white p-4 flex flex-col gap-3">
        {/* Showroom Info */}
        <div>
          <div className="font-semibold uppercase">{service.showroom_name}</div>
          {service.showroom_location &&
            (() => {
              const [lat, lng] = service.showroom_location
                .split(",")
                .map(Number);
              const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

              return (
                <div className="flex items-center gap-2 mt-1 text-gray-300">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on map"
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <MapPin size={16} />
                    <span>{service.showroom_address}</span>
                  </a>
                </div>

              );
            })()}
        </div>

        {/* View Details Button */}
        <Link
          href={`/showroom-services/${service.showroom_service_id}`}
          className="flex flex-col items-center justify-center"
        >
          <Button className="bg-orange-500 hover:bg-orange-600 text-white w-1/2">
            {t("common.bookNow")}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
