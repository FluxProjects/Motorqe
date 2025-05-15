import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Link } from "wouter";
import i18n, { resources } from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Calendar, Fuel, Gauge, Cog, CalendarIcon } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

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

   const {
      data: seller,
      error,
      isLoading,
    } = useQuery<User>({
      queryKey: ["/api/users", car?.user_id],
      queryFn: async () => {
        console.log("Car User ID:", car?.user_id);
  
        try {
          const res = await fetch(`/api/users/${car?.user_id}`);
          console.log("Response received:", res);
  
          const data = await res.json();
          console.log("Fetched seller data:", data);
          return data;
        } catch (err) {
          console.error("Error in query function:", err);
          throw err;
        }
      },
      enabled: !!car?.user_id, // Only fetch when car data is available
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
console.log("Car data", car);
  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 border-solid rounded-2xl ${
        car.is_featured ? 'border-orange-500' : 'border-blue-700'
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

          {car.is_featured && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-orange-500/50">
              {t("common.featured")}
            </Badge>
          )}

          {/* <Button
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
          </Button> */}
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
      <h3 className="text-base font-extrabold uppercase text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
  {title}
</h3>


      <div className="flex justify-between text-xs text-slate-700 mt-2">
        <div className="flex items-center gap-1">
          <CalendarIcon className="w-4 h-4 text-slate-500" />
          <span>{car.year || "2021"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Cog className="w-4 h-4 text-slate-500" />
          <span>{car.condition || "4 Cylinder"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Gauge className="w-4 h-4 text-slate-500" />
          <span>{car.mileage.toLocaleString()} KM</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center text-green-600 font-semibold text-sm">
          <MapPin size={16} className="mr-1" />
          <span className="text-xs">{car.location}</span>
        </div>
        <div className="text-blue-800 font-bold text-lg">
          QR. {car.price.toLocaleString()}
        </div>
      </div>
    </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <div className="flex items-center">
          {seller ? (
            <>
              {seller.avatar ? (
                <img
                  src={seller.avatar}
                  alt={seller.username}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                  {seller.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-slate-600">
              {seller.username.slice(0, 10)}
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
            variant="default"
            className="bg-orange-500 hover:bg-orange-600 font-semibold px-6 py-2 rounded-full"
          >
            {t("common.viewDetails")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CarCard;
