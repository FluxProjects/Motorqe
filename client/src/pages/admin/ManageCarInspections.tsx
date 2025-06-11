// CarInspections.tsx

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Eye,
  Trash2,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { roleMapping } from "@shared/permissions";

interface CarInspection {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  car_make: string;
  car_model: string;
  car_year: number;
  price: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  additional_notes?: string;
}

const ManageCarInspections = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInspection, setSelectedInspection] = useState<CarInspection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: inspections = [],
    isLoading,
    refetch,
  } = useQuery<CarInspection[]>({
    queryKey: ["/api/inspections", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`/api/inspections`);
      if (!res.ok) throw new Error("Failed to fetch inspections");
      return res.json();
    },
  });

  const handleViewInspection = (inspection: CarInspection) => {
    setSelectedInspection(inspection);
    setIsDialogOpen(true);
  };

  const filteredInspections = inspections
    .filter((inspection) => {
      const matchesStatus =
        statusFilter === "all" || inspection.status === statusFilter;

      const matchesSearch =
        searchTerm.trim() === "" ||
        inspection.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${inspection.car_make} ${inspection.car_model}`.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="md:flex">
            {/* Sidebar */}
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
                    {t("inspections.title")}
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
                        placeholder={t("inspections.searchPlaceholder")}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800"
                      >
                        <option value="all">{t("inspections.allStatuses")}</option>
                        <option value="pending">{t("inspections.pending")}</option>
                        <option value="approved">{t("inspections.approved")}</option>
                        <option value="rejected">{t("inspections.rejected")}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Inspections Table */}
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-500">
                        {t("common.loading")}
                      </span>
                    </div>
                  ) : filteredInspections.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100 hover:bg-gray-200 border-b">
                          <TableHead>{t("inspections.fullName")}</TableHead>
                          <TableHead>{t("inspections.email")}</TableHead>
                          <TableHead>{t("inspections.phone")}</TableHead>
                          <TableHead>{t("inspections.car")}</TableHead>
                          <TableHead>{t("inspections.price")}</TableHead>
                          <TableHead>{t("inspections.status")}</TableHead>
                          <TableHead className="text-right">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInspections.map((inspection) => (
                          <TableRow key={inspection.id} className="hover:bg-gray-50 border-b">
                            <TableCell className="text-gray-800">
                              {inspection.full_name}
                            </TableCell>
                            <TableCell className="text-gray-800">
                              {inspection.email}
                            </TableCell>
                            <TableCell className="text-gray-800">
                              {inspection.phone}
                            </TableCell>
                            <TableCell className="text-gray-800">
                              {inspection.car_make} {inspection.car_model} ({inspection.car_year})
                            </TableCell>
                            <TableCell className="text-gray-800">
                              {formatPrice(inspection.price)}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                inspection.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : inspection.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {inspection.status}
                              </span>
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
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleViewInspection(inspection)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("common.view")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-500">
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
                      <Car className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">
                        {t("inspections.noInspectionsFound")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("inspections.inspectionDetails")}</DialogTitle>
          </DialogHeader>
          {selectedInspection && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("inspections.fullName")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedInspection.full_name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("inspections.email")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedInspection.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("inspections.phone")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedInspection.phone}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("inspections.price")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatPrice(selectedInspection.price)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  {t("inspections.car")}
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedInspection.car_make} {selectedInspection.car_model} (
                  {selectedInspection.car_year})
                </p>
              </div>

              {selectedInspection.additional_notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("inspections.additionalNotes")}
                  </h3>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedInspection.additional_notes}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("inspections.status")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {selectedInspection.status}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("inspections.createdAt")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedInspection.created_at).toLocaleString()}
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

export default ManageCarInspections;