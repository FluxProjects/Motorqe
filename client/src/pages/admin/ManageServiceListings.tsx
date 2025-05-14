import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { roleMapping } from "@shared/permissions";
import { useServiceListingManage } from "@/hooks/user-servicelistingmanage";
import { ServiceListingFilters } from "@/components/services/listings/ServiceListingFilters";
import { ServiceListingTable } from "@/components/services/listings/ServiceListingTable";
import { ServiceListingDetailDialog } from "@/components/services/listings/ServiceListingDetailDialog";
import { ServiceListingActionDialog } from "@/components/services/listings/ServiceListingActionDialog";
import { ServiceListingFormDialog } from "@/components/services/listings/ServiceListingFormDialog";
import { Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Permission } from "@shared/permissions";
import { PermissionGuard } from "@/components/PermissionGuard";

const ManageServiceListing = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const {
    // State
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    viewDialogOpen,
    setViewDialogOpen,
    actionDialogOpen,
    setActionDialogOpen,
    currentService,
    actionType,
    actionInProgress,
    setFormDialogOpen,
    formDialogOpen,
    isEditing,

    // Data
    services,
    isLoading,

    // Functions
    handleSearch,
    resetFilters,
    handleViewService,
    handleEditService,
    handleCreateService,
    handleAction,
    confirmAction,
    refetch,
  } = useServiceListingManage();

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Admin Sidebar */}
            <div className="hidden md:block">
              <DashboardSidebar type={roleMapping[user.roleId] || "ADMIN"} />
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {t("services.manageServiceListing")}
                    </h1>
                    <p className="text-slate-400 mt-1">
                      {t("services.serviceListingDesc")}
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

                    <PermissionGuard permission={Permission.CREATE_SERVICES}>
                      <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleCreateService}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("services.createService")}
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>

                <ServiceListingFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filters={filters}
                  setFilters={setFilters}
                  handleSearch={handleSearch}
                  resetFilters={resetFilters}
                  refetch={refetch}
                  isLoading={isLoading}
                />

                <ServiceListingTable
                  services={services || []}
                  isLoading={isLoading}
                  resetFilters={resetFilters}
                  handleViewService={handleViewService}
                  handleEditService={handleEditService}
                  handleAction={handleAction}
                />
              </div>
            </div>

            {/* Dialogs */}
            {currentService && (
              <>
                <ServiceListingDetailDialog
                  service={currentService}
                  open={viewDialogOpen}
                  onOpenChange={setViewDialogOpen}
                  handleAction={handleAction}
                />

                <ServiceListingActionDialog
                  service={currentService}
                  actionType={actionType}
                  open={actionDialogOpen}
                  onOpenChange={setActionDialogOpen}
                  actionInProgress={actionInProgress}
                  confirmAction={confirmAction}
                />

                <PermissionGuard permission={Permission.MANAGE_SERVICES}>
                  <ServiceListingFormDialog
                    service={currentService}
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

export default ManageServiceListing;