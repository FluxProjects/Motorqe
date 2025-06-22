import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { roleMapping } from "@shared/permissions";
import { useServiceBookingManage } from "@/hooks/user-servicebookingmanage";
import { ServiceBookingFilters } from "@/components/services/bookings/ServiceBookingFilters";
import { ServiceBookingTable } from "@/components/services/bookings/ServiceBookingTable";
import { ServiceBookingDetailDialog } from "@/components/services/bookings/ServiceBookingDetailDialog";
import { ServiceBookingActionDialog } from "@/components/services/bookings/ServiceBookingActionDialog";
import { ServiceBookingFormDialog } from "@/components/services/bookings/ServiceBookingFormDialog";
import { Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Permission } from "@shared/permissions";
import { PermissionGuard } from "@/components/PermissionGuard";

const ManageServiceBookings = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const {
    // State
    currentTab,
    setCurrentTab,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    viewDialogOpen,
    setViewDialogOpen,
    actionDialogOpen,
    setActionDialogOpen,
    currentBooking,
    actionType,
    actionReason,
    setActionReason,
    actionInProgress,
    setFormDialogOpen,
    formDialogOpen,
    isEditing,

    // Data
    bookings,
    isLoading,

    // Functions
    handleSearch,
    resetFilters,
    handleViewBooking,
    handleEditBooking,
    handleCreateBooking,
    handleAction,
    confirmAction,
    getStatusBadge,
    refetch,
  } = useServiceBookingManage();

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Admin Sidebar */}
            <div className="hidden md:block">
              <DashboardSidebar type={roleMapping[user?.roleId] || "ADMIN"} />
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {t("bookings.manageServiceBookings")}
                    </h1>
                    <p className="text-slate-400 mt-1">
                      {t("bookings.serviceBookingsDesc")}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="default"
                      className="bg-orange-500 hover:bg-orange-500/50"
                      onClick={() => refetch()}
                      disabled={isLoading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                      />
                      {t("common.refresh")}
                    </Button>

                  </div>
                </div>

                <ServiceBookingFilters
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filters={filters}
                  setFilters={setFilters}
                  handleSearch={handleSearch}
                  resetFilters={resetFilters}
                  refetch={refetch}
                  isLoading={isLoading}
                />

                <ServiceBookingTable
                  bookings={bookings || []}
                  isLoading={isLoading}
                  resetFilters={resetFilters}
                  handleViewBooking={handleViewBooking}
                  handleEditBooking={handleEditBooking}
                  handleAction={handleAction}
                  getStatusBadge={getStatusBadge}
                />
              </div>
            </div>

            {/* Dialogs */}
            {currentBooking && (
              <>
                <ServiceBookingDetailDialog
                  booking={currentBooking}
                  open={viewDialogOpen}
                  onOpenChange={setViewDialogOpen}
                  handleAction={handleAction}
                />

                <ServiceBookingActionDialog
                  booking={currentBooking}
                  actionType={actionType}
                  open={actionDialogOpen}
                  onOpenChange={setActionDialogOpen}
                  actionReason={actionReason}
                  setActionReason={setActionReason}
                  actionInProgress={actionInProgress}
                  confirmAction={confirmAction}
                />

                <PermissionGuard permission={Permission.MANAGE_BOOKINGS}>
                  <ServiceBookingFormDialog
                    booking={currentBooking}
                    isEditing={isEditing}
                    open={formDialogOpen}
                    onOpenChange={setFormDialogOpen}
                    onSuccess={refetch}
                  />
                </PermissionGuard>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageServiceBookings;