import { useTranslation } from "react-i18next";
import ShowRoomsCarousel from "@/components/layout/ShowRoomsCarousel";
import FaqSection from "@/components/layout/FaqSection";
import HowItWorksSection from "@/components/layout/HowItWorks";
import CarTypeTabSection from "@/components/car/CarTypeTabSection";
import FeaturedListingsSection from "@/components/layout/FeaturedListingSection";
import SearchSection from "@/components/layout/SearchSection";


const Home = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative w-full">
        <img 
          src="/src/assets/banner.png" 
          alt="Hero Banner" 
          className="w-full h-auto object-cover"
        />


      <div className="absolute left-2/3 transform -translate-x-2/3 md:bottom-5 md:left-2/3 md:-translate-x-2/3 text-left w-full max-w-2xl">
        <h2 className="text-orange-500 font-bold text-4xl md:text-4xl ml-10 pb-20">
          Qatar’s #1 Favourite Site to Buy & Sell New & Used Cars
        </h2>
      </div>
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
      <SearchSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Car Types Section */}
      <CarTypeTabSection />

      {/* Featured Listings Section */}
      <FeaturedListingsSection />

      {/* ShowRooms Section */}
      <ShowRoomsCarousel />

      {/* FAQ Section*/}
      <FaqSection />
    </div>
  );
};

export default Home;
