import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Users,
  Car,
  Flag,
  ArrowUpRight,
  Loader2,
  ShieldAlert,
  Settings,
  ListFilter,
  FileText,
  RefreshCw,
} from "lucide-react";
import { CarListing, User } from "@shared/schema";
import ProtectedRoute from "@/components/ProtectedRoute";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const getStatusBadge = (status: string) => {
      switch (status) {
        case "active":
          return (
            <Badge className="bg-green-100 text-green-800">
              {t("admin.active")}
            </Badge>
          );
        case "pending":
          return (
            <Badge className="bg-yellow-100 text-yellow-800">
              {t("admin.pending")}
            </Badge>
          );
        case "rejected":
          return (
            <Badge className="bg-red-100 text-red-800">
              {t("admin.rejected")}
            </Badge>
          );
        case "sold":
          return (
            <Badge className="bg-blue-100 text-blue-800">{t("admin.sold")}</Badge>
          );
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    };

  // Fetch recent user activity
 const { data: statsData = [], isLoading, refetch } = useQuery({
      queryKey: ["admin-stats"],
      queryFn: () => fetch("/api/stats/overview").then((res) => res.json()),
    });

    console.log("statsData", statsData);

 // Helper component for user role badges
const Badge = ({ role }: { role: string }) => {
  let bgColor = "bg-slate-600";
  let textColor = "text-slate-200";

  switch (role) {
    case "admin":
      bgColor = "bg-red-900/30";
      textColor = "text-red-400";
      break;
    case "moderator":
      bgColor = "bg-amber-900/30";
      textColor = "text-amber-400";
      break;
    case "seller":
      bgColor = "bg-blue-900/30";
      textColor = "text-blue-400";
      break;
    case "buyer":
      bgColor = "bg-green-900/30";
      textColor = "text-green-400";
      break;
    case "both":
      bgColor = "bg-purple-900/30";
      textColor = "text-purple-400";
      break;
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${bgColor} ${textColor}`}>
      {role}
    </span>
  );
};

  return (
    <ProtectedRoute allowedRoles={["MODERATOR", "ADMIN", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="md:flex">
              {/* Admin Sidebar */}
              <div className="hidden md:block">
                <DashboardSidebar type="ADMIN" />
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-7xl mx-auto">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl truncate">
                        {t("admin.dashboard")}
                      </h1>
                      <p className="mt-1 text-sm text-gray-500 sm:text-base truncate">
                        {t("admin.welcomeMessage")}
                      </p>
                    </div>

                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <Button
                        variant="default"
                        className="bg-blue-600 hover:bg-blue-700 text-white mr-2"
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

                      <Link href="/admin/settings">
                        <Button
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {t("admin.siteSettings")}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500">
                              {t("admin.totalUsers")}
                            </p>
                            <h3 className="text-3xl font-bold mt-1 text-gray-800">
                              {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                              ) : (
                                statsData?.totalUsers || 0
                              )}
                            </h3>
                            {!isLoading && statsData?.userGrowth && (
                              <p className="text-xs text-green-600 mt-1 flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                {statsData.userGrowth}% {t("admin.fromLastMonth")}
                              </p>
                            )}
                          </div>
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500">
                              {t("admin.totalListings")}
                            </p>
                            <h3 className="text-3xl font-bold mt-1 text-gray-800">
                              {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                              ) : (
                                statsData?.totalListings || 0
                              )}
                            </h3>
                            {!isLoading && statsData?.listingGrowth && (
                              <p className="text-xs text-green-600 mt-1 flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                {statsData.listingGrowth}% {t("admin.fromLastMonth")}
                              </p>
                            )}
                          </div>
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Car className="h-6 w-6 text-indigo-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500">
                              {t("admin.pendingReports")}
                            </p>
                            <h3 className="text-3xl font-bold mt-1 text-gray-800">
                              {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                              ) : (
                                statsData?.pendingReports || 0
                              )}
                            </h3>
                            {!isLoading && statsData?.pendingReports > 0 && (
                              <p className="text-xs text-yellow-600 mt-1">
                                {t("admin.needsAttention")}
                              </p>
                            )}
                          </div>
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <Flag className="h-6 w-6 text-amber-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500">
                              {t("admin.pendingListings")}
                            </p>
                            <h3 className="text-3xl font-bold mt-1 text-gray-800">
                              {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                              ) : (
                                statsData?.pendingListings || 0
                              )}
                            </h3>
                            {!isLoading && statsData?.pendingListings > 0 && (
                              <p className="text-xs text-yellow-600 mt-1">
                                {t("admin.requiresReview")}
                              </p>
                            )}
                          </div>
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <ListFilter className="h-6 w-6 text-emerald-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Dashboard Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Users */}
                    <Card className="bg-white border border-gray-200 lg:col-span-1">
                      <CardHeader>
                        <CardTitle className="text-xl text-gray-800 flex items-center justify-between">
                          <span>{t("admin.recentUsers")}</span>
                          <Link href="/admin/users">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                          {t("admin.recentUsersDesc")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                          </div>
                        ) : statsData.recentUsers && statsData.recentUsers.length > 0 ? (
                          <div className="space-y-4">
                            {statsData.recentUsers.map((user: any) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                                    {user.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="ml-3">
                                    <p className="font-medium text-gray-800">
                                      {user.first_name} {user.last_name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                                <Badge role={user.role} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>{t("admin.noRecentUsers")}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recent Listings */}
                    <Card className="bg-white border border-gray-200 lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-xl text-gray-800 flex items-center justify-between">
                          <span>{t("admin.recentListings")}</span>
                          <Link href="/admin/listings">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                          {t("admin.recentListingsDesc")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                          </div>
                        ) : statsData.recentListings && statsData.recentListings.length > 0 ? (
                          <div className="rounded-md overflow-hidden border border-gray-200">
                            <Table>
                              <TableHeader className="bg-gray-50">
                                <TableRow className="hover:bg-gray-50 border-gray-200">
                                  <TableHead className="text-gray-600">
                                    {t("car.carDetails")}
                                  </TableHead>
                                  <TableHead className="text-gray-600">
                                    {t("car.seller")}
                                  </TableHead>
                                  <TableHead className="text-gray-600">
                                    {t("common.status")}
                                  </TableHead>
                                  <TableHead className="text-right text-gray-600">
                                    {t("common.actions")}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {statsData.recentListings.map((listing: any) => (
                                  <TableRow
                                    key={listing.id}
                                    className="hover:bg-gray-50 border-gray-200"
                                  >
                                    <TableCell>
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 mr-3">
                                          {listing.images &&
                                            listing.images.length > 0 && (
                                              <img
                                                src={listing.images[0]}
                                                alt={listing.title}
                                                className="h-full w-full object-cover"
                                              />
                                            )}
                                        </div>
                                        <div>
                                          <div className="font-medium text-gray-800">
                                            {listing.title}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            ${listing.price}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                      {listing?.seller_name}
                                    </TableCell>
                                    <TableCell>
                                      {listing?.status}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Link
                                        href={"/admin/listings/"}{...listing.id}>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                        >
                                          {t("common.review")}
                                        </Button>
                                      </Link>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>{t("admin.noRecentListings")}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recent Reports */}
                    <Card className="bg-white border border-gray-200 lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-xl text-gray-800 flex items-center justify-between">
                          <span>{t("admin.recentReports")}</span>
                          <Link href="/admin/reports">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                          {t("admin.recentReportsDesc")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                          </div>
                        ) : statsData.recentReports && statsData.recentReports.length > 0 ? (
                          <div className="space-y-4">
                            {statsData.recentReports.map((report: any) => (
                              <div
                                key={report.id}
                                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center">
                                    <ShieldAlert className="h-5 w-5 text-red-500 mr-2" />
                                    <span className="font-medium text-gray-800">
                                      {report.reason}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      report.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center mb-3">
                                  <Car className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    {report.listing_title}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-3 bg-gray-100 p-2 rounded">
                                  {report.username}
                                </p>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Users className="h-4 w-4 mr-1" />
                                    {t("admin.reportedBy")}:{" "}
                                    {report.user_first_name} {report.user_last_name}
                                  </div>
                                
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Flag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>{t("admin.noRecentReports")}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* CMS Stats */}
                    <Card className="bg-white border border-gray-200 lg:col-span-1">
                      <CardHeader>
                        <CardTitle className="text-xl text-gray-800 flex items-center justify-between">
                          <span>{t("admin.cmsOverview")}</span>
                          <Link href="/admin/cms">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                          {t("admin.cmsOverviewDesc")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                          </div>
                        ) : statsData?.cmsOverview ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-emerald-600 mr-2" />
                                <span className="text-gray-700">
                                  {t("admin.staticPages")}
                                </span>
                              </div>
                              <span className="font-medium text-gray-800">
                                {statsData.cmsOverview.length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                                <span className="text-gray-700">
                                  {t("admin.translatedContent")}
                                </span>
                              </div>
                              <span className="font-medium text-gray-800">
                                {statsData.cmsOverview.content_ar_filled_count}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center">
                                <Settings className="h-5 w-5 text-purple-600 mr-2" />
                                <span className="text-gray-700">
                                  {t("admin.siteSettings")}
                                </span>
                              </div>
                              <span className="font-medium text-gray-800">
                                {statsData.cmsOverview.settingsConfigured
                                  ? "✓"
                                  : "✗"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>{t("admin.noCmsData")}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};



export default AdminDashboard;
