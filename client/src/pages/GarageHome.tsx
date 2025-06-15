import { useTranslation } from "react-i18next";
import ShowRoomsCarousel from "@/components/layout/ShowRoomsCarousel";
import FaqSection from "@/components/layout/FaqSection";
import HowItWorksSection2 from "@/components/layout/HowItWorks2";
import CarTypeTabSection from "@/components/car/CarTypeTabSection";
import FeaturedListingsSection from "@/components/layout/FeaturedListingSection";
import SearchSection from "@/components/layout/SearchSection";
import FeaturedGaragesSection from "@/components/layout/FeaturedGarageSection";
import GaragesCarousel from "@/components/layout/GaragesCarousel";
import BrowseServices from "./BrowseServices";


const GarageHome = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative w-full">
        <img 
          src="/src/assets/garage-banner.png" 
          alt="Hero Banner" 
          className="w-full h-auto object-cover"
        />



        <div className="absolute bottom-5 right-5 md:bottom-10 md:right-10 text-center md:text-center text-white max-w-xs md:max-w-md">
          <p className="text-black text-sm md:text-base font-semibold">
            DOWNLOAD THE APP NOW
          </p>
          <div className="flex justify-end md:justify-end gap-2">
            <a href="https://apps.apple.com" target="_blank">
              <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="h-10 md:h-12" />
            </a>
            <a href="https://play.google.com" target="_blank">
              <img src="https://freelogopng.com/images/all_img/1664287128google-play-store-logo-png.png" alt="Google Play" className="h-10 md:h-12" />
            </a>
          </div>
        </div>
      </section>

     

      {/* Search Form */}
      <SearchSection is_garage={true} />;

      {/* How It Works Section */}
      <HowItWorksSection2 />

      {/* Car Types Section */}
      <BrowseServices />

      {/* Featured Listings Section */}
      <FeaturedGaragesSection />

      {/* Garages Section */}
      <GaragesCarousel />

      {/* FAQ Section*/}
      <FaqSection />
    </div>
  );
};

export default GarageHome;
