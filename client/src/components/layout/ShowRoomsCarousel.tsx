import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const showrooms = [
  'https://placehold.co/400x400',
  'https://placehold.co/400x400',
  'https://placehold.co/400x400',
  'https://placehold.co/400x400',
  'https://placehold.co/400x400',
  'https://placehold.co/400x400',
  'https://placehold.co/400x400',
  'https://placehold.co/400x400',
  'https://placehold.co/400x400',
  'https://placehold.co/400x400','https://placehold.co/400x400',
  'https://placehold.co/400x400',
];

const ShowRoomsCarousel = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">
          {t('common.featuredShowrooms')}
        </h2>

        <Swiper
          modules={[Navigation]}
          spaceBetween={40}
          slidesPerView={6}
          navigation
          loop
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 6 },
          }}
          className="relative"
        >
          {showrooms.map((src, idx) => (
            <SwiperSlide key={idx} className="flex justify-center">
              <img
                src={src}
                alt="Dealer Logo"
                className="h-30 grayscale hover:grayscale-0 transition"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ShowRoomsCarousel;
