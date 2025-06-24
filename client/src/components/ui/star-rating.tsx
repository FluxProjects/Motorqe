import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

export default function StarRating({ 
  rating, 
  onRatingChange, 
  size = "md", 
  readonly = false 
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoveredRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(0);
    }
  };

  const getStarColor = (starIndex: number) => {
  const effectiveRating = hoveredRating || rating;
  return starIndex <= effectiveRating ? "text-orange-500" : "text-gray-300";
};


  return (
    <div 
      className="flex space-x-1" 
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <Star
          key={starIndex}
          className={`${sizeClasses[size]} ${getStarColor(starIndex)} ${
            readonly ? "" : "cursor-pointer hover:scale-110"
          } transition-all duration-200`}
          fill={starIndex <= (hoveredRating || rating) ? "currentColor" : "none"}
          onClick={() => handleStarClick(starIndex)}
          onMouseEnter={() => handleStarHover(starIndex)}
        />
      ))}
    </div>
  );
}
