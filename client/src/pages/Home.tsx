import { useTranslation } from 'react-i18next';
import CarSearchForm from "@/components/car/CarSearchForm";
import AppDownloadSection from "@/components/layout/AppDownloadSection";
import ShowRoomsCarousel from "@/components/layout/ShowRoomsCarousel";
import FaqSection from "@/components/layout/FaqSection";
import HowItWorksSection  from "@/components/layout/HowItWorks";
import CarTypeTabSection from "@/components/car/CarTypeTabSection";
import FeaturedListingsSection from "@/components/layout/FeaturedListingSection";

const Home = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-light to-blue-100 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight">
                {t('home.heroTitle')}
              </h1>
              <p className="mt-4 text-xl text-neutral-700">
                {t('home.heroSubtitle')}
              </p>
              
              {/* Search Form */}
              <div className="mt-8">
                <CarSearchForm />
              </div>


            </div>
            
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                alt="Modern Car" 
                className="rounded-lg shadow-xl"
              />
              <div className="mt-4 grid grid-cols-3 gap-2">
                <img 
                  src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80" 
                  alt="Sports Car" 
                  className="rounded-md shadow"
                />
                <img 
                  src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80" 
                  alt="Classic Car" 
                  className="rounded-md shadow"
                />
                <img 
                  src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80" 
                  alt="SUV" 
                  className="rounded-md shadow"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* App Download Section */}
      <AppDownloadSection />

      
    </div>
  );
};

export default Home;
