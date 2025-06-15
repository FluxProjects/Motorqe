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
import GarageSliderSection from "@/components/layout/GarageSlider";


const GarageHome = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero Section */}
      <GarageSliderSection />
     

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
