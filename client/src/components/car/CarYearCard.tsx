import { BudgetRange } from "@shared/schema";
import { Link } from "wouter";

type Props = {
  yearRange: BudgetRange;
};

const CarYearCard = ({ yearRange }: Props) => {
  if (!yearRange) return null;

  const yearLabel = yearRange.name || "Unnamed Range";
  const minYear = yearRange.min !== undefined ? yearRange.min : "all";
  const maxYear = yearRange.max !== Infinity ? yearRange.max : "all";

  return (
    <Link href={`/browse?minYear=${minYear}&maxYear=${maxYear}`}>
      <div className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition cursor-pointer">
        <h3 className="text-sm font-medium text-neutral-800">{yearLabel}</h3>
      </div>
    </Link>
  );
};

export default CarYearCard;
