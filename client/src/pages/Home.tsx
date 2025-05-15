import { useTranslation } from 'react-i18next';
import CarSearchForm from "@/components/car/CarSearchForm";
import AppDownloadSection from "@/components/layout/AppDownloadSection";
import ShowRoomsCarousel from "@/components/layout/ShowRoomsCarousel";
import FaqSection from "@/components/layout/FaqSection";
import HowItWorksSection  from "@/components/layout/HowItWorks";
import CarTypeTabSection from "@/components/car/CarTypeTabSection";
import FeaturedListingsSection from "@/components/layout/FeaturedListingSection";
import SearchSection from '@/components/layout/SearchSection';

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

      {/* Seller CTA Section */}
      {/* <section className="py-16 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-white">{t('home.readyToSell')}</h2>
              <p className="mt-4 text-lg text-blue-100">{t('home.sellCTA')}</p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <CheckCircle2 className="text-blue-200 mt-1 mr-3" size={20} />
                  <div>
                    <h3 className="font-semibold text-white">{t('home.freeBasicListings')}</h3>
                    <p className="text-blue-100">{t('home.freeBasicListingsDesc')}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-blue-200 mt-1 mr-3" size={20} />
                  <div>
                    <h3 className="font-semibold text-white">{t('home.reachMoreBuyers')}</h3>
                    <p className="text-blue-100">{t('home.reachMoreBuyersDesc')}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-blue-200 mt-1 mr-3" size={20} />
                  <div>
                    <h3 className="font-semibold text-white">{t('home.secureMessaging')}</h3>
                    <p className="text-blue-100">{t('home.secureMessagingDesc')}</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link href="/sell">
                  <Button className="inline-flex items-center justify-center px-6 py-3 border border-transparent bg-white text-primary rounded-md hover:bg-blue-50 transition-colors font-medium">
                    {t('home.listYourCar')} <ArrowRight className="ml-2" size={16} />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block lg:w-2/5">
              <img 
                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                alt="Sell your car" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section> */}

        {/* FAQ Section*/}
      <FaqSection />
      
    </div>
  );
};

export default Home;
