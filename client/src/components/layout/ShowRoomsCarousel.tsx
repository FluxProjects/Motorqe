import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Showroom } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

const ShowRoomsCarousel = () => {
  const { t } = useTranslation();

  const { data: showrooms, isLoading } = useQuery<Showroom[]>({
    queryKey: ["/api/showrooms"],
    queryFn: () =>
      apiRequest("GET", "/api/showrooms").then((res) => res.json()),
    select: (data) => data.filter(showroom => showroom.is_featured === true)
  });

  if (isLoading) {
    return <div className="bg-white py-10">Loading...</div>;
  }

  if (!showrooms || showrooms.length === 0) {
    return <div className="bg-white py-10">No featured showrooms available</div>;
  }

  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">
          {t('common.featuredShowrooms')}
        </h2>

        <Swiper
          modules={[Navigation]}
          spaceBetween={40}
          slidesPerView={5}
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
          {showrooms && showrooms.map((showroom) => (
            <SwiperSlide key={showroom.id} className="flex justify-center">
               <Link href={`/showrooms/${showroom.id}`}>
                <a className="block cursor-pointer">
                  <img
                    src={showroom.logo || '/placeholder-logo.png'}
                    alt={showroom.name}
                    className="h-30 grayscale hover:grayscale-0 transition"
                  />
                  <p className="mt-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                    {showroom.name}
                  </p>
                </a>
              </Link>
             
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ShowRoomsCarousel;