import CarEditCard from "./CarEditCard";
import type { AdminCarListing } from "@shared/schema";

interface CarGridProps {
  cars: AdminCarListing[];
  isLoading: boolean;
}

export default function CarGrid({ cars, isLoading }: CarGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-4 w-1/2"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-300 rounded"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {cars.map((car) => (
        <CarEditCard key={car.id} car={car} />
      ))}
    </div>
  );
}
