import { CarCategory } from "@shared/schema";
import { Link } from "wouter";

type Props = {
  category: CarCategory;
};

const CarCategoryCard = ({ category }: Props) => {
  if (!category) return null;

  const imageUrl = category.image || "https://placehold.co/400x400"; // Fixed default image URL
  const categoryName = category.name || "Unknown Category";

  return (
    <Link href={`/browse?category=${category.id}`}>
      <div className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition cursor-pointer">
        <img
          src={imageUrl}
          alt={categoryName}
          className="w-full h-24 object-contain mb-3"
        />
        <h3 className="text-sm font-medium text-neutral-800">{categoryName}</h3>
        <h5 className="text-xs font-medium text-neutral-500">{category.count || '0'} Cars</h5>
      </div>
    </Link>
  );
};

export default CarCategoryCard;
