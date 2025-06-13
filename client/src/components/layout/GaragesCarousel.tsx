import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Showroom } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { GarageCard } from '../showroom/GarageCard';
import { SimilarShowrooms } from '../car/SimilarShowrooms';

const GaragesCarousel = () => {
  const { t } = useTranslation();

  const { data: garages, isLoading } = useQuery<Showroom[]>({
    queryKey: ['/api/garages'],
    queryFn: () =>
      apiRequest('GET', '/api/garages').then((res) => res.json()),
    select: (data) => data.filter((s) => s.is_featured === true),
  });

  if (isLoading) {
    return <div className="bg-white py-10">Loading...</div>;
  }

  if (!garages || garages.length === 0) {
    return <div className="bg-white py-10">No featured garages available</div>;
  }

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 text-center relative">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          Popular <span className="font-bold">Service Providers</span>
        </h2>
        <div className="w-40 h-1 bg-orange-500 mx-auto mb-20 rounded-full" />


               <SimilarShowrooms showroomId={garages[0].id} limit={6} />

        

       
      </div>
    </section>
  );
};

export default GaragesCarousel;
