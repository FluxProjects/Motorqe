// Messages.tsx
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
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
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { queryClient } from "@/lib/queryClient";

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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: messagesData = [],
    isLoading,
    refetch,
    error,
  } = useQuery<Message[]>({
    queryKey: ["/api/messages", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`/api/messages/${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", user?.id] });
    },
  });

  const handleDeleteMessage = (id: number) => {
    if (confirm(t("admin.confirmDeleteMessage") || "Are you sure you want to delete this message?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
  };

  // Filter and sort messages
  const filteredMessages = messagesData
    .filter((msg) => {
      const matchesType =
        statusFilter.type === "all" || msg.type === statusFilter.type;

      const matchesStatus =
        statusFilter.status === "all" || msg.status === statusFilter.status;

      const matchesSearch =
        searchTerm.trim() === "" ||
        msg.sender_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.receiver_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.content?.toLowerCase().includes(searchTerm.toLowerCase());

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

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter({
      type: "all",
      status: "all",
      sortBy: "newest",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow overflow-hidden">
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
                  <h1 className="text-3xl font-bold text-gray-800">
                    {t("admin.manageMessages")}
                  </h1>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="text-white bg-orange-500 hover:bg-orange-700 hover:text-white mr-2"
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
                <div className="mt-4 mb-6 bg-neutral-50 border border-orange-300 rounded-lg shadow p-4">
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex gap-3 mb-4"
                  >
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder={t("admin.searchMessages")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-gray-300 text-gray-800 placeholder:text-gray-400"
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
                      className="border-gray-400 text-gray-700 hover:bg-gray-100"
                      onClick={resetFilters}
                    >
                      {t("common.reset")}
                    </Button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Select
                        value={statusFilter.type}
                        onValueChange={(value) =>
                          setStatusFilter({ ...statusFilter, type: value })
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder={t("admin.filterByType")} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 text-gray-800">
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
                        value={statusFilter.status}
                        onValueChange={(value) =>
                          setStatusFilter({ ...statusFilter, status: value })
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder={t("admin.filterByStatus")} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 text-gray-800">
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
                        value={statusFilter.sortBy}
                        onValueChange={(value) =>
                          setStatusFilter({ ...statusFilter, sortBy: value })
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder={t("admin.sortBy")} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 text-gray-800">
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
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-500">
                        {t("common.loading")}
                      </span>
                    </div>
                  ) : filteredMessages.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100 hover:bg-gray-200 border-b">
                          <TableHead className="text-gray-700">Sender</TableHead>
                          <TableHead className="text-gray-700">Receiver</TableHead>
                          <TableHead className="text-gray-700">Type</TableHead>
                          <TableHead className="text-gray-700">Status</TableHead>
                          <TableHead className="text-gray-700">Sent At</TableHead>
                          <TableHead className="text-right text-gray-600">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMessages.map((message: any) => (
                          <TableRow key={message.id} className="hover:bg-gray-50 border-b">
                            <TableCell className="text-gray-800">
                              {message.sender_first_name} {message.sender_last_name}
                              <span className="block text-sm text-gray-500">
                                {message.sender_username}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-800">
                              {message.receiver_first_name} {message.receiver_last_name}
                              <span className="block text-sm text-gray-500">
                                {message.receiver_username}
                              </span>
                            </TableCell>
                            <TableCell className="capitalize text-gray-800">
                              {message.type}
                            </TableCell>
                            <TableCell>
                              {message.status === "sent" ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Sent
                                </Badge>
                              ) : message.status === "pending" ? (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Pending
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">
                                  Failed
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm">
                              {message.sent_at
                                ? new Date(message.sent_at).toLocaleString()
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-white border border-gray-300 text-gray-800"
                                >
                                  <DropdownMenuItem
                                    className="hover:bg-gray-100"
                                    onClick={() => handleViewMessage(message)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("common.view")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500 hover:bg-red-100"
                                    onClick={() => handleDeleteMessage(message.id)}
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
                      <Users className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">{t("admin.noMessagesFound")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Sender</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedMessage.sender_first_name} {selectedMessage.sender_last_name}
                    <span className="block text-gray-500">
                      @{selectedMessage.sender_username}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Receiver</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedMessage.receiver_first_name} {selectedMessage.receiver_last_name}
                    <span className="block text-gray-500">
                      @{selectedMessage.receiver_username}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {selectedMessage.type}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {selectedMessage.status}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sent At</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedMessage.sent_at
                    ? new Date(selectedMessage.sent_at).toLocaleString()
                    : "-"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Content</h3>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageMessages;