import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Phone,
  ChevronLeft,
  Heart,
  Share,
  Flag,
  Navigation,
  MessageSquare,
  MessageCircle,
  Wrench,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CarMake, CarService, Showroom, ShowroomService } from "@shared/schema";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForms } from "@/components/forms/AuthForm/AuthForms";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { formatDate } from "date-fns";
import i18n from "@/lib/i18n";

interface ExtendedCarService extends CarService {
  description?: string;
  descriptionAr?: string;
}

interface ServiceDetailData {
  service: ExtendedCarService;
  showroom: Showroom;
  availability: string;
  makes: CarMake[];
  price: number;
  currency?: string;
  isFeatured: boolean;
  status?: boolean;
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



export default function ShowroomServiceDetails() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [authModal, setAuthModal] = useState<
    "login" | "register" | "forget-password" | null
  >(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedService, setSelectedService] =
    useState<ShowroomService | null>(null);
  const params = useParams();
  const serviceId = params.id;


  const { data, isLoading, error } = useQuery<ServiceDetailData>({
    queryKey: ["/api/showroom/services/", serviceId],
  });

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

  // Fetch favorite status if logged in
  const { data: favoriteData } = useQuery<any>({
    queryKey: ["/api/favorites/services/check", serviceId],
    enabled: isAuthenticated && !!serviceId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    toast({
      title: t("common.error"),
      description: t("services.failedToLoad"),
      variant: "destructive",
    });
    return (
      <div className="text-center py-12 text-neutral-500">
        {t("services.failedToLoad")}
      </div>
    );
  }

 const handleFavoriteToggle = async () => {
  if (!isAuthenticated) {
    setAuthModal("login");
    return;
  }

  try {
    if (isFavorited) {
      await apiRequest("DELETE", `/api/favorites/services/${serviceId}`, {});
      setIsFavorited(false);
      toast({
        title: t("showroom.removedFromFavorites"),
        description: t("showroom.removedFromFavoritesDesc"),
      });
    } else {
      await apiRequest("POST", "/api/favorites/services", {
        serviceId: parseInt(serviceId),
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
      showroonId: parseInt(id),
      scheduledAt: new Date(
        `${formatDate(values.date, "yyyy-MM-dd")}T${values.time}`
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

  const { service, showroom, makes, price, currency, description, isFeatured } =
    data;

  return (
    <div className="bg-white-100 pb-16">
      <div className="bg-white py-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <Link href="/browse-services">
              <Button
                variant="ghost"
                className="flex items-center text-blue-900"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t("common.backToServices")}
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Service Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">
                    {service?.name}
                    {isFeatured && (
                      <Badge className="ml-3 bg-blue-900">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {t("services.featured")}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="text-2xl font-bold text-primary">
                    {price} {currency}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3">
                    <Avatar className="h-40 w-40 rounded-lg mx-auto">
                      <AvatarImage src={service?.image} alt={service?.name} />
                      <AvatarFallback>{service?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="w-full md:w-2/3">
                    <h3 className="font-semibold mb-2">
                      {t("services.description")}
                    </h3>
                    <p className="text-neutral-600 mb-4">
                      {service?.description || t("services.noDescription")}
                    </p>

                    {makes && makes.length > 0 && (
                      <>
                        <h3 className="font-semibold mb-2">
                          {t("services.availableFor")}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {makes?.map((make) => (
                            <Badge key={make.id} variant="outline">
                              <Avatar className="h-5 w-5 mr-2">
                                <AvatarImage src={make.image} alt={make.name} />
                                <AvatarFallback>
                                  {make.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {make.name}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      className="rounded-full bg-orange-500 hover:bg-orange-700"
                      onClick={() => {
                        setSelectedService({
                          id: service?.id,
                          description: service?.description ?? null,
                          isFeatured: service?.is_featured ?? false,
                          showroomId: showroom?.id,
                          serviceId: service?.ServiceId,
                          price: service?.price,
                          currency: service?.currency ?? "QAR",
                          descriptionAr: service?.descriptionAr ?? null,
                          isActive: service?.is_active ?? true,
                          status: service?.status ?? "active",
                          availability: service?.availability,
                        });
                        setBookingDialogOpen(true);
                      }}
                    >
                      <Wrench size={16} className="mr-1" />
                      {t("showroom.bookService")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Showroom Info */}
          <div>
            <Card className="sticky bg-neutral-50 rounded-2xl border-orange-500 border-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {t("showroom.about")} {showroom?.name || showroom?.nameAr}{" "}
                  {showroom?.is_main_branch && (
                    <Badge className="ml-3 bg-orange-500">
                      {t("showroom.mainBranch")}
                    </Badge>
                  )}
                </CardTitle>
                <div className="max-w-none">
                  <p>{showroom?.description || t("showroom.description")}</p>
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

                {showroom?.address && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-4">
                      {t("showroom.businessAddress")}
                    </h3>
                    <p className="text-sm text-gray-700">{showroom?.address}</p>

                    {/* Location & Directions Buttons */}
                    <div className="mt-4 flex justify-center gap-2 items-center">
                      {showroom?.location &&
                        (() => {
                          const [lat, lng] = showroom?.location
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
                    <div className="flex justify-center mt-4">
                      <div className="flex flex-col items-center w-[250px]">
                        {showroom.phone && (
                          <a href={`tel:${showroom?.phone}`} className="w-full">
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
                            href={`https://wa.me/${showroom?.phone.replace(
                              /\D/g,
                              ""
                            )}`}
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
                  {t("showroom.regarding")}: {showroom?.name}
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
}
