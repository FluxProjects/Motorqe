import { Link } from "react-router-dom";
import CarSearchForm from "../car/CarSearchForm";

const SearchSection = () => {

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       
       <CarSearchForm />
       
      </div>
    </section>
  );
};

export default SearchSection;
