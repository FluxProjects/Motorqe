import { useState } from "react";
import { ChevronLeft, ChevronRight, Share, Heart, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function CarImages({ images, title }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("360");

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="mb-6">
      {/* Tab Navigation */}
      <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("360")}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "360"
              ? "bg-white text-accent-orange shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          360 Tour
        </button>
        <button
          onClick={() => setActiveTab("exterior")}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "exterior"
              ? "bg-white text-primary-blue shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Exterior
        </button>
        <button
          onClick={() => setActiveTab("interior")}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "interior"
              ? "bg-white text-primary-blue shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Interior
        </button>
      </div>

      {/* Main Image with Navigation */}
      <div className="relative mb-3 group">
        <img 
          src={images[selectedImage]} 
          alt={`${title} ${activeTab} view`} 
          className="w-full h-96 object-cover rounded-lg"
        />
        
        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="h-6 w-6 text-gray-600" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="h-6 w-6 text-gray-600" />
        </button>

        {/* MOTORGE Logo */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-primary-blue text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
            M
          </div>
        </div>
      </div>
      
      {/* Thumbnail Gallery */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {images.slice(0, 7).map((image, index) => (
          <img 
            key={index}
            src={image} 
            alt={`${title} view ${index + 1}`} 
            className={`w-full h-16 object-cover rounded cursor-pointer border-2 transition-all ${
              selectedImage === index 
                ? 'border-primary-blue ring-2 ring-primary-blue ring-opacity-50' 
                : 'border-gray-200 hover:border-primary-blue'
            }`}
            onClick={() => setSelectedImage(index)}
          />
        ))}
      </div>

     

    </div>
  );
}
