import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CarService } from "@shared/schema";

export default function ServiceCard({ service }: { service: CarService }) {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardContent className="p-6">
        <div className="flex items-start mb-4">
          <Avatar className="h-12 w-12 mr-4 rounded-lg">
            <AvatarImage src={service.image || ""} alt={service.name} />
            <AvatarFallback>{service.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{service.name}</h3>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
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