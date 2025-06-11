import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Showroom } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ShowroomCard } from '../showroom/ShowroomCard';

const GaragesCarousel = () => {
  const { t } = useTranslation();

  const { data: showrooms, isLoading } = useQuery<Showroom[]>({
    queryKey: ['/api/garages'],
    queryFn: () =>
      apiRequest('GET', '/api/garages').then((res) => res.json()),
    select: (data) => data.filter((s) => s.is_featured === true),
  });

  if (isLoading) {
    return <div className="bg-white py-10">Loading...</div>;
  }

  if (!showrooms || showrooms.length === 0) {
    return <div className="bg-white py-10">No featured showrooms available</div>;
  }

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 text-center relative">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          Popular <span className="font-bold">Service Providers</span>
        </h2>
        <div className="w-40 h-1 bg-orange-500 mx-auto mb-20 rounded-full" />

        <Swiper
          modules={[Navigation]}
          spaceBetween={100}
          slidesPerView={3}
          loop={showrooms.length > 1}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 6 }
          }}
          className="relative"
        >
          {showrooms.map((showroom) => (
            <SwiperSlide key={showroom.id} className="flex justify-center">
              <Link href={`/showrooms/${showroom.id}`}>
                <ShowroomCard key={showroom.id} showroom={showroom} />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Arrows */}
        <div className="swiper-button-prev-custom absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
          <button className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="swiper-button-next-custom absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
          <button className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* View More Button */}
        <div className="flex flex-col items-end mt-10">
          <Link href="/browse-showrooms">
            <a className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full transition">
              View More
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GaragesCarousel;
