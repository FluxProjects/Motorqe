import { Check } from "lucide-react";

interface PlanProps {
  pkg: {
    plan: string;
    medal: string;
    medalType: string;
    price: string;
    currency: string;
    features: string[];
    showExposure: boolean;
    exposureText: string;
    exposureType: string;
  };
}

export default function PlanCard({ pkg }: PlanProps) {

  const ribbonClass =
    pkg.plan === "gold"
      ? "ribbon-premium"
      : pkg.plan === "silver"
      ? "ribbon-featured"
      : pkg.plan === "basic"
      ? "ribbon-basic"
      : "ribbon-basic";

  const exposureClass =
    pkg.exposureType === "blue"
      ? "bg-[#0057b8]"
      : pkg.exposureType === "orange"
      ? "bg-[#ff5722]"
      : "";

  console.log("ribbonClass", ribbonClass);
  console.log("exposureClass", exposureClass);
  return (
    <div className="bg-[#f8f8f8] rounded-2xl shadow-md overflow-hidden relative max-w-xs">
      {/* Ribbon */}
      <div className={`ribbon ribbon-top-left ${ribbonClass}`}>
        <span>{pkg.plan}</span>
      </div>

      {/* Medal and Price */}
      <div className="px-6 pt-14 pb-4 text-center border-b border-gray-200">
        <div className={`medal-icon ${pkg.medalType} mb-5`}>{pkg.medal}</div>
        <h3 className="text-3xl font-bold text-[#ff5722] mt-4">
          {pkg.currency} {pkg.price}
        </h3>
      </div>

      {/* Features List */}
      <div className="px-6 py-5 bg-white h-[250px] overflow-y-auto">
        <ul className="space-y-3">
          {pkg.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#ff5722] text-white mr-3 flex-shrink-0">
                <Check className="h-3 w-3" />
              </span>
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Exposure Banner */}
      <div className="bg-white min-h-[48px]"> {/* Adjust height based on your design */}
  {pkg.showExposure ? (
    <div className={`${exposureClass} py-3 text-center font-bold`}>
      <span className="text-white text-sm">{pkg.exposureText}</span>
    </div>
  ) : (
    <div className="py-3 bg-text-center font-bold invisible">
      <span className="text-sm">placeholder</span>
    </div>
  )}
</div>


      {/* CTA Button */}
      <div className="px-6 py-5 bg-white">
        <button className="w-full bg-[#0057b8] hover:bg-[#004494] text-white font-semibold py-3 px-4 rounded-full text-base">
          Select Plan
        </button>
      </div>
    </div>
  );
}
