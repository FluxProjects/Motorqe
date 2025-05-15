import { CarMake } from "@shared/schema";
import { Link } from "wouter";

type Props = {
  make: CarMake;
};

const CarMakeCard = ({ make }: Props) => {
  if (!make) return null;

  const imageUrl = make.image || "https://placehold.co/400x400"; // Remove extra quotes
  const makeName = make.name || "Unknown Make";
  
  return (
    <Link href={`/browse?make=${make.id}`}>
      <div className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition cursor-pointer">
        <img
          src={imageUrl}
          alt={makeName}
          className="w-full h-24 object-contain mb-3"
        />
        <h3 className="text-sm font-medium text-neutral-800">{makeName}</h3>
        <h5 className="text-xs font-medium text-neutral-500">0 Cars</h5>
      </div>
    </Link>
  );
};

export default CarMakeCard;
