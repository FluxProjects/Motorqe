import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CarService, Showroom } from "@shared/schema";

export interface ShowroomService {
    id: number;
    showroomId: number;
    serviceId: number;
    price: number;
    currency: string;
    isFeatured: boolean;
    service: CarService;
    showroom: Showroom;
  }

export default function GarageServiceCard({ service }: { service: ShowroomService }) {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardContent className="p-6">
        <div className="flex items-start mb-4">
          <Avatar className="h-12 w-12 mr-4 rounded-lg">
            <AvatarImage src={service.service.image} alt={service.service.name} />
            <AvatarFallback>{service.service.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{service.service.name}</h3>
            <p className="text-sm text-neutral-500">
              {t("services.offeredBy")} {service.showroom.name}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="font-bold text-primary">
            {service.price} {service.currency}
          </span>
          <Link href={`/services/${service.id}`}>
            <Button variant="outline" size="sm">
              {t("services.view")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}