import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Link } from "wouter";
import i18n, { resources } from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Calendar, Fuel, Gauge, Cog } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CarCardProps {
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
  };
  isFavorited?: boolean;
}

const CarCard = ({ car, isFavorited = false }: CarCardProps) => {
  const auth = useAuth();
  const { isAuthenticated} = auth;
  const { t } = useTranslation();
  const language = i18n.language;
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
      className={`overflow-hidden hover:shadow-md transition-shadow duration-300 ${
        car.is_featured ? 'border-2 border-orange-500 border-solid' : ''
      }`}
    >

      <Link href={`/cars/${car.id}`}>
        <div className="relative h-56 overflow-hidden group cursor-pointer">
          {car.images && car.images.length > 0 ? (
            <img
              src={car.images[0]}
              alt={title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full bg-slate-200 flex items-center justify-center">
              <p className="text-slate-400">{t("common.noImage")}</p>
            </div>
          )}

          {car.is_Featured && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-orange-500/50">
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
      </Link>

      <CardContent className="pt-4">
        <Link href={`/cars/${car.id}`}>
          <h3 className="text-lg font-semibold line-clamp-2 mb-1 hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </Link>

        <p className="text-2xl font-bold text-blue-600 mb-3">
          ${car.price.toLocaleString()}
        </p>

        <div className="flex items-center text-slate-500 text-sm mb-3">
          <MapPin size={16} className="mr-1" />
          <span>{car.location}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
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
                `car.${
                  car.fuel_type?.toLowerCase?.() || "unknownFuelType"                  
                }`
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
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <div className="flex items-center">
          {car.seller ? (
            <>
              {car.seller.avatar ? (
                <img
                  src={car.seller.avatar}
                  alt={car.seller.username}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                  {car.seller.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-slate-600">
              {car.seller.username.slice(0, 10)}
              </span>
            </>
          ) : (
            <div className="text-sm text-slate-400">
              {t("common.unknownSeller")}
            </div>
          )}
        </div>

        <Link href={`/cars/${car.id}`}>
          <Button
            size="sm"
            variant="outline"
            className="text-white bg-blue-900 hover:bg-blue-700 hover:text-white"
          >
            {t("common.viewDetails")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CarCard;
