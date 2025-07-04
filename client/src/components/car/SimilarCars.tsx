import { getEngineSizeLabel } from "@/lib/utils";
import { CarEngineCapacity, CarListing } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Car, Calendar, Settings, Zap } from "lucide-react";
import { Link } from "wouter";

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
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {similarCars.map((car, index) => {
          const engineSizeLabel = getEngineSizeLabel(
            car?.engine_capacity_id,
            carEngineCapacities
          );

          return (
            <Link to={`/cars/${car.id}`} key={car.id} className="block">
            <div
              key={car.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={car?.images[0]}
                  alt={car?.title}
                  className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                    car?.status === "sold" ? "opacity-50" : ""
                  }`}
                />
               {/* SOLD STAMP */}
                {car?.status === "sold" && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-red-500 text-xl font-extrabold border-red-500 border-2 px-6 py-2 shadow-lg transform rotate-[-10deg] opacity-90">
                      SOLD
                    </div>
                  </div>
                )}

                {/* NEW RIBBON */}
                {car?.condition === "new" && car?.status !== "sold" && (
                  <div className="absolute top-5 left-[-40px] -rotate-45 bg-red-700 text-white font-black px-20 py-1 text-lg shadow-lg z-10">
                    NEW
                  </div>
                )}

                {/* LOW MILEAGE RIBBON */}
                {(() => {
                  const currentYear = new Date().getFullYear();
                  const carYear = parseInt(car.year);
                  const yearsOwned = Math.max(currentYear - carYear + 1, 1); // Prevent division by zero
                  const avgMileagePerYear = car.mileage / yearsOwned;
                  const condition = car.condition?.toLowerCase();

                  if (
                    condition === "used" && car?.status !== "sold" &&
                    avgMileagePerYear < 25000
                  ) {
                    return (
                      <div className="absolute top-7 left-[-80px] -rotate-45 bg-green-500 text-white font-black px-20 py-1 text-sm shadow-lg z-10">
                        LOW MILEAGE
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* 360 Overlay */}
                {car?.image360 && (
                  <div className="absolute bottom-2 left-2 z-10">
                    <img
                      src="/src/assets/360-listing.png"
                      alt="360 Available"
                      className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg"
                    />
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}
