import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import i18n, { resources } from "@/lib/i18n";
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
  Bookmark,
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
  Star,
  Info,
  BookmarkCheck,
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
  User,
  Showroom,
  ShowroomMake,
  showroomMakes,
  serviceBookings,
} from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatAvailability, isOpenNow } from "@/lib/utils";
import { CarImages } from "@/components/car/CarImages";
import { CarListingDetail } from "@/components/car/CarListingDetail";
import { SimilarShowrooms } from "@/components/car/SimilarShowrooms";
import { Card, CardContent } from "@/components/ui/card";
import CarCard from "@/components/car/CarCard";
import StarRating from "@/components/ui/star-rating";

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

const ShowroomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const language = i18n.language;
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [authModal, setAuthModal] = useState<
    "login" | "register" | "forget-password" | null
  >(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "reviews">("about");

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

  const {
    data: showroom,
    isLoading: isLoadingShowroom,
    isError: isErrorShowroom,
  } = useQuery<Showroom>({
    queryKey: [`/api/showrooms/${id}`],
  });

  // Fetch showroom car listings
  const { data: carListings = [], isLoading: isLoadingCarListings } = useQuery<
    any[]
  >({
    queryKey: [`/api/showrooms/${id}/cars`],
    enabled: !!id,
  });

  // Fetch showroom makes (brands they service)
  const { data: makes = [], isLoading: isLoadingMakes } = useQuery<any[]>({
    queryKey: [`/api/showrooms/${id}/makes`],
    enabled: !!id,
  });

  console.log("user data in car detail", user);

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
  

  const {
    data: sellerData,
    error,
    isLoading,
  } = useQuery<User>({
    queryKey: ["/api/users", showroom?.user_id],
    queryFn: async () => {
      console.log("Car User ID:", showroom?.user_id);

      try {
        const res = await fetch(`/api/users/${showroom?.user_id}`);
        console.log("Response received:", res);

        const data = await res.json();
        console.log("Fetched seller data:", data);
        return data;
      } catch (err) {
        console.error("Error in query function:", err);
        throw err;
      }
    },
    enabled: !!showroom?.user_id, // Only fetch when car data is available
  });

  console.log("Query Status:", {
    isLoading,
    error,
    sellerData,
  });

  const { data: showroomReviews = [], isLoading: isLoadingReviews } = useQuery<any[]>({
    queryKey: [`/api/reviews/showroom/${id}`],
    enabled: !!id,
  });

  const handleContactSeller = (values: MessageValues) => {
    if (!isAuthenticated) {
      setContactDialogOpen(false);
      setAuthModal("login");
      return;
    }

    apiRequest("POST", "/api/messages", {
      receiver_id: showroom!.user_id,
      sender_id: user?.id,
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

  const handleCall = (phone: string) => {
    if (!phone) {
    console.warn("Phone number is missing");
    return;
  }
    window.open(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string, carTitle: string) => {
    const encodedMessage = encodeURIComponent(
      `Hi, I'm interested in the ${carTitle}`
    );
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`);
  };

  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  useEffect(() => {
    if (!showroom?.id) return; // wait until showroom is loaded

    const bookmarks = JSON.parse(localStorage.getItem("bookmarkedGarages") || "[]");
    setIsBookmarked(bookmarks.includes(showroom.id));
  }, [showroom?.id]);

    const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarkedGarages") || "[]");
    let updatedBookmarks;

    if (isBookmarked) {
      updatedBookmarks = bookmarks.filter((id: number) => id !== showroom.id);
      toast({
        title: t("common.removedBookmark"),
        description: t("common.removedBookmarkDesc"),
      });
    } else {
      updatedBookmarks = [...bookmarks, showroom.id];
      toast({
        title: t("common.addedBookmark"),
        description: t("common.addedBookmarkDesc"),
      });
    }

    localStorage.setItem("bookmarkedGarages", JSON.stringify(updatedBookmarks));
    setIsBookmarked(!isBookmarked);
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
          <p className="text-neutral-600 mb-6">{t("common.garageNotFound")}</p>
          <Link href="/home">
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
  const title =
    language === "ar" && showroom.nameAr ? showroom.nameAr : showroom.name;
  const description =
    language === "ar" && showroom.descriptionAr
      ? showroom.descriptionAr
      : showroom.description;

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
              <CarImages images={showroom.images} title={showroom.name} is_garage={true}  />

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-2 mb-4">
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
                  } else if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: t("common.linkCopied"),
                      description: t("common.linkCopiedDesc"),
                    });
                  } else {
                    // Fallback for older browsers
                    const textArea = document.createElement("textarea");
                    textArea.value = window.location.href;
                    textArea.style.position = "fixed"; // Prevent scrolling
                    textArea.style.opacity = "0";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();

                    try {
                      document.execCommand("copy");
                      toast({
                        title: t("common.linkCopied"),
                        description: t("common.linkCopiedDesc"),
                      });
                    } catch (err) {
                      console.error("Fallback copy failed:", err);
                      toast({
                        title: t("common.copyFailed"),
                        description: t("common.copyFailedDesc"),
                        variant: "destructive",
                      });
                    }

                    document.body.removeChild(textArea);
                  }
                }}
              >
                <Share size={16} className="mr-1" />
                {t("common.share")}
              </Button>


                <Button
                  size="sm"
                  className="rounded-full bg-blue-600 text-white"
                  onClick={handleBookmark}
                >
                  {isBookmarked ? (
                    <BookmarkCheck size={16} className="mr-1" />
                  ) : (
                    <Bookmark size={16} className="mr-1" />
                  )}
                  {isBookmarked ? t("common.bookmarked") : t("common.bookmark")}
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
              
               {/* Tabs Section */}
              <div className="w-full mx-auto">
                {/* Tabs */}
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setActiveTab("about")}
                    className={`flex items-center px-4 py-2 rounded-full transition-all bg-neutral-100
                      ${activeTab === "about" ? "text-orange-500" : "text-black"}
                    `}
                  >
                    <Info size={16} className="mr-2" />
                    About
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`flex items-center px-4 py-2 rounded-full transition-all bg-neutral-100
                      ${activeTab === "reviews" ? "text-orange-500" : "text-black"}
                    `}
                  >
                    <Star size={16} className="mr-2" />
                    Reviews
                  </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow p-4">
                  {activeTab === "about" && (
                    <CarListingDetail
                      is_showroom={true}
                      vehicleDescription={showroom?.description ?? "No Description Available"}
                      vehicleDescriptionAr={showroom?.descriptionAr ?? "لا يوجد وصف متاح"}
                    />
                  )}

                  {activeTab === "reviews" && (
                   <div className="space-y-4">
                    {(!showroomReviews || showroomReviews.length === 0) ? (
                      <p className="text-center text-gray-500 py-6">
                        No reviews available for this showroom yet.
                      </p>
                    ) : (
                      showroomReviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
                        >
                          {/* Example review content */}
                          <div className="flex items-center space-x-2 mb-2">
                            {review.user_avatar ? (
                              <img
                                src={review.user_avatar}
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                                {review.user_first_name?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">
                                {review.user_first_name} {review.user_last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {/* Stars */}
                          <StarRating rating={review.rating} />

                          {/* Comment */}
                          {review.comment && (
                            <p className="text-gray-800 mt-2 whitespace-pre-line">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  )}
                </div>
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

              {/* Showroom listings */}
              <Card className="border-transparent shadow-none mb-4">
              <CardContent className="p-0">
                {isLoadingCarListings ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                ) : carListings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {carListings.map((car) => (
                      <CarCard key={car.id} isFavorited={car.is_favourite} car={car} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    {t("showroom.noInventory")}
                  </div>
                )}
              </CardContent>
              </Card>

             
            </div>

            {/* Car Summary (1/4 width on md and above) */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg p-4 shadow-sm border top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {showroom.name}
                </h2>

                <div className="w-full flex items-center justify-between mb-6">
                  <div className="w-full text-3xl text-blue-900">

                    <div className="mt-4 space-y-2">

                      <Button
                        size="sm"
                        className="w-full rounded-full bg-blue-900 text-white flex items-center justify-center gap-2"
                        onClick={() =>
                          handleCall(showroom?.phone || sellerData?.phone)
                        }
                      >
                        <Phone size={16} />
                        {showroom?.phone || sellerData?.phone}
                      </Button>

                      <Button
                        size="sm"
                        className="w-full rounded-full bg-green-500 text-white flex items-center justify-center gap-2"
                        onClick={() =>
                          handleWhatsApp(
                            showroom?.phone ?? sellerData?.phone,
                            service?.name
                          )
                        }
                      >
                        <MessageCircle size={16} />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller info card */}
              {!!sellerData && (
                <div className="bg-white rounded-lg p-4 mt-4 shadow-sm border mb-4">
                  <div className="text-center mb-4">
                    <div className="flex justify-center cursor-pointer text-center">
                      <img src={showroom?.logo} width={75} />
                    </div>
                  </div>

                  {(showroom?.address || showroom?.addressAr) && (
                    <div className="flex space-x-2 mb-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-full bg-orange-500 text-white"
                        onClick={() =>
                          handleLocationMap(
                            showroom?.address || showroom?.addressAr
                          )
                        }
                      >
                        <MapPin className="h-3 w-3 mr-1" /> Location Map
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-full bg-orange-500 text-white"
                        onClick={() =>
                          handleGetDirection(
                            showroom?.address || showroom?.address_ar
                          )
                        }
                      >
                        <Navigation className="h-3 w-3 mr-1" /> Get Direction
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    {showroom?.address || showroom?.addressAr ? (
                      <div>
                        <span className="text-gray-600">Street:</span>{" "}
                        {showroom.address || showroom.addressAr}
                      </div>
                    ) : null}

                    {sellerData?.location ? (
                      <div>
                        <span className="text-gray-600">City:</span>{" "}
                        {sellerData?.location}
                      </div>
                    ) : null}
                  </div>

                  {showroom?.timing && (
                    <div className="mt-4 p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm">
                            Timings (24h format) •{" "}
                            <span
                              className={
                                isOpenNow(showroom.timing)
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {isOpenNow(showroom.timing)
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
                              typeof showroom?.timing === "string"
                                ? JSON.parse(showroom?.timing)
                                : showroom?.timing;
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Similar Cars */}
        <div className="mt-12">
        <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Similar Showrooms</h2>
      </div>
        <SimilarShowrooms showroomId={showroom.id} limit={4} />
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
                  ${showroom.service}
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
                        <SelectItem value="wrongprice">
                          Listing price different from showroom
                        </SelectItem>
                        <SelectItem value="wronglocation">
                          Location is different
                        </SelectItem>
                        <SelectItem value="wrongphone">
                          Different contact no.
                        </SelectItem>
                        <SelectItem value="unreachable">
                          Showroom is unreachable
                        </SelectItem>
                        <SelectItem value="wongimages">
                          Showroom images do not match
                        </SelectItem>
                        <SelectItem value="wongservices">
                          Inaccurate Showroom Listings
                        </SelectItem>
                        <SelectItem value="misleading">
                          Misleading Listings
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

export default ShowroomDetails;
