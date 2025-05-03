import { CarMake } from "@shared/schema";
type Props = {
  make: CarMake;
};

const CarMakeCard = ({ make }: Props) => {
  if (!make) return null;
  const imageUrl = make.image || '"https://placehold.co/400x400"'; // Default image URL
  const makeName = make.name || "Unknown Category"; // Default name if missing
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition">
      <img
        src={imageUrl}
        alt={makeName}
        className="w-full h-24 object-contain mb-3"
      />
      <h3 className="text-sm font-medium text-neutral-800">{makeName}</h3>
    </div>
  );
};

export default CarMakeCard;
