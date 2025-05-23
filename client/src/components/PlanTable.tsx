import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

const tierStyles = {
  0: {
    ribbon: "bg-gray-400",
    label: "Basic",
    badge: "bg-gray-300 text-gray-700",
    exposure: null,
  },
  1: {
    ribbon: "bg-blue-600",
    label: "Featured",
    badge: "bg-yellow-400 text-yellow-900",
    exposure: "x 10 High Exposure",
  },
  2: {
    ribbon: "bg-red-500",
    label: "Premium",
    badge: "bg-slate-300 text-slate-800",
    exposure: "x 50 Higher Exposure",
  },
};

export default function PlanCards() {
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["promotion-packages"],
    queryFn: () => fetch("/api/promotion-packages").then((res) => res.json()),
  });

  const visiblePackages = packages.filter((pkg) => pkg.isVisible);
  const rows = [];
  for (let i = 0; i < visiblePackages.length; i += 3) {
    rows.push(visiblePackages.slice(i, i + 3));
  }

  return (
    <div className="space-y-12">
      <h2 className="text-3xl font-bold text-center">Choose a Plan</h2>
      {rows.map((row, i) => (
        <div
          key={i}
          className={clsx(
            "flex flex-wrap justify-center gap-6",
            row.length === 1 && "justify-center",
            row.length === 2 && "justify-center"
          )}
        >
          {row.map((pkg, index) => {
            const style = tierStyles[pkg.tier] || tierStyles[0];
            return (
              <div
                key={pkg.id}
                className="relative bg-white rounded-xl shadow-lg p-6 w-[300px] flex flex-col items-center"
              >
                {/* Ribbon */}
                <div
                  className={clsx(
                    "absolute top-0 left-0 px-2 py-1 text-white text-xs rounded-br-xl",
                    style.ribbon
                  )}
                >
                  {style.label}
                </div>

                {/* Badge */}
                <div
                  className={clsx(
                    "w-24 h-24 rounded-full flex items-center justify-center text-xl font-bold mb-4",
                    style.badge
                  )}
                >
                  {pkg.name.toUpperCase().split(" ")[0]}
                </div>

                {/* Price */}
                <div className="text-lg font-semibold text-orange-600 mb-4">
                  {pkg.price === 0 ? "FREE" : `${pkg.price} ${pkg.currency}`}
                </div>

                {/* Description */}
                <ul className="text-sm space-y-2 text-gray-700 mb-4">
                  <li>📷 Upload up to {pkg.tier === 2 ? 20 : pkg.tier === 1 ? 10 : 3} Photos</li>
                  {pkg.tier > 0 && <li>⭐ Featured Ad for {pkg.duration} days</li>}
                  {pkg.tier === 2 && <li>🌀 360 Angle of Interior</li>}
                  <li>📆 Listing Active for {pkg.duration} Days</li>
                  {pkg.tier === 2 ? (
                    <li>⚡ 2 Boosters daily to refresh your ad</li>
                  ) : pkg.tier === 1 ? (
                    <li>⚡ 1 Booster daily to refresh your ad</li>
                  ) : (
                    <li>🚫 No High Exposure</li>
                  )}
                </ul>

                {/* Exposure label */}
                {style.exposure && (
                  <div className="bg-blue-600 text-white font-semibold px-4 py-1 rounded-full mb-4">
                    {style.exposure}
                  </div>
                )}

                <button className="mt-auto bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition">
                  Select Plan
                </button>
              </div>
            );
          })}
        </div>
      ))}

      <p className="text-sm text-center text-gray-500 mt-4">
        ❓ Can’t Find The Right Plan? Contact Us For A Customized Plan Or Listing!
      </p>
    </div>
  );
}
