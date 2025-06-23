import { Link } from "wouter";

const HowItWorksSection = () => {
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
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 text-center relative">

      <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          With Motorqe
        </h2>
        <div className="w-40 h-1 bg-orange-500 mx-auto mb-20 rounded-full" />

        <div className="grid md:grid-cols-4 gap-6 text-center">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition"
            >
              <img
                src={feature.image}
                alt={feature.title}
                className="mx-auto mb-4 w-14 h-14 object-contain"
              />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/sell-car">
             <a className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full transition">
            Sell your car
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
