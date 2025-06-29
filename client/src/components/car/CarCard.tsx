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
  MessageCircle,
  Phone,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CarListing, User } from "@shared/schema";
import { AuthForms } from "../forms/AuthForm/AuthForms";
import { calculateMonthlyPayment, formatTimeAgo } from "@/lib/utils";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
    currency?: string;
    price: number;
    location: string;
    images: string[];
    image360: string;
    mileage: number;
    fuel_type: string;
    year: string;
    transmission: string;
    cylinders: string;
    condition: string;
    color: string;
    isFeatured: boolean;
    isImported: boolean;
    is_inspected: boolean;
    has_warranty: boolean;
    has_insurace: boolean;
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

const CarCard = ({ car, isFavorited = false }: CarCardProps) => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const language = i18n.language;
  const { toast } = useToast();
  const [, setIsFavorited] = useState(false);
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

  const warrantyExpiryText = car?.warranty_expiry
    ? `Warranty expired on ${format(
        new Date(car.warranty_expiry),
        "dd MMM yyyy"
      )}`
    : "Warranty expired";

  console.log("Car data", car);

  return (
    <>
      <Card
        className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 border-4 border-solid rounded-2xl ${
          car.is_featured ? "border-orange-500" : "border-neutral-50"
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

                {/* 360 Overlay */}
                {car.image360 && (
                  <div className="absolute bottom-2 left-2 z-10">
                    <img
                      src="/360-listing.png"
                      alt="360 Available"
                      className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg"
                    />
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

      {/* Contact Seller Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("car.contactSeller")}</DialogTitle>
            <DialogDescription>{t("car.contactSellerDesc")}</DialogDescription>
          </DialogHeader>

          <Form {...messageForm}>
            <form
              onSubmit={messageForm.handleSubmit(handleContactSeller)}
              className="space-y-4"
            >
              <div className="bg-neutral-50 p-3 rounded-md text-sm mb-4">
                <p className="font-medium">
                  {t("car.regarding")}: {title}
                </p>
                <p className="text-primary font-medium mt-1">
                  {car.currency || "QR"} {car.price.toLocaleString()}
                </p>
              </div>

              <FormField
                control={messageForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={t("car.writeYourMessage")}
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" className="w-full">
                  {messageForm.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <MessageSquare size={16} className="mr-1" />
                  )}
                  {t("car.sendMessage")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
    </>
  );
};

export default CarCard;
