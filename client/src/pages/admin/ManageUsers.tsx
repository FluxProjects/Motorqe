import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import i18n, { resources } from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  User,
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  UserPlus,
  Shield,
  RefreshCw,
  Trash2,
  Loader2,
  Mail,
  Calendar,
  Car,
  MessageSquare,
  AlertTriangle,
  Check,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { roleMapping } from "@shared/permissions";
import { RoleBadge } from "@/lib/utils";

const ManageUsers = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    isEmailVerified: "all",
    sortBy: "newest",
  });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionType, setActionType] = useState<"ban" | "delete" | "promote">(
    "ban"
  );
  const [actionReason, setActionReason] = useState("");
  const [editedUser, setEditedUser] = useState<any>({
    username: "",
    email: "",
    role: "",
    isEmailVerified: false,
    status: "",
  });
  const [actionInProgress, setActionInProgress] = useState(false);

  // Fetch users with filters
  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/get-users", searchQuery, filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (searchQuery) {
        searchParams.append("search", searchQuery);
      }

      if (filters.role && filters.role !== "all") {
        searchParams.append("role", filters.role.toUpperCase());
      }

      if (filters.status && filters.status !== "all") {
        searchParams.append("status", filters.status);
      }

      if (filters.isEmailVerified && filters.isEmailVerified !== "all") {
        searchParams.append(
          "isEmailVerified", 
          filters.isEmailVerified === "verified" ? "true" : "false"
        );
      }

      if (filters.sortBy) {
        searchParams.append("sortBy", filters.sortBy);
      }

      const response = await fetch(`/api/get-users?${searchParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return await response.json();
    },
  });

  // Mutation for user actions
  const performAction = useMutation({
    mutationFn: async ({
      userId,
      action,
      reason,
      role,
    }: {
      userId: number;
      action: string;
      reason?: string;
      role?: string;
    }) => {
      setActionInProgress(true);

      if (action === "delete") {
        await apiRequest("DELETE", `/api/users/${userId}`, {});
        return;
      }

      await apiRequest("PUT", `/api/users/${userId}/actions`, {
        action,
        reason,
        role,
      });
    },
    onSuccess: () => {
      let message = "";

      switch (actionType) {
        case "ban":
          message = t("admin.userBanned");
          break;
        case "delete":
          message = t("admin.userDeleted");
          break;
        case "promote":
          message = t("admin.userPromoted");
          break;
      }

      toast({
        title: t("common.success"),
        description: message,
      });

      // Reset state
      setActionDialogOpen(false);
      setSelectedUser(null);
      setActionReason("");
      refetch();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error ? error.message : t("admin.actionFailed"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setActionInProgress(false);
    },
  });

  // Mutation for updating user
  const updateUser = useMutation({
    mutationFn: async (userData: any) => {
      setActionInProgress(true);
      return await apiRequest("PUT", `/api/users/${userData.id}`, userData);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("admin.userUpdated"),
      });

      setEditDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error ? error.message : t("admin.updateFailed"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setActionInProgress(false);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      role: "",
      status: "all",
      isEmailVerified: "all",
      sortBy: "newest",
    });
    refetch();
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditedUser({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role.toUpperCase(),
      isEmailVerified: user.isEmailVerified,
    });
    setEditDialogOpen(true);
  };

  const handleAction = (user: any, action: "ban" | "delete" | "promote") => {
    setSelectedUser(user);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedUser) return;

    switch (actionType) {
      case "ban":
        performAction.mutate({
          userId: selectedUser.id,
          action: "ban",
          reason: actionReason,
        });
        break;
      case "delete":
        performAction.mutate({
          userId: selectedUser.id,
          action: "delete",
        });
        break;
      case "promote":
        performAction.mutate({
          userId: selectedUser.id,
          action: "promote",
          role: "moderator",
        });
        break;
    }
  };

  const handleUpdateUser = () => {
    updateUser.mutate(editedUser);
  };

  useEffect(() => {
    // Debounce the refetch to avoid too many requests
    const timer = setTimeout(() => {
      refetch();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, refetch]);

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Admin Sidebar */}
            <div className="hidden md:block">
              {user?.roleId && (
                <DashboardSidebar type={roleMapping[user?.roleId] || "BUYER"} />
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold">
                    {t("admin.manageUsers")}
                  </h1>
                  <div className="flex gap-2">
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

                    <Button
                      variant="outline"
                      className="hover:bg-blue-900 border-blue-700 hover:text-white"
                      onClick={() => {
                        /* Handle add user */
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t("admin.addUser")}
                    </Button>
                  </div>
                </div>

                {/* Search & Filters */}
                <div className="mt-4 mb-6 bg-neutral-50 border-2 border-orange-500 border-solid rounded-lg shadow p-4">
                  <form onSubmit={handleSearch} className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder={t("admin.searchUsers")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="default"
                      className="bg-blue-500 hover:bg-blue-900 text-white"
                    >
                      {t("common.search")}
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      className="bg-blue-900 text-white hover:bg-blue-500"
                      onClick={resetFilters}
                    >
                      {t("common.reset")}
                    </Button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      {/* Role Filter */}
                      <Select
                        value={filters.role}
                        onValueChange={(value) => {
                          setFilters({ ...filters, role: value });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("admin.filterByRole")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("admin.allRoles")}
                          </SelectItem>
                          <SelectItem value="BUYER">
                            {t("admin.buyer")}
                          </SelectItem>
                          <SelectItem value="SELLER">
                            {t("admin.seller")}
                          </SelectItem>
                          <SelectItem value="DEALER">
                            {t("admin.dealer")}
                          </SelectItem>
                          <SelectItem value="GARAGE">
                            {t("admin.garage")}
                          </SelectItem>
                          <SelectItem value="MODERATOR">
                            {t("admin.moderator")}
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            {t("admin.admin")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Email Verification Filter */}
                    <div>
                      <Select
                        value={filters.isEmailVerified}
                        onValueChange={(value) => {
                          setFilters({ ...filters, isEmailVerified: value });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("admin.filterByVerification")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("admin.allVerifications")}
                          </SelectItem>
                          <SelectItem value="verified">
                            {t("admin.verified")}
                          </SelectItem>
                          <SelectItem value="unverified">
                            {t("admin.unverified")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Account Status Filter */}
                    <div>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => {
                          setFilters({ ...filters, status: value });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("admin.filterByStatus")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("admin.allStatuses")}
                          </SelectItem>
                          <SelectItem value="active">
                            {t("admin.active")}
                          </SelectItem>
                          <SelectItem value="inactive">
                            {t("admin.inactive")}
                          </SelectItem>
                          <SelectItem value="suspended">
                            {t("admin.suspended")}
                          </SelectItem>
                          <SelectItem value="removed">
                            {t("admin.removed")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Select
                        value={filters.sortBy || "newest"}
                        onValueChange={(value) =>
                          setFilters({ ...filters, sortBy: value })
                        }
                      >
                        <SelectTrigger className="">
                          <SelectValue placeholder={t("admin.sortBy")} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 text-gray-800">
                          <SelectItem value="newest">
                            {t("admin.newest")}
                          </SelectItem>
                          <SelectItem value="oldest">
                            {t("admin.oldest")}
                          </SelectItem>
                          <SelectItem value="username_asc">
                            {t("admin.usernameAZ")}
                          </SelectItem>
                          <SelectItem value="username_desc">
                            {t("admin.usernameZA")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-neutral-50 rounded-lg overflow-hidden">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-500">
                        {t("common.loading")}
                      </span>
                    </div>
                  ) : usersData && usersData.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100 border-b border-gray-300">
                          <TableHead className="text-gray-800 font-semibold">
                            {t("admin.user")}
                          </TableHead>
                          <TableHead className="text-gray-800 font-semibold">
                            {t("admin.email")}
                          </TableHead>
                          <TableHead className="text-gray-800 font-semibold">
                            {t("admin.phone")}
                          </TableHead>
                          <TableHead className="text-gray-800 font-semibold">
                            {t("admin.role")}
                          </TableHead>
                          <TableHead className="text-gray-800 font-semibold">
                            {t("admin.verificationStatus")}
                          </TableHead>
                          <TableHead className="text-gray-800 font-semibold">
                            {t("admin.status")}
                          </TableHead>
                          <TableHead className="text-gray-800 font-semibold">
                            {t("admin.joinedOn")}
                          </TableHead>
                          <TableHead className="text-gray-800 font-semibold">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersData.map((user: any) => (
                          <TableRow
                            key={user.id}
                            className="border-b border-gray-200"
                          >
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2 bg-gray-300">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="">
                                    {user.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {user.username}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="">{user.email}</TableCell>
                            <TableCell className="">{user.phone}</TableCell>
                            <TableCell>
                              <RoleBadge role={user.role} />
                            </TableCell>
                            <TableCell>
                              {!user.is_email_verified ? (
                                <Badge className="bg-yellow-100 text-yellow-800 hover:text-white">
                                  {t("admin.unverified")}
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 hover:text-white">
                                  {t("admin.verified")}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.status === "active" && (
                                <Badge className="bg-green-100 text-green-800 hover:text-white">
                                  {t("admin.active")}
                                </Badge>
                              )}
                              {user.status === "inactive" && (
                                <Badge className="bg-gray-100 text-gray-800 hover:text-white">
                                  {t("admin.inactive")}
                                </Badge>
                              )}
                              {user.status === "suspended" && (
                                <Badge className="bg-red-100 text-red-800 hover:text-white">
                                  {t("admin.suspended")}
                                </Badge>
                              )}
                              {user.status === "removed" && (
                                <Badge className="bg-zinc-100 text-zinc-800 hover:text-white">
                                  {t("admin.removed")}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-white"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white border border-gray-200 text-gray-800">
                                  <DropdownMenuLabel>
                                    {t("common.actions")}
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem
                                    className="hover:bg-gray-100"
                                    onClick={() => handleViewUser(user)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("common.view")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="hover:bg-gray-100"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t("common.edit")}
                                  </DropdownMenuItem>

                                  {/* In the dropdown menu */}
                                  {!user.isSuspended &&
                                    user.role !== "ADMIN" && (
                                      <DropdownMenuItem
                                        className="hover:bg-gray-100"
                                        onClick={() =>
                                          handleAction(user, "ban")
                                        }
                                      >
                                        <Ban className="mr-2 h-4 w-4 text-amber-500" />
                                        {t("admin.suspendUser")}
                                      </DropdownMenuItem>
                                    )}

                                  {user.role !== "ADMIN" &&
                                    user.role !== "MODERATOR" && (
                                      <DropdownMenuItem
                                        className="hover:bg-gray-100"
                                        onClick={() =>
                                          handleAction(user, "promote")
                                        }
                                      >
                                        <Shield className="mr-2 h-4 w-4 text-blue-500" />
                                        {t("admin.promoteToModerator")}
                                      </DropdownMenuItem>
                                    )}
                                  <DropdownMenuSeparator className="bg-gray-200" />
                                  <DropdownMenuItem
                                    className="text-red-400 hover:bg-gray-100 focus:bg-red-900/30"
                                    onClick={() => handleAction(user, "delete")}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("admin.deleteUser")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Users className="h-16 w-16 text-slate-700 mb-4" />
                      <h3 className="text-xl font-medium text-slate-400 mb-2">
                        {t("admin.noUsersFound")}
                      </h3>
                      <p className="text-slate-500 text-center max-w-md mb-4">
                        {t("admin.noUsersFoundDesc")}
                      </p>
                      <Button
                        variant="outline"
                        onClick={resetFilters}
                        className="border-slate-600 text-slate-700 hover:bg-slate-700"
                      >
                        {t("common.resetFilters")}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {usersData && usersData.totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <nav className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-slate-700 text-slate-400 hover:bg-slate-800"
                        disabled={usersData.currentPage === 1}
                      >
                        <span className="sr-only">{t("common.previous")}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Button>

                      {Array.from({ length: usersData.totalPages }).map(
                        (_, i) => (
                          <Button
                            key={i}
                            variant={
                              usersData.currentPage === i + 1
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className={
                              usersData.currentPage === i + 1
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "border-slate-700 text-slate-400 hover:bg-slate-800"
                            }
                          >
                            {i + 1}
                          </Button>
                        )
                      )}

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-slate-700 text-slate-400 hover:bg-slate-800"
                        disabled={
                          usersData.currentPage === usersData.totalPages
                        }
                      >
                        <span className="sr-only">{t("common.next")}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View User Dialog */}
      {selectedUser && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="bg-white text-neutral-900 border-neutral-200 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-neutral-900">
                {t("admin.userDetails")}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="md:col-span-1 flex flex-col items-center">
                <Avatar className="h-32 w-32 bg-neutral-100">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="text-3xl text-neutral-400">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <h3 className="text-lg font-semibold mt-4 text-neutral-900">
                  {selectedUser.username}
                </h3>
                <RoleBadge role={selectedUser.role} className="mt-2" />

                {selectedUser.isSuspended && (
                  <Badge className="mt-2 bg-red-100 text-red-600">
                    {t("admin.suspended")}
                  </Badge>
                )}

                <div className="w-full mt-4 space-y-2">
                  <div className="flex items-center text-sm p-2 bg-neutral-100 rounded">
                    <Mail className="h-4 w-4 mr-2 text-neutral-500" />
                    <span className="text-neutral-600 truncate">
                      {selectedUser.email}
                    </span>
                  </div>
                  <div className="flex items-center text-sm p-2 bg-neutral-100 rounded">
                    <Calendar className="h-4 w-4 mr-2 text-neutral-500" />
                    <span className="text-neutral-600">
                      {t("admin.joinedOn")}:{" "}
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="bg-neutral-100 p-3 rounded-lg">
                  <h4 className="font-medium text-neutral-700 mb-2">
                    {t("admin.accountStats")}
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm text-neutral-700">
                          {t("admin.listingsCount")}
                        </span>
                      </div>
                      <span className="font-medium">
                        {selectedUser.listingsCount || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-neutral-700">
                          {t("admin.messagesCount")}
                        </span>
                      </div>
                      <span className="font-medium">
                        {selectedUser.messagesCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-100 p-3 rounded-lg">
                  <h4 className="font-medium text-neutral-700 mb-2">
                    {t("admin.activitySummary")}
                  </h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                      <span className="text-sm text-neutral-700">
                        {t("admin.lastActive")}
                      </span>
                      <span>
                        {selectedUser.lastActive
                          ? new Date(selectedUser.lastActive).toLocaleString()
                          : t("admin.never")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                      <span className="text-sm text-neutral-700">
                        {t("admin.emailVerified")}
                      </span>
                      <span>
                        {selectedUser.isEmailVerified
                          ? t("common.yes")
                          : t("common.no")}
                      </span>
                    </div>

                    {selectedUser.isSuspended && (
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm text-red-600">
                          {t("admin.suspendedOn")}
                        </span>
                        <span className="text-red-600">
                          {new Date(
                            selectedUser.suspendedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-neutral-100 p-3 rounded-lg">
                  <h4 className="font-medium text-neutral-700 mb-2">
                    {t("admin.recentActivity")}
                  </h4>

                  {selectedUser.recentActivity &&
                  selectedUser.recentActivity.length > 0 ? (
                    <div className="space-y-2">
                      {selectedUser.recentActivity.map(
                        (activity: any, index: number) => (
                          <div
                            key={index}
                            className="p-2 bg-neutral-50 rounded"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-neutral-700">
                                {activity.action}
                              </span>
                              <span className="text-xs text-neutral-500">
                                {new Date(activity.date).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500 p-2 text-center">
                      {t("admin.noRecentActivity")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setViewDialogOpen(false)}
                className="border-neutral-300 text-neutral-700 hover:bg-neutral-100"
              >
                {t("common.close")}
              </Button>

              <div className="space-x-2">
                <Button
                  variant="outline"
                  className="border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEditUser(selectedUser);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t("common.edit")}
                </Button>

                {!selectedUser.isSuspended && selectedUser.role !== "admin" && (
                  <Button
                    variant="outline"
                    className="border-amber-300 bg-amber-100 text-amber-600 hover:bg-amber-200"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleAction(selectedUser, "ban");
                    }}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    {t("admin.suspend")}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-white text-neutral-900 border-neutral-200 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-neutral-900">
                {t("admin.editUser")}
              </DialogTitle>
              <DialogDescription>
                {t("admin.editUserDesc", { username: selectedUser.username })}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  {t("admin.username")}
                </Label>
                <Input
                  id="username"
                  value={editedUser.username}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, username: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  {t("admin.email")}
                </Label>
                <Input
                  id="email"
                  value={editedUser.email}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  {t("admin.role")}
                </Label>
                <Select
                  value={editedUser.role}
                  onValueChange={(value) =>
                    setEditedUser({ ...editedUser, role: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t("admin.selectRole")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">{t("admin.admin")}</SelectItem>
                    <SelectItem value="MODERATOR">
                      {t("admin.moderator")}
                    </SelectItem>
                    <SelectItem value="SELLER">{t("admin.seller")}</SelectItem>
                    <SelectItem value="DEALER">{t("admin.dealer")}</SelectItem>
                    <SelectItem value="GARAGE">{t("admin.garage")}</SelectItem>
                    <SelectItem value="BUYER">{t("admin.buyer")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="verified" className="text-right">
                  {t("admin.emailVerified")}
                </Label>
                <div className="col-span-3 flex items-center">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={editedUser.isEmailVerified}
                    onChange={(e) =>
                      setEditedUser({
                        ...editedUser,
                        isEmailVerified: e.target.checked,
                      })
                    }
                    className="mr-2 h-4 w-4"
                  />
                  <Label htmlFor="verified">
                    {editedUser.isEmailVerified
                      ? t("common.yes")
                      : t("common.no")}
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={actionInProgress}
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleUpdateUser} disabled={actionInProgress}>
                {actionInProgress ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {t("common.saveChanges")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Action Dialog */}
      {selectedUser && (
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent className="bg-slate-800 text-white border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {actionType === "ban" && t("admin.suspendUser")}
                {actionType === "delete" && t("admin.deleteUser")}
                {actionType === "promote" && t("admin.promoteToModerator")}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {actionType === "ban" &&
                  t("admin.suspendUserDesc", {
                    username: selectedUser.username,
                  })}
                {actionType === "delete" &&
                  t("admin.deleteUserDesc", {
                    username: selectedUser.username,
                  })}
                {actionType === "promote" &&
                  t("admin.promoteUserDesc", {
                    username: selectedUser.username,
                  })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {actionType === "ban" && (
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-slate-300">
                    {t("admin.suspensionReason")}
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder={t("admin.suspensionReasonPlaceholder")}
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              )}

              {actionType === "delete" && (
                <div className="bg-red-900/20 border border-red-800 p-3 rounded-md text-red-300 text-sm">
                  <AlertTriangle className="h-5 w-5 text-red-400 mb-2" />
                  <p>{t("admin.deleteUserWarning")}</p>
                </div>
              )}

              {actionType === "promote" && (
                <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-md text-blue-300 text-sm">
                  <Shield className="h-5 w-5 text-blue-400 mb-2" />
                  <p>{t("admin.promoteUserInfo")}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActionDialogOpen(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={actionInProgress}
              >
                {t("common.cancel")}
              </Button>

              <Button
                onClick={confirmAction}
                disabled={
                  (actionType === "ban" && !actionReason.trim()) ||
                  actionInProgress
                }
                className={`
                  ${
                    actionType === "ban"
                      ? "bg-amber-700 hover:bg-amber-800"
                      : ""
                  }
                  ${
                    actionType === "delete" ? "bg-red-700 hover:bg-red-800" : ""
                  }
                  ${
                    actionType === "promote"
                      ? "bg-blue-700 hover:bg-blue-800"
                      : ""
                  }
                  text-white
                `}
              >
                {actionInProgress ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <>
                    {actionType === "ban" && <Ban className="h-4 w-4 mr-2" />}
                    {actionType === "delete" && (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    {actionType === "promote" && (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                  </>
                )}

                {actionType === "ban" && t("admin.suspendUser")}
                {actionType === "delete" && t("admin.deleteUser")}
                {actionType === "promote" && t("admin.promoteUser")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManageUsers;
