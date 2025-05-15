import { Link } from 'wouter';
import i18n from '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logoFooter from '@/assets/logo-white.png';

const Footer = () => {
  const { t } = useTranslation();
  const language = i18n.language;
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <footer className="bg-blue-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 ${direction === 'rtl' ? 'text-right' : ''}`}>
          {/* Logo & Social */}
          <div>
            <div className={`flex items-center gap-2 mb-6 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <img src={logoFooter} alt="Logo" className="h-20" />
            </div>
            <p className="text-white mb-6">{t('footer.subscribeText')}</p>
            <div className="flex gap-4 mb-6">
              <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">
                <img src="https://freelogopng.com/images/all_img/1664287128google-play-store-logo-png.png" alt="Google Play" className="h-12" />
              </a>
              <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="h-12" />
              </a>
            </div>

                        <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="bg-white text-blue-900 rounded-full p-2 hover:bg-orange-500 hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="bg-white text-blue-900 rounded-full p-2 hover:bg-orange-500 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="bg-white text-blue-900 rounded-full p-2 hover:bg-orange-500 hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="bg-white text-blue-900 rounded-full p-2 hover:bg-orange-500 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>


          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li><Link href="/">{t('common.home')}</Link></li>
              <li><Link href="/browse">{t('common.browseCars')}</Link></li>
              <li><Link href="/sell">{t('common.sellCar')}</Link></li>
              <li><Link href="/about">{t('common.aboutUs')}</Link></li>
              <li><Link href="/contact">{t('common.contactUs')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2">
              <li><Link href="/help">{t('footer.helpCenter')}</Link></li>
              <li><Link href="/safety">{t('footer.safetyTips')}</Link></li>
              <li><Link href="/terms">{t('footer.termsOfService')}</Link></li>
              <li><Link href="/privacy">{t('footer.privacyPolicy')}</Link></li>
              <li><Link href="/cookie">{t('footer.cookiePolicy')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.contact')}</h4>
            <p className="flex items-center mb-2">
              <MapPin className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              1234 Market St, San Francisco, CA
            </p>
            <p className="flex items-center mb-2">
              <Phone className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              (123) 456-7890
            </p>
            <p className="flex items-center">
              <Mail className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              info@motorqe.com
            </p>
          </div>
        </div>

        {/* Newsletter Form */}
        <div className="mt-12">
          <h4 className="text-lg font-semibold mb-4">{t('footer.subscribe')}</h4>
          <form onSubmit={(e) => e.preventDefault()} className="flex max-w-md">
            <Input
              type="email"
              placeholder={t('footer.yourEmail')}
              className="w-full bg-white text-black rounded-l-md"
            />
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 rounded-r-md px-4">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">&copy; 2025 MotorQE. {t('footer.allRightsReserved')}</p>
          <div className="flex gap-4 text-sm mt-4 md:mt-0">
            <Link href="/privacy">{t('footer.privacyPolicy')}</Link>
            <Link href="/terms">{t('footer.termsOfService')}</Link>
            <Link href="/cookie">{t('footer.cookiePolicy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
