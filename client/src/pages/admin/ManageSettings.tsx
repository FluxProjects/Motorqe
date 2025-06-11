import { useEffect, useState } from "react";
import i18n, { resources } from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Save,
  Settings2,
  Info,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { roleMapping } from "@shared/permissions";

const ManageSettings = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [generalSettings, setGeneralSettings] = useState({
    site_name: "CarMarket",
    site_description: "Your trusted marketplace for buying and selling cars",
    contact_email: "support@carmarket.com",
    phone_number: "+1 (555) 123-4567",
    address: "123 Main Street, City, Country",
    logo: "/src/assets/sitelogo.png",
    footer_logo: "/src/assets/footerLogo.png",
    favicon: "/src/assets/favicon.ico",
    bank_logo: "/src/assets/bankLogo.png",
    bank_url: "https://wwww.example.com",
    max_listings_per_user: 10,
    max_images_per_listing: 10,
    enable_registration: true,
    require_email_verification: true,
    allow_user_rating: true,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtp_server: "smtp.example.com",
    smtp_port: 587,
    smtp_username: "notifications@carmarket.com",
    smtp_password: "••••••••••••",
    from_email: "no-reply@carmarket.com",
    from_name: "CarMarket Team",
    enable_email_notifications: true,
    new_listing_template:
      'Your listing "{{title}}" has been published successfully.',
    new_message_template:
      'You have received a new message from {{sender}} regarding "{{listing}}"',
  });

  const [smsSettings, setSmsSettings] = useState({
    provider: "twilio", // Default provider
    account_sid: "", // Twilio Account SID
    auth_token: "", // Twilio Auth Token
    from_number: "", // Twilio phone number
    enable_sms_notifications: false,
    new_listing_template:
      'Your listing "{{title}}" has been published successfully.',
    new_message_template: 'New message from {{sender}} regarding "{{listing}}"',
    low_balance_alert_template:
      "Your SMS balance is low. Current balance: {{balance}}",
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    google_analytics_id: "UA-XXXXXXXXX-X",
    enable_google_analytics: false,
    facebook_pixel_id: "",
    enable_facebook_pixel: false,
    google_maps_api_key: "",
    enable_location_map: true,
    payment_gateway: "stripe",
    stripe_public_key: "pk_test_••••••••••••",
    stripe_secret_key: "••••••••••••",
    paypal_client_id: "",
    enable_payments: false,
  });

  // useQuery({
  //   queryKey: ["settings/general"],
  //   queryFn: async () => {
  //     const res = await apiRequest("GET", "/api/settings");
  //     const data = await res.json(); // ⬅️ extract JSON
  //     setGeneralSettings(data);
  //     return data;
  //   },
  // });

  // useQuery({
  //   queryKey: ["settings/email"],
  //   queryFn: async () => {
  //     const res = await apiRequest("GET", "/api/settings/email");
  //     const data = await res.json();
  //     setEmailSettings(data);
  //     return data;
  //   },
  // });

  // useQuery({
  //   queryKey: ["settings/integrations"],
  //   queryFn: async () => {
  //     const res = await apiRequest("GET", "/api/settings/integrations");
  //     const data = await res.json();
  //     setIntegrationSettings(data);
  //     return data;
  //   },
  // });

  const { data: settingsData = [], isLoading, refetch } = useQuery({
    queryKey: ["general-settings"],
    queryFn: () => fetch("/api/settings").then((res) => res.json()),
  });

  useEffect(() => {
  if (settingsData) {
    // You can either set whole or partial sections based on keys
    const generalKeys = [
      "site_name",
      "site_name_ar",
      "site_description",
      "site_description_ar",
      "contact_email",
      "logo",
      "footer_logo",
      "favicon",
      "bank_logo",
      "bank_url",
      "primary_color",
      "secondary_color",
      "enable_registration",
      "require_email_verification",
      "allowed_languages",
      "default_language",
      "address",
      "address_ar",
      "phone_number",
      "allow_user_rating",
      "google_maps_config",
      "max_images_per_listing",
      "max_listings_per_user",
    ];



    // Assuming your state setters accept partials or entire configs:
    setGeneralSettings((prev) => ({
      ...prev,
      ...Object.fromEntries(
        generalKeys.map((key) => [key, settingsData[key]])
      ),
    }));

    if (settingsData.email_config) {
      setEmailSettings((prev) => ({
        ...prev,
        ...settingsData.email_config,
      }));
    }

    if (settingsData.sms_config) {
      setSmsSettings((prev) => ({
        ...prev,
        ...settingsData.sms_config,
      }));
    }

    if (settingsData.integrations) {
      setIntegrationSettings((prev) => ({
        ...prev,
        ...settingsData.integrations,
      }));
    }
  }
}, [settingsData]);


  // === Mutations ===

  const updateGeneralSettings = useMutation({
    mutationFn: async (data: typeof generalSettings) => {
      return await apiRequest("PUT", "/api/settings", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("admin.settingsUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ["settings/general"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("admin.settingsUpdateFailed"),
        variant: "destructive",
      });
    },
  });

  const updateEmailSettings = useMutation({
    mutationFn: async (data: typeof emailSettings) => {
      return await apiRequest("PUT", "/api/settings/email", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("admin.settingsUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ["settings/email"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("admin.settingsUpdateFailed"),
        variant: "destructive",
      });
    },
  });

  const updateSMSSettings = useMutation({
    mutationFn: async (data: typeof smsSettings) => {
      return await apiRequest("PUT", "/api/settings/sms", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("admin.settingsUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ["settings/sms"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("admin.settingsUpdateFailed"),
        variant: "destructive",
      });
    },
  });

  const updateIntegrationSettings = useMutation({
    mutationFn: async (data: typeof integrationSettings) => {
      return await apiRequest("PUT", "/api/settings/integrations", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("admin.settingsUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ["settings/integrations"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("admin.settingsUpdateFailed"),
        variant: "destructive",
      });
    },
  });

  // === Handlers ===
  const handleSaveGeneralSettings = () =>
    updateGeneralSettings.mutate(generalSettings);
  const handleSaveEmailSettings = () =>
    updateEmailSettings.mutate(emailSettings);
  const handleSaveSmsSettings = () => updateSMSSettings.mutate(smsSettings);
  const handleSaveIntegrationSettings = () =>
    updateIntegrationSettings.mutate(integrationSettings);

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Admin Sidebar */}
            <div className="hidden md:block">
              {user?.roleId && (
                <DashboardSidebar type={roleMapping[user.roleId] || "BUYER"} />
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {t("admin.siteSettings")}
                    </h1>
                    <p className="text-slate-400 mt-1">
                      {t("admin.siteSettingsDesc")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="text-slate-200 border-slate-700 bg-slate-700 hover:bg-blue-600 hover:text-white mr-2"
                    onClick={() => settingsData.refetch()}
                    disabled={settingsData.isFetching}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        settingsData.isFetching ? "animate-spin" : ""
                      }`}
                    />
                    {t("common.refresh")}
                  </Button>
                </div>

                {/* Tabs & Content */}
                {settingsData.isLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    <span className="ml-2 text-slate-400">
                      {t("common.loading")}
                    </span>
                  </div>
                ) : (
                  <Tabs defaultValue="General" className="w-full">
                    <TabsList className="w-full bg-white border-b border-gray-200 p-0 justify-start rounded-none">
                      {["General", "Email", "SMS", "Integrations"].map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="
                            py-3 px-6 
                            text-gray-600 hover:text-gray-800
                            border-b-2 border-transparent
                            data-[state=active]:border-orange-500 
                            data-[state=active]:text-orange-500
                            data-[state=active]:font-medium
                            rounded-none
                            transition-colors duration-200
                          "
                        >
                          {tab}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* General Settings Tab Content */}
                    <TabsContent value="General" className="py-4">
                      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <CardHeader className="border-b border-gray-200 px-6 py-4">
                          <div className="flex items-center">
                            <Settings2 className="h-5 w-5 text-gray-700 mr-2" />
                            <CardTitle className="text-gray-800 font-medium">
                              General Settings
                            </CardTitle>
                          </div>
                          <CardDescription className="text-gray-500 mt-1">
                            Configure the general settings for your application
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 py-4 space-y-6">
                          {/* site_name */}
                          <div className="space-y-1">
                            <Label
                              htmlFor="siteName"
                              className="text-gray-700 font-medium"
                            >
                              Site Name
                            </Label>
                            <Input
                              id="siteName"
                              value={generalSettings.site_name}
                              onChange={(e) =>
                                setGeneralSettings({
                                  ...generalSettings,
                                  site_name: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="My Property Listing"
                            />
                          </div>

                          {/* site_description */}
                          <div className="space-y-1">
                            <Label
                              htmlFor="siteDescription"
                              className="text-gray-700 font-medium"
                            >
                              Site Description
                            </Label>
                            <Textarea
                              id="siteDescription"
                              value={generalSettings.site_description}
                              onChange={(e) =>
                                setGeneralSettings({
                                  ...generalSettings,
                                  site_description: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Find your dream property with our premium listing service."
                            />
                          </div>

                          {/* contact_email */}
                          <div className="space-y-1">
                            <Label
                              htmlFor="contactEmail"
                              className="text-gray-700 font-medium"
                            >
                              Contact Email
                            </Label>
                            <Input
                              id="contactEmail"
                              type="email"
                              value={generalSettings.contact_email}
                              onChange={(e) =>
                                setGeneralSettings({
                                  ...generalSettings,
                                  contact_email: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="support@propertylisting.com"
                            />
                          </div>

                          {/* phone_number */}
                          <div className="space-y-1">
                            <Label
                              htmlFor="phoneNumber"
                              className="text-gray-700 font-medium"
                            >
                              Phone Number
                            </Label>
                            <Input
                              id="phoneNumber"
                              type="tel"
                              value={generalSettings.phone_number}
                              onChange={(e) =>
                                setGeneralSettings({
                                  ...generalSettings,
                                  phone_number: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="+1 (234) 567-8910"
                            />
                          </div>

                          {/* address */}
                          <div className="space-y-1">
                            <Label
                              htmlFor="address"
                              className="text-gray-700 font-medium"
                            >
                              Address
                            </Label>
                            <Textarea
                              id="address"
                              value={generalSettings.address}
                              onChange={(e) =>
                                setGeneralSettings({
                                  ...generalSettings,
                                  address: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="123 Property Lane, Real Estate City"
                            />
                          </div>

                          {/* logo */}
                          <div className="space-y-1">
                            <Label
                              htmlFor="logo"
                              className="text-gray-700 font-medium"
                            >
                              Logo URL
                            </Label>
                            <Input
                              id="logo"
                              type="url"
                              value={generalSettings.logo}
                              onChange={(e) =>
                                setGeneralSettings({
                                  ...generalSettings,
                                  logo: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="https://example.com/logo.png"
                            />
                          </div>

                          {/* Footer Logo */}
                          <div className="space-y-1">
                            <Label
                              htmlFor="footer_logo"
                              className="text-gray-700 font-medium"
                            >
                              Footer Logo URL
                            </Label>
                            <Input
                              id="footer_logo"
                              type="url"
                              value={generalSettings.footer_logo}
                              onChange={(e) =>
                                setGeneralSettings({
                                  ...generalSettings,
                                  footer_logo: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="https://example.com/logo-white.png"
                            />
                          </div>

                          {/* Bank Logo */}
                          <div className="space-y-1">
                            <Label
                              htmlFor="bankLogo"
                              className="text-gray-700 font-medium"
                            >
                              Bank Logo
                            </Label>
                            <Input
                              id="bankLogo"
                              type="url"
                              value={generalSettings.bank_logo}
                              onChange={(e) =>
                                setGeneralSettings({
                                  ...generalSettings,
                                  bank_logo: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="https://example.com/bankLogo.png"
                            />
                          </div>

                          {/* Bank URL */}
                          <div className="space-y-1">
                            <Label
                              htmlFor="bankURL"
                              className="text-gray-700 font-medium"
                            >
                              Bank URL
                            </Label>
                            <Input
                              id="bankURL"
                              type="url"
                              value={generalSettings.bank_url}
                              onChange={(e) =>
                                setGeneralSettings({
                                  ...generalSettings,
                                  bank_url: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="https://bank.com/"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            {/* max_listings_per_user */}
                            <div className="space-y-1">
                              <Label
                                htmlFor="maxListingsPerUser"
                                className="text-gray-700 font-medium"
                              >
                                Max Listings Per User
                              </Label>
                              <Input
                                id="maxListingsPerUser"
                                type="number"
                                min={1}
                                value={generalSettings.max_listings_per_user}
                                onChange={(e) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    max_listings_per_user: Number(
                                      e.target.value
                                    ),
                                  })
                                }
                                className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="10"
                              />
                            </div>

                            {/* max_images_per_listing */}
                            <div className="space-y-1">
                              <Label
                                htmlFor="maxImagesPerListing"
                                className="text-gray-700 font-medium"
                              >
                                Max Images Per Listing
                              </Label>
                              <Input
                                id="maxImagesPerListing"
                                type="number"
                                min={1}
                                value={generalSettings.max_images_per_listing}
                                onChange={(e) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    max_images_per_listing: Number(
                                      e.target.value
                                    ),
                                  })
                                }
                                className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="5"
                              />
                            </div>
                          </div>

                          {/* <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-gray-800 font-medium mb-4">
                              SYSTEM PREFERENCES
                            </h3>

                            <div className="flex items-center space-x-3 py-2">
                              <Switch
                                id="enableRegistration"
                                checked={generalSettings.enable_registration}
                                onCheckedChange={(checked) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    enable_registration: checked,
                                  })
                                }
                                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                              />
                              <Label
                                htmlFor="enableRegistration"
                                className="text-gray-700 cursor-pointer"
                              >
                                Enable User Registration
                              </Label>
                            </div>

                            <div className="flex items-center space-x-3 py-2">
                              <Switch
                                id="requireEmailVerification"
                                checked={
                                  generalSettings.require_email_verification
                                }
                                onCheckedChange={(checked) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    require_email_verification: checked,
                                  })
                                }
                                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                              />
                              <Label
                                htmlFor="requireEmailVerification"
                                className="text-gray-700 cursor-pointer"
                              >
                                Require Email Verification
                              </Label>
                            </div>

                            <div className="flex items-center space-x-3 py-2">
                              <Switch
                                id="allowUserRating"
                                checked={generalSettings.allow_user_rating}
                                onCheckedChange={(checked) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    allow_user_rating: checked,
                                  })
                                }
                                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                              />
                              <Label
                                htmlFor="allowUserRating"
                                className="text-gray-700 cursor-pointer"
                              >
                                Allow User Rating
                              </Label>
                            </div>
                          </div> */}
                        </CardContent>
                        <CardFooter className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                            onClick={handleSaveGeneralSettings}
                            disabled={updateGeneralSettings.isPending}
                          >
                            {updateGeneralSettings.isPending &&
                            updateGeneralSettings.variables ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>

                    {/* Email and Integrations tabs continue here */}
                    <TabsContent value="Email" className="py-4">
                      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <CardHeader className="border-b border-gray-200 px-6 py-4">
                          <div className="flex items-center">
                            <Settings2 className="h-5 w-5 text-gray-700 mr-2" />
                            <CardTitle className="text-gray-800 font-medium">
                              {t("admin.emailSettings")}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-gray-500 mt-1">
                            {t("admin.emailSettingsDesc")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 py-4 space-y-4">
                          <div className="space-y-1">
                            <Label
                              htmlFor="smtp_server"
                              className="text-gray-700 font-medium"
                            >
                              {t("admin.smtpServer")}
                            </Label>
                            <Input
                              id="smtp_server"
                              value={emailSettings.smtp_server}
                              onChange={(e) =>
                                setEmailSettings({
                                  ...emailSettings,
                                  smtp_server: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label
                              htmlFor="smtp_port"
                              className="text-gray-700 font-medium"
                            >
                              {t("admin.smtpPort")}
                            </Label>
                            <Input
                              id="smtp_port"
                              type="number"
                              value={emailSettings.smtp_port}
                              onChange={(e) =>
                                setEmailSettings({
                                  ...emailSettings,
                                  smtp_port: Number(e.target.value),
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label
                              htmlFor="smtp_username"
                              className="text-gray-700 font-medium"
                            >
                              {t("admin.smtpUsername")}
                            </Label>
                            <Input
                              id="smtp_username"
                              value={emailSettings.smtp_username}
                              onChange={(e) =>
                                setEmailSettings({
                                  ...emailSettings,
                                  smtp_username: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label
                              htmlFor="smtp_password"
                              className="text-gray-700 font-medium"
                            >
                              {t("admin.smtpPassword")}
                            </Label>
                            <Input
                              id="smtp_password"
                              type="password"
                              value={emailSettings.smtp_password}
                              onChange={(e) =>
                                setEmailSettings({
                                  ...emailSettings,
                                  smtp_password: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label
                              htmlFor="from_email"
                              className="text-gray-700 font-medium"
                            >
                              {t("admin.fromEmail")}
                            </Label>
                            <Input
                              id="from_email"
                              type="email"
                              value={emailSettings.from_email}
                              onChange={(e) =>
                                setEmailSettings({
                                  ...emailSettings,
                                  from_email: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label
                              htmlFor="from_name"
                              className="text-gray-700 font-medium"
                            >
                              {t("admin.fromName")}
                            </Label>
                            <Input
                              id="from_name"
                              value={emailSettings.from_name}
                              onChange={(e) =>
                                setEmailSettings({
                                  ...emailSettings,
                                  from_name: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="flex items-center space-x-3 py-2">
                            <Switch
                              id="enable_email_notifications"
                              checked={emailSettings.enable_email_notifications}
                              onCheckedChange={(checked) =>
                                setEmailSettings({
                                  ...emailSettings,
                                  enable_email_notifications: checked,
                                })
                              }
                              className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                            />
                            <Label
                              htmlFor="enable_email_notifications"
                              className="text-gray-700 cursor-pointer"
                            >
                              {t("admin.enableEmailNotifications")}
                            </Label>
                          </div>

                          <div className="space-y-1">
                            <Label
                              htmlFor="new_listing_template"
                              className="text-gray-700 font-medium"
                            >
                              {t("admin.newListingTemplate")}
                            </Label>
                            <Textarea
                              id="new_listing_template"
                              value={emailSettings.new_listing_template}
                              onChange={(e) =>
                                setEmailSettings({
                                  ...emailSettings,
                                  new_listing_template: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label
                              htmlFor="new_message_template"
                              className="text-gray-700 font-medium"
                            >
                              {t("admin.newMessageTemplate")}
                            </Label>
                            <Textarea
                              id="new_message_template"
                              value={emailSettings.new_message_template}
                              onChange={(e) =>
                                setEmailSettings({
                                  ...emailSettings,
                                  new_message_template: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                            />
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                            onClick={handleSaveEmailSettings}
                            disabled={updateEmailSettings.isPending}
                          >
                            {updateEmailSettings.isPending &&
                            updateEmailSettings.variables ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {t("common.saving")}
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                {t("common.saveChanges")}
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>

                    {/* SMS */}
                    <TabsContent value="SMS" className="py-4">
                      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <CardHeader className="border-b border-gray-200 px-6 py-4">
                          <div className="flex items-center">
                            <Settings2 className="h-5 w-5 text-gray-700 mr-2" />
                            <CardTitle className="text-gray-800 font-medium">
                              {t("admin.smsSettings")}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-gray-500 mt-1">
                            {t("admin.smsSettingsDesc")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 py-4 space-y-4">
                          <div className="space-y-1">
                            <Label
                              htmlFor="provider"
                              className="text-gray-700 font-medium"
                            >
                              {t("admin.smsProvider")}
                            </Label>
                            <select
                              id="provider"
                              value={smsSettings.provider}
                              onChange={(e) =>
                                setSmsSettings({
                                  ...smsSettings,
                                  provider: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full p-2"
                            >
                              <option value="twilio">Twilio</option>
                              <option value="nexmo">Nexmo</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <Label
                              htmlFor="account_sid"
                              className="text-gray-700 font-medium"
                            >
                              {t("admin.accountSid")}
                            </Label>
                            <Input
                              id="account_sid"
                              value={smsSettings.account_sid}
                              onChange={(e) =>
                                setSmsSettings({
                                  ...smsSettings,
                                  account_sid: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label
                              htmlFor="auth_token"
                              className="text-gray-700 font-medium"
                            >
                              {t("admin.authToken")}
                            </Label>
                            <Input
                              id="auth_token"
                              type="password"
                              value={smsSettings.auth_token}
                              onChange={(e) =>
                                setSmsSettings({
                                  ...smsSettings,
                                  auth_token: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label
                              htmlFor="from_number"
                              className="text-gray-700 font-medium"
                            >
                              {t("admin.fromNumber")}
                            </Label>
                            <Input
                              id="from_number"
                              value={smsSettings.from_number}
                              onChange={(e) =>
                                setSmsSettings({
                                  ...smsSettings,
                                  from_number: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="+1234567890"
                            />
                          </div>

                          <div className="flex items-center space-x-3 pt-2">
                            <Switch
                              id="enable_sms_notifications"
                              checked={smsSettings.enable_sms_notifications}
                              onCheckedChange={(checked) =>
                                setSmsSettings({
                                  ...smsSettings,
                                  enable_sms_notifications: checked,
                                })
                              }
                              className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                            />
                            <Label
                              htmlFor="enable_sms_notifications"
                              className="text-gray-700 cursor-pointer"
                            >
                              {t("admin.enableSmsNotifications")}
                            </Label>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                            onClick={handleSaveSmsSettings}
                            disabled={updateSMSSettings.isPending}
                          >
                            {updateSMSSettings.isPending &&
                            updateSMSSettings.variables ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {t("common.saving")}
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                {t("common.saveChanges")}
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>

                    {/* Google Maps */}
                    {/* <TabsContent value="google_maps" className="py-4">
                      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <CardHeader className="border-b border-gray-200 px-6 py-4">
                          <div className="flex items-center">
                            <Settings2 className="h-5 w-5 text-gray-700 mr-2" />
                            <CardTitle className="text-gray-800 font-medium">
                              {t("admin.googleMapsSettings")}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-gray-500 mt-1">
                            {t("admin.googleMapsSettingsDesc")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 py-4 space-y-4">
                          <div className="space-y-1">
                            <Label htmlFor="api_key" className="text-gray-700 font-medium">
                              {t("admin.apiKey")}
                            </Label>
                            <Input
                              id="api_key"
                              type="password"
                              value={google_maps_config.api_key}
                              onChange={(e) =>
                                setGoogleMapsConfig({
                                  ...google_maps_config,
                                  api_key: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <Label htmlFor="default_zoom" className="text-gray-700 font-medium">
                                {t("admin.defaultZoom")}
                              </Label>
                              <Input
                                id="default_zoom"
                                type="number"
                                min={0}
                                max={21}
                                value={google_maps_config.default_zoom}
                                onChange={(e) =>
                                  setGoogleMapsConfig({
                                    ...google_maps_config,
                                    default_zoom: Number(e.target.value),
                                  })
                                }
                                className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="12"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="default_latitude" className="text-gray-700 font-medium">
                                {t("admin.defaultLatitude")}
                              </Label>
                              <Input
                                id="default_latitude"
                                type="number"
                                min={-90}
                                max={90}
                                step={0.000001}
                                value={google_maps_config.default_latitude}
                                onChange={(e) =>
                                  setGoogleMapsConfig({
                                    ...google_maps_config,
                                    default_latitude: Number(e.target.value),
                                  })
                                }
                                className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="40.7128"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="default_longitude" className="text-gray-700 font-medium">
                                {t("admin.defaultLongitude")}
                              </Label>
                              <Input
                                id="default_longitude"
                                type="number"
                                min={-180}
                                max={180}
                                step={0.000001}
                                value={google_maps_config.default_longitude}
                                onChange={(e) =>
                                  setGoogleMapsConfig({
                                    ...google_maps_config,
                                    default_longitude: Number(e.target.value),
                                  })
                                }
                                className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="-74.0060"
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                            onClick={handleSaveGoogleMapsConfig}
                            disabled={updateGoogleMapsConfig.isPending}
                          >
                            {updateGoogleMapsConfig.isPending && updateGoogleMapsConfig.variables ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {t("common.saving")}
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                {t("common.saveChanges")}
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent> */}

                    {/* Integration */}
                    <TabsContent value="Integrations" className="py-4">
                      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <CardHeader className="border-b border-gray-200 px-6 py-4">
                          <div className="flex items-center">
                            <Settings2 className="h-5 w-5 text-gray-700 mr-2" />
                            <CardTitle className="text-gray-800 font-medium">
                              {t("admin.integrationSettings")}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-gray-500 mt-1">
                            {t("admin.integrationSettingsDesc")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 py-4 space-y-4">
                          {/* Google Analytics */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <Label
                                htmlFor="googleAnalyticsId"
                                className="text-gray-700 font-medium"
                              >
                                {t("admin.googleAnalyticsId")}
                              </Label>
                              <Input
                                id="googleAnalyticsId"
                                value={integrationSettings.googleAnalyticsId}
                                onChange={(e) =>
                                  setIntegrationSettings({
                                    ...integrationSettings,
                                    googleAnalyticsId: e.target.value,
                                  })
                                }
                                className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                                disabled={
                                  !integrationSettings.enableGoogleAnalytics
                                }
                              />
                            </div>
                            <div className="flex items-center space-x-3 pt-6">
                              <Switch
                                id="enableGoogleAnalytics"
                                checked={
                                  integrationSettings.enableGoogleAnalytics
                                }
                                onCheckedChange={(checked) =>
                                  setIntegrationSettings({
                                    ...integrationSettings,
                                    enableGoogleAnalytics: checked,
                                  })
                                }
                                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                              />
                              <Label
                                htmlFor="enableGoogleAnalytics"
                                className="text-gray-700 cursor-pointer"
                              >
                                {t("admin.enableGoogleAnalytics")}
                              </Label>
                            </div>
                          </div>

                          {/* Facebook Pixel */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <Label
                                htmlFor="facebookPixelId"
                                className="text-gray-700 font-medium"
                              >
                                {t("admin.facebookPixelId")}
                              </Label>
                              <Input
                                id="facebookPixelId"
                                value={integrationSettings.facebookPixelId}
                                onChange={(e) =>
                                  setIntegrationSettings({
                                    ...integrationSettings,
                                    facebookPixelId: e.target.value,
                                  })
                                }
                                className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                                disabled={
                                  !integrationSettings.enableFacebookPixel
                                }
                              />
                            </div>
                            <div className="flex items-center space-x-3 pt-6">
                              <Switch
                                id="enableFacebookPixel"
                                checked={
                                  integrationSettings.enableFacebookPixel
                                }
                                onCheckedChange={(checked) =>
                                  setIntegrationSettings({
                                    ...integrationSettings,
                                    enableFacebookPixel: checked,
                                  })
                                }
                                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                              />
                              <Label
                                htmlFor="enableFacebookPixel"
                                className="text-gray-700 cursor-pointer"
                              >
                                {t("admin.enableFacebookPixel")}
                              </Label>
                            </div>
                          </div>

                          {/* Google Maps API Key */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <Label
                                htmlFor="googleMapsApiKey"
                                className="text-gray-700 font-medium"
                              >
                                {t("admin.googleMapsApiKey")}
                              </Label>
                              <Input
                                id="googleMapsApiKey"
                                value={integrationSettings.googleMapsApiKey}
                                onChange={(e) =>
                                  setIntegrationSettings({
                                    ...integrationSettings,
                                    googleMapsApiKey: e.target.value,
                                  })
                                }
                                className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                                disabled={
                                  !integrationSettings.enableLocationMap
                                }
                              />
                            </div>
                            <div className="flex items-center space-x-3 pt-6">
                              <Switch
                                id="enableLocationMap"
                                checked={integrationSettings.enableLocationMap}
                                onCheckedChange={(checked) =>
                                  setIntegrationSettings({
                                    ...integrationSettings,
                                    enableLocationMap: checked,
                                  })
                                }
                                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                              />
                              <Label
                                htmlFor="enableLocationMap"
                                className="text-gray-700 cursor-pointer"
                              >
                                {t("admin.enableLocationMap")}
                              </Label>
                            </div>
                          </div>

                          {/* Payment Gateway */}
                          <div className="space-y-1">
                            <Label
                              htmlFor="paymentGateway"
                              className="text-gray-700 font-medium"
                            >
                              {t("admin.paymentGateway")}
                            </Label>
                            <select
                              id="paymentGateway"
                              value={integrationSettings.paymentGateway}
                              onChange={(e) =>
                                setIntegrationSettings({
                                  ...integrationSettings,
                                  paymentGateway: e.target.value,
                                })
                              }
                              className="bg-white border-gray-300 text-gray-800 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full p-2"
                            >
                              <option value="stripe">
                                {t("admin.stripe")}
                              </option>
                              <option value="paypal">
                                {t("admin.paypal")}
                              </option>
                              <option value="none">{t("admin.none")}</option>
                            </select>
                          </div>

                          {/* Stripe Keys */}
                          {integrationSettings.paymentGateway === "stripe" && (
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <Label
                                  htmlFor="stripePublicKey"
                                  className="text-gray-700 font-medium"
                                >
                                  {t("admin.stripePublicKey")}
                                </Label>
                                <Input
                                  id="stripePublicKey"
                                  value={integrationSettings.stripePublicKey}
                                  onChange={(e) =>
                                    setIntegrationSettings({
                                      ...integrationSettings,
                                      stripePublicKey: e.target.value,
                                    })
                                  }
                                  className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                                  disabled={!integrationSettings.enablePayments}
                                />
                              </div>

                              <div className="space-y-1">
                                <Label
                                  htmlFor="stripeSecretKey"
                                  className="text-gray-700 font-medium"
                                >
                                  {t("admin.stripeSecretKey")}
                                </Label>
                                <Input
                                  id="stripeSecretKey"
                                  type="password"
                                  value={integrationSettings.stripeSecretKey}
                                  onChange={(e) =>
                                    setIntegrationSettings({
                                      ...integrationSettings,
                                      stripeSecretKey: e.target.value,
                                    })
                                  }
                                  className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                                  disabled={!integrationSettings.enablePayments}
                                />
                              </div>
                            </div>
                          )}

                          {/* PayPal Client ID */}
                          {integrationSettings.paymentGateway === "paypal" && (
                            <div className="space-y-1">
                              <Label
                                htmlFor="paypalClientId"
                                className="text-gray-700 font-medium"
                              >
                                {t("admin.paypalClientId")}
                              </Label>
                              <Input
                                id="paypalClientId"
                                value={integrationSettings.paypalClientId}
                                onChange={(e) =>
                                  setIntegrationSettings({
                                    ...integrationSettings,
                                    paypalClientId: e.target.value,
                                  })
                                }
                                className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                                disabled={!integrationSettings.enablePayments}
                              />
                            </div>
                          )}

                          {/* Enable Payments Toggle */}
                          <div className="flex items-center space-x-3 pt-2">
                            <Switch
                              id="enablePayments"
                              checked={integrationSettings.enablePayments}
                              onCheckedChange={(e) =>
                                setIntegrationSettings({
                                  ...integrationSettings,
                                  enablePayments: e,
                                })
                              }
                              className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                              disabled={
                                integrationSettings.paymentGateway === "none"
                              }
                            />
                            <Label
                              htmlFor="enablePayments"
                              className="text-gray-700 cursor-pointer"
                            >
                              {t("admin.enablePayments")}
                            </Label>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                            onClick={handleSaveIntegrationSettings}
                            disabled={updateIntegrationSettings.isPending}
                          >
                            {updateIntegrationSettings.isPending &&
                            updateIntegrationSettings.variables ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {t("common.saving")}
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                {t("common.saveChanges")}
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSettings;
