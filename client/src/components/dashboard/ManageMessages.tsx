// Messages.tsx

import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "./DashboardSidebar";
import { roleSchema, roleMapping } from "@shared/permissions";
import { Message } from "@shared/schema";
import { z } from "zod";
import {
  Eye,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type UserRole = z.infer<typeof roleSchema>;


const ManageMessages = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<Partial<Message>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState({
    type: "all",
    status: "all",
    sortBy: "newest",
  });

  const {
    data: messagesData = [],
    isLoading,
    refetch,
    error,
  } = useQuery<Message[]>({
    queryKey: ["getMessages", user?.id],
    enabled: !!user?.id && isAuthenticated,
  });

  // ✅ Correct filtering
  const filteredMessages = messagesData
    .filter((msg) => {
      const matchesType =
        statusFilter.type === "all" || msg.type === statusFilter.type;

      const matchesStatus =
        statusFilter.status === "all" || msg.status === statusFilter.status;

      const matchesSearch =
        searchTerm.trim() === "" ||
        msg.senderId
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesType && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (statusFilter.sortBy === "newest") {
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
      } else if (statusFilter.sortBy === "oldest") {
        return (
          new Date(a.createdAt ?? 0).getTime() -
          new Date(b.createdAt ?? 0).getTime()
        );
      }
      return 0;
    });

  // ✅ Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.senderId || !formData.content) return;

    // You can now use formData to submit a reply or update message status, etc.
    console.log("Submit message formData:", formData);
  };

  // ✅ Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setSearchTerm(""); // Reset the search term
    setStatusFilter({
      type: "all", // Default value for 'type'
      status: "all", // Default value for 'status'
      sortBy: "newest", // Default value for 'sortBy'
    });
  };

  const renderRoleSpecificFields = () => {
    const fields: Record<UserRole, JSX.Element[]> = {
      BUYER: [],
      SELLER: [],
      DEALER: [
        renderInput("showroomName", t("profile.showroomName")),
        renderInput("showroomLocation", t("profile.showroomLocation")),
      ],
      GARAGE: [
        renderInput("showroomName", t("profile.showroomName")),
        renderInput("showroomLocation", t("profile.showroomLocation")),
      ],
      MODERATOR: [],
      SENIOR_MODERATOR: [],
      ADMIN: [],
      SUPER_ADMIN: [],
    };

    return fields[userRole] || null;
  };

  const renderInput = (name: string, label: string) => (
    <div className="mb-4" key={name}>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        value={(formData as any)[name] || ""}
        onChange={handleChange}
        className="mt-1 p-2 border rounded w-full"
      />
    </div>
  );

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
                    {t("admin.manageMessages")}
                  </h1>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="text-slate-200 border-slate-700 bg-slate-700 hover:bg-blue-600 hover:text-white mr-2"
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

                {/* Search & Filters */}
                <div className="mt-4 mb-6 bg-neutral-50 border-2 border-orange-500 border-solid rounded-lg shadow p-4">
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex gap-3 mb-4"
                  >
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder={t("admin.searchMessages")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {t("common.search")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-600 text-slate-700 hover:bg-slate-700"
                      onClick={resetFilters}
                    >
                      {t("common.reset")}
                    </Button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Select
                        value={statusFilter.type || "all"}
                        onValueChange={(value) =>
                          setStatusFilter({ ...statusFilter, type: value })
                        }
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder={t("admin.filterByType")} />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="all">
                            {t("admin.allMessageTypes")}
                          </SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Select
                        value={statusFilter.status || "all"}
                        onValueChange={(value) =>
                          setStatusFilter({ ...statusFilter, status: value })
                        }
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue
                            placeholder={t("admin.filterByStatus")}
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="all">
                            {t("admin.allStatuses")}
                          </SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Select
                        value={statusFilter.sortBy || "newest"}
                        onValueChange={(value) =>
                          setStatusFilter({ ...statusFilter, sortBy: value })
                        }
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder={t("admin.sortBy")} />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="newest">
                            {t("admin.newest")}
                          </SelectItem>
                          <SelectItem value="oldest">
                            {t("admin.oldest")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Messages Table */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <span className="ml-2 text-slate-400">
                        {t("common.loading")}
                      </span>
                    </div>
                  ) : messagesData && messagesData.length > 0 ? (
                    <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-500 hover:bg-neutral-700 border-neutral-50">
                        <TableHead className="text-white">
                            Sender ID
                          </TableHead>
                          <TableHead className="text-white">
                            Receiver ID
                          </TableHead>
                          <TableHead className="text-white">Type</TableHead>
                          <TableHead className="text-white">
                            Status
                          </TableHead>
                          <TableHead className="text-white">
                            Sent At
                          </TableHead>
                          <TableHead className="text-right text-slate-300">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messagesData.map((message: any) => (
                          <TableRow
                            key={message.id}
                            className="hover:bg-slate-700/50 border-slate-700"
                          >
                            <TableCell className="text-slate-200">
                              {message.senderId}
                            </TableCell>
                            <TableCell className="text-slate-200">
                              {message.receiverId}
                            </TableCell>
                            <TableCell className="text-slate-200 capitalize">
                              {message.type}
                            </TableCell>
                            <TableCell>
                              {message.status === "sent" ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Sent
                                </Badge>
                              ) : message.status === "pending" ? (
                                <Badge className="bg-amber-100 text-amber-800">
                                  Pending
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">
                                  Failed
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-slate-400 text-sm">
                              {message.sentAt
                                ? new Date(message.sentAt).toLocaleString()
                                : "-"}
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
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-slate-800 border-slate-700 text-slate-300"
                                >
                                  <DropdownMenuItem
                                    className="hover:bg-slate-700 focus:bg-slate-700"
                                    onClick={() => handleViewMessage(message)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("common.view")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-400 hover:bg-red-900/30 focus:bg-red-900/30"
                                    onClick={() => handleDeleteMessage(message)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("common.delete")}
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
                      <p className="text-slate-400">
                        {t("admin.noMessagesFound")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMessages;
