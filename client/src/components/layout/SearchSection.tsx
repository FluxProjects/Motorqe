import { Link } from "react-router-dom";
import CarSearchForm from "../car/CarSearchForm";

type SearchSectionProps = {
  is_garage?: boolean;
};

const SearchSection = ({ is_garage }: SearchSectionProps) => {

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       
       <CarSearchForm is_garage={is_garage} />
       
      </div>
    </section>
  );
};

export default SearchSection;
