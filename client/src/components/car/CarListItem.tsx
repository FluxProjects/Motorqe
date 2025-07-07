import { useEffect, useState } from "react";
import { Link } from "wouter";
import i18n from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Phone,
  MessageCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CarListing, CarMake, CarModel, User } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  calculateMonthlyPayment,
  fetchModelsByMake,
  formatTimeAgo,
} from "@/lib/utils";
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
import { AuthForms } from "../forms/AuthForm/AuthForms";
import { useNavigate } from "react-router-dom";
// Message form schema
const messageSchema = z.object({
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message cannot exceed 500 characters"),
});

type MessageValues = z.infer<typeof messageSchema>;

interface CarListItemProps {
  car: {
    id: number;
    title: string;
    titleAr?: string;
    currency?: string;
    price: number;
    location: string;
    images: string[];
    image360: string;
    make_id?: number;
    model_id?: number;
    mileage: number;
    fuel_type: string;
    year: string;
    transmission: string;
    cylinders: string;
    condition: string;
    color: string;
    is_featured: boolean;
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
  isCompared?: boolean;
  onAddToCompare: (car: CarListing) => void;
  onRemoveFromCompare: (carId: number) => void;
}

const CarListItem = ({
  car,
  isFavorited = false,
  isCompared = false,
  onAddToCompare,
  onRemoveFromCompare,
}: CarListItemProps) => {
  const { t } = useTranslation();
  const language = i18n.language;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setIsFavorited] = useState(isFavorited);
  const [authModal, setAuthModal] = useState<
    "login" | "register" | "forget-password" | null
  >(null);
  const navigate = useNavigate();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const title = language === "ar" && car?.titleAr ? car?.titleAr : car?.title;

  // Message form
  const messageForm = useForm<MessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

 
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
      receiver_id: car!.seller.id,
      sender_id: user?.id,
      listing_id: parseInt(car?.id),
      content: values.message,
      type:"web",
      title: "Message From Website",
      status: "sent",
      sent_at: new Date().toISOString(),
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

  const { data: makes = [] } = useQuery<CarMake[]>({
    queryKey: ["/api/car-makes"],
  });

  const carMake = makes.find((c) => c.id === car.make_id)?.name || "";

  const { data: models = [] } = useQuery<CarModel[]>({
    queryKey: ["car-models", car?.make_id],
    queryFn: () => fetchModelsByMake(car?.make_id),
    enabled: !!car?.make_id,
  });

  const carModel = models.find((m) => m.id === car.model_id)?.name || "";

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
          listingId: parseInt(car?.id),
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
        new Date(car?.warranty_expiry),
        "dd MMM yyyy"
      )}`
    : "Warranty expired";

  console.log("Car data", car);

  const imageUrl = car?.images?.[0]?.trim() || null;

    
  return (
    <>
      <Card
        className={`flex flex-col md:flex-row w-full max-w-full overflow-hidden rounded-2xl shadow-sm border ${
          car?.is_featured ? "border-2 border-orange-500 border-solid" : ""
        }`}
      >
        <Link href={`/cars/${car.id}`}>
          <div className="relative w-full md:w-[400px] h-[294px] md:h-auto max-h-[300px] flex-shrink-0 bg-slate-200 flex items-center justify-center">
            {car?.images && car?.images?.length > 0 ? (
              <>
                <div 
                  className={`h-[294px] w-[400px] bg-center bg-cover group-hover:scale-105 transition-transform duration-300 ${
                    car?.status === "sold" ? "opacity-50" : ""
                  }`}
                  style={{
                    backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}>
                </div>

                {/* SOLD STAMP */}
                {car.status === "sold" && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-red-500 text-xl font-extrabold border-red-500 border-2 px-6 py-2 shadow-lg transform rotate-[-10deg] opacity-90">
                      SOLD
                    </div>
                  </div>
                )}

                {/* NEW RIBBON */}
                {car.condition === "new" && (
                  <div className="absolute top-5 left-[-40px] -rotate-45 bg-red-700 text-white font-black px-20 py-1 text-lg shadow-lg z-10">
                    NEW
                  </div>
                )}

                {/* LOW MILEAGE RIBBON */}
                {(() => {
                  const currentYear = new Date().getFullYear();
                  const carYear = parseInt(car?.year);
                  const yearsOwned = Math.max(currentYear - carYear + 1, 1); // Prevent division by zero
                  const avgMileagePerYear = car?.mileage / yearsOwned;
                  const condition = car?.condition.toLowerCase();

                  if (condition === "used" && avgMileagePerYear < 25000) {
                    return (
                      <div className="absolute top-7 left-[-80px] -rotate-45 bg-green-500 text-white font-black px-20 py-1 text-sm shadow-lg z-10">
                        LOW MILEAGE
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* 360 Overlay */}
                {car?.image360 && (
                  <div className="absolute bottom-2 left-2 z-10">
                    <img
                      src="/src/assets/360-listing.png"
                      alt="360 Available"
                      className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="relative h-full w-full bg-slate-200 flex items-center justify-center">
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

        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-[4fr_1fr] gap-4">
            {/* LEFT COLUMN: Car Details */}

            <div className="flex-1 p-4 flex flex-col justify-between">
              <Link href={`/cars/${car?.id}`}>
                <h3 className="text-base font-extrabold uppercase text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
                  {title}
                </h3>
              </Link>

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
                    {calculateMonthlyPayment(car.price).toLocaleString(
                      "en-US",
                      {
                        maximumFractionDigits: 0,
                      }
                    )}
                    /Month
                  </>
                ) : (
                  "N/A"
                )}
              </div>

              <div className="flex justify-between mt-4 text-xs max-w-[250px] text-slate-700">
                <div className="flex items-center gap-1">
                  <img src="/src/assets/car-calendar.png" className="w-4 h-4" />
                  <span>{car?.year || "2021"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <img
                    src="/src/assets/car-cylinders.png"
                    className="w-4 h-4"
                  />
                  <span>{car?.cylinder_count || "4 Cylinder"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <img src="/src/assets/car-mileage.png" className="w-4 h-4" />
                  <span>
                    {car?.mileage != null
                      ? Number(car.mileage).toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })
                      : "0"}{" "}
                    KM
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                {car?.has_warranty && (
                  <div className="flex items-center gap-1">
                    <img
                      src="/src/assets/car-warranty.png"
                      className="w-4 h-4"
                      title={warrantyExpiryText}
                    />
                    <span className="text-blue-900 text-sm">Warranty</span>
                  </div>
                )}

                {car?.is_inspected && (
                  <div className="flex items-center gap-1">
                    <img
                      src="/src/assets/car-inspected.png"
                      className="w-4 h-4"
                    />
                    <span className="text-red-500 text-sm">Inspected</span>
                  </div>
                )}
              </div>

              <div className="text-blue-900 text-xs mt-4">
                Do you have a similar{" "}
                <span
                  onClick={() =>
                    navigate(
                      `/browse?make=${car?.make_id}&model=${car?.model_id}`
                    )
                  }
                  className="font-semibold underline cursor-pointer hover:text-blue-700"
                >
                  {carMake} {carModel}
                </span>{" "}
                to sell? Sell it yourself!
              </div>
            </div>

            {/* RIGHT COLUMN: Buttons */}
            <div className="flex flex-col gap-2 md:w-40 p-4 items-end justify-start">
              <Button
                size="sm"
                className="w-full rounded-full bg-blue-900 text-white flex items-center justify-center gap-2"
                onClick={() =>
                  handleCall(car?.showroom?.phone || seller?.phone)
                }
              >
                <Phone size={16} />
                {t("common.call")}
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
                {t("common.chat")}
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

              <div className="flex py-1 px-4 border-2 border-blue-900 mt-4 items-center space-x-2 cursor-pointer">
                <span className="text-sm font-semibold text-blue-900">
                  <Link href="/compare">{t("common.addCompare")}</Link>
                </span>
                <input
                  type="checkbox"
                  checked={isCompared}
                  onChange={() => {
                    if (isCompared) {
                      onRemoveFromCompare(car.id);
                    } else {
                      onAddToCompare(car);
                    }
                  }}
                  className="h-4 w-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div className="text-neutral-600 font-medium text-sm">
                  {car?.created_at ? formatTimeAgo(car?.created_at) : "Just now"}
                </div>

                {car?.showroom_name && car?.showroom_logo && (
                  <Link href={`/showrooms/${car?.showroom_id}`}>
                    <img
                      src={car.showroom_logo}
                      alt={car.showroom_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardContent>
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
                  {car?.currency || "QR"} {car?.price.toLocaleString()}
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

export default CarListItem;
