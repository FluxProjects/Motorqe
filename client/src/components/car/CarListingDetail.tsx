import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TabNavigationProps {
  vehicleDescription: string;
  vehicleDescriptionAr: string;
  is_showroom?: boolean;
}

export function CarListingDetail({
  vehicleDescription,
  vehicleDescriptionAr,
  is_showroom,
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState("car-details");

  if (is_showroom) {
    return (
      <div className="mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h2 className="text-xl font-semibold mb-3">Showroom Description:</h2>
          <div className="text-gray-700 leading-relaxed space-y-4">
            <p>{vehicleDescription}</p>
            <p dir="rtl" className="text-right">{vehicleDescriptionAr}</p>
            <button className="text-primary-blue hover:underline font-medium">
              See more
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "car-details", label: "Car Details" },
    { id: "inspection-report", label: "Inspection Report" },
    { id: "spare-parts", label: "Spare Parts" },
    { id: "tyres", label: "Tyres" },
  ];

  return (
    <div className="mb-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? "default" : "outline"}
            className={`px-6 py-2 rounded-full transition-colors ${
              activeTab === tab.id
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        {activeTab === "car-details" && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Description:</h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>{vehicleDescription}</p>
              <p dir="rtl" className="text-right">{vehicleDescriptionAr}</p>
              <button className="text-primary-blue hover:underline font-medium">
                See more
              </button>
            </div>
          </div>
        )}

        {activeTab === "inspection-report" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Inspection Report:</h2>
            <div className="text-gray-700">
              <p className="mb-4">
                Comprehensive vehicle inspection report will be displayed here with detailed analysis of:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Engine condition and performance</li>
                <li>Transmission and drivetrain</li>
                <li>Braking system</li>
                <li>Suspension and steering</li>
                <li>Electrical systems</li>
                <li>Body and paint condition</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "spare-parts" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Spare Parts:</h2>
            <div className="text-gray-700">
              <p className="mb-4">Available spare parts and accessories for this vehicle:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Original BMW parts</li>
                <li>Engine components</li>
                <li>Body panels</li>
                <li>Interior accessories</li>
                <li>Performance upgrades</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "tyres" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Tyres:</h2>
            <div className="text-gray-700">
              <p className="mb-4">Tyre information and recommendations:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Front: 245/35R20</li>
                <li>Rear: 275/30R20</li>
                <li>Brand: Michelin Pilot Sport 4S</li>
                <li>Condition: Excellent (90% tread remaining)</li>
                <li>Recommended replacement interval: 40,000 km</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
