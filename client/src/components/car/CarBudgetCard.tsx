import { BudgetRange } from "@shared/schema";
  
  type Props = {
    budget: BudgetRange;
  };
  
  const CarBudgetCard = ({ budget }: Props) => {
    if (!budget) return null;
  
    const budgetName = budget.name || "Unnamed Budget";
  
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition">
        <h3 className="text-sm font-medium text-neutral-800">{budgetName}</h3>
      </div>
    );
  };
  
  export default CarBudgetCard;
  