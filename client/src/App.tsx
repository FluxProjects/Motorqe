// 🌐 Core & Routing
import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";

// 🌍 Internationalization
import { useTranslation } from "react-i18next";

// 🔐 Authentication & Authorization
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleSpecificRoute } from "@/components/RoleSpecificRoute";
import { LoginRedirect } from "@/lib/auth/loginRedirect";
import { Permission, roleMapping } from "@shared/permissions";

// 🧩 UI Components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AuthForms } from "@/components/forms/AuthForm/AuthForms";
import ManageMessages from "./pages/admin/ManageMessages";
import ManageProfile from "./pages/admin/ManageProfile";

// 📄 Static Pages
import StaticPage from "./pages/StaticPage";
import NotFound from "./pages/not-found";

// 🏠 Public Pages
import Home from "./pages/Home";
import GarageHome from "./pages/GarageHome";
import BrowseCars from "./pages/BrowseCars";
import CarDetails from "./pages/CarDetails";
import SellCar from "./pages/SellCar";
import SellService from "./pages/SellService";
import BrowseShowrooms from "./pages/BrowseShowrooms";
import BrowseGarages from "./pages/BrowseGarages";
import BrowseServices from "./pages/BrowseServices";
import ShowroomDetails from "./pages/ShowroomDetails";
import GarageDetails from "./pages/GarageDetails";
import ServiceDetails from "./pages/ServiceDetail";
import ShowroomServiceDetails from "./pages/ShowroomServiceDetail";
import CompareCars from "./pages/CompareCars";
import BlogPage from "./pages/BlogPage";
import Login from "./pages/Login";
import Review from "./pages/Review";
import Feedback from "./pages/Feedback";
import ConfirmFeedback from "./pages/ConfirmFeedback";
import ServiceBookingConfirmation from "./pages/ServiceBookingConfirmation";

// 👤 Buyer Pages
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import BuyerManageSettings from "./pages/buyer/ManageSettings";

// 🧑‍💼 Seller Pages
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerManageSettings from "./pages/seller/ManageSettings";

// 🏢 Showroom Pages
import ShowroomDashboard from "./pages/showroom/ShowroomDashboard";
import GarageDashboard from "./pages/showroom/GarageDashboard";
import GarageServiceListings from "./pages/showroom/GarageServiceListings";
import GarageServiceBookings from "./pages/showroom/GarageServiceBookings";
import GarageMessaging from "./pages/showroom/GarageMessages";
import GarageProfile from "./pages/showroom/GarageProfile";

// 🛠️ Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminManageUsers from "./pages/admin/ManageUsers";
import AdminManageSettings from "./pages/admin/ManageSettings";
import AdminManageContent from "./pages/admin/ManageContent";
import ManageListings from "./pages/admin/ManageListings";
import ManageSliders from "./pages/admin/ManageSliders";
import ManageBlogs from "./pages/admin/ManageBlogs";
import ManageBannerAds from "./pages/admin/ManageBannerAds";
import ManageServiceListings from "./pages/admin/ManageServiceListings";
import ManageServiceBookings from "./pages/admin/ManageServiceBookings";
import ManageCarInspections from "./pages/admin/ManageCarInspections";
import ManagePromotionPackages from "./pages/admin/ManagePromtionPackages";
import ManageShowrooms from "./pages/admin/ManageShowrooms";
import AdminAddGarage from "./pages/admin/AdminAddGarage";
import ShowroomBookings from "./pages/showroom/ShowroomBookings";
import ShowroomMessaging from "./pages/showroom/ShowroomMessages";
import ShowroomProfile from "./pages/showroom/ShowroomProfile";
import ShowroomListings from "./pages/showroom/ShowroomListing";



function App() {
  const [error, setError] = useState<Error | null>(null);
  const { i18n } = useTranslation();
  const [location] = useLocation();
  const { initializeAuth, isLoading } = useAuth();

  const isAdminRoute = location.startsWith("/admin");

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState<"login" | "register" | null>(null);

  
function functionStaticPage({ keyParam }: { keyParam: string }) {
  console.log("StaticPage keyParam:", keyParam);
  return <div>Static page: {keyParam}</div>;
}

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
          {/* ---------- Public Pages ---------- */}
          <Route path="/page/:key">
            {(params) => {
              if (!params) return <p>Loading...</p>;
              console.log("Params in route:", params);
              return <StaticPage keyParam={params.key} />;
            }}
          </Route>
          <Route path="/" component={Home} />
          <Route path="/home-garages" component={GarageHome} />
          <Route path="/browse" component={BrowseCars} />
          <Route path="/browse-showrooms" component={BrowseShowrooms} />
          <Route path="/browse-garages" component={BrowseGarages} />
          <Route path="/browse-services" component={BrowseServices} />
          <Route path="/cars/:id" component={CarDetails} />
          <Route path="/showrooms/:id" component={ShowroomDetails} />
          <Route path="/garages/:id" component={GarageDetails} />
          <Route path="/services/:id" component={ServiceDetails} />
          <Route path="/showroom-services/:id" component={ShowroomServiceDetails} />
          <Route path="/compare" component={CompareCars} />
          <Route path="/blogs" component={BlogPage} />
          <Route path="/login" component={LoginRedirect} />
          <Route path="/review" component={Review} />
          <Route path="/confirmfeedback" component={ConfirmFeedback} />
          <Route path="/feedback" component={Feedback} />
          <Route path="/confirmedbooking" component={ServiceBookingConfirmation} />

          {/* ---------- Sell Car & Service--------------- */}
          <Route path="/sell-car">
            <SellCar />
          </Route>
          <Route path="/sell-service">
            <SellService />
          </Route>

          {/* ---------- Buyer Dashboard Routes ---------- */}
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

          {/* ---------- Seller Dashboard Routes ---------- */}
          <Route path="/seller-dashboard">
            <RoleSpecificRoute role="SELLER">
              <ShowroomDashboard />
            </RoleSpecificRoute>
          </Route>
          <Route path="/seller-dashboard/listings">
            <RoleSpecificRoute role="SELLER">
              <ProtectedRoute permissions={[Permission.MANAGE_OWN_LISTINGS]}>
                <ShowroomListings />
              </ProtectedRoute>
            </RoleSpecificRoute>
          </Route>
          <Route path="/seller-dashboard/bookings">
            <RoleSpecificRoute role="SELLER">
              <ShowroomBookings />
            </RoleSpecificRoute>
          </Route>
          <Route path="/seller-dashboard/profile">
            <RoleSpecificRoute role="SELLER">
              <ShowroomProfile />
            </RoleSpecificRoute>
          </Route>
          <Route path="/seller-dashboard/messages">
            <RoleSpecificRoute role="SELLER">
              <ProtectedRoute permissions={[Permission.RESPOND_TO_INQUIRIES]}>
                <ShowroomMessaging />
              </ProtectedRoute>
            </RoleSpecificRoute>
          </Route>

          {/* ---------- Showroom Dashboard Routes ---------- */}
          <Route path="/showroom-dashboard">
            <ProtectedRoute permissions={[Permission.MANAGE_OWN_LISTINGS]}>
              <ShowroomDashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/showroom-dashboard/listings">
            <ProtectedRoute permissions={[Permission.MANAGE_OWN_LISTINGS]}>
              <ShowroomListings />
            </ProtectedRoute>
          </Route>
          <Route path="/showroom-dashboard/bookings">
            <ProtectedRoute permissions={[Permission.MANAGE_OWN_SERVICES]}>
              <ShowroomBookings />
            </ProtectedRoute>
          </Route>
          <Route path="/showroom-dashboard/profile">
            <ProtectedRoute permissions={[Permission.MANAGE_SHOWROOM_PROFILE]}>
              <ShowroomProfile />
            </ProtectedRoute>
          </Route>
          <Route path="/showroom-dashboard/messaging">
            <ProtectedRoute permissions={[Permission.RESPOND_TO_INQUIRIES]}>
              <ShowroomMessaging />
            </ProtectedRoute>
          </Route>

          <Route path="/garage-dashboard">
            <ProtectedRoute permissions={[Permission.CREATE_SHOWROOM_PROFILE]} fallback="/">
              <GarageDashboard />
            </ProtectedRoute>
          </Route>
           <Route path="/garage-dashboard/servicelistings">
            <ProtectedRoute permissions={[Permission.MANAGE_OWN_SERVICES]}>
              <GarageServiceListings />
            </ProtectedRoute>
          </Route>
          <Route path="/garage-dashboard/servicebookings">
            <ProtectedRoute permissions={[Permission.MANAGE_OWN_BOOKINGS]}>
              <GarageServiceBookings />
            </ProtectedRoute>
          </Route>
          <Route path="/garage-dashboard/messaging">
            <ProtectedRoute permissions={[Permission.MANAGE_OWN_BOOKINGS]}>
              <GarageMessaging />
            </ProtectedRoute>
          </Route>
          <Route path="/garage-dashboard/profile">
            <ProtectedRoute permissions={[Permission.MANAGE_SHOWROOM_PROFILE]}>
              <GarageProfile />
            </ProtectedRoute>
          </Route>

          {/* ---------- Admin Routes ---------- */}
          <Route path="/admin">
            <ProtectedRoute
              permissions={[
                Permission.MANAGE_ALL_LISTINGS,
                Permission.MANAGE_ALL_USERS,
                Permission.MANAGE_ALL_SERVICES,
                Permission.MANAGE_BOOKINGS,
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
          <Route path="/admin/servicelistings">
            <ProtectedRoute permissions={[Permission.MANAGE_ALL_SERVICES]}>
              <ManageServiceListings />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/servicebookings">
            <ProtectedRoute permissions={[Permission.MANAGE_BOOKINGS]}>
              <ManageServiceBookings />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/users">
            <ProtectedRoute permissions={[Permission.MANAGE_ALL_USERS]}>
              <AdminManageUsers />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/showrooms">
            <ProtectedRoute permissions={[Permission.MANAGE_ALL_USERS]}>
              <ManageShowrooms />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/addgarage">
            <ProtectedRoute permissions={[Permission.MANAGE_ALL_USERS]}>
              <AdminAddGarage />
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
          <Route path="/admin/sliders">
            <ProtectedRoute permissions={[Permission.MANAGE_CONTENT]}>
              <ManageSliders />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/blogs">
            <ProtectedRoute permissions={[Permission.MANAGE_CONTENT]}>
              <ManageBlogs />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/ads">
            <ProtectedRoute permissions={[Permission.MANAGE_CONTENT]}>
              <ManageBannerAds />
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
          <Route path="/admin/inspections">
            <ProtectedRoute permissions={[Permission.MANAGE_PLATFORM_SETTINGS]}>
              <ManageCarInspections />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/promotions">
            <ProtectedRoute permissions={[Permission.MANAGE_PLATFORM_SETTINGS]}>
              <ManagePromotionPackages />
            </ProtectedRoute>
          </Route>



          {/* ---------- 404 - Not Found ---------- */}
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