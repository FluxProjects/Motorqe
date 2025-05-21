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
      <div className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition cursor-pointer">
        <h3 className="text-sm font-medium text-neutral-800">{label}</h3>
      </div>
    </Link>
  );
};

export default CarCapacityCard;
