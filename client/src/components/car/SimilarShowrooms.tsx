import { useQuery } from "@tanstack/react-query";
import { MapPin, Building2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "../ui/button";

interface Showroom {
  id: number;
  name: string;
  location: string;
  logo?: string;
}

interface SimilarShowroomsProps {
  showroomId: number;
}

export function SimilarShowrooms({ showroomId }: SimilarShowroomsProps) {
  const { data: similarShowrooms = [] } = useQuery<Showroom[]>({
    queryKey: ["similar-showrooms", showroomId],
    enabled: !!showroomId,
    queryFn: async () => {
      const res = await fetch(`/api/garages`);
      if (!res.ok) throw new Error("Failed to fetch similar garages");
      return res.json();
    },
  });

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Similar Garages</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {similarShowrooms.slice(0, 4).map((showroom, index) => (
          <Link to={`/garages/${showroom.id}`} key={showroom.id} className="block">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={showroom.logo || "/placeholder.jpg"}
                  alt={showroom.name}
                  className="w-full h-48 object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Featured
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-900 text-white">
                <h3 className="font-bold text-sm mb-3 uppercase">{showroom.name}</h3>
                <div className="flex items-center text-xs">
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600 text-white mx-auto mt-2"
                    size="sm"
                    >
                    Book Now
                    </Button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
