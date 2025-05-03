import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// Layouts
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Pages
import Home from "./pages/Home";
import BrowseCars from "./pages/BrowseCars";
import CarDetails from "./pages/CarDetails";
import SellCar from "./pages/SellCar";
import BrowseShowrooms from "./pages/BrowseShowrooms";
import NotFound from "./pages/not-found";

// Buyer Dashboard
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import BuyerManageListings from "./pages/buyer/ManageListings";
import BuyerManageSettings from "./pages/buyer/ManageSettings";

// Seller Dashboard
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerManageListings from "./pages/seller/ManageListings";
import SellerManageSettings from "./pages/seller/ManageSettings";

// Showroom Dashboard
import ShowroomDashboard from "./pages/showroom/ShowroomDashboard";
import ShowroomManageListings from "./pages/showroom/ManageListings";
import ShowroomManageSettings from "./pages/showroom/ManageSettings";

// Admin Dashboard
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminManageListings from "./pages/admin/ManageListings";
import ManageCarListings from "./components/admin/ManageCarListings"
import AdminManageUsers from "./pages/admin/ManageUsers";
import AdminManageSettings from "./pages/admin/ManageSettings";
import AdminManageContent from "./pages/admin/ManageContent";

import ManageMessages from "./components/dashboard/ManageMessages";
import ManageProfile from "./components/dashboard/ManageProfile";

// Auth
import { useAuth } from "@/contexts/AuthContext";
import { AuthForms } from "./components/forms/AuthForms";

import { roleSchema, roleMapping } from "@shared/permissions";
import { z } from "zod";

type UserRole = z.infer<typeof roleSchema>;

function App() {
  const [error, setError] = useState<Error | null>(null);
  const { i18n } = useTranslation();
  const [location] = useLocation();
  const { login } = useAuth();

  const isAdminRoute = location.startsWith("/admin");

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  // --- Auth Modal State ---
  const [authModalOpen, setAuthModalOpen] = useState<
    "login" | "register" | null
  >(null);

  const openAuthModal = (view: "login" | "register") => {
    setAuthModalOpen(view);
  };

  const closeAuthModal = () => {
    console.log("Closing auth modal...");
    setAuthModalOpen(null);
  };

  // -------------------------

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

  // --- Handle User Authentication ---
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");

    // Debug: Check if localStorage values are correctly set
    console.log("AuthToken from localStorage: ", token);
    console.log("User data from localStorage: ", userData);

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      login(token, parsedUser);
      setIsAuthenticated(true);
      setUser(parsedUser);
    } else {
      console.log("User is not authenticated, no token found.");
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  // Role-specific profile components with proper typing
  const BuyerProfileWrapper = () => <ManageProfile userRole="BUYER" />;
  const SellerProfileWrapper = () => <ManageProfile userRole="SELLER" />;
  const ShowroomProfileWrapper = () => <ManageProfile userRole={user.roleId === 4 ? "SHOWROOM_PREMIUM" : "SHOWROOM_BASIC"} />;
  const AdminProfileWrapper = () => <ManageProfile userRole={
    !user ? "MODERATOR" :
    user.roleId === 8 ? "SUPER_ADMIN" :
    user.roleId === 6 ? "SENIOR_MODERATOR" :
    user.roleId === 5 ? "MODERATOR" : "ADMIN"
  } />;

  // Similar wrappers for messages
  const BuyerMessagesWrapper = () => <ManageMessages userRole="BUYER" />;
  const SellerMessagesWrapper = () => <ManageMessages userRole="SELLER" />;
  const ShowroomMessagesWrapper = () => <ManageMessages userRole={user.roleId === 4 ? "SHOWROOM_PREMIUM" : "SHOWROOM_BASIC"} />;
  const AdminMessagesWrapper = () => <ManageMessages userRole={
    !user ? "MODERATOR" :
    user.roleId === 8 ? "SUPER_ADMIN" :
    user.roleId === 6 ? "SENIOR_MODERATOR" :
    user.roleId === 5 ? "MODERATOR" : "ADMIN"
  } />;

  interface ProfileRouterProps {
    userRole?: UserRole;
    allowedRoles: UserRole[];
    fallbackComponent: React.ComponentType;
  }

  const ProfileRouter = ({ 
    userRole, 
    allowedRoles, 
    fallbackComponent: Fallback 
  }: ProfileRouterProps) => {
    // Debug logs
    console.log('userRole:', userRole);
    console.log('allowedRoles:', allowedRoles);

    if (!userRole) {
      console.log('No userRole, rendering fallback');
      return <Fallback />;
    }

    if (!allowedRoles.includes(userRole)) {
      console.log('UserRole not allowed, rendering fallback');
      return <Fallback />;
    }

  };


  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Application Error
          </h1>
          <p className="mb-4">
            The application encountered an issue during initialization.
          </p>
          <p className="text-gray-700 mb-6">
            Error: {error.message || "Unknown error"}
          </p>
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header openAuthModal={openAuthModal} />
      
      <main className="flex-grow">
        <Switch>
          {/* Public Pages */}
          <Route path="/" component={Home} />
          <Route path="/browse" component={BrowseCars} />
          <Route path="/browse-showrooms" component={BrowseShowrooms} />
          <Route path="/cars/:id" component={CarDetails} />
          <Route path="/sellCar" component={SellCar} />

          {/* Buyer Dashboard Routes */}
          <Route path="/buyer-dashboard" component={BuyerDashboard} />
          <Route path="/buyer-dashboard/listings" component={BuyerManageListings} />
          <Route path="/buyer-dashboard/settings" component={BuyerManageSettings} />
          <Route path="/buyer-dashboard/profile" component={BuyerProfileWrapper} />
          <Route path="/buyer-dashboard/messages" component={BuyerMessagesWrapper} />

          {/* Seller Dashboard Routes */}
          <Route path="/seller-dashboard" component={SellerDashboard} />
          <Route path="/seller-dashboard/listings" component={SellerManageListings} />
          <Route path="/seller-dashboard/settings" component={SellerManageSettings} />
          <Route path="/seller-dashboard/profile" component={SellerProfileWrapper} />
          <Route path="/seller-dashboard/messages" component={SellerMessagesWrapper} />

          {/* Showroom Dashboard Routes (shared for BASIC/PREMIUM) */}
          <Route path="/showroom-dashboard" component={ShowroomDashboard} />
          <Route path="/showroom-dashboard/listings" component={ShowroomManageListings} />
          <Route path="/showroom-dashboard/settings" component={ShowroomManageSettings} />
          <Route path="/showroom-dashboard/profile" component={ShowroomProfileWrapper} />
          <Route path="/showroom-dashboard/messages" component={ShowroomMessagesWrapper} />

          {/* Admin Routes (shared for ADMIN/MODERATOR/SUPER_ADMIN) */}
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/listings" component={AdminManageListings} />
          <Route path="/admin/messages" component={AdminMessagesWrapper} />
          <Route path="/admin/users" component={AdminManageUsers} />
          <Route path="/admin/settings" component={AdminManageSettings} />
          <Route path="/admin/content" component={AdminManageContent} />
          <Route path="/admin/profile" component={AdminProfileWrapper} />

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
              onClose={closeAuthModal}
              onSwitchView={(view) => setAuthModalOpen(view)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;