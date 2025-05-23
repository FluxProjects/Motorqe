import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { useTranslation } from "react-i18next";
import { Settings } from "@shared/schema";

const ManageSettings = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

 const [, setGeneralSettings] = useState<Settings>();
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.example.com",
    smtpPort: 587,
    smtpUsername: "notifications@carmarket.com",
    smtpPassword: "••••••••••••",
    fromEmail: "no-reply@carmarket.com",
    fromName: "CarMarket Team",
    enableEmailNotifications: true,
    newListingTemplate:
      'Your listing "{{title}}" has been published successfully.',
    newMessageTemplate:
      'You have received a new message from {{sender}} regarding "{{listing}}"',
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    googleAnalyticsId: "UA-XXXXXXXXX-X",
    enableGoogleAnalytics: false,
    facebookPixelId: "",
    enableFacebookPixel: false,
    googleMapsApiKey: "",
    enableLocationMap: true,
    paymentGateway: "stripe",
    stripePublicKey: "pk_test_••••••••••••",
    stripeSecretKey: "••••••••••••",
    paypalClientId: "",
    enablePayments: false,
  });

  // Settings query
   const { 
      data: generalSettings = [],
      isLoading,
      refetch,
      error,
    } = useQuery<Settings[]>({
      queryKey: ['/api/settings'],
    });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/settings", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("admin.settingsUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
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

  const handleSaveGeneralSettings = () => {
    updateSettings.mutate({ general: generalSettings });
  };

  const handleSaveEmailSettings = () => {
    updateSettings.mutate({ email: emailSettings });
  };

  const handleSaveIntegrationSettings = () => {
    updateSettings.mutate({ integrations: integrationSettings });
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Admin Sidebar */}
            <div className="hidden md:block">
              {user?.roleId && (
                <DashboardSidebar type={roleMapping[user.roleId] || "SELLER"} />
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {t("admin.siteSettings")}
                    </h1>
                    <p className="text-slate-400 mt-1">
                      {t("admin.siteSettingsDesc")}
                    </p>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      className="text-slate-200 border-slate-700 hover:bg-slate-800 mr-2"
                      onClick={() => refetch()}
                      disabled={isLoading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          isLoading ? "animate-spin" : ""
                        }`}
                      />
                      {t("common.refresh")}
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    <span className="ml-2 text-slate-400">
                      {t("common.loading")}
                    </span>
                  </div>
                ) : (
                  <Tabs defaultValue="general" className="w-full">
                    <TabsList className="w-full bg-slate-800 border-b border-slate-700 p-0 justify-start rounded-none">
                      <TabsTrigger
                        value="general"
                        className="py-3 px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-none"
                      >
                        {t("admin.generalSettings")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="email"
                        className="py-3 px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-none"
                      >
                        {t("admin.emailSettings")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="integrations"
                        className="py-3 px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-none"
                      >
                        {t("admin.integrationSettings")}
                      </TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general" className="py-4">
                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <div className="flex items-center">
                            <Settings2 className="h-5 w-5 text-blue-400 mr-2" />
                            <CardTitle className="text-white">
                              {t("admin.generalSettings")}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-slate-400">
                            {t("admin.generalSettingsDesc")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="siteName"
                                className="text-slate-300"
                              >
                                {t("admin.siteName")}
                              </Label>
                              <Input
                                id="siteName"
                                value={generalSettings.siteName}
                                onChange={(e) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    siteName: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="contactEmail"
                                className="text-slate-300"
                              >
                                {t("admin.contactEmail")}
                              </Label>
                              <Input
                                id="contactEmail"
                                type="email"
                                value={generalSettings.contactEmail}
                                onChange={(e) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    contactEmail: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="phoneNumber"
                                className="text-slate-300"
                              >
                                {t("admin.phoneNumber")}
                              </Label>
                              <Input
                                id="phoneNumber"
                                value={generalSettings.phoneNumber}
                                onChange={(e) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    phoneNumber: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="maxListingsPerUser"
                                className="text-slate-300"
                              >
                                {t("admin.maxListingsPerUser")}
                              </Label>
                              <Input
                                id="maxListingsPerUser"
                                type="number"
                                value={generalSettings.maxListingsPerUser}
                                onChange={(e) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    maxListingsPerUser: parseInt(
                                      e.target.value
                                    ),
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="maxImagesPerListing"
                                className="text-slate-300"
                              >
                                {t("admin.maxImagesPerListing")}
                              </Label>
                              <Input
                                id="maxImagesPerListing"
                                type="number"
                                value={generalSettings.maxImagesPerListing}
                                onChange={(e) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    maxImagesPerListing: parseInt(
                                      e.target.value
                                    ),
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="address"
                                className="text-slate-300"
                              >
                                {t("admin.address")}
                              </Label>
                              <Input
                                id="address"
                                value={generalSettings.address}
                                onChange={(e) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    address: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="siteDescription"
                              className="text-slate-300"
                            >
                              {t("admin.siteDescription")}
                            </Label>
                            <Textarea
                              id="siteDescription"
                              value={generalSettings.siteDescription}
                              onChange={(e) =>
                                setGeneralSettings({
                                  ...generalSettings,
                                  siteDescription: e.target.value,
                                })
                              }
                              className="bg-slate-700 border-slate-600 text-white h-20"
                            />
                          </div>

                          <div className="pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label
                                  htmlFor="enableRegistration"
                                  className="text-slate-300"
                                >
                                  {t("admin.enableRegistration")}
                                </Label>
                                <p className="text-slate-400 text-sm">
                                  {t("admin.enableRegistrationDesc")}
                                </p>
                              </div>
                              <Switch
                                id="enableRegistration"
                                checked={generalSettings.enableRegistration}
                                onCheckedChange={(checked) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    enableRegistration: checked,
                                  })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label
                                  htmlFor="requireEmailVerification"
                                  className="text-slate-300"
                                >
                                  {t("admin.requireEmailVerification")}
                                </Label>
                                <p className="text-slate-400 text-sm">
                                  {t("admin.requireEmailVerificationDesc")}
                                </p>
                              </div>
                              <Switch
                                id="requireEmailVerification"
                                checked={
                                  generalSettings.requireEmailVerification
                                }
                                onCheckedChange={(checked) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    requireEmailVerification: checked,
                                  })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label
                                  htmlFor="allowUserRating"
                                  className="text-slate-300"
                                >
                                  {t("admin.allowUserRating")}
                                </Label>
                                <p className="text-slate-400 text-sm">
                                  {t("admin.allowUserRatingDesc")}
                                </p>
                              </div>
                              <Switch
                                id="allowUserRating"
                                checked={generalSettings.allowUserRating}
                                onCheckedChange={(checked) =>
                                  setGeneralSettings({
                                    ...generalSettings,
                                    allowUserRating: checked,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <Alert className="bg-blue-900/20 border border-blue-800 text-blue-200">
                            <Info className="h-4 w-4" />
                            <AlertTitle>
                              {t("admin.logoAndFaviconSettings")}
                            </AlertTitle>
                            <AlertDescription>
                              {t("admin.logoAndFaviconSettingsDesc")}
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                        <CardFooter className="border-t border-slate-700 bg-slate-800/50 px-6 py-4">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                            onClick={handleSaveGeneralSettings}
                            disabled={updateSettings.isPending}
                          >
                            {updateSettings.isPending &&
                            updateSettings.variables?.general ? (
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

                    {/* Email Settings */}
                    <TabsContent value="email" className="py-4">
                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <div className="flex items-center">
                            <Settings2 className="h-5 w-5 text-blue-400 mr-2" />
                            <CardTitle className="text-white">
                              {t("admin.emailSettings")}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-slate-400">
                            {t("admin.emailSettingsDesc")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <Alert className="bg-amber-900/20 border border-amber-800 text-amber-200">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>
                              {t("admin.configureEmailFirst")}
                            </AlertTitle>
                            <AlertDescription>
                              {t("admin.configureEmailFirstDesc")}
                            </AlertDescription>
                          </Alert>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="smtpServer"
                                className="text-slate-300"
                              >
                                {t("admin.smtpServer")}
                              </Label>
                              <Input
                                id="smtpServer"
                                value={emailSettings.smtpServer}
                                onChange={(e) =>
                                  setEmailSettings({
                                    ...emailSettings,
                                    smtpServer: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="smtpPort"
                                className="text-slate-300"
                              >
                                {t("admin.smtpPort")}
                              </Label>
                              <Input
                                id="smtpPort"
                                type="number"
                                value={emailSettings.smtpPort}
                                onChange={(e) =>
                                  setEmailSettings({
                                    ...emailSettings,
                                    smtpPort: parseInt(e.target.value),
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="smtpUsername"
                                className="text-slate-300"
                              >
                                {t("admin.smtpUsername")}
                              </Label>
                              <Input
                                id="smtpUsername"
                                value={emailSettings.smtpUsername}
                                onChange={(e) =>
                                  setEmailSettings({
                                    ...emailSettings,
                                    smtpUsername: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="smtpPassword"
                                className="text-slate-300"
                              >
                                {t("admin.smtpPassword")}
                              </Label>
                              <Input
                                id="smtpPassword"
                                type="password"
                                value={emailSettings.smtpPassword}
                                onChange={(e) =>
                                  setEmailSettings({
                                    ...emailSettings,
                                    smtpPassword: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="fromEmail"
                                className="text-slate-300"
                              >
                                {t("admin.fromEmail")}
                              </Label>
                              <Input
                                id="fromEmail"
                                type="email"
                                value={emailSettings.fromEmail}
                                onChange={(e) =>
                                  setEmailSettings({
                                    ...emailSettings,
                                    fromEmail: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="fromName"
                                className="text-slate-300"
                              >
                                {t("admin.fromName")}
                              </Label>
                              <Input
                                id="fromName"
                                value={emailSettings.fromName}
                                onChange={(e) =>
                                  setEmailSettings({
                                    ...emailSettings,
                                    fromName: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>
                          </div>

                          <div className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <Label
                                  htmlFor="enableEmailNotifications"
                                  className="text-slate-300"
                                >
                                  {t("admin.enableEmailNotifications")}
                                </Label>
                                <p className="text-slate-400 text-sm">
                                  {t("admin.enableEmailNotificationsDesc")}
                                </p>
                              </div>
                              <Switch
                                id="enableEmailNotifications"
                                checked={emailSettings.enableEmailNotifications}
                                onCheckedChange={(checked) =>
                                  setEmailSettings({
                                    ...emailSettings,
                                    enableEmailNotifications: checked,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-white font-medium">
                              {t("admin.emailTemplates")}
                            </h3>

                            <div className="space-y-2">
                              <Label
                                htmlFor="newListingTemplate"
                                className="text-slate-300"
                              >
                                {t("admin.newListingTemplate")}
                              </Label>
                              <Textarea
                                id="newListingTemplate"
                                value={emailSettings.newListingTemplate}
                                onChange={(e) =>
                                  setEmailSettings({
                                    ...emailSettings,
                                    newListingTemplate: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white h-20"
                              />
                              <p className="text-xs text-slate-400">
                                {t("admin.availablePlaceholders")}:{" "}
                                {"{{title}}, {{username}}, {{date}}"}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="newMessageTemplate"
                                className="text-slate-300"
                              >
                                {t("admin.newMessageTemplate")}
                              </Label>
                              <Textarea
                                id="newMessageTemplate"
                                value={emailSettings.newMessageTemplate}
                                onChange={(e) =>
                                  setEmailSettings({
                                    ...emailSettings,
                                    newMessageTemplate: e.target.value,
                                  })
                                }
                                className="bg-slate-700 border-slate-600 text-white h-20"
                              />
                              <p className="text-xs text-slate-400">
                                {t("admin.availablePlaceholders")}:{" "}
                                {
                                  "{{sender}}, {{listing}}, {{recipient}}, {{date}}"
                                }
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-slate-700 bg-slate-800/50 px-6 py-4">
                          <Button
                            variant="outline"
                            className="text-slate-300 border-slate-600 hover:bg-slate-700 mr-2"
                            onClick={() => {
                              // Mock function to test email
                              toast({
                                title: t("admin.testEmailSent"),
                                description: t("admin.checkInbox"),
                              });
                            }}
                          >
                            {t("admin.testEmailSettings")}
                          </Button>

                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                            onClick={handleSaveEmailSettings}
                            disabled={updateSettings.isPending}
                          >
                            {updateSettings.isPending &&
                            updateSettings.variables?.email ? (
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

                    {/* Integrations Settings */}
                    <TabsContent value="integrations" className="py-4">
                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <div className="flex items-center">
                            <Settings2 className="h-5 w-5 text-blue-400 mr-2" />
                            <CardTitle className="text-white">
                              {t("admin.integrationSettings")}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-slate-400">
                            {t("admin.integrationSettingsDesc")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Google Analytics */}
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <h3 className="text-white font-medium">
                                  {t("admin.googleAnalytics")}
                                </h3>
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
                                  className="ml-auto"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="googleAnalyticsId"
                                  className="text-slate-300"
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
                                  className="bg-slate-700 border-slate-600 text-white"
                                  disabled={
                                    !integrationSettings.enableGoogleAnalytics
                                  }
                                />
                              </div>
                            </div>

                            {/* Facebook Pixel */}
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <h3 className="text-white font-medium">
                                  {t("admin.facebookPixel")}
                                </h3>
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
                                  className="ml-auto"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="facebookPixelId"
                                  className="text-slate-300"
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
                                  className="bg-slate-700 border-slate-600 text-white"
                                  disabled={
                                    !integrationSettings.enableFacebookPixel
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Google Maps */}
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <h3 className="text-white font-medium">
                                  {t("admin.googleMaps")}
                                </h3>
                                <Switch
                                  id="enableLocationMap"
                                  checked={
                                    integrationSettings.enableLocationMap
                                  }
                                  onCheckedChange={(checked) =>
                                    setIntegrationSettings({
                                      ...integrationSettings,
                                      enableLocationMap: checked,
                                    })
                                  }
                                  className="ml-auto"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="googleMapsApiKey"
                                  className="text-slate-300"
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
                                  className="bg-slate-700 border-slate-600 text-white"
                                  disabled={
                                    !integrationSettings.enableLocationMap
                                  }
                                />
                              </div>
                            </div>

                            {/* Payment Gateway */}
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <h3 className="text-white font-medium">
                                  {t("admin.paymentGateway")}
                                </h3>
                                <Switch
                                  id="enablePayments"
                                  checked={integrationSettings.enablePayments}
                                  onCheckedChange={(checked) =>
                                    setIntegrationSettings({
                                      ...integrationSettings,
                                      enablePayments: checked,
                                    })
                                  }
                                  className="ml-auto"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="paymentGateway"
                                  className="text-slate-300"
                                >
                                  {t("admin.selectPaymentGateway")}
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
                                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                                  disabled={!integrationSettings.enablePayments}
                                >
                                  <option value="stripe">Stripe</option>
                                  <option value="paypal">PayPal</option>
                                </select>
                              </div>

                              {integrationSettings.paymentGateway ===
                                "stripe" && (
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="stripePublicKey"
                                    className="text-slate-300"
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
                                    className="bg-slate-700 border-slate-600 text-white"
                                    disabled={
                                      !integrationSettings.enablePayments
                                    }
                                  />
                                </div>
                              )}

                              {integrationSettings.paymentGateway ===
                                "paypal" && (
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="paypalClientId"
                                    className="text-slate-300"
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
                                    className="bg-slate-700 border-slate-600 text-white"
                                    disabled={
                                      !integrationSettings.enablePayments
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <Alert className="bg-blue-900/20 border border-blue-800 text-blue-200 mt-4">
                            <Info className="h-4 w-4" />
                            <AlertTitle>{t("admin.secureStorage")}</AlertTitle>
                            <AlertDescription>
                              {t("admin.secureStorageDesc")}
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                        <CardFooter className="border-t border-slate-700 bg-slate-800/50 px-6 py-4">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                            onClick={handleSaveIntegrationSettings}
                            disabled={updateSettings.isPending}
                          >
                            {updateSettings.isPending &&
                            updateSettings.variables?.integrations ? (
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
