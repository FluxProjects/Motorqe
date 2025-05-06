import { Switch, Route, useLocation} from "wouter";
import { useTranslation } from "react-i18next";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import BrowseCars from "./pages/BrowseCars";
import CarDetails from "./pages/CarDetails";
import SellCar from "./pages/SellCar";
import BrowseShowrooms from "./pages/BrowseShowrooms";
import NotFound from "./pages/not-found";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import ManageListings from "./pages/admin/ManageListings";
import BuyerManageSettings from "./pages/buyer/ManageSettings";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerManageSettings from "./pages/seller/ManageSettings";
import ShowroomDashboard from "./pages/showroom/ShowroomDashboard";
import ShowroomManageSettings from "./pages/showroom/ManageSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminManageUsers from "./pages/admin/ManageUsers";
import AdminManageSettings from "./pages/admin/ManageSettings";
import AdminManageContent from "./pages/admin/ManageContent";
import ManageMessages from "./components/dashboard/ManageMessages";
import ManageProfile from "./components/dashboard/ManageProfile";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForms } from "./components/forms/AuthForms";
import { Permission, roleMapping } from "@shared/permissions";
import { RoleSpecificRoute } from "@/components/RoleSpecificRoute";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute"

function App() {
  const [error, setError] = useState<Error | null>(null);
  const { i18n } = useTranslation();
  const [location] = useLocation();
  const { initializeAuth, isLoading } = useAuth();

  const isAdminRoute = location.startsWith("/admin");

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState<"login" | "register" | null>(null);

  // Set document language and direction
  useEffect(() => {
    try {
      const language = i18n.language;
      const direction = language === "ar" ? "rtl" : "ltr";
      document.documentElement.dir = direction;
      document.documentElement.lang = language;
    } catch (e) {
      console.error("Error setting document properties:", e);
    }
  }, [i18n.language]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="mb-4">The application encountered an issue during initialization.</p>
          <p className="text-gray-700 mb-6">Error: {error.message || "Unknown error"}</p>
          <button
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header openAuthModal={setAuthModalOpen} />
      
      <main className="flex-grow">
        <Switch>
          {/* Public Pages */}
          <Route path="/" component={Home} />
          <Route path="/browse" component={BrowseCars} />
          <Route path="/browse-showrooms" component={BrowseShowrooms} />
          <Route path="/cars/:id" component={CarDetails} />
          
          {/* Sell Car - Protected by CREATE_LISTINGS permission */}
          <Route path="/sell-car">
            <ProtectedRoute permissions={[Permission.CREATE_LISTINGS]}>
              <SellCar />
            </ProtectedRoute>
          </Route>

          {/* Buyer Dashboard Routes */}
          <Route path="/buyer-dashboard">
            <RoleSpecificRoute role="BUYER">
              <BuyerDashboard />
            </RoleSpecificRoute>
          </Route>
          
          <Route path="/buyer-dashboard/listings">
            <RoleSpecificRoute role="BUYER">
              <ProtectedRoute permissions={[Permission.SAVE_FAVORITES]}>
                <ManageListings />
              </ProtectedRoute>
            </RoleSpecificRoute>
          </Route>
          
          <Route path="/buyer-dashboard/settings">
            <RoleSpecificRoute role="BUYER">
              <BuyerManageSettings />
            </RoleSpecificRoute>
          </Route>
          
          <Route path="/buyer-dashboard/profile">
            <RoleSpecificRoute role="BUYER">
              <ManageProfile />
            </RoleSpecificRoute>
          </Route>
          
          <Route path="/buyer-dashboard/messages">
            <RoleSpecificRoute role="BUYER">
              <ProtectedRoute permissions={[Permission.CONTACT_SELLERS]}>
                <ManageMessages />
              </ProtectedRoute>
            </RoleSpecificRoute>
          </Route>

          {/* Seller Dashboard Routes */}
          <Route path="/seller-dashboard">
            <RoleSpecificRoute role="SELLER">
              <SellerDashboard />
            </RoleSpecificRoute>
          </Route>
          
          <Route path="/seller-dashboard/listings">
            <RoleSpecificRoute role="SELLER">
              <ProtectedRoute permissions={[Permission.MANAGE_OWN_LISTINGS]}>
                <ManageListings />
              </ProtectedRoute>
            </RoleSpecificRoute>
          </Route>
          
          <Route path="/seller-dashboard/settings">
            <RoleSpecificRoute role="SELLER">
              <SellerManageSettings />
            </RoleSpecificRoute>
          </Route>
          
          <Route path="/seller-dashboard/profile">
            <RoleSpecificRoute role="SELLER">
              <ManageProfile />
            </RoleSpecificRoute>
          </Route>
          
          <Route path="/seller-dashboard/messages">
            <RoleSpecificRoute role="SELLER">
              <ProtectedRoute permissions={[Permission.RESPOND_TO_INQUIRIES]}>
                <ManageMessages />
              </ProtectedRoute>
            </RoleSpecificRoute>
          </Route>

          {/* Showroom Dashboard Routes */}
          <Route path="/showroom-dashboard">
            <ProtectedRoute 
              permissions={[Permission.CREATE_SHOWROOM_PROFILE]} 
              fallback="/"
            >
              <ShowroomDashboard />
            </ProtectedRoute>
          </Route>
          
          <Route path="/showroom-dashboard/listings">
            <ProtectedRoute permissions={[Permission.MANAGE_SHOWROOM_LISTINGS]}>
              <ManageListings />
            </ProtectedRoute>
          </Route>
          
          <Route path="/showroom-dashboard/settings">
            <ProtectedRoute permissions={[Permission.MANAGE_SHOWROOM_PROFILE]}>
              <ShowroomManageSettings />
            </ProtectedRoute>
          </Route>
          
          <Route path="/showroom-dashboard/profile">
            <ProtectedRoute permissions={[Permission.MANAGE_SHOWROOM_PROFILE]}>
              <ManageProfile />
            </ProtectedRoute>
          </Route>
          
          <Route path="/showroom-dashboard/messages">
            <ProtectedRoute permissions={[Permission.RESPOND_TO_INQUIRIES]}>
              <ManageMessages />
            </ProtectedRoute>
          </Route>
          
          <Route path="/showroom-dashboard/staff">
            <ProtectedRoute permissions={[Permission.MANAGE_SHOWROOM_STAFF]}>
              <ShowroomManageSettings />
            </ProtectedRoute>
          </Route>

          {/* Admin Routes */}
          <Route path="/admin">
            <ProtectedRoute 
              permissions={[
                Permission.MANAGE_ALL_LISTINGS, 
                Permission.MANAGE_ALL_USERS,
                Permission.APPROVE_LISTINGS
              ]}
              fallback="/"
            >
              <AdminDashboard />
            </ProtectedRoute>
          </Route>
          
          <Route path="/admin/listings">
            <ProtectedRoute permissions={[Permission.MANAGE_ALL_LISTINGS]}>
              <ManageListings />
            </ProtectedRoute>
          </Route>
          
          <Route path="/admin/users">
            <ProtectedRoute permissions={[Permission.MANAGE_ALL_USERS]}>
              <AdminManageUsers />
            </ProtectedRoute>
          </Route>
          
          <Route path="/admin/settings">
            <ProtectedRoute permissions={[Permission.MANAGE_PLATFORM_SETTINGS]}>
              <AdminManageSettings />
            </ProtectedRoute>
          </Route>
          
          <Route path="/admin/content">
            <ProtectedRoute permissions={[Permission.MANAGE_CONTENT]}>
              <AdminManageContent />
            </ProtectedRoute>
          </Route>
          
          <Route path="/admin/profile">
            <ProtectedRoute permissions={[Permission.MANAGE_ALL_USERS]}>
              <ManageProfile />
            </ProtectedRoute>
          </Route>
          
          <Route path="/admin/messages">
            <ProtectedRoute permissions={[Permission.MANAGE_REPORTS]}>
              <ManageMessages />
            </ProtectedRoute>
          </Route>

          {/* 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>

      {!isAdminRoute && <Footer />}

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 animate-in fade-in duration-300">
            <AuthForms
              initialView={authModalOpen}
              onClose={() => setAuthModalOpen(null)}
              onSwitchView={(view) => setAuthModalOpen(view)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;