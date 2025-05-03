// components/admin/SystemHealthMonitor.tsx
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Activity, Server, Database, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SystemHealthMonitor() {
  const { t } = useTranslation();
  
  const { data: stats } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => fetch('/api/admin/system-stats').then(res => res.json())
  });

  const metrics = [
    { 
      icon: <Server className="h-5 w-5" />,
      title: t('admin.serverLoad'),
      value: stats?.serverLoad || '0%'
    },
    // ... other metrics
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">{t('admin.systemHealth')}</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted">
                {metric.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="font-medium">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}