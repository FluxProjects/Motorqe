import { useTranslation } from "react-i18next";
import ShowRoomsCarousel from "@/components/layout/ShowRoomsCarousel";
import FaqSection from "@/components/layout/FaqSection";
import HowItWorksSection from "@/components/layout/HowItWorks";
import CarTypeTabSection from "@/components/car/CarTypeTabSection";
import FeaturedListingsSection from "@/components/layout/FeaturedListingSection";
import SearchSection from "@/components/layout/SearchSection";
import HomeSliderSection from "@/components/layout/HomeSlider";


const Home = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero Section */}
      <HomeSliderSection />

    
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
