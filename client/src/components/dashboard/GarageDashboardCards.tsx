import { Card } from "@/components/ui/card";
import { ClipboardList, CalendarCheck, Clock, Users } from "lucide-react";

export default function GarageDashboardCards() {
  const cards = [
    {
      title: "Today's Bookings",
      value: "101",
      icon: ClipboardList,
    },
    {
      title: "Upcoming Bookings",
      value: "0",
      icon: CalendarCheck,
    },
    {
      title: "Pending Bookings",
      value: "72",
      icon: Clock,
    },
    {
      title: "Total Visits",
      value: "101",
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="gradient-motoroe rounded-lg p-6 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{card.value}</div>
                <div className="text-sm opacity-90">{card.title}</div>
              </div>
              <div className="text-2xl opacity-80">
                <Icon className="h-8 w-8" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
