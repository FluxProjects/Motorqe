import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PanoViewer } from "@/components/ui/pano-view";


interface ImageGalleryProps {
  images: string[] | string;
  images360?: string[] | string;
  interiorImages?: string[] | string;
  title?: string;
  is_garage?: boolean;
}

export function CarImages({
  images,
  images360,
  interiorImages,
  title,
  is_garage = false
}: ImageGalleryProps) {
  // Normalize all inputs to arrays
  const exteriorArray = Array.isArray(images) ? images : [images];
  const interiorArray = interiorImages ? (Array.isArray(interiorImages) ? interiorImages : [interiorImages]) : [];
  const images360Array = images360 ? (Array.isArray(images360) ? images360 : [images360]) : [];

  // Build available tabs dynamically
  const availableTabs = useMemo(() => {
    const tabs = [];
    if (images360Array.length > 0) tabs.push("360");
    if (exteriorArray.length > 0) tabs.push("exterior");
    if (interiorArray.length > 0) tabs.push("interior");
    return tabs;
  }, [images360Array, exteriorArray, interiorArray]);

  const [activeTab, setActiveTab] = useState<string>(availableTabs[0] || "exterior");
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamically set imageArray based on tab
  const imageArray = useMemo(() => {
    if (activeTab === "360") return images360Array;
    if (activeTab === "interior") return interiorArray;
    return exteriorArray;
  }, [activeTab, images360Array, interiorArray, exteriorArray]);

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

  // Reset selectedImage when tab changes
  useEffect(() => {
    setSelectedImage(0);
    setImageError(false);
  }, [activeTab]);

  return (
    <div className="mb-6">
      {/* Dynamic Tabs */}
      {!is_garage && availableTabs.length > 1 && (
        <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-white text-primary-blue shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "360" ? "360° View" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      {imageArray.length > 0 && (
        <div className="relative mb-3 group cursor-zoom-in">
          {activeTab === "360" ? (
            // 360° viewer using native image drag or third-party viewer if needed
           <div className="w-full h-[500px] rounded-lg overflow-hidden">
    <PanoViewer
      src={getImageUrl(imageArray[selectedImage])}
      width="100%"
      height="100%"
    />
  </div>
          ) : (
            <img
              src={getImageUrl(imageArray[selectedImage])}
              alt={`${title || 'Car'} ${activeTab} view`}
              className="w-full h-96 object-cover rounded-lg"
              onClick={() => setIsModalOpen(true)}
              onError={() => setImageError(true)}
            />
          )}
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

      {/* Full-Screen Modal */}
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
