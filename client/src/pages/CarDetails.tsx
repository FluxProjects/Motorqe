import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import i18n from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart,
  Share,
  Flag,
  MapPin,
  MessageSquare,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Phone,
  MessageCircle,
  Navigation,
  Clock,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AuthForms } from "@/components/forms/AuthForm/AuthForms";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CarListing,
  CarMake,
  CarModel,
  CarCategory,
  User,
  CarFeature,
  CarEngineCapacity,
  Showroom,
} from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CarLoanCalculator from "@/components/car/CarLoanCalcuator";
import { SimilarCars } from "@/components/car/SimilarCars";
import { formatAvailability, getEngineSizeLabel, isOpenNow } from "@/lib/utils";
import { CarImages } from "@/components/car/CarImages";
import { CarListingDetail } from "@/components/car/CarListingDetail";
import { navigate } from "wouter/use-browser-location";
import ShareModal from "@/components/layout/ShareModal";

// Message form schema
const messageSchema = z.object({
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message cannot exceed 500 characters"),
});

type MessageValues = z.infer<typeof messageSchema>;

// Report form schema
const reportSchema = z.object({
  reason: z.string().min(1, "Please select a reason"),
  details: z
    .string()
    .min(10, "Details must be at least 10 characters")
    .max(500, "Details cannot exceed 500 characters"),
});

type ReportValues = z.infer<typeof reportSchema>;

type CarListingWithShowroom = CarListing & {
  showroom?: Showroom; // optional if it’s not always present
};

const CarDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const language = i18n.language;
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [authModal, setAuthModal] = useState<
    "login" | "register" | "forget-password" | null
  >(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  // Message form
  const messageForm = useForm<MessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  // Report form
  const reportForm = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: "",
      details: "",
    },
  });

  // Fetch car details
  const {
    data: car,
    isLoading: isLoadingCar,
    isError: isErrorCar,
  } = useQuery<CarListingWithShowroom>({
    queryKey: [`/api/car-listings/${id}`],
  });

  // Fetch car listing features
  const { data: listingFeatures = [], isLoading: isLoadingCarFeature } =
    useQuery<CarFeature[]>({
      queryKey: [`/api/car-listings/${id}/features`],
      enabled: !!id,
      queryFn: async () => {
        if (!id) {
          console.warn("⚠️ No ID provided for fetching listing features");
          return [];
        }

        const url = `/api/car-listings/${id}/features`;
        console.log(`🌐 Sending GET request to: ${url}`);

        const res = await fetch(url);

        console.log("📥 Response status:", res.status);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("❌ Failed to fetch listing features:", errorData);
          throw new Error(
            errorData.message || "Failed to fetch listing features"
          );
        }

        const json = await res.json();
        console.log("✅ Listing features fetched successfully:", json);
        return json;
      },
    });

  console.log("user data in car detail", user);

  if (user) {
    const { data: favoriteData } = useQuery<any>({
      queryKey: ["check-favorite", { listingId: id, userId: user?.id }],
      queryFn: async () => {
        const res = await fetch("/api/favorites/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ listingId: id, userId: user?.id }),
        });
        return res.json();
      },
      enabled: !!user?.id,
    });

    useEffect(() => {
      if (favoriteData !== undefined) {
        setIsFavorited(favoriteData);
      }
    }, [favoriteData]);
  }

  const {
    data: sellerData,
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

  console.log("Query Status:", {
    isLoading,
    error,
    sellerData,
  });

  const { data: makes = [] } = useQuery<CarMake[]>({
    queryKey: ["/api/car-makes"],
  });

  // Fetch car categories for filter
  const { data: categories = [] } = useQuery<CarCategory[]>({
    queryKey: ["/api/car-categories"],
  });

  const { data: models } = useQuery<CarModel>({
    queryKey: ["/api/car-model", car?.model_id],
    queryFn: () =>
      fetch(`/api/car-model/${car?.model_id}`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch model");
        return res.json();
      }),
    enabled: !!car?.model_id,
  });

  const { data: carEngineCapacities = [] } = useQuery<CarEngineCapacity[]>({
    queryKey: ["/api/car-enginecapacities"], // Changed to a more standard key
  });

  const engineSizeLabel = getEngineSizeLabel(
    car?.engine_capacity_id,
    carEngineCapacities
  );



  const makeName =
    makes.find((m) => m.id === car?.make_id)?.name ?? "Unknown Make";
  const modelName = models?.name;
  console.log("Car", car);
  console.log("Model", models);
  const categoryName =
    categories.find((c) => c.id === car?.category_id)?.name ??
    "Unknown Category";

  const formatPrice = (price: number, currency = "USD") => {
    return new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      setAuthModal("login");
      return;
    }

    try {
      if (isFavorited) {
        await apiRequest("DELETE", "/api/favorites", {
          listingId: parseInt(id),
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

  const handleReportListing = (values: ReportValues) => {
    if (!isAuthenticated) {
      setReportDialogOpen(false);
      setAuthModal("login");
      return;
    }

    apiRequest("POST", "/api/reports", {
      carId: parseInt(id),
      reason: values.reason,
      details: values.details,
    })
      .then(() => {
        toast({
          title: "Report submitted",
          description:
            "Thank you for reporting this listing. Our team will review it.",
        });
        reportForm.reset();
        setReportDialogOpen(false);
      })
      .catch((error) => {
        toast({
          title: "Report failed",
          description:
            error.message || "There was a problem submitting your report",
          variant: "destructive",
        });
      });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLocationMap = (showroomAddress: string) => {
    const encodedAddress = encodeURIComponent(showroomAddress);
    window.open(`https://maps.google.com/?q=${encodedAddress}`, "_blank");
  };

  const handleGetDirection = (showroomAddress: string) => {
    const encodedAddress = encodeURIComponent(showroomAddress);
    window.open(
      `https://maps.google.com/maps/dir//${encodedAddress}`,
      "_blank"
    );
  };

  const handleBookTestDrive = (phone: string, carTitle: string) => {
    const message = `Hi, I would like to book a test drive for the ${carTitle}. Please let me know available times.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
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

  const handleSearchByUser = () => {
  // First try to get user_id from showroom, then from sellerData
  const userId = sellerData?.id;
  
  if (userId) {
    // Use URLSearchParams for proper URL encoding
    const params = new URLSearchParams();
    params.set('user_id', userId.toString());
    navigate(`/browse?${params.toString()}`);
  } else {
    console.error("No user ID available for filtering");
    // Optionally show a toast notification
    toast({
      title: "Error",
      description: "Could not filter by this user",
      variant: "destructive"
    });
  }
};

  if (isLoadingCar) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-neutral-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (isErrorCar || !car) {
    return (
      <div className="min-h-screen bg-neutral-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            {t("common.error")}
          </h1>
          <p className="text-neutral-600 mb-6">{t("common.carNotFound")}</p>
          <Link href="/browse">
            <Button>
              <ArrowLeft className="mr-2" size={16} />
              {t("common.backToBrowse")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format and prepare car data
  const title = language === "ar" && car.titleAr ? car.titleAr : car.title;
  const description =
    language === "ar" && car.descriptionAr
      ? car.descriptionAr
      : car.description;

  return (
    <div className="bg-white-100 pb-16">
      <div className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button and actions */}
          <div className="flex justify-between items-center mb-6">
            <Link href="/browse">
              <Button
                variant="ghost"
                className="flex items-center text-blue-900"
              >
                <ArrowLeft size={16} className="mr-1" />
                {t("common.backToBrowse")}
              </Button>
            </Link>

            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Images (3/4 width on md and above) */}
            <div className="md:col-span-3">
              <CarImages images={car.images} title={car.title} />

              {/* Action Buttons */}
            <div className="flex justify-center items-center mb-8 mt-8 space-x-2">
              
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-blue-900 border-blue-500 hover:bg-blue-900 hover:text-white hover:border-blue-900"
                onClick={() => setIsShareOpen(true)}
              >
                <Share size={16} className="mr-1" />
                {t("common.share")}
              </Button>

              <ShareModal
                open={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                title={car.title}
                url={window.location.href}
              />


              <Button
                variant="outline"
                size="sm"
                className={
                  isFavorited
                    ? "rounded-full hover:text-orange-600 hover:border-orange-600 bg-orange-600 text-white"
                    : "rounded-full text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
                }
                onClick={handleFavoriteToggle}
              >
                <Heart
                  className="w-4 h-4"
                  fill={isFavorited ? "currentColor" : "none"}
                />
                {isFavorited
                  ? t("common.removeFromFavorites")
                  : t("common.addToFavorites")}
              </Button>

              <Button
                variant="default"
                size="sm"
                className="rounded-full bg-red-500 hover:bg-black"
                onClick={() => setReportDialogOpen(true)}
              >
                <Flag size={16} className="mr-1" />
                {t("common.report")}
              </Button>
            </div>

              <CarListingDetail
                vehicleDescription={car?.description ?? "No Description Available"}
                vehicleDescriptionAr={car?.descriptionAr ?? "لا يوجد وصف متاح"}
                inspectionReportUrl={
                  car?.is_inspected ? car?.inspectionReport ?? undefined : undefined
                }
              />

              {/* Safety Features */}
              <div className="mb-4 bg-gray-50 rounded-lg p-4">
                {isLoadingCarFeature ? (
                  <p>{t("common.loading")}</p>
                ) : listingFeatures.length === 0 ? (
                  <p>{t("car.noFeatures")}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {listingFeatures.map((feature) => (
                      <div key={feature.id} className="flex items-center">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-800 font-medium">
                          {language === "ar" && feature?.nameAr
                            ? feature.nameAr
                            : feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Map */}
              <div className="mb-4">
                <div className="bg-gray-200 rounded-lg h-80 relative overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57912.294236227725!2d51.441241299999996!3d25.276987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e45c534ffdce87f%3A0x44d2e5e5d107b7a7!2sDoha%2C%20Qatar!5e0!3m2!1sen!2sus!4v1694789123456!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Car Summary (1/4 width on md and above) */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg p-4 shadow-sm border top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {car.title}
                </h2>
                <div className="text-sm text-gray-600 mb-4">
                  {car.year} • {categoryName} • {car.fuel_type}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="text-3xl font-bold text-blue-900">
                    {car.currency || "QR"}{" "}
                    {car.price != null
                      ? Number(car.price).toLocaleString("en-US", { maximumFractionDigits: 0 })
                      : "0"}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                   <div className="flex justify-between">
                    <span className="text-gray-600">Type of Ad:</span>
                    <span className="font-medium">
                      {car.listing_type === "sale"
                        ? "For Sale"
                        : car.listing_type === "exchange"
                        ? "For Exchange"
                        : car.listing_type === "both"
                        ? "Sale & Exchange"
                        : "For Sale"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Make:</span>
                    <span className="font-medium">{makeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-medium">{modelName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium">{car.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Car Type:</span>
                    <span className="font-medium">{categoryName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mileage:</span>
                    <span className="font-medium">
                      {car.mileage != null
                      ? Number(car.mileage).toLocaleString("en-US", { maximumFractionDigits: 0 })
                      : "0"} Kms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-medium">{car.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Engine Size:</span>
                    <span className="font-medium">{engineSizeLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cylinders:</span>
                    <span className="font-medium">{car.cylinder_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transmission:</span>
                    <span className="font-medium">{car.transmission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exterior Colour:</span>
                    <span className="font-medium">{car.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interior Colour:</span>
                    <span className="font-medium">{car.interior_color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tinted:</span>
                    <span className="font-medium">
                      {car.tinted ? t("common.yes") : t("common.no")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fuel Type:</span>
                    <span className="font-medium">{car.fuel_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Owner Type:</span>
                    <span className="font-medium">{car.owner_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Warranty Date:</span>
                    <span className="font-medium">
                      {car.warranty_date || "25-06-2026"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insurance Type:</span>
                    <span className="font-medium">
                      {car.insurance_type || "Fully Insured"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-xs">Post Date:</span>
                    <span className="font-xs">
                      {new Date(car?.created_at).toDateString()}
                    </span>
                  </div>

                </div>
              </div>

              {/* Seller info card */}
              {(!!car.showroom || !!sellerData) && (
                <div className="bg-white rounded-lg p-4 mt-4 shadow-sm border mb-4">
                  <h4 className="font-semibold mb-4">Posted by:</h4>
                  <div className="flex flex-col items-center text-center mb-4">
                    {car.showroom ? (
                      <>
                        <img
                          src={car.showroom.logo || "/fallback-avatar.png"}
                          alt={car.showroom.name}
                          className="w-16 h-16 rounded-lg object-cover mb-3"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/fallback-avatar.png";
                          }}
                        />
                        <div className="text-sm font-semibold">
                          {car.showroom.name}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-3">
                          <div>
                            <div className="text-xs">
                              {sellerData?.first_name}
                            </div>
                            <div className="text-xs">
                              {sellerData?.last_name}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold">
                          {sellerData?.first_name} {sellerData?.last_name}
                        </div>
                      </>
                    )}
                  </div>

                  
                  <div className="text-center mb-4">
                    <div 
                    className="text-orange-500 hover:underline cursor-pointer text-sm"
                    onClick={handleSearchByUser}
                    >
                      See all Cars Listed from{" "}
                      {car?.showroom
                        ? car?.showroom.name
                        : `${sellerData?.first_name} ${sellerData?.last_name}`}
                    </div>
                  </div>

                  {(car?.showroom?.address || car?.showroom?.addressAr) && (
                    <div className="flex space-x-2 mb-4">
                      <Button
                        size="xs"
                        variant="outline"
                        className="pt-2 pb-2 flex-1 rounded-full bg-orange-500 text-white"
                        onClick={() =>
                          handleLocationMap(
                            car?.showroom?.address || car?.showroom?.addressAr
                          )
                        }
                      >
                        <MapPin className="h-3 w-3 mr-1" /> Location Map
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="pt-2 pb-2 flex-1 rounded-full bg-orange-500 text-white"
                        onClick={() =>
                          handleGetDirection(
                            car?.showroom?.address || car?.showroom?.addressAr
                          )
                        }
                      >
                        <Navigation className="h-3 w-3 mr-1" /> Get Direction
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    {car?.showroom?.address || car?.showroom?.addressAr ? (
                      <div>
                        <span className="text-gray-600">Street:</span>{" "}
                        {car.showroom.address || car.showroom.addressAr}
                      </div>
                    ) : null}

                    {car?.location ? (
                      <div>
                        <span className="text-gray-600">City:</span>{" "}
                        {car?.location}
                      </div>
                    ) : null}
                  </div>

                  {car?.showroom?.timing && (
                    <div className="mt-4 p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm">
                            Timings (24h format) •{" "}
                            <span
                              className={
                                isOpenNow(car?.showroom.timing)
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {isOpenNow(car?.showroom.timing)
                                ? "Open now"
                                : "Closed now"}
                            </span>
                          </span>
                        </div>
                        <span className="text-xs text-green-600">▼</span>
                      </div>

                      <div className="space-y-1 text-xs">
                        {(() => {
                          try {
                            const availability =
                              typeof car?.showroom?.timing === "string"
                                ? JSON.parse(car?.showroom?.timing)
                                : car?.showroom?.timing;
                            console.log("showroom availability", availability);
                            return (
                              formatAvailability(availability) ||
                              t("services.unknownAvailability")
                            );
                          } catch (e) {
                            return t("services.unknownAvailability");
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  <Button
                    className="mt-4 w-full bg-orange-500 text-white hover:bg-orange-600 text-sm"
                    onClick={() =>
                      handleBookTestDrive(
                        car?.showroom?.phone ?? sellerData?.phone,
                        car.title
                      )
                    }
                  >
                    Book a test drive
                  </Button>

                  <div className="mt-4 space-y-2">
                    <Button
                      size="sm"
                      className="w-full bg-blue-900 text-white flex items-center justify-center gap-2"
                      onClick={() =>
                        handleCall(car?.showroom?.phone || sellerData?.phone)
                      }
                    >
                      <Phone size={16} />
                      {car?.showroom?.phone || sellerData?.phone}
                    </Button>

                    <Button
                      size="sm"
                      className="w-full bg-green-500 text-white flex items-center justify-center gap-2"
                      onClick={() =>
                        handleWhatsApp(
                          car?.showroom?.phone ?? sellerData?.phone,
                          car.title
                        )
                      }
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loan Calculator */}
        <CarLoanCalculator vehiclePrice={car.price} />

        {/* Similar Cars */}
        <SimilarCars vehicleId={car.id} />
      </div>

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
                  {car.currency || 'QR'} {car.price.toLocaleString()}
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

      {/* Report Listing Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("common.reportListing")}</DialogTitle>
            <DialogDescription>
              {t("common.reportListingDesc")}
            </DialogDescription>
          </DialogHeader>

          <Form {...reportForm}>
            <form
              onSubmit={reportForm.handleSubmit(handleReportListing)}
              className="space-y-4"
            >
              <div className="bg-neutral-50 p-3 rounded-md text-sm mb-4">
                <p className="font-medium">
                  {t("common.reporting")}: {title}
                </p>
              </div>

              <FormField
                control={reportForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("common.selectReason")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fake">
                          Fake Ad
                        </SelectItem>
                        <SelectItem value="sold">
                          Car is Sold
                        </SelectItem>
                        <SelectItem value="wrongprice">
                          Inaccurate Price
                        </SelectItem>
                        <SelectItem value="misrepresentation">
                          Seller is unreachable
                        </SelectItem>
                        <SelectItem value="wrongimage">
                          Car images are incorrect
                        </SelectItem>
                         <SelectItem value="misleading">
                          Misleading Ad
                        </SelectItem>
                        <SelectItem value="wrongspecs">
                          Car Specifications does not match
                        </SelectItem>
                         <SelectItem value="other">
                          {t("common.reportReasonOther")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={reportForm.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={t("common.reportDetails")}
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" variant="destructive" className="w-full">
                  {reportForm.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Flag size={16} className="mr-1" />
                  )}
                  {t("common.submitReport")}
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
    </div>
  );
};

export default CarDetails;
