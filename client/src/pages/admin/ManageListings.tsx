import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { roleMapping } from "@shared/permissions";
import { useCarListingManage } from "@/hooks/user-carlistingmanage";
import { CarListingFilters } from "@/components/car/listing/CarListingFilters";
import { CarListingTable } from "@/components/car/listing/CarListingTable";
import { CarListingDetailDialog } from "@/components/car/listing/CarListingDetailDialog";
import { CarListingActionDialog } from "@/components/car/listing/CarListingActionDialog";
import { CarListingFormDialog } from "@/components/car/listing/CarListingFormDialog";
import { Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Permission } from "@shared/permissions";
import { PermissionGuard } from "@/components/PermissionGuard";

const ManageListings = () => {
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
    currentListing,
    actionType,
    actionReason,
    setActionReason,
    actionInProgress,
    setFormDialogOpen,
    formDialogOpen,

    // Data
    categories,
    makes,
    listings,
    isLoading,

    // Functions
    handleSearch,
    resetFilters,
    handleViewListing,
    handleEditListing,
    handleCreateListing,
    handleAction,
    confirmAction,
    getStatusBadge,
    refetch,
  } = useCarListingManage();


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
      {t("admin.manageListings")}
    </h1>
    <p className="text-slate-400 mt-1">
      {t("admin.listingDesc")}
    </p>
  </div>

  {/* Buttons container */}
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

    <PermissionGuard permission={Permission.CREATE_LISTINGS}>
      <Button
        variant="default"
        className="bg-green-600 hover:bg-green-700"
        onClick={handleCreateListing}
      >
        <Plus className="h-4 w-4 mr-2" />
        {t("admin.createListing")}
      </Button>
    </PermissionGuard>
  </div>
</div>


                <CarListingFilters
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
                  categories={categories}
                  makes={makes}
                />

                <CarListingTable
                  listings={listings || []}
                  isLoading={isLoading}
                  resetFilters={resetFilters}
                  handleViewListing={handleViewListing}
                  handleEditListing={handleEditListing}
                  handleAction={handleAction}
                  getStatusBadge={getStatusBadge}
                />
              </div>
            </div>

            <CarListingFormDialog
              listing={currentListing} // will be null for create, existing for edit
              open={formDialogOpen}
              onOpenChange={setFormDialogOpen}
              onSuccess={refetch}
            />

            {/* Dialogs */}
            {currentListing && (
              <>
                <CarListingDetailDialog
                  listing={currentListing}
                  open={viewDialogOpen}
                  onOpenChange={setViewDialogOpen}
                  handleAction={handleAction}
                />

                <CarListingActionDialog
                  listing={currentListing}
                  actionType={actionType}
                  open={actionDialogOpen}
                  onOpenChange={setActionDialogOpen}
                  actionReason={actionReason}
                  setActionReason={setActionReason}
                  actionInProgress={actionInProgress}
                  confirmAction={confirmAction}
                />

                <PermissionGuard permission={Permission.CREATE_LISTINGS}>
                  <CarListingFormDialog
                    listing={currentListing}
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

export default ManageListings;
