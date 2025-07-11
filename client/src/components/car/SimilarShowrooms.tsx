import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Showroom {
  id: number;
  name: string;
  location: string;
  logo?: string;
}

interface SimilarShowroomsProps {
  showroomId: number;
  limit?: number;
  is_garage?: boolean;
}

export function SimilarShowrooms({
  showroomId,
  limit = 6,
  is_garage = false,
}: SimilarShowroomsProps) {
  const { data: similarShowrooms = [] } = useQuery<Showroom[]>({
    queryKey: ["similar-showrooms", showroomId],
    enabled: !!showroomId,
    queryFn: async () => {
      const endpoint = is_garage ? "/api/garages" : "/api/showrooms";
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch similar garages");
      return res.json();
    },
  });

  const visibleShowrooms = similarShowrooms;

  return (
    <section className="bg-white relative">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={4}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
      >
        {visibleShowrooms.map((showroom, index) => (
          <SwiperSlide key={showroom.id}>
            <Link
              to={`/${is_garage ? "garages" : "showrooms"}/${showroom.id}`}
              className="block h-full"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={showroom.logo || "/placeholder.jpg"}
                    alt={showroom.name}
                    className="w-full h-48 object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-4 bg-blue-900 text-white">
                  <h3 className="font-bold text-sm mb-3 uppercase">
                    {showroom.name}
                  </h3>
                  <div className="flex items-center text-xs">
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white mx-auto mt-2"
                      size="sm"
                    >
                      {is_garage ? "Book Now" : "View Detail"}
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

       {/* Custom Navigation Arrows */}
        <div className="swiper-button-prev-custom absolute top-1/2 -left-8 transform -translate-y-1/2 z-10">
          <button className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="swiper-button-next-custom absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
          <button className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
    </section>
  );
}
