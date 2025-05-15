import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Link } from "wouter";
import i18n from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Fuel, Gauge, Cog, CalendarIcon } from "lucide-react";
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
    user_id?: number;
  };
  isFavorited?: boolean;
}

const FeaturedCarCard = ({ car, isFavorited = false, className = "", cardSize = "default" }: CarCardProps & { className?: string, cardSize?: 'default' | 'large' }) => {
  const auth = useAuth();
  const { isAuthenticated } = auth;
  const { t } = useTranslation();
  const language = i18n.language;
  const { toast } = useToast();
  const [favorited, setFavorited] = useState(isFavorited);

  const title = language === "ar" && car.titleAr ? car.titleAr : car.title;

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

  const { data: seller } = useQuery<User>({
    queryKey: ["/api/users", car?.user_id],
    queryFn: async () => {
      const res = await fetch(`/api/users/${car.user_id}`);
      return res.json();
    },
    enabled: !!car.user_id,
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
    <Link href={`/cars/${car.id}`}>
  <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 rounded-2xl ${car.is_featured ? "border-blue-700" : "border-slate-200"} ${className}`}>
    <div className={`w-full ${cardSize === 'large' ? 'h-340' : 'aspect-[16/6]'} overflow-hidden`}>
  {car.images?.length ? (
  <img
    src={car.images[0]}
    alt={car.title}
    className="object-cover w-full h-full"
  />) : (
        <div className="h-full w-full bg-slate-100 flex items-center justify-center">
          <p className="text-slate-400">{t("common.noImage")}</p>
        </div>
      )}
</div>


    <CardContent className="p-4 space-y-2">
      <h3 className="text-base font-extrabold uppercase text-slate-900">
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
  </Card>
</Link>

  );
};

export default FeaturedCarCard;
