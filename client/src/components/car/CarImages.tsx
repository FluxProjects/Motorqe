import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageGalleryProps {
  images: string[] | string;
  title?: string;
  is_garage?: boolean;
}

export function CarImages({ images, title, is_garage = false }: ImageGalleryProps) {
  const imageArray = Array.isArray(images) ? images : [images];
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("360");
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getImageUrl = (path: string) => {
    try {
      if (path.startsWith('http') || path.startsWith('data:')) return path;
      if (path.startsWith('/')) return path;
      return new URL(`/src/${path.replace('/src/', '')}`, import.meta.url).href;
    } catch (error) {
      console.error('Error loading image:', error);
      return '';
    }
  };

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % imageArray.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + imageArray.length) % imageArray.length);

  // Close modal on ESC
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setIsModalOpen(false);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, handleKeyDown]);

  return (
    <div className="mb-6">
      {/* Tab Navigation */}
      {!is_garage && (
        <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
          {["360", "exterior", "interior"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-white text-primary-blue shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      {imageArray.length > 0 && (
        <div className="relative mb-3 group cursor-zoom-in">
          <img
            src={getImageUrl(imageArray[selectedImage])}
            alt={`${title || 'Car'} ${activeTab} view`}
            className="w-full h-96 object-cover rounded-lg"
            onClick={() => setIsModalOpen(true)}
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
        </div>
      )}

      {/* Thumbnails */}
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

      {/* Full-Screen Modal for Zoom */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
            <img
              src={getImageUrl(imageArray[selectedImage])}
              alt={`${title || 'Car'} zoomed view`}
              className="w-full h-full object-contain rounded-lg"
            />
            {imageArray.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
