import { useTranslation } from 'react-i18next';

const AppDownloadSection = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-primary py-16 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 items-center gap-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('common.downloadAppTitle')}
          </h2>
          <p className="text-lg text-blue-100 mb-6">
            {t('common.downloadAppSubtitle')}
          </p>
          <div className="flex space-x-4 items-center">
            <a
              href="https://apps.apple.com/app/idYOUR_APP_ID"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                className="h-12 object-contain"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=YOUR_APP_ID"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://freelogopng.com/images/all_img/1664287128google-play-store-logo-png.png"
                alt="Get it on Google Play"
                className="h-12 object-contain"
              />
            </a>
          </div>
        </div>
        <div className="hidden md:block">
          <img
            src="https://img.freepik.com/premium-vector/smartphone-isometric-mockup-isolated-realistic-design-realistic-3d-objects_177517-1652.jpg"
            alt="Mobile App"
            className="w-full max-w-xs mx-auto rounded-lg shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
