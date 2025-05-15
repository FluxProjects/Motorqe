import { Link } from "react-router-dom";
import CarSearchForm from "../car/CarSearchForm";

const SearchSection = () => {
  const features = [
    {
      image: "/src/assets/calendar-clock.png", // Replace with your actual image path
      title: "Selling Process",
      desc: "80% of our Customers sell their car with in 2 weeks",
    },
    {
      image: "/src/assets/free-listing.png", // Replace with your actual image path
      title: "Free Listing",
      desc: "List your Car for 30 days for free then sit back & we will find you a potential buyer",
    },
    {
      image: "/src/assets/compare-cars.png", // Replace with your actual image path
      title: "Compare cars",
      desc: "Choosing your favourite Car is now easier with the new comparison feature",
    },
    {
      image: "/src/assets/find-garage.png", // Replace with your actual image path
      title: "Find a Garage",
      desc: "Looking to fix or service your Car? find your ideal garage now hassle free.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       
       <CarSearchForm />
       
      </div>
    </section>
  );
};

export default SearchSection;
