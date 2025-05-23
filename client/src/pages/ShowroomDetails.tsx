import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import i18n from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  MessageSquare,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Check,
  Wrench,
  Clock,
  Car,
  Phone,
  ChevronRight,
  Navigation,
  MessageCircle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Types for our data
interface Showroom {
  id: number;
  userId: number;
  name: string;
  nameAr: string;
  isMainBranch: boolean;
  parentId: number | null;
  address: string;
  addressAr: string;
  location: string;
  phone: string;
  logo: string;
  description?: string;
  descriptionAr?: string;
}

interface ShowroomService {
  id: number;
  showroomId: number;
  serviceId: number;
  price: number;
  currency: string;
  description: string;
  descriptionAr: string;
  isFeatured: boolean;
  service: {
    id: number;
    name: string;
    nameAr: string;
    image: string;
  };
}

interface ShowroomMake {
  id: number;
  showroomId: number;
  makeId: number;
  make: {
    id: number;
    name: string;
    nameAr: string;
  };
}

// Booking form schema
const bookingSchema = z.object({
  serviceId: z.number().min(1, "Service is required"),
  date: z.date({
    required_error: "A date is required.",
  }),
  time: z.string().min(1, "Time is required"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

type BookingValues = z.infer<typeof bookingSchema>;

// Message form schema
const messageSchema = z.object({
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message cannot exceed 500 characters"),
});

type MessageValues = z.infer<typeof messageSchema>;

const ShowroomDetails = () => {
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
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedService, setSelectedService] =
    useState<ShowroomService | null>(null);
  const [selectedTab, setSelectedTab] = useState("services");

  // Booking form
  const bookingForm = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: 0,
      date: new Date(),
      time: "",
      notes: "",
    },
  });

  // Message form
  const messageForm = useForm<MessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  // Fetch showroom details
  const {
    data: showroom,
    isLoading: isLoadingShowroom,
    isError: isErrorShowroom,
  } = useQuery<Showroom>({
    queryKey: [`/api/showrooms/${id}`],
  });

  // Fetch showroom services
  const { data: services = [], isLoading: isLoadingServices } = useQuery<
    ShowroomService[]
  >({
    queryKey: [`/api/showrooms/${id}/services`],
    enabled: !!id,
  });

  // Fetch showroom makes (brands they service)
  const { data: makes = [], isLoading: isLoadingMakes } = useQuery<
    ShowroomMake[]
  >({
    queryKey: [`/api/showrooms/${id}/makes`],
    enabled: !!id,
  });

  // Fetch showroom car listings
  const { data: carListings = [], isLoading: isLoadingCarListings } = useQuery<
    any[]
  >({
    queryKey: [`/api/showrooms/${id}/cars`],
    enabled: !!id,
  });

  // Fetch favorite status if logged in
  const { data: favoriteData } = useQuery<any>({
    queryKey: ["/api/favorites/showrooms/check", id],
    enabled: isAuthenticated && !!id,
  });

  // Set favorite status when data is loaded
  useEffect(() => {
    if (favoriteData) {
      setIsFavorited(favoriteData.isFavorited);
    }
  }, [favoriteData]);

  // Set selected service when booking dialog opens
  useEffect(() => {
    if (bookingDialogOpen && selectedService) {
      bookingForm.setValue("serviceId", selectedService.id);
    }
  }, [bookingDialogOpen, selectedService]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      setAuthModal("login");
      return;
    }

    try {
      if (isFavorited) {
        await apiRequest("DELETE", `/api/favorites/showrooms/${id}`, {});
        setIsFavorited(false);
        toast({
          title: t("showroom.removedFromFavorites"),
          description: t("showroom.removedFromFavoritesDesc"),
        });
      } else {
        await apiRequest("POST", "/api/favorites/showrooms", {
          showroomId: parseInt(id),
        });
        setIsFavorited(true);
        toast({
          title: t("showroom.addedToFavorites"),
          description: t("showroom.addedToFavoritesDesc"),
        });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("showroom.favoriteError"),
        variant: "destructive",
      });
    }
  };

  const handleContactShowroom = (values: MessageValues) => {
    if (!isAuthenticated) {
      setContactDialogOpen(false);
      setAuthModal("login");
      return;
    }

    apiRequest("POST", "/api/messages", {
      receiverId: showroom!.userId,
      showroomId: parseInt(id),
      content: values.message,
    })
      .then(() => {
        toast({
          title: t("common.messageSent"),
          description: t("showroom.messageSentDesc"),
        });
        messageForm.reset();
        setContactDialogOpen(false);
      })
      .catch((error) => {
        toast({
          title: t("common.error"),
          description: error.message || t("showroom.messageError"),
          variant: "destructive",
        });
      });
  };

  const handleBookService = (values: BookingValues) => {
    if (!isAuthenticated) {
      setBookingDialogOpen(false);
      setAuthModal("login");
      return;
    }

    apiRequest("POST", "/api/service-bookings", {
      userId: user?.id,
      serviceId: values.serviceId,
      scheduledAt: new Date(
        `${format(values.date, "yyyy-MM-dd")}T${values.time}`
      ).toISOString(),
      status: "pending",
      notes: values.notes,
    })
      .then(() => {
        toast({
          title: t("showroom.bookingSuccess"),
          description: t("showroom.bookingSuccessDesc"),
        });
        bookingForm.reset();
        setBookingDialogOpen(false);
        setSelectedService(null);
      })
      .catch((error) => {
        toast({
          title: t("common.error"),
          description: error.message || t("showroom.bookingError"),
          variant: "destructive",
        });
      });
  };

  const formatPrice = (price: number, currency = "QAR") => {
    return new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };



  if (isLoadingShowroom) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-neutral-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (isErrorShowroom || !showroom) {
    return (
      <div className="min-h-screen bg-neutral-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            {t("common.error")}
          </h1>
          <p className="text-neutral-600 mb-6">{t("showroom.notFound")}</p>
          <Link href="/browse-showrooms">
            <Button variant="ghost" className="flex items-center text-blue-900">
              <ArrowLeft className="mr-2" size={16} />
              {t("showroom.backToShowrooms")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format and prepare showroom data
  const name =
    language === "ar" && showroom.nameAr ? showroom.nameAr : showroom.name;
  const address =
    language === "ar" && showroom.addressAr
      ? showroom.addressAr
      : showroom.address;
  const description =
    language === "ar" && showroom?.descriptionAr
      ? showroom?.descriptionAr
      : showroom?.description;

  return (
    <div className="bg-white pb-16">
      {/* Hero section with showroom images */}
      <div className="bg-white py-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button and actions */}
          <div className="flex justify-between items-center mb-6">
            <Link href="/browse-showrooms">
              <Button
                variant="ghost"
                className="flex items-center text-blue-900"
              >
                <ArrowLeft size={16} className="mr-1" />
                {t("showroom.backToShowrooms")}
              </Button>
            </Link>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={
                  isFavorited
                    ? "rounded-full hover:text-red-500 hover:border-red-500 bg-red-500 text-white"
                    : "rounded-full text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
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
                        title: showroom.name,
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

          {/* Showroom header */}
          <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-lg">
              <AvatarImage src={showroom.logo} alt={name} />
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
                    {name}{" "}
                    {showroom.is_main_branch && (
                      <Badge className="ml-3 bg-orange-500">
                        {t("showroom.mainBranch")}
                      </Badge>
                    )}
                  </h1>

                  {/* Makes they service */}
                  {makes.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-neutral-500 mb-2">
                        {t("showroom.specializesIn")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {makes.map((make) => (
                          <div
                            key={make.id}
                            className="flex items-center gap-2 border rounded-full px-3 py-1 text-sm text-neutral-700 bg-white shadow-sm"
                          >
                            {make.make?.image && (
                              <img
                                src={make.make.image}
                                alt={make.make?.name}
                                className="w-5 h-5 object-contain"
                              />
                            )}
                            <span>
                              {language === "ar" && make.make?.nameAr
                                ? make.make.nameAr
                                : make.make?.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                <div className="flex flex-col items-end w-[250px]">
                  {showroom.phone && (
                    <a href={`tel:${showroom.phone}`} className="w-full">
                      <Button className="mt-2 w-full rounded-full bg-blue-900 text-white">
                        <Phone size={16} className="mr-1" />
                        {t("showroom.callShowroom")}
                      </Button>
                    </a>
                  )}
                  <Button
                    className="mt-2 w-full rounded-full bg-orange-500"
                    onClick={() => setContactDialogOpen(true)}
                  >
                    <MessageSquare size={16} className="mr-1" />
                    {t("showroom.messageShowroom")}
                  </Button>
                  {showroom.phone && (
                    <a
                      href={`https://wa.me/${showroom.phone.replace(/\D/g, "")}`}
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

          {/* Showroom banner image carousel */}
          {showroom.logo && (
            <Carousel className="w-full mb-8">
              <CarouselContent>
                <CarouselItem>
                  <div className="aspect-[16/4] rounded-lg overflow-hidden">
                    <img
                      src={showroom.logo}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          )}
        </div>
      </div>

      {/* Content section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Showroom details tabs */}
            <Card className="border-transparent shadow-none">
              <CardContent className="p-0">
                <Tabs 
                value={selectedTab}
                onValueChange={setSelectedTab}
                defaultValue="services" 
                className="w-full">
                  <TabsList className="flex flex-wrap justify-center gap-3 bg-transparent p-0">
                    <TabsTrigger 
                    value="services"
                    className={`px-5 py-2 text-sm font-medium transition-all ${
                    selectedTab === "services"
                      ? "text-orange-500 border-b-4 border-b-orange-500 hover:font-bold"
                      : "text-blue-900"
                  }`}
                    >
                      {t("showroom.services")}
                    </TabsTrigger>
                    <TabsTrigger value="inventory"
                    className={`px-5 py-2 text-sm font-medium transition-all ${
                    selectedTab === "inventory"
                      ? "text-orange-500 border-b-4 border-b-orange-500 hover:font-bold"
                      : "text-blue-900"
                  }`}
                    >
                      {t("showroom.listings")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="services" className="p-6">
                    {isLoadingServices ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      </div>
                    ) : services.length > 0 ? (
                      <div className="space-y-6">
                        {services.map((service) => (
                          <Card
                            key={service.id}
                            className="rounded-2xl border-2 border-blue-900"
                          >
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center gap-6">
                                {service?.image && (
                                  <div className="w-24 h-24 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden">
                                    <img
                                      src={service.image}
                                      alt={
                                        language === "ar" && service.nameAr
                                          ? service.nameAr
                                          : service.name
                                      }
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}

                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-semibold">
                                      {language === "ar" && service.nameAr
                                        ? service.nameAr
                                        : service.name}
                                    </h3>
                                    <span className="text-lg font-bold text-primary">
                                      {formatPrice(
                                        service.price,
                                        service.currency
                                      )}
                                    </span>
                                  </div>

                                  <p className="text-neutral-600 mt-2">
                                    {language === "ar" && service?.descriptionAr
                                      ? service?.descriptionAr
                                      : service?.description ||
                                        t("showroom.noServiceDescription")}
                                  </p>

                                  <div className="mt-4 flex justify-end">
                                    <Button
                                      size="sm"
                                      className="rounded-full bg-orange-500 hover:bg-orange-700"
                                      onClick={() => {
                                        setSelectedService(service);
                                        setBookingDialogOpen(true);
                                      }}
                                    >
                                      <Wrench size={16} className="mr-1" />
                                      {t("showroom.bookService")}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        {t("showroom.noServices")}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="inventory" className="p-6">
                    {isLoadingCarListings ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      </div>
                    ) : carListings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {carListings.map((car) => (
                          <CarCard key={car.id} car={car} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        {t("showroom.noInventory")}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            {/* Showroom card */}
            <Card className="sticky bg-neutral-50 rounded-2xl border-orange-500 border-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {t("showroom.about")} {showroom.name || showroom.nameAr}
                </CardTitle>
                <div className="max-w-none">
                  <p>{showroom.description}</p>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0">
                
              <Separator className="my-4" />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      {t("showroom.businessHours")}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">
                          {t("showroom.weekdays")}
                        </span>
                        <span className="font-medium">8:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">
                          {t("showroom.friday")}
                        </span>
                        <span className="font-medium">8:00 AM - 12:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">
                          {t("showroom.saturday")}
                        </span>
                        <span className="font-medium">
                          {t("showroom.closed")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {showroom.address && (
                  <div className="mt-4">
                     <h3 className="text-lg font-semibold mb-4">
                      {t("showroom.businessAddress")}
                    </h3>
                    <p className="text-sm text-gray-700">{showroom.address}</p>

                    {/* Location & Directions Buttons */}
                    <div className="mt-4 flex justify-center gap-2 items-center">
                      {showroom.location &&
                        (() => {
                          const [lat, lng] = showroom.location
                            .split(",")
                            .map(Number);
                          const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

                          return (
                            <>
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center rounded-full bg-orange-500 text-white px-3 py-1 text-sm min-w-[120px]"
                              >
                                <MapPin size={16} className="mr-1" />
                                Location Map
                              </a>
                              <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center rounded-full bg-orange-500 text-white px-3 py-1 text-sm min-w-[120px]"
                              >
                                <Navigation size={16} className="mr-1" />
                                Get Directions
                              </a>
                            </>
                          );
                        })()}
                    </div>
                  </div>
                  
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Showroom Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("showroom.contactShowroom")}</DialogTitle>
            <DialogDescription>
              {t("showroom.contactShowroomDesc")}
            </DialogDescription>
          </DialogHeader>

          <Form {...messageForm}>
            <form
              onSubmit={messageForm.handleSubmit(handleContactShowroom)}
              className="space-y-4"
            >
              <div className="bg-neutral-50 p-3 rounded-md text-sm mb-4">
                <p className="font-medium">
                  {t("showroom.regarding")}: {name}
                </p>
              </div>

              <FormField
                control={messageForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={t("showroom.writeYourMessage")}
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
                  {t("showroom.sendMessage")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Book Service Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("showroom.bookService")}</DialogTitle>
            <DialogDescription>
              {selectedService && (
                <div className="mt-2">
                  <p className="font-medium">
                    {language === "ar" && selectedService.service?.nameAr
                      ? selectedService.service?.nameAr
                      : selectedService.service?.name}
                  </p>
                  <p className="text-primary font-medium">
                    {formatPrice(
                      selectedService?.price,
                      selectedService?.currency
                    )}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...bookingForm}>
            <form
              onSubmit={bookingForm.handleSubmit(handleBookService)}
              className="space-y-4"
            >
              <input type="hidden" {...bookingForm.register("serviceId")} />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={bookingForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>{t("showroom.selectDate")}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() ||
                              date >
                                new Date(
                                  new Date().setDate(new Date().getDate() + 30)
                                )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bookingForm.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("showroom.selectTime")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="08:00">8:00 AM</SelectItem>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="13:00">1:00 PM</SelectItem>
                          <SelectItem value="14:00">2:00 PM</SelectItem>
                          <SelectItem value="15:00">3:00 PM</SelectItem>
                          <SelectItem value="16:00">4:00 PM</SelectItem>
                          <SelectItem value="17:00">5:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={bookingForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={t("showroom.specialInstructions")}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" className="w-full">
                  {bookingForm.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Wrench size={16} className="mr-1" />
                  )}
                  {t("showroom.confirmBooking")}
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

export default ShowroomDetails;
