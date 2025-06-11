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
      <div className="text-blue-900 border-2 border-blue-900 rounded-lg shadow-sm p-4 text-center hover:shadow-md hover:bg-blue-900 hover:text-white transition cursor-pointer">
        <h3 className="text-sm font-medium">{yearLabel}</h3>
      </div>
    </Link>
  );
};

export default CarYearCard;
