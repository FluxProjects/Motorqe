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
import { StatusBadge } from "@/components/ui/status-badge";
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


  // Fetch recent user activity
 const { data: statsData = [], isLoading, refetch } = useQuery({
      queryKey: ["admin-stats"],
      queryFn: () => fetch("/api/stats/overview").then((res) => res.json()),
    });

    console.log("statsData", statsData);

 

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
                      <h1 className="text-2xl font-bold sm:text-3xl truncate">
                        {t("admin.dashboard")}
                      </h1>
                      <p className="mt-1 text-sm text-slate-400 sm:text-base truncate">
                        {t("admin.welcomeMessage")}
                      </p>
                    </div>

                    <div className="ml-4 flex-shrink-0">
                    <Button
                      variant="default"
                      className="bg-orange-500 hover:bg-oreange-500/50 mr-2"
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

                    <div className="flex space-x-2">
                      <Link href="/admin/settings">
                        <Button
                          variant="outline"
                          className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {t("admin.siteSettings")}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-neutral-50">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-slate-400">
                              {t("admin.totalUsers")}
                            </p>
                            <h3 className="text-3xl font-bold mt-1">
                              {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                              ) : (
                                statsData?.totalUsers || 0
                              )}
                            </h3>
                            {!isLoading && statsData?.userGrowth && (
                              <p className="text-xs text-green-400 mt-1 flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                {statsData.userGrowth}% {t("admin.fromLastMonth")}
                              </p>
                            )}
                          </div>
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Users className="h-6 w-6 text-blue-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-neutral-50">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-slate-400">
                              {t("admin.totalListings")}
                            </p>
                            <h3 className="text-3xl font-bold mt-1">
                              {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                              ) : (
                                statsData?.totalListings || 0
                              )}
                            </h3>
                            {!isLoading && statsData?.listingGrowth && (
                              <p className="text-xs text-green-400 mt-1 flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                {statsData.listingGrowth}%{" "}
                                {t("admin.fromLastMonth")}
                              </p>
                            )}
                          </div>
                          <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Car className="h-6 w-6 text-indigo-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-neutral-50">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-slate-400">
                              {t("admin.pendingReports")}
                            </p>
                            <h3 className="text-3xl font-bold mt-1">
                              {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                              ) : (
                                statsData?.pendingReports || 0
                              )}
                            </h3>
                            {!isLoading && statsData?.pendingReports > 0 && (
                              <p className="text-xs text-yellow-400 mt-1">
                                {t("admin.needsAttention")}
                              </p>
                            )}
                          </div>
                          <div className="p-2 bg-amber-500/20 rounded-lg">
                            <Flag className="h-6 w-6 text-amber-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-neutral-50">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-slate-400">
                              {t("admin.pendingListings")}
                            </p>
                            <h3 className="text-3xl font-bold mt-1">
                              {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                              ) : (
                                statsData?.pendingListings || 0
                              )}
                            </h3>
                            {!isLoading && statsData?.pendingListings > 0 && (
                              <p className="text-xs text-yellow-400 mt-1">
                                {t("admin.requiresReview")}
                              </p>
                            )}
                          </div>
                          <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <ListFilter className="h-6 w-6 text-emerald-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Dashboard Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Users */}
                    <Card className="bg-neutral-50 lg:col-span-1">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center justify-between">
                          <span>{t("admin.recentUsers")}</span>
                          <Link href="/admin/users">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 bg-blue-700 text-white"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {t("admin.recentUsersDesc")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                          </div>
                        ) : statsData.recentUsers && statsData.recentUsers.length > 0 ? (
                          <div className="space-y-4">
                            {statsData.recentUsers.map((user: any) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                              >
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium">
                                    {user.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="ml-3">
                                    <p className="font-medium text-white">
                                      {user.username}
                                    </p>
                                    <p className="text-sm text-slate-400">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                                <Badge role={user.role} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-400">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>{t("admin.noRecentUsers")}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recent Listings */}
                    <Card className="bg-neutral-50 lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center justify-between">
                          <span>{t("admin.recentListings")}</span>
                          <Link href="/admin/listings">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 bg-blue-700 text-white"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {t("admin.recentListingsDesc")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                          </div>
                        ) : statsData.recentListings && statsData.recentListings.length > 0 ? (
                          <div className="rounded-md overflow-hidden">
                            <Table>
                              <TableHeader className="bg-slate-700">
                                <TableRow className="hover:bg-slate-700/70 border-slate-600">
                                  <TableHead className="text-slate-300">
                                    {t("car.carDetails")}
                                  </TableHead>
                                  <TableHead className="text-slate-300">
                                    {t("car.seller")}
                                  </TableHead>
                                  <TableHead className="text-slate-300">
                                    {t("common.status")}
                                  </TableHead>
                                  <TableHead className="text-right text-slate-300">
                                    {t("common.actions")}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {statsData.recentListings.map((listing: any) => (
                                  <TableRow
                                    key={listing.id}
                                    className="hover:bg-slate-700/50 border-slate-700"
                                  >
                                    <TableCell>
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 rounded overflow-hidden bg-slate-700 mr-3">
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
                                          <div className="font-medium text-white">
                                            {listing.title}
                                          </div>
                                          <div className="text-sm text-slate-400">
                                            ${listing.price.toLocaleString()}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-slate-300">
                                      {listing.seller.username}
                                    </TableCell>
                                    <TableCell>
                                      <StatusBadge status={listing.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Link
                                        href={`/admin/listings/review/${listing.id}`}
                                      >
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
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
                          <div className="text-center py-8 text-slate-400">
                            <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>{t("admin.noRecentListings")}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recent Reports */}
                    <Card className="bg-neutral-50 lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center justify-between">
                          <span>{t("admin.recentReports")}</span>
                          <Link href="/admin/reports">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 bg-blue-700 text-white"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {t("admin.recentReportsDesc")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                          </div>
                        ) : statsData.recentReports && statsData.recentReports.length > 0 ? (
                          <div className="space-y-4">
                            {statsData.recentReports.map((report: any) => (
                              <div
                                key={report.id}
                                className="p-4 bg-slate-700/50 rounded-lg"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center">
                                    <ShieldAlert className="h-5 w-5 text-red-400 mr-2" />
                                    <span className="font-medium text-white">
                                      {t(
                                        `admin.reportReason${
                                          report.reason
                                            .charAt(0)
                                            .toUpperCase() +
                                          report.reason.slice(1)
                                        }`
                                      )}
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-400">
                                    {new Date(
                                      report.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center mb-3">
                                  <Car className="h-4 w-4 text-slate-400 mr-2" />
                                  <span className="text-sm text-slate-300">
                                    {report.car.title}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-300 mb-3 bg-slate-600/50 p-2 rounded">
                                  {report.details}
                                </p>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center text-sm text-slate-400">
                                    <Users className="h-4 w-4 mr-1" />
                                    {t("admin.reportedBy")}:{" "}
                                    {report.user.username}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-200 hover:bg-slate-700"
                                  >
                                    {t("admin.reviewReport")}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-400">
                            <Flag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>{t("admin.noRecentReports")}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* CMS Stats */}
                    <Card className="bg-neutral-50 lg:col-span-1">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center justify-between">
                          <span>{t("admin.cmsOverview")}</span>
                          <Link href="/admin/cms">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 bg-blue-700 text-white"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {t("admin.cmsOverviewDesc")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                          </div>
                        ) : statsData?.contentStats ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-emerald-400 mr-2" />
                                <span className="text-slate-300">
                                  {t("admin.staticPages")}
                                </span>
                              </div>
                              <span className="font-medium">
                                {statsData.contentStats.pages || 0}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-blue-400 mr-2" />
                                <span className="text-slate-300">
                                  {t("admin.translatedContent")}
                                </span>
                              </div>
                              <span className="font-medium">
                                {statsData.contentStats.translatedPercent || 0}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                              <div className="flex items-center">
                                <Settings className="h-5 w-5 text-purple-400 mr-2" />
                                <span className="text-slate-300">
                                  {t("admin.siteSettings")}
                                </span>
                              </div>
                              <span className="font-medium">
                                {statsData.contentStats.settingsConfigured
                                  ? "✓"
                                  : "✗"}
                              </span>
                            </div>
                            <Link href="/admin/cms" className="block">
                              <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white">
                                {t("admin.manageCMS")}
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-400">
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

export default AdminDashboard;
