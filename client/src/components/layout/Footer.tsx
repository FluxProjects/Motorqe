import { Link } from "wouter";
import i18n from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import {
  Facebook,
  Video,
  Instagram,
  Youtube,
  Camera,
  MapPin,
  Phone,
  Mail,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePagesByPlacement } from "@/hooks/use-pagesbyplacement";
import { useSettings } from "@/hooks/use-settings";

const Footer = () => {
  const { t } = useTranslation();
  const language = i18n.language;
  const direction = language === "ar" ? "rtl" : "ltr";
  const { pages } = usePagesByPlacement("footer");

  const { data: settingsData = [], isLoading } = useSettings();

  return (
    <footer className="bg-blue-900 text-white pt-16 pb-8">
      {settingsData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`grid grid-cols-1 md:grid-cols-4 gap-8 ${
              direction === "rtl" ? "text-right" : ""
            }`}
          >
            {/* Logo & Social */}
            <div>
              <div
                className={`flex items-center gap-2 mb-6 ${
                  direction === "rtl" ? "flex-row-reverse" : ""
                }`}
              >
                <img
                  src={
                    settingsData?.footer_logo || "/src/assets/logo-white.png"
                  }
                  alt="Logo"
                  className="h-20"
                />
              </div>
              <p className="text-white mb-6">
                {settingsData?.site_description}
              </p>
              <div className="flex gap-4 mb-6">
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://freelogopng.com/images/all_img/1664287128google-play-store-logo-png.png"
                    alt="Google Play"
                    className="h-12"
                  />
                </a>
                <a
                  href="https://www.apple.com/app-store/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                    alt="App Store"
                    className="h-12"
                  />
                </a>
              </div>

              <div className="flex space-x-4 rtl:space-x-reverse">
                <a
                  href="https://www.facebook.com/share/1YtgprdSoG/"
                  className="bg-white text-blue-900 rounded-full p-2 hover:bg-orange-500 hover:text-white transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/motorqeqtr?igsh=MXZzazEzZnl5a25oZg=="
                  className="bg-white text-blue-900 rounded-full p-2 hover:bg-orange-500 hover:text-white transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.snapchat.com/add/motorqe?share_id=0b1pEuuHbOg&locale=en-GB"
                  className="bg-white text-blue-900 rounded-full p-2 hover:bg-orange-500 hover:text-white transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </a>
                <a
                  href="https://www.youtube.com/@Motorqee"
                  className="bg-white text-blue-900 rounded-full p-2 hover:bg-orange-500 hover:text-white transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="https://www.tiktok.com/@motorqee?_t=ZS-8xrgwQZn0TZ&_r=1"
                  className="bg-white text-blue-900 rounded-full p-2 hover:bg-orange-500 hover:text-white transition-colors"
                >
                  <Video className="w-4 h-4" />
                </a>
                
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {t("footer.quickLinks")}
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/">{t("common.home")}</Link>
                </li>
                <li>
                  <Link href="/browse">{t("common.browseCars")}</Link>
                </li>
                <li>
                  <Link href="/home-garages">{t("common.browseGarages")}</Link>
                </li>
                <li>
                  <Link href="/sell-car">{t("common.sellCar")}</Link>
                </li>

                {/* First 2 dynamic pages */}
                {Array.isArray(pages) &&
                  pages.slice(0, 2).map((page) => (
                    <li key={page.key}>
                      <Link href={`/page/${page.key}`}>{page.title}</Link>
                    </li>
                  ))}
                <li>
                  <Link href="/blogs">{t("common.news")}</Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {t("footer.support")}
              </h4>
              <ul className="space-y-2">
                {/* Remaining dynamic pages */}
                {Array.isArray(pages) &&
                  pages.slice(2).map((page) => (
                    <li key={page.key}>
                      <Link href={`/page/${page.key}`}>{page.title}</Link>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              {/* Newsletter Form */}
              <div className="mb-10">
                <h4 className="text-lg font-semibold mb-4">
                  {t("footer.subscribe")}
                </h4>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex max-w-md"
                >
                  <Input
                    type="email"
                    placeholder={t("footer.yourEmail")}
                    className="w-full bg-white text-black rounded-l-md"
                  />
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 rounded-r-md px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              <h4 className="text-lg font-semibold mb-4">
                {t("footer.contact")}
              </h4>
              <p className="flex items-center mb-2">
                <MapPin className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {settingsData.address}
              </p>
              <p className="flex items-center mb-2">
                <Phone className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {settingsData.phone_number}
              </p>
              <p className="flex items-center">
                <Mail className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {settingsData.contact_email}
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              &copy; 2025 MotorQE. {t("footer.allRightsReserved")}
            </p>
            <div className="flex gap-4 text-sm mt-4 md:mt-0">
              <Link href="/privacy">{t("footer.privacyPolicy")}</Link>
              <Link href="/terms">{t("footer.termsOfService")}</Link>
              <Link href="/cookie">{t("footer.cookiePolicy")}</Link>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
