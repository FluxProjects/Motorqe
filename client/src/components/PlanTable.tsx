import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Card } from "./ui/card";

type PlanType = "basic" | "silver" | "gold" | "platinum";

interface PromotionPackage {
  id: number;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: number;
  currency: string;
  duration: number;
  isFeatured: boolean;
  exposureMultiplier: number;
  active: boolean;
  createdAt: string;
  plan: PlanType;
}

const tierStyles: Record<
  PlanType,
  {
    ribbon: string;
    label: string;
    badge: string;
    exposure: string | null;
    button: string;
    photoLimit: number;
  }
> = {
  basic: {
    ribbon: "bg-gray-500",
    label: "Basic",
    badge: "from-gray-300 to-gray-400",
    exposure: null,
    button: "bg-blue-900 hover:bg-orange-500",
    photoLimit: 3,
  },
  silver: {
    ribbon: "bg-blue-600",
    label: "Silver",
    badge: "from-blue-200 to-blue-400",
    exposure: "X10 High Exposure",
    button: "bg-blue-600 hover:bg-blue-700",
    photoLimit: 10,
  },
  gold: {
    ribbon: "bg-orange-500",
    label: "Gold",
    badge: "from-yellow-200 to-yellow-400",
    exposure: "X50 Higher Exposure",
    button: "bg-orange-500 hover:bg-orange-600",
    photoLimit: 20,
  },
  platinum: {
    ribbon: "bg-purple-600",
    label: "Platinum",
    badge: "from-purple-200 to-purple-400",
    exposure: "X100 Highest Exposure",
    button: "bg-purple-600 hover:bg-purple-700",
    photoLimit: 50,
  },
};

export default function PlanCards() {
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["promotion-packages"],
    queryFn: () => fetch("/api/promotion-packages").then((res) => res.json()),
  });

  const visiblePackages = packages.filter(
    (pkg: PromotionPackage) => pkg.is_active
  );
  const rows = [];
  for (let i = 0; i < visiblePackages.length; i += 3) {
    console.log("visiblePackages", visiblePackages);
    rows.push(visiblePackages.slice(i, i + 3));
  }

  // Function to generate 24-pointed star polygon points
  const generate24PointedStar = (outerRadius = 50, innerRadius = 25) => {
    const points = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI) / 12;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      points.push(`${x}% ${y}%`);
    }
    return `polygon(${points.join(", ")})`;
  };

  return (
    <div className="space-y-8 py-8">
      <h2 className="text-3xl font-bold text-center">Choose a Plan</h2>
      {rows.map((row, i) => (
        <div
          key={i}
          className={clsx(
            "flex flex-wrap justify-center gap-8",
            row.length === 1 && "justify-center",
            row.length === 2 && "justify-center"
          )}
        >
          {row.map((pkg: PromotionPackage) => {
            const style = tierStyles[pkg.plan] ?? tierStyles.basic;

            return (
              <Card
                key={pkg.id}
                className="relative bg-white rounded-2xl shadow-lg p-6 w-[300px] flex flex-col items-center border border-gray-200"
              >
                {/* Ribbon - Updated to match design */}
                <div className="absolute top-0 left-0 w-32 overflow-hidden h-8">
                  <div className="absolute top-0 left-0 w-full h-full bg-red-600 transform -skew-x-45 origin-top-left flex items-center justify-center">
                    <span className="text-white text-xs font-bold transform skew-x-45">
                      {style.label}
                    </span>
                  </div>
                  <div className="absolute top-0 left-0 w-2 h-2 bg-red-800"></div>
                </div>

                {/* Star-like badge with gradient */}
                <div className="mt-10 mb-6 relative">
                  <div
                    className={`w-24 h-24 bg-gradient-to-br ${style.badge} flex items-center justify-center text-xl font-bold text-white relative`}
                    style={{
                      clipPath: generate24PointedStar(),
                    }}
                  >
                    {pkg.name.toUpperCase().split(" ")[0]}
                  </div>
                </div>

                {/* Price */}
                <div className="text-3xl font-bold mb-6">
                  {pkg.price === 0 ? (
                    <span className="text-gray-800">FREE</span>
                  ) : (
                    <span className="text-orange-500">
                      {pkg.currency} {pkg.price}{" "}
                    </span>
                  )}
                </div>
                
                  <div className="border-2 border-neutral-300 w-full mb-10"></div>

                {/* Description with orange circle checkboxes */}
                <ul className="text-sm space-y-4 text-gray-600 mb-10 w-full pl-8">
  <li className="relative pl-6 leading-5">
    <span className="absolute left-0 top-1 flex items-center justify-center w-4 h-4 rounded-full bg-orange-500">
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
    Upload up to {style.photoLimit} Photos
  </li>
  <li className="relative pl-6 leading-5">
    <span className="absolute left-0 top-1 flex items-center justify-center w-4 h-4 rounded-full bg-orange-500">
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
    Listing Active for {pkg.duration} Days
  </li>
  {!style.exposure ? (
    <li className="relative pl-6 leading-5">
      <span className="absolute left-0 top-1 flex items-center justify-center w-4 h-4 rounded-full bg-orange-500">
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      No High Exposure
    </li>
  ) : null}
</ul>

                {/* Exposure label */}
                {style.exposure && (
                  <div className="w-full mb-6">
                    <div className="bg-blue-100 text-blue-800 font-medium px-4 py-2 rounded-full text-sm">
                      {style.exposure}
                    </div>
                  </div>
                )}

                <button
                  className={clsx(
                    "w-full text-white font-medium py-3 rounded-full transition shadow-md",
                    style.button
                  )}
                >
                  Select Plan
                </button>
              </Card>
            );
          })}
        </div>
      ))}

      <p className="text-sm text-center text-gray-500 mt-6">
        ❓ Can't Find The Right Plan? Contact Us For A Customized Plan Or
        Listing!
      </p>
    </div>
  );
}
