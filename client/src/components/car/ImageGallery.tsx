import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () =>
    setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative w-full">
      {/* Main Image with Zoom */}
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative cursor-zoom-in w-full rounded-lg overflow-hidden">
            <img
              src={images[currentIndex]}
              alt={`Car image ${currentIndex + 1}`}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
            />
            <div className="absolute bottom-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 text-white"
              >
                <ZoomIn size={20} />
              </Button>
            </div>
          </div>
        </DialogTrigger>

        <DialogContent className="max-w-4xl p-0">
          <Zoom>
            <img
              src={images[currentIndex]}
              alt={`Zoomed car image ${currentIndex + 1}`}
              className="w-full h-[60vh] sm:h-[70vh] object-contain"
            />
          </Zoom>
        </DialogContent>
      </Dialog>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-2 overflow-x-auto py-2">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden ${
              currentIndex === index ? "ring-2 ring-primary" : ""
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white"
            onClick={prevImage}
          >
            <ChevronLeft size={24} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white"
            onClick={nextImage}
          >
            <ChevronRight size={24} />
          </Button>
        </>
      )}
    </div>
  );
}
