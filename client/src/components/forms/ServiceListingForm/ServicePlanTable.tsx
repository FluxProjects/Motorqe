import PlanCard from "@/components/layout/PlanCard";
import { InfoIcon } from "lucide-react";
import { ServicePromotionPackage } from "@shared/schema";

interface PlanCardsProps {
  packageslist: ServicePromotionPackage[];
  selectedPackageId?: number;
  onSelect: (pkg: ServicePromotionPackage) => void;
}

export default function ServicePlanCards({
  packageslist,
  selectedPackageId,
  onSelect,
}: PlanCardsProps) {

const packages = packageslist
  ? [
      {
        id: packageslist[0]?.id,
        plan: packageslist[0]?.plan || "Basic",
        medal: packageslist[0]?.name || packageslist[0]?.name_ar,
        medalType: "silver-medal",
        price: packageslist[0]?.price,
        currency: packageslist[0]?.currency,
        features: [
          "Upload up to 3 Photos",
          "Listing active for 25 Days",
          "No High Exposure"
        ],
        showExposure: false,
        exposureText: "",
        exposureType: ""
      },
      {
        id: packageslist[0]?.id,
        plan: packageslist[1]?.plan || "Featured",
        medal: packageslist[1]?.name || packageslist[1]?.name_ar,
        medalType: "gold-medal",
        price: packageslist[1]?.price,
        currency: packageslist[1]?.currency,
        features: [
          "Upload up to 10 Photos",
          "Featured Ad for 5 days",
          "Listing Active for 45 Days",
          "1 Booster daily to refresh your ad"
        ],
        showExposure: true,
        exposureText: "x 10 High Exposure",
        exposureType: "blue"
      },
      {
        id: packageslist[0]?.id,
        plan: packageslist[2]?.plan || "Premium",
        medal: packageslist[2]?.name || packageslist[2]?.name_ar,
        medalType: "platinum-medal",
        price: packageslist[2]?.price,
        currency: packageslist[2]?.currency,
        features: [
          "Upload up to 20 Photos",
          "Featured Ad for 10 days",
          "360 Angle of Interior",
          "Listing Active for 60 Days",
          "2 Boosters daily to refresh your ad (One of our members will contact you instantly to take pics & upload them)"
        ],
        showExposure: true,
        exposureText: "x 50 Higher Exposure",
        exposureType: "orange"
      }
    ]
  : [];

  

  return (
    <main className="container mx-auto px-4 py-12 bg-white">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Choose a Plan</h1>
      
      <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-8">
        {packages.map((pkg, index) => (
          <PlanCard 
            key={index} 
            pakg={pkg}
            selected={selectedPackageId === pkg.id} // optional
            onClick={() => onSelect(packageslist[index])}
          />
        ))}
      </div>
      
      <div className="text-center mt-10">
        <p className="flex items-center justify-center text-gray-600 text-sm">
          <InfoIcon className="h-4 w-4 mr-2" />
          Can't Find The Right Plan Up? Contact Us For A Customized Plan Or Listing !
        </p>
      </div>
    </main>
  );
}
