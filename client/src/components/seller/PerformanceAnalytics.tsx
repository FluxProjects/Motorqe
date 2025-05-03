// components/seller/PerformanceAnalytics.tsx
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export function PerformanceAnalytics() {
  const { t } = useTranslation();
  const auth = useAuth();

  const { data: performanceData } = useQuery({
    queryKey: ['listing-performance', auth.user?.id],
    queryFn: () => 
      fetch(`/api/analytics/listing-performance?sellerId=${auth.user?.id}`)
        .then(res => res.json())
  });

  return (
    <Card>
      <h3 className="p-4 font-semibold">{t('seller.listingPerformance')}</h3>
      <div className="h-80 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={performanceData}>
            <XAxis dataKey="title" />
            <YAxis />
            <Bar dataKey="views" fill="#8884d8" />
            <Bar dataKey="contacts" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}