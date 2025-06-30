import { Check } from "lucide-react";

interface PlanProps {
  pakg: {
    id: number;
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
  selected?: boolean;
  onClick?: () => void;
}

export default function PlanCard({ 
  pakg,
 selected, 
 onClick
 }: PlanProps) {

  const ribbonClass =
  pakg.plan.toLowerCase() === "featured"
    ? "ribbon-featured" // your new blue ribbon class
    : pakg.plan.toLowerCase() === "platinum"
    ? "ribbon-platinum"
    : pakg.plan.toLowerCase() === "basic"
    ? "ribbon-basic"
    : "ribbon-basic";


  const exposureClass =
    pakg?.exposureType === "blue"
      ? "bg-[#0057b8]"
      : pakg?.exposureType === "orange"
      ? "bg-[#ff5722]"
      : "";

  console.log("ribbonClass", ribbonClass);
  console.log("exposureClass", exposureClass);
  return (
    <div 
    onClick={onClick}
    className={`bg-[#f8f8f8] rounded-2xl shadow-md overflow-hidden relative max-w-xs cursor-pointer ${
        selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
      }`}
    >
      {/* Ribbon */}
      <div className={`ribbon ribbon-top-left ${ribbonClass}`}>
        <span>{pakg.plan}</span>
      </div>

      {/* Medal and Price */}
      <div className="px-6 pt-14 pb-4 text-center border-b border-gray-200">
        <div className={`medal-icon ${pakg.medalType} mb-5`}> </div>
        <h3 className="text-3xl font-bold text-[#ff5722] mt-4">
          {pakg.price === 0 ? "FREE" : `${pakg.currency} ${pakg.price}`}
        </h3>
      </div>

      {/* Features List */}
      <div className="px-6 py-5 bg-white h-[250px] overflow-y-auto">
        <ul className="space-y-3">
          {pakg.features.map((feature, index) => (
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
  {pakg.showExposure ? (
    <div className={`${exposureClass} py-3 text-center font-bold`}>
      <span className="text-white text-sm">{pakg.exposureText}</span>
    </div>
  ) : (
    <div className="py-3 bg-text-center font-bold invisible">
      <span className="text-sm">placeholder</span>
    </div>
  )}
</div>


      {/* CTA Button */}
      <div className="px-6 py-5 bg-white">
        <button 
        
        className="w-full bg-[#0057b8] hover:bg-[#004494] text-white font-semibold py-3 px-4 rounded-full text-base">
          Select Plan
        </button>
      </div>
    </div>
  );
}
