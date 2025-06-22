import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { Monitor, Smartphone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const dummyChartData = [
  { time: '1', desktop: 400, mobile: 200 },
  { time: '2', desktop: 420, mobile: 220 },
  { time: '3', desktop: 380, mobile: 180 },
  { time: '4', desktop: 450, mobile: 250 },
  { time: '5', desktop: 470, mobile: 270 },
  { time: '6', desktop: 440, mobile: 240 },
  { time: '7', desktop: 460, mobile: 260 },
  { time: '8', desktop: 480, mobile: 280 },
  { time: '9', desktop: 500, mobile: 300 },
  { time: '10', desktop: 490, mobile: 290 },
  { time: '11', desktop: 520, mobile: 320 },
  { time: '12', desktop: 510, mobile: 310 },
  { time: '13', desktop: 530, mobile: 330 },
  { time: '14', desktop: 540, mobile: 340 },
  { time: '15', desktop: 520, mobile: 320 },
  { time: '16', desktop: 550, mobile: 350 },
  { time: '17', desktop: 570, mobile: 370 },
  { time: '18', desktop: 560, mobile: 360 },
  { time: '19', desktop: 580, mobile: 380 },
  { time: '20', desktop: 590, mobile: 390 },
  { time: '21', desktop: 570, mobile: 370 },
  { time: '22', desktop: 600, mobile: 400 },
  { time: '23', desktop: 620, mobile: 420 },
  { time: '24', desktop: 610, mobile: 410 },
];

const buttonClicks = [
  { name: "Showrooms", color: "bg-blue-500" },
  { name: "Views (67 clicks)", color: "bg-green-500" },
  { name: "Whatsapp (127 clicks)", color: "bg-purple-500" },
  { name: "Call (135 clicks)", color: "bg-yellow-500" },
  { name: "Message (635 clicks)", color: "bg-orange-500" },
  { name: "Get Direction", color: "bg-red-500" },
  { name: "Share (635 clicks)", color: "bg-indigo-500" },
  { name: "Bookings (635 clicks)", color: "bg-gray-500" },
];

export default function GarageAnalytics() {
  const { data: fetchedChartData, isLoading } = useQuery({
    queryKey: ["garage-visit-chart"],
    queryFn: async () => {
      const res = await fetch("/api/showroom/visit-chart");
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : null;
    },
  });

  const chartData = fetchedChartData ?? dummyChartData;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Analytics Cards */}
      <div className="lg:col-span-1 space-y-6">
        {/* Views Card */}
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-motoroe-orange rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
              V
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Views</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">24</span>
              <span className="text-sm text-gray-600">4x</span>
              <span className="text-sm text-gray-600">4x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">764</span>
              <span className="text-sm font-medium">1467</span>
              <span className="text-sm font-medium">10,564</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Last 24 hours</span>
              <span>Last 7 days</span>
              <span>Last 30 days</span>
            </div>
          </div>
        </Card>

        {/* Button Clicks Card */}
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-motoroe-orange rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
              B
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Button Clicks</h3>
          </div>
          <div className="space-y-3">
            {buttonClicks.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 ${item.color} rounded-full mr-2`}></div>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Devices Card */}
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-motoroe-orange rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
              D
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Devices</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <Monitor className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">Desktop (24,876 Views)</span>
            </div>
            <div className="flex items-center">
              <Smartphone className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">Mobile (1444 Views)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Chart */}
      <div className="lg:col-span-2">
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-motoroe-orange rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                V
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Visits</h3>
            </div>
            <div className="flex space-x-4 text-sm">
              <Button variant="ghost" className="text-motoroe-orange font-medium p-0 h-auto">
                Last 24 hours
              </Button>
              <Button variant="ghost" className="text-gray-500 hover:text-motoroe-orange p-0 h-auto">
                Last 7 days
              </Button>
              <Button variant="ghost" className="text-gray-500 hover:text-motoroe-orange p-0 h-auto">
                Last 30 Days
              </Button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  domain={[0, 1000]}
                  ticks={[0, 200, 400, 600, 800, 1000]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="desktop" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mobile" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
