import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Share, Flag } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CarMake, CarService, Showroom } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForms } from "@/components/forms/AuthForm/AuthForms";
import { GarageCard } from "@/components/showroom/GarageCard";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface ExtendedCarService extends CarService {
  description?: string;
  descriptionAr?: string;
}

interface ServiceDetailData {
  service: ExtendedCarService;
  showrooms: Showroom[];
  makes: CarMake[];
  price: number;
  currency: string;
  isFeatured: boolean;
}

// Report form schema
const reportSchema = z.object({
  reason: z.string().min(1, "Please select a reason"),
  details: z
    .string()
    .min(10, "Details must be at least 10 characters")
    .max(500, "Details cannot exceed 500 characters"),
});

type ReportValues = z.infer<typeof reportSchema>;

const fetchServiceDetail = async (serviceId: string) => {
  const response = await apiRequest("GET", `/api/services/${serviceId}`);
  return await response.json();
};

const PLACEHOLDER_IMG = "https://placehold.co/400x400";

export default function ServiceDetails() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [authModal, setAuthModal] = useState<
    "login" | "register" | "forget-password" | null
  >(null);
  const params = useParams();
  const serviceId = params.id;

  // Report form
  const reportForm = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: "",
      details: "",
    },
  });

  const { data, isLoading, error } = useQuery<ServiceDetailData>({
    queryKey: ["service-detail", serviceId],
    queryFn: () => fetchServiceDetail(serviceId),
  });

  const handleReportService = (values: ReportValues) => {
    if (!isAuthenticated) {
      setReportDialogOpen(false);
      setAuthModal("login");
      return;
    }

    apiRequest("POST", "/api/reports", {
      carId: serviceId,
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

  const { service, showrooms, makes } = data;

  return (
    <div className="bg-white pb-16">
      <div className="bg-white py-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <Link href="/browse-garages">
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
                className="rounded-full text-blue-900 border-blue-500 hover:bg-blue-900 hover:text-white hover:border-blue-900"
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title: service.name,
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Service Info Card */}
            <Card>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6">
                {/* Left: Image */}
                <div className="w-full md:w-1/6 flex justify-center md:justify-start">
                  <Avatar className="h-40 w-40 rounded-xl">
                    <AvatarImage
                      src={service.image || PLACEHOLDER_IMG}
                      alt={service.name}
                    />
                    <AvatarFallback>{service.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-5/6 space-y-4">
                  {/* Title and Price */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-2xl font-semibold flex items-center gap-2">
                      {service.name}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-1">
                      {service.description || service.descriptionAr}
                    </h3>
                  </div>

                  {/* Makes */}
                  {makes && makes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-1">
                        {t("services.availableFor")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {makes.map((make) => (
                          <Badge
                            key={make.id}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Avatar className="h-5 w-5">
                              <AvatarImage
                                src={make.image || PLACEHOLDER_IMG}
                                alt={make.name}
                              />
                              <AvatarFallback>
                                {make.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {make.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Showrooms Grid */}
            <div className="space-y-6">
              {showrooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {showrooms.map((garages) => (
                    <GarageCard key={garages.id} garage={garages} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8 text-neutral-500">
                    {t("services.noShowroomsAvailable")}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

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
              onSubmit={reportForm.handleSubmit(handleReportService)}
              className="space-y-4"
            >
              <div className="bg-neutral-50 p-3 rounded-md text-sm mb-4">
                <p className="font-medium">
                  {t("common.reporting")}: {service.name}
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
}
