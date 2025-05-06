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
import logo from "@/assets/logo.png";
import {
  Car,
  Globe,
  User,
  ChevronDown,
  Menu,
  X,
  MessageSquare,
  Bell,
  Heart,
} from "lucide-react";
import i18n, { resources } from "@/lib/i18n"; // adjust the path as needed
import { useTranslation } from "react-i18next";

type HeaderProps = {
  openAuthModal: (view: "login" | "register") => void;
};

const Header = ({ openAuthModal }: HeaderProps) => {
  const auth = useAuth();
  const { user, isAuthenticated, logout } = auth;
  const { t } = useTranslation();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Debugging logs to check current states
  console.log("Location: ", location);
  console.log("IsAuthenticated: ", isAuthenticated);
  console.log("User: ", user);

  useEffect(() => {
    if (isAuthenticated !== null) {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const toggleMobileMenu = () => {
    console.log("Toggling mobile menu...");
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

  const openLoginModal = () => {
    console.log("Opening login modal...");
    openAuthModal("login"); // Change to use the prop method
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.roleId) {
      case 1: // BUYER
        return "/buyer-dashboard";
      case 2: // SELLER
        return "/seller-dashboard";
      case 3: // SHOWROOM_BASIC
      case 4: // SHOWROOM_PREMIUM
        return "/showroom-dashboard";
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
      case 3: // SHOWROOM_BASIC
      case 4: // SHOWROOM_PREMIUM
        return "/showroom-dashboard/profile";
      default:
        return "/profile";
    }
  };

  const getSellCarLink = () => {
    if (!user) return "/";
    switch (user.roleId) {
      case 8: // SUPER_ADMIN
      case 7: // ADMIN
      case 6: // MODERATOR
      case 5: // SENIOR_MODERATOR
      case 4: // SHOWROOM_PREMIUM
      case 3: // SHOWROOM_BASIC
      case 2: // SELLER
        return "/sellCar";
      case 1: // BUYER
        return "/";
      default:
        return "/sellCar";
    }
  };
  
  const getMessagesLink = () => {
    if (!user) return "/";
    switch (user.roleId) {
      case 7: // ADMIN
      case 5: // MODERATOR
      case 6: // SENIOR_MODERATOR
      case 8: // SUPER_ADMIN
        return "/admin/messages";
      case 2: // SELLER
        return "/seller-dashboard/messages";
      case 1: // BUYER
        return "/buyer-dashboard/messages";
      case 3: // SHOWROOM_BASIC
      case 4: // SHOWROOM_PREMIUM
        return "/showroom-dashboard/messages";
      default:
        return "/messages";
    }
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-32 xl:px-32">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-primary font-bold text-2xl flex items-center gap-2"
          >
            <img src={logo} alt="Logo" />
          </Link>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex space-x-6">
          <Link
            href="/"
            className={`text-neutral-900 hover:text-primary font-medium ${
              location === "/" ? "text-primary" : ""
            }`}
          >
            {t("common.home")}
          </Link>
          <Link
            href="/browse"
            className={`text-neutral-900 hover:text-primary font-medium ${
              location === "/browse" ? "text-primary" : ""
            }`}
          >
            {t("common.browseCars")}
          </Link>
          <Link
            href="/browse-showrooms"
            className={`text-neutral-900 hover:text-primary font-medium ${
              location === "/browse-showroom" ? "text-primary" : ""
            }`}
          >
            {t("common.browseShowrooms")}
          </Link>
          <Link
            href="/about"
            className={`text-neutral-900 hover:text-primary font-medium ${
              location === "/about" ? "text-primary" : ""
            }`}
          >
            {t("common.aboutUs")}
          </Link>
          <Link
            href="/"
            className={`text-neutral-900 hover:text-primary font-medium ${
              location === "/news" ? "text-primary" : ""
            }`}
          >
            {t("common.news")}
          </Link>
        </nav>

        {/* Right Menu */}
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center text-neutral-700 hover:text-primary"
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

          {/* User Menu or Sign In Button */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.avatar || "/default-avatar.png"} // fallback to default image if no avatar
                      alt={user.username}
                    />
                    <AvatarFallback>
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {user.firstName || user.username}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{t("common.myAccount")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(getSellCarLink())}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("common.sellCar")}</span>
                </DropdownMenuItem>
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
            <Button
              variant="outline"
              className="hidden md:flex items-center text-primary bg-primary-light hover:bg-primary hover:text-white"
              onClick={openLoginModal}
            >
              {t("auth.login")}
            </Button>
          )}

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
            href="/sell"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
          >
            {t("common.sellCar")}
          </Link>
          <Link
            href="/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
          >
            {t("common.aboutUs")}
          </Link>
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
