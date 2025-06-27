import { useAuth } from "@/contexts/AuthContext";
import { roleMapping } from "@shared/permissions";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function ShowroomNavigation() {
  const auth = useAuth();
  const { user, isAuthenticated, logout } = auth;
  const { t } = useTranslation();
  const [location, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const role = roleMapping?.[Number(user?.roleId)];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (isAuthenticated !== null) {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const links = [
    { href: "/showroom-dashboard", label: t("admin.dashboard") },
    { href: "/showroom-dashboard/listings", label: t("admin.manageCarListings") },
    { href: "/showroom-dashboard/bookings", label: t("admin.manageServiceBookings") },
    { href: "/showroom-dashboard/messaging", label: t("admin.manageMessages") },
    { href: "/showroom-dashboard/profile", label: t("admin.profile") },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-6 overflow-x-auto">
          {links.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap py-4 px-1 text-sm font-medium border-b-2 ${
                  isActive
                    ? "border-motoroe-orange text-motoroe-orange"
                    : "border-transparent text-motoroe-blue hover:border-gray-300 hover:text-motoroe-blue"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <Button
            variant="ghost"
            className="ml-auto whitespace-nowrap px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            {t("auth.logout")}
          </Button>
        </nav>
      </div>
    </div>
  );
}
