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
  Fuel,
  Settings,
  MessageSquare,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Check,
  Wrench,
  Droplet,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AuthForms } from "@/components/forms/AuthForms";
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
  Users,
  CarFeature,
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
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
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
  } = useQuery<CarListing>({
    queryKey: [`/api/car-listings/${id}`],
  });

  // Fetch car listing features
  const { data: listingFeatures = [], isLoading: isLoadingCarFeature } =
    useQuery<CarFeature[]>({
      queryKey: [`/api/car-listings/${id}/features`],
      enabled: !!id,
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
  } = useQuery<Users>({
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

  const { data: models = [] } = useQuery<CarModel[]>({
    queryKey: [`/api/car-models`, car?.make_id],
    enabled: !!car?.makeId,
  });

  console.log('listingFeatures', listingFeatures);

  const makeName =
    makes.find((m) => m.id === car?.make_id)?.name ?? "Unknown Make";
  const modelName =
    models.find((m) => m.id === car?.model_id)?.name ?? "Unknown Model";
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
    <div className="bg-neutral-100 pb-16">
      {/* Hero section with car images */}
      <div className="bg-white py-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button and actions */}
          <div className="flex justify-between items-center mb-6">
            <Link href="/browse">
              <Button
                variant="ghost"
                className="flex items-center text-neutral-600"
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
                    ? "text-secondary border-secondary hover:bg-secondary-light"
                    : ""
                }
                onClick={handleFavoriteToggle}
              >
                <Heart
                  className={`mr-1 ${isFavorited ? "fill-secondary" : ""}`}
                  size={16}
                />
                {isFavorited
                  ? t("common.removeFromFavorites")
                  : t("common.addToFavorites")}
              </Button>

              <Button
                variant="outline"
                size="sm"
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
                variant="outline"
                size="sm"
                onClick={() => setReportDialogOpen(true)}
              >
                <Flag size={16} className="mr-1" />
                {t("common.report")}
              </Button>
            </div>
          </div>

          {/* Car images carousel */}
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
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                {title}
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
                  <h2 className="text-xl font-semibold">
                    {makeName} {modelName}
                  </h2>
                  <p className="text-muted-foreground">{categoryName}</p>
                  <p className="text-primary font-bold">
                   
                  </p>
                  {/* Include more car fields if needed */}
                </CardContent>
              </Card>


              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col items-center bg-white p-3 rounded-md">
                  <GaugeCircle className="text-neutral-700 mb-1" size={20} />
                  <span className="text-sm font-medium">
                    {car.mileage.toLocaleString()} mi
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t("car.mileage")}
                  </span>
                </div>

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

                {/* Transmission */}
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

                {/* Condition */}
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

                {/* Color */}
                <div className="flex flex-col items-center bg-white p-3 rounded-md">
                  <Droplet className="text-neutral-700 mb-1" size={20} />
                  <span className="text-sm font-medium capitalize">
                    {car.color}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t("car.color")}
                  </span>
                </div>
              </div>

              <Button
                className="w-full mb-2"
                onClick={() => setContactDialogOpen(true)}
              >
                <MessageSquare size={16} className="mr-1" />
                {t("car.contactSeller")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Car details tabs */}
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 rounded-none">
                    <TabsTrigger value="description">
                      {t("car.description")}
                    </TabsTrigger>
                    <TabsTrigger value="features">
                      {t("car.features")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="p-6">
                    <div className="prose max-w-none">
                      <p>{description}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="features">
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
            <Card>
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

                <Button
                  className="w-full mt-4"
                  onClick={() => setContactDialogOpen(true)}
                >
                  <MessageSquare size={16} className="mr-1" />
                  {t("car.contactSeller")}
                </Button>
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
