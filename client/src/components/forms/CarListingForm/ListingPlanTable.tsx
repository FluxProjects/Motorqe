import PlanCard from "@/components/layout/PlanCard";
import { InfoIcon } from "lucide-react";
import { PromotionPackage } from "@shared/schema";

interface PlanCardsProps {
  packageslist: PromotionPackage[];
  selectedPackageId?: number;
  onSelect: (pkg: PromotionPackage) => void;
  currentPackagePriority?: number; // Add this prop
}

export default function ListingPlanCards({
  packageslist,
  selectedPackageId,
  onSelect,
  currentPackagePriority, // Add this prop
}: PlanCardsProps) {

  // Filter packages based on priority if currentPackagePriority is provided
  const filteredPackages = currentPackagePriority 
    ? packageslist.filter(pkg => pkg.priority > currentPackagePriority)
    : packageslist;

  // Map the filtered packages to your card format
  const packages = filteredPackages.map(pkg => {
    // Determine medal type based on priority or name
    let medalType = "";
    if (pkg.priority >= 3 || pkg.name.toLowerCase().includes("platinum")) {
      medalType = "platinum-medal";
    } else if (pkg.priority >= 2 || pkg.name.toLowerCase().includes("gold")) {
      medalType = "gold-medal";
    } else {
      medalType = "silver-medal";
    }

    // Create features array based on package properties
    const features = [];
    if (pkg.photo_limit) features.push(`Upload up to ${pkg.photo_limit} Photos`);
    if (pkg.feature_duration) features.push(`Featured Ad for ${pkg.feature_duration} days`);
    if (pkg.duration_days) features.push(`Listing active for ${pkg.duration_days} Days`);
    if (pkg.no_of_refresh) features.push(`${pkg.no_of_refresh} Booster${pkg.no_of_refresh > 1 ? "s" : ""} daily`);

    return {
      id: pkg.id,
      plan: pkg.plan,
      medal: pkg.name || pkg.name_ar,
      medalType,
      price: pkg.price.toString(),
      currency: pkg.currency,
      features,
      showExposure: pkg.priority >= 2, // Only show exposure for higher priority packages
      exposureText: pkg.priority >= 3 ? "x 50 Higher Exposure" : "x 10 High Exposure",
      exposureType: pkg.priority >= 3 ? "orange" : "blue"
    };
  });

  return (
    <main className="container mx-auto px-4 py-12 bg-white justify-center ite">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        {currentPackagePriority ? "Upgrade Your Plan" : "Choose a Plan"}
      </h1>
      
      {packages.length > 0 ? (
        <>
          <div
            className={`
              grid gap-8
              grid-cols-1
              ${packages.length === 1 ? 'md:grid-cols-1 place-items-center' : ''}
              ${packages.length === 2 ? 'md:grid-cols-2' : ''}
              ${packages.length === 4 ? 'md:grid-cols-2 lg:grid-cols-3' : ''}
              ${packages.length >= 3 && packages.length !== 4 ? 'md:grid-cols-3' : ''}
            `}
          >
            {packages.map((pkg, index) => (
              <PlanCard 
                key={pkg.id}
                pakg={pkg}
                selected={selectedPackageId === pkg.id}
                onClick={() => onSelect(packageslist.find(pl => pl.id === pkg.id)!)}
              />
            ))}
          </div>


          
          <div className="text-center mt-10">
            <p className="flex items-center justify-center text-gray-600 text-sm">
              <InfoIcon className="h-4 w-4 mr-2" />
              Can't Find The Right Plan Up? Contact Us For A Customized Plan Or Listing !
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">
            No higher-tier plans available for upgrade.
          </p>
        </div>
      )}
    </main>
  );
}