import { getEngineSizeLabel } from "@/lib/utils";
import { CarEngineCapacity, CarListing } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Car, Calendar, Settings, Zap } from "lucide-react";

interface SimilarCarsProps {
  vehicleId: number;
}

export function SimilarCars({ vehicleId }: SimilarCarsProps) {
  // Fetch similar cars
  const { data: similarCars = [] } = useQuery<CarListing[]>({
    queryKey: ["similar-car-listings", vehicleId],
    enabled: !!vehicleId,
    queryFn: async () => {
      const res = await fetch(`/api/listings/${vehicleId}/similar`);
      if (!res.ok) throw new Error("Failed to fetch similar car listings");
      return res.json();
    },
  });

  const { data: carEngineCapacities = [] } = useQuery<CarEngineCapacity[]>({
    queryKey: ["/api/car-enginecapacities"], // Changed to a more standard key
  });

  // Function to get engine size in liters by id

  console.log("similar cars", similarCars);

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Similar Cars</h2>
        <a href="#" className="text-primary-blue hover:underline font-medium">
          Notify me for Similar Cars
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {similarCars.map((car, index) => {
          const engineSizeLabel = getEngineSizeLabel(
            car?.engine_capacity_id,
            carEngineCapacities
          );

          return (
            <div
              key={car.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={car.images?.[0] ?? "/placeholder.jpg"}
                  alt={car.title}
                  className="w-full h-48 object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    New Arrival
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-900 text-white">
                <h3 className="font-bold text-sm mb-3 uppercase">
                  {car.title}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{car.year}</span>
                  </div>
                  <div className="flex items-center">
                    <Settings className="w-3 h-3 mr-1" />
                    <span>{car?.capacity_count} Cylinders</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    <span>{car.mileage}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
