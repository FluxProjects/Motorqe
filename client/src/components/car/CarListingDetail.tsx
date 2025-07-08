import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CarPart, CarTyre } from "@shared/schema";
import { QRCodeSVG } from "qrcode.react"; 

interface CarListingDetailProps {
  vehicleDescription: string;
  vehicleDescriptionAr: string;
  inspectionReportUrl?: string; // Pass the PDF file URL here if available
  is_showroom?: boolean;
  is_garage?: boolean;
   carPartsData?: CarPart;
  carTyresData?: CarTyre;
}

export function CarListingDetail({
  vehicleDescription,
  vehicleDescriptionAr,
  inspectionReportUrl,
  is_showroom,
  is_garage,
  carPartsData,
  carTyresData,
}: CarListingDetailProps) {
  const [activeTab, setActiveTab] = useState("car-details");

  console.log("inspectionReportUrl", inspectionReportUrl);

  if (is_showroom || is_garage) {
    return (
      <div className="mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h2 className="text-xl font-semibold mb-3">
            {is_showroom ? "Showroom Description:" : "Garage Description:"}
          </h2>
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
            {inspectionReportUrl ? (
              <div className="flex flex-col items-center space-y-4">
                <iframe
                  src={inspectionReportUrl}
                  title="Inspection Report"
                  className="w-full h-[500px] rounded border"
                />
                <a
                  href={inspectionReportUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-orange-500 text-white hover:bg-orange-600">
                    Download Inspection Report
                  </Button>
                </a>
              </div>
            ) : (
              <p className="text-gray-500">Inspection report is not available for this vehicle.</p>
            )}
          </div>
        )}

        {activeTab === "spare-parts" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Spare Parts:</h2>
            {carPartsData ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-600">
                {Object.entries(carPartsData).map(([key, value]) => {
                  if (
                    value !== undefined &&
                    value > 0 &&
                    key !== "id" &&
                    key !== "listing_id"
                  ) {
                    const displayKey = key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase());

                    return (
                      <li
                        key={key}
                        className="border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm"
                      >
                        <div className="text-sm font-medium">{displayKey}</div>
                        <div className="text-lg font-semibold text-gray-800">QR {value}</div>
                      
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            ) : (
              <p className="text-gray-500">No spare parts data available for this vehicle.</p>
            )}
          </div>
        )}

        {activeTab === "tyres" && (
          <div>
            
           {carTyresData ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
              {carTyresData.front_tyre_size && carTyresData.front_tyre_price !== undefined && (
                <li className="border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="text-sm font-medium">Front Tyre Size</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {carTyresData.front_tyre_size}
                  </div>
                  <div className="text-sm font-medium mt-2">Price</div>
                  <div className="text-lg font-semibold text-gray-800">
                   QR {carTyresData.front_tyre_price}
                  </div>
                </li>
              )}

              {carTyresData.rear_tyre_size && carTyresData.rear_tyre_price !== undefined && (
                <li className="border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="text-sm font-medium">Rear Tyre Size</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {carTyresData.rear_tyre_size}
                  </div>
                  <div className="text-sm font-medium mt-2">Price</div>
                  <div className="text-lg font-semibold text-gray-800">
                   QR {carTyresData.rear_tyre_price}
                  </div>
                </li>
              )}
            </ul>
            ) : (
              <p className="text-gray-500">No tyre data available for this vehicle.</p>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
