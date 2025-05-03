import { CarCategory } from "@shared/schema";

type Props = {
  category: CarCategory;
};

const CarCategoryCard = ({ category }: Props) => {
  // Ensure category is defined
  if (!category) return null;  // Avoid rendering if category is undefined

  // Provide default values if properties are missing
  const imageUrl = category.image || '"https://placehold.co/400x400"';  // Default image URL
  const categoryName = category.name || 'Unknown Category';  // Default name if missing

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition">
      <img
        src={imageUrl}
        alt={categoryName}
        className="w-full h-24 object-contain mb-3"
      />
      <h3 className="text-sm font-medium text-neutral-800">{categoryName}</h3>
    </div>
  );
};

export default CarCategoryCard;
