// components/dashboard/StatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  isLoading?: boolean;
}

export function StatsCard({ title, value, change, isLoading }: StatsCardProps) {
  const { t } = useTranslation();
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change !== undefined && (
              <div className={`flex items-center text-xs mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(change)}% {t('common.fromLastPeriod')}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}