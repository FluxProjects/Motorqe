import React from "react";
import { useQuery } from "@tanstack/react-query";
import { HeroSlider } from "@shared/schema";
import { HeartPulse } from "lucide-react";

const HomeSliderSection: React.FC = () => {
  const {
    data: sliderData = [],
    isLoading,
    refetch,
  } = useQuery<HeroSlider[]>({
    queryKey: ["hero-sliders"],
    queryFn: async () => {
      const res = await fetch("/api/hero-sliders");
      if (!res.ok) throw new Error("Failed to fetch hero sliders");
      return res.json();
    },
  });

  const hero = sliderData.find((s) => s.is_active && s.slide_type === "home") || null;

  return (
    <section className="relative w-full">
      <a href={hero?.button_url}>
        {isLoading ? (
            <img
            src="/src/assets/banner.png"
            alt="Hero Banner"
            className="w-full h-auto object-cover"
            />
            
        ) : (
            <img
            src={hero?.image_url}
            alt={hero?.title}
            className="w-full h-auto object-cover"
            />
        )}

        <div className="absolute left-2/3 transform -translate-x-2/3 md:bottom-5 md:left-2/3 md:-translate-x-2/3 text-left w-full max-w-2xl">
            <h2 className="text-orange-500 font-bold text-4xl md:text-4xl ml-10 pb-20">
            {hero?.subtitle || hero?.subtitle_ar}
            </h2>
        </div>

        <div className="absolute bottom-5 right-5 md:bottom-10 md:right-10 text-center text-white max-w-xs md:max-w-md">
            <p className="text-black text-sm md:text-base font-semibold">
            DOWNLOAD THE APP NOW
            </p>
            <div className="flex justify-end gap-2">
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer">
                <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="App Store"
                className="h-10 md:h-12"
                />
            </a>
            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">
                <img
                src="https://freelogopng.com/images/all_img/1664287128google-play-store-logo-png.png"
                alt="Google Play"
                className="h-10 md:h-12"
                />
            </a>
            </div>
        </div>
      </a>
    </section>
  );
};

export default HomeSliderSection;
