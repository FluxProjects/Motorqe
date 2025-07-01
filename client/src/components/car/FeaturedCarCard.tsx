import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Link } from "wouter";
import i18n from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Fuel, Gauge, Cog, CalendarIcon, Phone, MessageCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CarListing, User } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { calculateMonthlyPayment, formatTimeAgo } from "@/lib/utils";
import { format } from "date-fns";

// Message form schema
const messageSchema = z.object({
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message cannot exceed 500 characters"),
});

type MessageValues = z.infer<typeof messageSchema>;

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

const FeaturedCarCard = ({
  car,
  isFavorited = false,
  className = "",
  cardSize = "default",
}: CarCardProps & { className?: string; cardSize?: "default" | "large" }) => {
  const auth = useAuth();
  const { isAuthenticated } = auth;
  const { t } = useTranslation();
  const language = i18n.language;
  const { toast } = useToast();
  const [favorited, setFavorited] = useState(isFavorited);
  const [comparisonList, setComparisonList] = useState<CarListing[]>([]);
    const [authModal, setAuthModal] = useState<
      "login" | "register" | "forget-password" | null
    >(null);
    const [contactDialogOpen, setContactDialogOpen] = useState(false);
    const title = language === "ar" && car.titleAr ? car.titleAr : car.title;
    const isCompared = comparisonList?.some((c) => c.id === car.id);
  
    // Message form
    const messageForm = useForm<MessageValues>({
      resolver: zodResolver(messageSchema),
      defaultValues: {
        message: "",
      },
    });
  
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
  
    const handleCall = (phone: string) => {
      window.open(`tel:${phone}`);
    };
  
    const handleWhatsApp = (phone: string, carTitle: string) => {
      const encodedMessage = encodeURIComponent(
        `Hi, I'm interested in the ${carTitle}`
      );
      window.open(`https://wa.me/${phone}?text=${encodedMessage}`);
    };
  
    const handleContactSeller = (values: MessageValues) => {
      if (!isAuthenticated) {
        setContactDialogOpen(false);
        setAuthModal("login");
        return;
      }
  
      apiRequest("POST", "/api/messages", {
        receiverId: car!.sellerId,
        carId: parseInt(id),
        content: values.message,
      })
        .then(() => {
          toast({
            title: "Message sent",
            description: "Your message has been sent to the seller",
          });
          messageForm.reset();
          setContactDialogOpen(false);
        })
        .catch((error) => {
          toast({
            title: "Message failed",
            description:
              error.message || "There was a problem sending your message",
            variant: "destructive",
          });
        });
    };

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
const warrantyExpiryText = car?.warranty_expiry
    ? `Warranty expired on ${format(
        new Date(car.warranty_expiry),
        "dd MMM yyyy"
      )}`
    : "Warranty expired";

  return (
    <Link href={`/cars/${car.id}`}>
      <Card
        className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 rounded-2xl ${
          car.is_featured ? "border-blue-700" : "border-slate-200"
        } ${className}`}
      >
        <div
          className={`relative w-full ${
            cardSize === "large" ? "aspect-[1/1]" : "aspect-[16/6]"
          } overflow-hidden`}
        >
          {car.images?.length ? (
            <img
              src={car.images[0]}
              alt={car.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="h-full w-full bg-slate-100 flex items-center justify-center">
              <p className="text-slate-400">{t("common.noImage")}</p>

            </div>
          )}

          {car?.is_featured && (
            <Badge className="absolute top-2 right-2 bg-blue-700 hover:bg-orange-500/50">
              {t("common.featured")}
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center mt-3">
                    <Link href={`/cars/${car?.id}`}>
                      <h3 className="text-base font-extrabold uppercase text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
                        {title}
                      </h3>
                    </Link>
                    <div className="flex items-center">
                      <Link href={`/showrooms/${car?.showroom_id}`}>
                        {car?.showroom_name && (
                          <>
                            {car?.showroom_logo && (
                              <img
                                src={car?.showroom_logo}
                                alt={car?.showroom_name}
                                className="w-8 h-8 rounded-full mr-2 object-cover"
                              />
                            )}
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
        
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-blue-800 font-bold text-lg">
                      {car?.currency || "QR"}{" "}
                      {car?.price != null
                        ? Number(car.price).toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })
                        : "N/A"}
                    </div>
        
                    <div className="text-green-500 font-bold text-lg">
                      {car?.price != null ? (
                        <>
                          {car?.currency || "QR"}{" "}
                          {calculateMonthlyPayment(car.price).toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })}
                          /Month
                        </>
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </div>
        
                  <div className="flex justify-between text-xs text-slate-700 mt-2">
                    <div className="flex items-center gap-1">
                      <img src="/src/assets/car-calendar.png" className="w-4 h-4" />
                      <span>{car.year || "2021"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src="/src/assets/car-cylinders.png" className="w-4 h-4" />
                      <span>{car.cylinder_count || "4 Cylinder"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src="/src/assets/car-mileage.png" className="w-4 h-4" />
                      <span>{car?.mileage?.toLocaleString()} KM</span>
                    </div>
                  </div>
        
                  <div className="flex justify-between items-center mt-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <span className="text-sm font-semibold text-blue-900">
                        <Link href="/compare">{t("common.addCompare")}</Link>
                      </span>
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
                    </label>
        
                    {car?.has_warranty && (
                      <img
                        src="/src/assets/car-warranty.png"
                        className="w-4 h-4"
                        title={warrantyExpiryText}
                      />
                    )}
        
                    {car?.is_inspected && (
                      <img src="/src/assets/car-inspected.png" className="w-4 h-4" />
                    )}
        
                    <div className="text-neutral-600 font-medium text-sm">
                      {car?.created_at ? formatTimeAgo(car.created_at) : "Just now"}
                    </div>
                  </div>
                </CardContent>
        
                <CardFooter className="border-t pt-4 flex justify-between items-center gap-4">
                    <Button
                      size="sm"
                      className="w-full rounded-full bg-blue-900 text-white flex items-center justify-center gap-2"
                      onClick={() => handleCall(car?.showroom?.phone || seller?.phone)}
                    >
                      <Phone size={16} /> 
                      Call
                    </Button>
        
                    <Button
                      size="sm"
                      className="w-full rounded-full bg-red-500 text-white flex items-center justify-center gap-2"
                      onClick={() => {
                        if (isAuthenticated) {
                          setContactDialogOpen(true);
                        } else {
                          setAuthModal("login");
                        }
                      }}
                    >
                      <MessageCircle size={16} />
                      Chat
                    </Button>
        
                    <Button
                      size="sm"
                      className="w-full rounded-full bg-green-500 text-white flex items-center justify-center gap-2"
                      onClick={() =>
                        handleWhatsApp(
                          car?.showroom?.phone ?? seller?.phone,
                          car.title
                        )
                      }
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </Button>
                </CardFooter>
      </Card>
    </Link>
  );
};

export default FeaturedCarCard;
