import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import i18n, { resources } from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Heart,
  Share,
  Flag,
  MapPin,
  Calendar,
  DollarSign,
  GaugeCircle,
  Globe,
  Fuel,
  Settings,
  MessageSquare,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Check,
  CircleDot,
  Wrench,
  Droplet,
  Phone,
  MessageCircle,
  Droplets,
  Sun,
  User2,
  Activity,
  Gauge,
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
import CarCard from "@/components/car/CarCard";
import {
  CarListing,
  CarMake,
  CarModel,
  CarCategory,
  User,
  CarFeature,
  CarEngineCapacity,
} from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const CarDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const language = i18n.language;
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [authModal, setAuthModal] = useState<
    "login" | "register" | "forget-password" | null
  >(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("description");

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
  } = useQuery<CarListing>({
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

  // Fetch favorite status if logged in
  const { data: favoriteData } = useQuery<any>({
    queryKey: ["/api/favorites/check", id],
    enabled: isAuthenticated && !!id,
  });

  // Fetch similar cars
  const { data: similarCars = [] } = useQuery<CarListing[]>({
    queryKey: ["/api/cars/similar", id],
    enabled: !!car,
  });

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

  const engineSizeLabel =
  carEngineCapacities.find((e) => e.id === car?.engine_capacity_id)?.size_liters ?? "Unknown";



  console.log("carEngineCapacities", carEngineCapacities);
  console.log("car?.engine_capacity_id", car?.engine_capacity_id);

  console.log("listingFeatures", listingFeatures);

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

  // Set favorite status when data is loaded
  useEffect(() => {
    if (favoriteData) {
      setIsFavorited(favoriteData.isFavorited);
    }
  }, [favoriteData]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      setAuthModal("login");
      return;
    }

    try {
      if (isFavorited) {
        await apiRequest("DELETE", `/api/favorites/${id}`, {});
        setIsFavorited(false);
        toast({
          title: "Removed from favorites",
          description: "Car has been removed from your favorites",
        });
      } else {
        await apiRequest("POST", "/api/favorites", { carId: parseInt(id) });
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

            <div className="flex items-center space-x-2">
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
                variant="outline"
                size="sm"
                className="rounded-full text-blue-900 border-blue-500 hover:bg-blue-900 hover:text-white hover:border-blue-900"
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title: car.title,
                        url: window.location.href,
                      })
                      .catch((err) => console.error("Error sharing:", err));
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: t("common.linkCopied"),
                      description: t("common.linkCopiedDesc"),
                    });
                  }
                }}
              >
                <Share size={16} className="mr-1" />
                {t("common.share")}
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
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Carousel className="w-full">
                <CarouselContent>
                  {car.images?.map((image: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="aspect-[16/9] bg-neutral-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${car.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>

              {/* Thumbnails */}
              <div className="hidden md:grid grid-cols-5 gap-2 mt-2">
                {car.images?.slice(0, 5).map((image: string, index: number) => (
                  <div
                    key={index}
                    className="aspect-[16/9] bg-neutral-100 rounded-md overflow-hidden cursor-pointer"
                  >
                    <img
                      src={image}
                      alt={`${car.title} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Car summary */}
            <div className="bg-neutral-50 p-4 rounded-2xl border-2 py-6 border-orange-500">
              <h1 className="text-2xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
                {title}
                {car?.is_imported && (
                  <Badge variant="outline" className="text-sm px-2 py-0.5">
                    <Globe size={12} className="mr-1" />
                    {t("common.isImported")}
                  </Badge>
                )}
              </h1>

              <div className="flex items-center text-neutral-600 mb-4">
                <MapPin size={16} className="mr-1" />
                <span>{car.location}</span>
                <span className="mx-2">•</span>
                <Calendar size={16} className="mr-1" />
                <span>
                  {car.created_at
                    ? formatDate(car.created_at.toString())
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center mb-6">
                <DollarSign size={20} className="text-primary mr-1" />
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(car.price, car.currency ?? "QAR")}
                </span>
              </div>

              <Card className="mb-6">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {makeName}{" "}
                      <span className="text-muted-foreground font-medium">
                        {modelName}
                      </span>
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Category:{" "}
                      <span className="font-medium">{categoryName}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Mileage */}
                <div className="flex flex-col items-center bg-white p-3 rounded-md">
                  <GaugeCircle className="text-neutral-700 mb-1" size={20} />
                  <span className="text-sm font-medium">
                    {car.mileage.toLocaleString()} mi
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t("car.mileage")}
                  </span>
                </div>

                {/* Year of Manufacture */}
                <div className="flex flex-col items-center bg-white p-3 rounded-md">
                  <Calendar className="text-neutral-700 mb-1" size={20} />
                  <span className="text-sm font-medium">{car.year}</span>
                  <span className="text-xs text-neutral-500">
                    {t("car.year")}
                  </span>
                </div>

                {/* Fuel Type */}
                <div className="flex flex-col items-center bg-white p-3 rounded-md">
                  <Fuel className="text-neutral-700 mb-1" size={20} />
                  <span className="text-sm font-medium">
                    {t(
                      `car.${
                        car.fuel_type?.toLowerCase?.() || "unknownFuelType"
                      }`
                    )}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t("car.fuelType")}
                  </span>
                </div>

                {/* Transmission Type */}
                <div className="flex flex-col items-center bg-white p-3 rounded-md">
                  <Settings className="text-neutral-700 mb-1" size={20} />
                  <span className="text-sm font-medium">
                    {t(
                      `car.${
                        car.transmission?.toLowerCase?.() ||
                        "unknownTransmission"
                      }`
                    )}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t("car.transmission")}
                  </span>
                </div>

                {/* Engine Size */}
                <div className="flex flex-col items-center bg-white p-3 rounded-md">
                  <Gauge className="text-neutral-700 mb-1" size={20} />
                  <span className="text-sm font-medium">
                    {engineSizeLabel} L
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t("car.engineCapacity")}
                  </span>
                </div>

                {/* Cylinder Count */}
                <div className="flex flex-col items-center bg-white p-3 rounded-md">
                  <CircleDot className="text-neutral-700 mb-1" size={20} />
                  <span className="text-sm font-medium">
                    {car.cylinder_count}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t("car.cylinders")}
                  </span>
                </div>

                {/* Car Condition */}
                <div className="flex flex-col items-center bg-white p-3 rounded-md">
                  <Wrench className="text-neutral-700 mb-1" size={20} />
                  <span className="text-sm font-medium">
                    {t(
                      `car.${
                        car.condition?.toLowerCase?.() || "unknownCondition"
                      }`
                    )}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t("car.condition")}
                  </span>
                </div>

                {/* Exterior Color */}
                <div className="flex flex-col items-center bg-white p-3 rounded-md">
                  <Droplet className="text-neutral-700 mb-1" size={20} />
                  <span className="text-sm font-medium capitalize">
                    {car.color}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t("car.color")}
                  </span>
                </div>

                {/* Interior Color */}
                <div className="flex flex-col items-center bg-white p-3 rounded-md">
                  <Droplets className="text-neutral-700 mb-1" size={20} />
                  <span className="text-sm font-medium capitalize">
                    {car.interior_color}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t("car.interiorColor")}
                  </span>
                </div>

                {/* Tinted Windows */}
                <div className="flex flex-col items-center bg-white p-3 rounded-md">
                  <Sun className="text-neutral-700 mb-1" size={20} />
                  <span className="text-sm font-medium">
                    {car.tinted ? t("common.yes") : t("common.no")}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t("car.tinted")}
                  </span>
                </div>

                {/* Owner Type (e.g., Individual or Company) */}
                <div className="flex flex-col items-center bg-white p-3 rounded-md">
                  <User2 className="text-neutral-700 mb-1" size={20} />
                  <span className="text-sm font-medium capitalize">
                    {car.owner_type}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t("car.ownerType")}
                  </span>
                </div>
              </div>

              {sellerData && sellerData?.phone && (
                <a href={`tel:${sellerData?.phone}`} className="w-full">
                  <Button className="mt-2 w-full rounded-full bg-blue-900 text-white">
                    <Phone size={16} className="mr-1" />
                    {t("seller.callSeller")}
                  </Button>
                </a>
              )}
              <Button
                className="mt-2 w-full rounded-full bg-orange-500"
                onClick={() => setContactDialogOpen(true)}
              >
                <MessageSquare size={16} className="mr-1" />
                {t("seller.messageSeller")}
              </Button>
              {sellerData?.phone && (
                <a
                  href={`https://wa.me/${sellerData?.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="mt-2 w-full rounded-full bg-green-600 text-white hover:bg-green-700">
                    <MessageCircle size={16} className="mr-1" />
                    {t("showroom.chatOnWhatsApp")}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            {/* Car details tabs */}
            <Card className="border-transparent shadow-none">
              <CardContent className="p-0">
                <Tabs
                  value={selectedTab}
                  onValueChange={setSelectedTab}
                  defaultValue="description"
                  className="w-full"
                >
                  <TabsList className="flex flex-wrap justify-center gap-3 bg-transparent p-0">
                    <TabsTrigger
                      value="description"
                      className={`px-5 py-2 text-sm font-medium transition-all ${
                        selectedTab === "description"
                          ? "text-orange-500 border-b-4 border-b-orange-500 hover:font-bold"
                          : "text-blue-900"
                      }`}
                    >
                      {t("car.description")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="features"
                      className={`px-5 py-2 text-sm font-medium transition-all ${
                        selectedTab === "features"
                          ? "text-orange-500 border-b-4 border-b-orange-500 hover:font-bold"
                          : "text-blue-900"
                      }`}
                    >
                      {t("car.features")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="p-6">
                    <div className="prose max-w-none">
                      <p>{description}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="features" className="p-6">
                    {isLoadingCarFeature ? (
                      <p>{t("common.loading")}</p>
                    ) : listingFeatures.length === 0 ? (
                      <p>{t("car.noFeatures")}</p>
                    ) : (
                      <ul className="grid grid-cols-2 gap-4">
                        {listingFeatures?.map((feature) => (
                          <li
                            key={feature.id}
                            className="flex items-center gap-2"
                          >
                            <Check className="text-green-600" size={16} />
                            {language === "ar" && feature?.nameAr
                              ? feature?.nameAr
                              : feature?.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Similar cars */}
            {similarCars && similarCars?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">
                  {t("car.similarCars")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {similarCars.map((similarCar: any) => (
                    <CarCard key={similarCar.id} car={similarCar} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {/* Seller info card */}
            <Card className="bg-white p-4 rounded-2xl border-2 py-6 border-orange-500">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {t("common.sellerInfo")}
                </h2>
                <div className="flex items-center mb-4">
                  <Avatar className="h-16 w-16 mr-4">
                    <AvatarImage
                      src={sellerData?.avatar ?? undefined}
                      alt={sellerData?.username ?? ""}
                    />
                    <AvatarFallback>
                      {sellerData?.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-lg">
                      {sellerData?.username}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {t("common.memberSince")}{" "}
                      {sellerData?.created_at
                        ? new Date(sellerData.created_at).getFullYear()
                        : ""}
                    </p>
                    {sellerData?.is_email_verified && (
                      <Badge variant="outline" className="mt-1">
                        <Check size={12} className="mr-1" />{" "}
                        {t("common.verified")}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex flex-col space-y-2">
                  <div>
                    <span className="text-sm text-neutral-500">
                      {t("common.totalListings")}:
                    </span>
                    <span className="font-medium ml-2">
                      {sellerData?.listingCount || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">
                      {t("common.responseRate")}:
                    </span>
                    <span className="font-medium ml-2">
                      {sellerData?.responseRate || 0}%
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">
                      {t("common.avgResponseTime")}:
                    </span>
                    <span className="font-medium ml-2">
                      {sellerData?.responseTime || 0} {t("common.hours")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
                  ${car.price.toLocaleString()}
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
                        <SelectItem value="fraud">
                          {t("common.reportReasonFraud")}
                        </SelectItem>
                        <SelectItem value="inappropriate">
                          {t("common.reportReasonInappropriate")}
                        </SelectItem>
                        <SelectItem value="duplicate">
                          {t("common.reportReasonDuplicate")}
                        </SelectItem>
                        <SelectItem value="misrepresentation">
                          {t("common.reportReasonMisrepresentation")}
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