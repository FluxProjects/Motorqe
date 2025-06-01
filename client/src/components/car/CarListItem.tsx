import { useState } from "react";
import { Link } from "wouter";
import i18n, { resources } from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Calendar, Fuel, Gauge, Cog } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CarListItemProps {
  car: {
    id: number;
    title: string;
    titleAr?: string;
    price: number;
    location: string;
    images: string[];
    mileage: number;
    fuel_type: string;
    transmission: string;
    condition: string;
    color: string;
    isFeatured: boolean;
    seller: {
      id: number;
      username: string;
      avatar?: string;
    };
    showroom_name?: string;
    showroom_logo?: string;
  };
  isFavorited?: boolean;
}

const CarListItem = ({ car, isFavorited = false }: CarListItemProps) => {
  const { t } = useTranslation();
  const language = i18n.language;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [favorited, setFavorited] = useState(isFavorited);

  const title = language === "ar" && car.titleAr ? car.titleAr : car.title;

  // Toggle favorite mutation
  const toggleFavorite = useMutation({
    mutationFn: async () => {
      return await apiRequest(
        favorited ? "DELETE" : "POST",
        `/api/favorites/${car.id}`,
        {}
      );
    },
    onSuccess: () => {
      setFavorited(!favorited);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });

      toast({
        title: favorited
          ? t("favorites.removedFromFavorites")
          : t("favorites.addedToFavorites"),
        description: title,
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("common.somethingWentWrong"),
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: t("common.authRequired"),
        description: t("common.loginToFavorite"),
        variant: "destructive",
      });
      return;
    }

    toggleFavorite.mutate();
  };

  return (
    <Card
      className={`flex flex-col md:flex-row w-full overflow-hidden hover:shadow-md transition-shadow duration-300 ${
        car.is_featured ? "border-2 border-orange-500 border-solid" : ""
      }`}
    >
      <Link
        href={`/cars/${car.id}`}
        className="flex flex-col md:flex-row w-full"
      >
        <div className="relative md:w-1/3 w-full h-64 md:h-auto overflow-hidden group cursor-pointer">
          {car.images && car.images.length > 0 ? (
            <img
              src={car.images[0]}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full bg-slate-200 flex items-center justify-center">
              <p className="text-slate-400">{t("common.noImage")}</p>
            </div>
          )}

          {car.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
              {t("common.featured")}
            </Badge>
          )}

          <Button
            size="icon"
            variant="ghost"
            className={`absolute top-2 right-2 rounded-full ${
              favorited
                ? "bg-rose-100 text-rose-500 hover:bg-rose-200 hover:text-rose-600"
                : "bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-500"
            }`}
            onClick={handleFavoriteToggle}
            disabled={toggleFavorite.isPending}
          >
            <Heart className={favorited ? "fill-rose-500" : ""} size={20} />
          </Button>
        </div>

        <div className="flex-1 flex flex-col justify-between p-4">
          <div>
            <h3 className="text-lg font-semibold mb-1 hover:text-blue-600 transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-2xl font-bold text-blue-600 mb-3">
              ${car.price.toLocaleString()}
            </p>
            <div className="flex items-center text-slate-500 text-sm mb-3">
              <MapPin size={16} className="mr-1" />
              <span>{car.location}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm mb-4">
              <div className="flex flex-col items-center p-2 bg-slate-50 rounded-md">
                <Gauge size={18} className="text-slate-500 mb-1" />
                <span>
                  {car.mileage.toLocaleString()} {t("car.miles")}
                </span>
              </div>
              <div className="flex flex-col items-center p-2 bg-slate-50 rounded-md">
                <Fuel size={18} className="text-slate-500 mb-1" />
                <span>
                  {t(
                    `car.${car.fuel_type?.toLowerCase?.() || "unknownFuelType"}`
                  )}
                </span>
              </div>
              <div className="flex flex-col items-center p-2 bg-slate-50 rounded-md">
                <Cog size={18} className="text-slate-500 mb-1" />
                <span>
                  {t(
                    `car.${
                      car.transmission?.toLowerCase?.() || "unknownTransmission"
                    }`
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <div className="flex items-center">
              {car.showroom_name || car.seller ? (
                <>
                  <img
                    src={
                      car?.showroom_logo ||
                      (car?.showroom_name && car?.seller.avatar) ||
                      "/fallback-avatar.png"
                    }
                    alt={car?.showroom_name || car?.seller.username}
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/fallback-avatar.png";
                    }}
                  />
                  <span className="text-sm text-slate-600">
                    {car?.showroom_name || car?.seller.username}
                  </span>
                </>
              ) : (
                <div className="text-sm text-slate-400">
                  {t("common.unknownSeller")}
                </div>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              {t("common.viewDetails")}
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default CarListItem;
