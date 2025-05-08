import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

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
  showroom_location: string;
}

export default function FeaturedServiceCard({ service }: { service: ShowroomService }) {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-md transition-shadow h-full border-2 border-primary">
      <CardContent className="p-6">
        <div className="mb-3">
          {service.is_featured && (
            <Badge className="flex items-center bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {t("services.featured")}
            </Badge>
          )}
        </div>

        <div className="flex items-start mb-4">
          <Avatar className="h-12 w-12 mr-4 rounded-lg">
            <AvatarImage
              src={`https://placehold.co/400x400?text=${service.service_name}`}
              alt={service.service_name}
            />
            <AvatarFallback>{service.service_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold">{service.service_name}</h3>
            <p className="text-sm text-neutral-500">
              {t("services.offeredBy")}{":"} <span className="font-semibold">{service.showroom_name}</span>
            </p>
            <p className="text-sm text-neutral-500">{service.showroom_location}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="font-bold text-primary">
            {service.price} {service.currency}
          </span>
          <Link href={`/showroom-services/${service.showroom_service_id}`}>
            <Button variant="outline" size="sm">
              {t("services.view")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
