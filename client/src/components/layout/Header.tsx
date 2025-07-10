import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Car,
  Globe,
  User,
  ChevronDown,
  Menu,
  X,
  MessageSquare,
  Search,
} from "lucide-react";
import i18n, { resources } from "@/lib/i18n"; // adjust the path as needed
import { useTranslation } from "react-i18next";
import { usePagesByPlacement } from "@/hooks/use-pagesbyplacement";
import { useSettings } from "@/hooks/use-settings";

type HeaderProps = {
  openAuthModal: (view: "login" | "register") => void;
};

const Header = ({ openAuthModal }: HeaderProps) => {
  const auth = useAuth();
  const { user, isAuthenticated, logout } = auth;
  const { t } = useTranslation();
  const [location, navigate] = useLocation();
  const normalizedLocation = location.split("?")[0].replace(/\/$/, "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const { pages, error } = usePagesByPlacement("header");
  

  // Debugging logs to check current states
  console.log("Location: ", location);
  console.log("User: ", user);

  useEffect(() => {
    if (isAuthenticated !== null) {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    pages.forEach((page, idx) => {
    });
    if (error) {
      console.warn("usePagesByPlacement error:", error);
    }
  }, [pages, error]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleLanguageChange = (lang: string) => {
    const supportedLanguages = Object.keys(resources);
    if (supportedLanguages.includes(lang)) {
      i18n.changeLanguage(lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      console.log(`Language changed to: ${lang}`);
    } else {
      console.warn("Unsupported language:", lang);
    }
  };

  const {
    data: settingsData = [],
    isLoading,
    refetch,
  } = useSettings();

  const openLoginModal = () => {
    console.log("Opening login modal...");
    openAuthModal("login"); // Change to use the prop method
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.roleId) {
      case 1: // BUYER
        return "/buyer-dashboard";
      case 2: // SELLER
        return "/showroom-dashboard";
      case 3: // DEALER
        return "/showroom-dashboard";
      case 4: // GARAGE
        return "/garage-dashboard";
      case 5: // MODERATOR
      case 6: // SENIOR_MODERATOR
      case 7: // ADMIN
      case 8: // SUPER_ADMIN
        return "/admin";
      default:
        return "/";
    }
  };

  const getProfileLink = () => {
    if (!user) return "/";
    switch (user.roleId) {
      case 7: // ADMIN
      case 5: // MODERATOR
      case 6: // SENIOR_MODERATOR
      case 8: // SUPER_ADMIN
        return "/admin/profile";
      case 2: // SELLER
        return "/seller-dashboard/profile";
      case 1: // BUYER
        return "/buyer-dashboard/profile";
      case 3: // DEALER
        return "/showroom-dashboard/profile";
      case 4: // GARAGE
        return "/garage-dashboard/profile";
      default:
        return "/profile";
    }
  };

  const getMessagesLink = () => {
    if (!user) return "/";
    switch (user.roleId) {
      case 1: // BUYER
        return "/buyer-dashboard/messages";
      case 2: // SELLER
        return "/showroom-dashboard/messaging";
      case 3: // DEALER
        return "/showroom-dashboard/messaging";
      case 4: // GARAGE
        return "/garage-dashboard/messaging";
      case 7: // ADMIN
      case 5: // MODERATOR
      case 6: // SENIOR_MODERATOR
      case 8: // SUPER_ADMIN
      default:
        return "/messages";
    }
  };

  console.log("Current location:", location);

  return (
  <div className="w-full mx-auto px-4 sm:px-6 lg:px-32 xl:px-32">
    <div className="flex justify-between items-center h-16">
      {/* Logo and Search */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-primary font-bold text-2xl flex items-center gap-2"
        >
          <img src={settingsData?.logo || "/src/assets/logo.png"} alt={settingsData?.site_name} />
        </Link>

        {/* Search Bar - Desktop */}
        <form 
          className="hidden md:flex items-center" 
          onSubmit={(e) => {
            e.preventDefault();
            const keyword = e.currentTarget.search.value;
            navigate(`/browse?search=${encodeURIComponent(keyword)}`);
          }}
        >
          <div className="relative">
            <input
              type="text"
              name="search"
              placeholder={t("common.searchCars")}
              className="w-64 px-4 py-2 rounded-md border border-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-orange-500"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Search Button - Mobile */}
      <div className="md:hidden flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden md:flex space-x-6">
        {/* Static links */}
        <Link
          href="/"
          className={`text-sm text-neutral-900 hover:text-orange-500 font-medium pb-1 uppercase ${
            location === "/"
              ? "border-b-2 border-orange-500 text-orange-500"
              : ""
          }`}
        >
          {t("common.home")}
        </Link>

        <Link
          href="/browse?is_imported=true"
          className={`text-sm text-neutral-900 hover:text-orange-500 font-medium pb-1 uppercase ${
            location === "/browse"
              ? "border-b-2 border-orange-500 text-orange-500"
              : ""
          }`}
        >
          {t("common.importedCars")}
        </Link>

        <Link
          href="/browse-services"
          className={`text-sm text-neutral-900 hover:text-orange-500 font-medium pb-1 uppercase ${
            location === "/browse-services"
              ? "border-b-2 border-orange-500 text-orange-500"
              : ""
          }`}
        >
          {t("common.carServices")}
        </Link>

        {/* Dynamic links from pages */}
        {Array.isArray(pages) &&
          pages.length > 0 &&
          pages.map((page) => (
            <Link
              key={page.key}
              href={`/page/${page.key}`}
              className={`text-sm text-neutral-900 hover:text-orange-500 font-medium pb-1 uppercase ${
                location === `/page/${page.key}`
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : ""
              }`}
            >
              {page.title}
            </Link>
          ))}
      </nav>

      {/* Right Menu */}
      <div className="flex items-center space-x-4">
        {/* User Menu or Sign In Button */}
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.username || "User"}
                  />
                  <AvatarFallback>
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">
                  {user.username || "User"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t("common.myAccount")}</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => navigate(getProfileLink())}>
                <User className="mr-2 h-4 w-4" />
                <span>{t("common.myProfile")}</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                <Car className="mr-2 h-4 w-4" />
                <span>{t("common.dashboard")}</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate(getMessagesLink())}>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>{t("common.messages")}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {t("auth.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/sell-car">
            <a className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition">
              <Car className="h-4 w-4 mr-2" />
              Sell My Car
            </a>
          </Link>
        )}

        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center border-none bg-transparent text-neutral-700 text-sm hover:text-blue-900 hover:bg-transparent"
            >
              <Globe className="h-4 w-4 mr-1" />
              <span>
                {i18n.language ? i18n.language.toUpperCase() : "EN"}
              </span>

              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
              {t("english")} (EN)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLanguageChange("ar")}>
              {t("arabic")} (AR)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>

    {/* Mobile Search Bar */}
    {showMobileSearch && (
      <div className="md:hidden my-3">
        <form 
          className="flex items-center" 
          onSubmit={(e) => {
            e.preventDefault();
            const keyword = e.currentTarget.search.value;
            navigate(`/browse-cars?search=${encodeURIComponent(keyword)}`);
            setShowMobileSearch(false);
          }}
        >
          <div className="relative w-full">
            <input
              type="text"
              name="search"
              placeholder={t("common.searchCars")}
              className="w-full px-4 py-2 rounded-full border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-orange-500"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    )}

    {/* Mobile menu */}
    {mobileMenuOpen && (
      <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <Link
          href="/"
          className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
        >
          {t("common.home")}
        </Link>
        <Link
          href="/browse"
          className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
        >
          {t("common.browseCars")}
        </Link>
        <Link
          href="/browse-showrooms"
          className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
        >
          {t("common.browseShowrooms")}
        </Link>
        <Link
          href="/browse-garages"
          className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
        >
          {t("common.browsegarages")}
        </Link>
        <Link
          href="/browse-services"
          className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
        >
          {t("common.browseServices")}
        </Link>

        {/* Dynamic links from pages */}
        {Array.isArray(pages) &&
          pages.length > 0 &&
          pages.map((page) => (
            <Link
              key={page.key}
              href={`/page/${page.key}`}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
            >
              {page.title}
            </Link>
          ))}
        <div className="border-t border-neutral-200 my-2"></div>
        {isAuthenticated && user ? (
          <>
            <Link
              href="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
            >
              {t("common.myProfile")}
            </Link>
            <Link
              href={getDashboardLink()}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
            >
              {t("common.dashboard")}
            </Link>
            <Link
              href="/messages"
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
            >
              {t("common.messages")}
            </Link>
            <Link
              href="/favorites"
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
            >
              {t("buyer.savedCars")}
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              {t("auth.logout")}
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-base font-medium text-primary flex items-center"
            onClick={openLoginModal}
          >
            <User className="mr-2 h-5 w-5" /> {t("auth.login")}
          </Button>
        )}
      </div>
    )}
  </div>
);

 
};
export default Header;
