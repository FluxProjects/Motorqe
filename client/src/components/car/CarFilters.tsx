import { AdminCarListingFilters } from "@shared/schema";
import { ChevronDown, Grid } from "lucide-react";

interface CarFiltersProps {
  filters: AdminCarListingFilters;
  onFiltersChange: (updateFn: (prev: any) => any) => void;
  availableMakes: { id: number; name: string;}[];
  availableModels: { id: number; name: string; }[];
}

export default function CarFilters({ 
  filters, 
  onFiltersChange, 
  availableMakes,
  availableModels
}: CarFiltersProps) {

  console.log("availableModels", availableModels);


  const sortOptions = ["Newly added", "Price: Low to High", "Price: High to Low", "Most Popular"];

  return (
    <div className="flex flex-wrap gap-6 items-end justify-between mb-6">
      <div className="flex flex-wrap gap-6 items-end">
        {/* Make */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
          <select
            value={filters.make}
            onChange={(e) => {
              const selectedMake = e.target.value;
              onFiltersChange((prev) => ({
                ...prev,
                make: selectedMake,
                model: "", // Reset model when make changes
              }));
            }}
          >
            <option value="">Select Make</option>
            {availableMakes.map((make) => (
              <option key={make.id} value={make.id}> {/* Use make.id as value */}
                {make.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-9 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Model */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <select
            value={filters.model}
            onChange={(e) => onFiltersChange((prev) => ({ ...prev, model: e.target.value }))}
            disabled={!filters.make}
          >
            <option value="">Select Model</option>
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}> {/* Use model.id as value */}
                {model.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-9 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Sort by:</span>
        <div className="relative">
          <select
            className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.sort}
            onChange={(e) => onFiltersChange((prev) => ({ ...prev, sort: e.target.value }))}
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        <Grid className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
