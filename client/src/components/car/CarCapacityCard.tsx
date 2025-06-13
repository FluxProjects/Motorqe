import { BudgetRange } from "@shared/schema";
import { Link } from "wouter";

type Props = {
  capacity: BudgetRange;
};

const CarCapacityCard = ({ capacity }: Props) => {
  if (!capacity) return null;

  const label = capacity.name || `${capacity.min}L - ${capacity.max}L`;
  const capacityId = capacity.id?.toString(); // Assuming your API gives each engine capacity a unique `id`

  if (!capacityId) return null;

  return (
    <Link href={`/browse?engine_capacity=${capacityId}`}>
            <div className="text-blue-900 border-2 border-blue-900 rounded-lg shadow-sm p-4 text-center hover:shadow-md hover:bg-blue-900 hover:text-white transition cursor-pointer">
        <h3 className="text-sm font-medium">{label}</h3>
      </div>
    </Link>
  );
};

export default CarCapacityCard;
