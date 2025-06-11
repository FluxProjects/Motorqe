import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import i18n, { resources } from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MapPin,
  Calendar,
  Fuel,
  Gauge,
  Cog,
  CalendarIcon,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CarListing, User } from "@shared/schema";
import { AuthForms } from "../forms/AuthForm/AuthForms";

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
    status: string;
    created_at: Date;
    updated_at?: Date;
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

const CarCard = ({
  car,
  isFavorited = false,
}: CarCardProps) => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const language = i18n.language;
  const { toast } = useToast();
  const [, setIsFavorited] = useState(false);
  const [comparisonList, setComparisonList] = useState<CarListing[]>([]);
  const [authModal, setAuthModal] = useState<
    "login" | "register" | "forget-password" | null
  >(null);

  const title = language === "ar" && car.titleAr ? car.titleAr : car.title;
  const isCompared = comparisonList?.some((c) => c.id === car.id);

    
const handleAddToCompare = (car: CarListing) => {
  const existing = JSON.parse(localStorage.getItem("comparisonList") || "[]");
  const updated = [...existing, car];
  localStorage.setItem("comparisonList", JSON.stringify(updated));
  setComparisonList(updated); // if you're using state
  const stored = localStorage.getItem("comparisonList");
  console.log("stored", stored);
};


const handleRemoveFromCompare = (carId: number) => {
  setComparisonList(comparisonList.filter((c) => c.id !== carId));
};

  // Toggle favorite mutation
  if (user) {
    const { data: favoriteData } = useQuery<any>({
      queryKey: ["check-favorite", { listingId: car?.id, userId: user?.id }],
      queryFn: async () => {
        const res = await fetch("/api/favorites/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: car?.id, userId: user?.id }),
        });
        return res.json();
      },
      enabled: !!user?.id && !!car.id,
    });

    useEffect(() => {
      if (favoriteData !== undefined) {
        setIsFavorited(favoriteData);
      }
    }, [favoriteData]);
  }

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

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      setAuthModal("login");
      return;
    }

    try {
      if (isFavorited) {
        await apiRequest("DELETE", "/api/favorites", {
          listingId: car?.id,
          userId: user?.id,
        });
        setIsFavorited(false);
        toast({
          title: "Removed from favorites",
          description: "Car has been removed from your favorites",
        });
      } else {
        await apiRequest("POST", "/api/favorites", {
          listingId: parseInt(id),
          userId: user?.id,
        });
        setIsFavorited(true);
        toast({
          title: "Added to favorites",
          description: "Car has been added to your favorites",
        });
      }
    } catch (error) {
      toast({
        title: "Action failed",
        description: "There was a problem updating your favorites",
        variant: "destructive",
      });
    }
  };

  console.log("Car data", car);
  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 border-solid rounded-2xl ${
        car.is_featured ? "border-orange-500" : "border-blue-700"
      }`}
    >
      <Link href={`/cars/${car.id}`}>
        <div className="relative h-56 overflow-hidden group cursor-pointer">
          {car.images && car.images.length > 0 ? (
            <>
              <img
                src={car.images[0]}
                alt={car.title}
                className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                  car.status === "sold" ? "opacity-50" : ""
                }`}
              />
              {/* SOLD STAMP */}
              {car.status === "sold" && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-red-500 text-xl font-extrabold border-red-500 border-2 px-6 py-2 shadow-lg transform rotate-[-10deg] opacity-90">
                    SOLD
                  </div>
                </div>
              )}

              {/* NEW RIBBON */}
              {new Date(car.created_at).toDateString() ===
                new Date().toDateString() && (
                <div className="absolute top-5 left-[-40px] -rotate-45 bg-red-700 text-white font-black px-20 py-1 text-lg shadow-lg z-10">
                  NEW
                </div>
              )}
            </>
          ) : (
            <div className="h-full w-full bg-slate-200 flex items-center justify-center">
              <p className="text-slate-400">{t("common.noImage")}</p>
            </div>
          )}

          {car.is_featured && (
            <Badge className="absolute top-2 right-2 bg-blue-700 hover:bg-orange-500">
              {t("common.featured")}
            </Badge>
          )}

          <Button
            size="icon"
            variant="ghost"
            className={`absolute top-2 left-2 rounded-full ${
              isFavorited
                ? "rounded-full hover:text-orange-600 hover:border-orange-600 bg-orange-600 text-white"
                : "rounded-full text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
            }`}
            onClick={handleFavoriteToggle}
          >
            <Heart
              className="w-4 h-4"
              fill={isFavorited ? "currentColor" : "none"}
            />
          </Button>
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
            <span>{car?.mileage?.toLocaleString()} KM</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center text-green-600 font-semibold text-sm">
            <MapPin size={16} className="mr-1" />
            <span className="text-xs">{car?.location}</span>

            <label className="flex items-center space-x-2 cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={() => {
                  if (isCompared) {
                    handleRemoveFromCompare(car?.id);
                  } else {
                    handleAddToCompare(car);
                  }
                }}
                className="h-4 w-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm font-semibold text-neutral-700">
                <Link href="/compare">
                  {t("common.addCompare")}
                </Link>
              </span>
            </label>
          </div>

          <div className="text-blue-800 font-bold text-lg">
            QR. {car?.price?.toLocaleString()}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <div className="flex items-center">
          {car?.showroom_name || seller ? (
            <>
              {car?.showroom_logo || seller?.avatar ? (
                <img
                  src={car?.showroom_logo || seller?.avatar}
                  alt={car?.showroom_name || seller?.username}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                  {seller?.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-slate-600">
                {car?.showroom_name || seller?.username.slice(0, 10)}
              </span>
            </>
          ) : (
            <div className="text-sm text-slate-400">
              {t("common.unknownSeller")}
            </div>
          )}
        </div>

        <Link href={`/cars/${car?.id}`}>
          <Button
            size="sm"
            variant="default"
            className="bg-orange-500 hover:bg-orange-600 font-semibold px-6 py-2 rounded-full"
          >
            {t("common.viewDetails")}
          </Button>
        </Link>
      </CardFooter>
      {/* Auth Modal */}
      {authModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 animate-in fade-in duration-300">
            <AuthForms
              initialView={authModal}
              onClose={() => setAuthModal(null)}
              onSwitchView={(view) => setAuthModal(view)}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default CarCard;
