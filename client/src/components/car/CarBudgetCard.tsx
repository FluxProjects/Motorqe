import { BudgetRange } from "@shared/schema";
import { Link } from "wouter";

type Props = {
  budget: BudgetRange;
};

const CarBudgetCard = ({ budget }: Props) => {
  if (!budget) return null;

  const budgetName = budget.name || "Unnamed Budget";
  const min = budget.min !== undefined ? budget.min : "all";
  const max = budget.max !== Infinity ? budget.max : "all";

  return (
    <Link href={`/browse?minPrice=${min}&maxPrice=${max}`}>
      <div className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition cursor-pointer">
        <h3 className="text-sm font-medium text-neutral-800">{budgetName}</h3>
      </div>
    </Link>
  );
};

export default CarBudgetCard;
