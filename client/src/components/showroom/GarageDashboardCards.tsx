import { Card } from "@/components/ui/card";
import { ClipboardList, CalendarCheck, Clock, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function GarageDashboardCards() {
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch booking stats
  const { data: bookingsData = [], isLoading: bookingLoading } = useQuery({
    queryKey: ["/api/service-bookings", { user_id: user?.id }],
    enabled: !!user?.id,
    queryFn: async () => {
      const query = new URLSearchParams({ user_id: String(user?.id) });
      const res = await fetch(`/api/service-bookings?${query}`);
      const data = await res.json();
      return data;
    },
  });

   const { data: userShowroom } = useQuery({
    queryKey: ["user-showroom", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`/api/garages/user/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch user showroom");
      const showrooms = await res.json();
  
      // ✅ Return only the first showroom or null
      return showrooms?.[0] ?? null;
    },
    enabled: !!user?.id,
  });

  const todayBookings = bookingsData.filter(
    (b: any) => b.status !== "pending" && b.scheduledAt?.startsWith(today)
  );
  const upcomingBookings = bookingsData.filter(
    (b: any) => b.status !== "pending" && b.scheduledAt > today
  );
  const pendingBookings = bookingsData.filter((b: any) => b.status === "pending");

  // Fetch interaction stats
  const { data: interactionStats, isLoading: interactionLoading } = useQuery({
    queryKey: ["interaction-stats", userShowroom?.id.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/showroom/${userShowroom.id}/service-interactions`);
      return res.json();
    },
  });

  const totalVisits = interactionStats?.visits?.last30Days || 0;

  const cards = [
    {
      title: "Today's Bookings",
      value: todayBookings.length,
      icon: ClipboardList,
    },
    {
      title: "Upcoming Bookings",
      value: upcomingBookings.length,
      icon: CalendarCheck,
    },
    {
      title: "Pending Bookings",
      value: pendingBookings.length,
      icon: Clock,
    },
    {
      title: "Total Visits",
      value: totalVisits,
      icon: Users,
    },
  ];

  const isLoading = bookingLoading || interactionLoading;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="gradient-motoroe rounded-lg p-6 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {isLoading ? "..." : card.value}
                </div>
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
