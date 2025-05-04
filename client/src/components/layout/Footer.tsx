import { Link } from 'wouter';
import i18n, { resources } from '@/lib/i18n'; 
import { useTranslation } from 'react-i18next';
import { Car, Send, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  const { t } = useTranslation();
  const language = i18n.language;
  const direction = language === "ar" ? "rtl" : "ltr"; // Set direction based on language
  
  return (
    <footer className="bg-blue-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className={`flex items-center gap-2 mb-6 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <Car className={`h-8 w-8 text-primary ${direction === 'rtl' ? 'flip-x' : ''}`} />
              <span className="text-2xl font-bold">{t('common.appName')}</span>
            </div>
            <p className="text-white mb-6">
              {t('footer.subscribeText')}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-white hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-white hover:text-white transition-colors">{t('common.home')}</Link></li>
              <li><Link href="/browse" className="text-white hover:text-white transition-colors">{t('common.browseCars')}</Link></li>
              <li><Link href="/sell" className="text-white hover:text-white transition-colors">{t('common.sellCar')}</Link></li>
              <li><Link href="/about" className="text-white hover:text-white transition-colors">{t('common.aboutUs')}</Link></li>
              <li><Link href="/contact" className="text-white hover:text-white transition-colors">{t('common.contactUs')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-white hover:text-white transition-colors">{t('footer.helpCenter')}</Link></li>
              <li><Link href="/safety" className="text-white hover:text-white transition-colors">{t('footer.safetyTips')}</Link></li>
              <li><Link href="/terms" className="text-white hover:text-white transition-colors">{t('footer.termsOfService')}</Link></li>
              <li><Link href="/privacy" className="text-white hover:text-white transition-colors">{t('footer.privacyPolicy')}</Link></li>
              <li><Link href="/cookie" className="text-white hover:text-white transition-colors">{t('footer.cookiePolicy')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.subscribe')}</h4>
            <p className="text-white mb-4">{t('footer.subscribeText')}</p>
            <form onSubmit={(e) => e.preventDefault()} className="mb-6">
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder={t('footer.yourEmail')} 
                  className="w-full bg-white border-neutral-700 focus:border-primary rounded-r-none"
                />
                <Button type="submit" className="px-4 bg-orange-500 hover:bg-orange-500/90 rounded-l-none">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <div>
              <h4 className="text-lg font-semibold mb-2">{t('footer.contact')}</h4>
              <p className={`text-white flex items-center mb-2 ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <MapPin className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> 
                <span>1234 Market St, San Francisco, CA</span>
              </p>
              <p className={`text-white flex items-center mb-2 ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Phone className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> 
                <span>(123) 456-7890</span>
              </p>
              <p className={`text-white flex items-center ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Mail className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> 
                <span>info@motorqe.com</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white text-sm">{t('footer.allRightsReserved')}</p>
          <div className="flex space-x-4 rtl:space-x-reverse mt-4 md:mt-0">
            <Link href="/privacy" className="text-white hover:text-white text-sm transition-colors">{t('footer.privacyPolicy')}</Link>
            <Link href="/terms" className="text-white hover:text-white text-sm transition-colors">{t('footer.termsOfService')}</Link>
            <Link href="/cookie" className="text-white hover:text-white text-sm transition-colors">{t('footer.cookiePolicy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
