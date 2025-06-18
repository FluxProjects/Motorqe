import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[] | string; // Allow for single string or array
  title?: string;
  is_garage?: boolean;
}

export function CarImages({ images, title, is_garage = false }: ImageGalleryProps) {
  // Normalize images to always be an array
  const imageArray = Array.isArray(images) ? images : [images];
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("360");
  const [imageError, setImageError] = useState(false);

  console.log("imageArray", imageArray);

  const getImageUrl = (path: string) => {
    try {
      if (path.startsWith('http') || path.startsWith('data:')) {
        return path;
      }
      if (path.startsWith('/')) {
        return path;
      }
      return new URL(`/src/${path.replace('/src/', '')}`, import.meta.url).href;
    } catch (error) {
      console.error('Error loading image:', error);
      return '';
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % imageArray.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + imageArray.length) % imageArray.length);
  };

  return (
    <div className="mb-6">
      {/* Tab Navigation */}
      {!is_garage && (
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
      )}

      {imageArray.length > 0 && (
        <div className="relative mb-3 group">
          <img 
            src={getImageUrl(imageArray[selectedImage])} 
            alt={`${title || 'Car'} ${activeTab} view`} 
            className="w-full h-96 object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
          {imageError && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">Image failed to load</span>
            </div>
          )}
          
          {imageArray.length > 1 && (
            <>
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
            </>
          )}

          <div className="absolute bottom-4 right-4">
            <div className="bg-primary-blue text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
              {/* Logo content here */}
            </div>
          </div>
        </div>
      )}

      {imageArray.length > 1 && (
        <div className="grid grid-cols-7 gap-2 mb-3">
          {imageArray.slice(0, 7).map((image, index) => (
            <img 
              key={index}
              src={getImageUrl(image)} 
              alt={`${title || 'Car'} view ${index + 1}`} 
              className={`w-full h-16 object-cover rounded cursor-pointer border-2 transition-all ${
                selectedImage === index 
                  ? 'border-primary-blue ring-2 ring-primary-blue ring-opacity-50' 
                  : 'border-gray-200 hover:border-primary-blue'
              }`}
              onClick={() => {
                setSelectedImage(index);
                setImageError(false);
              }}
              onError={() => setImageError(true)}
            />
          ))}
        </div>
      )}
    </div>
  );
}