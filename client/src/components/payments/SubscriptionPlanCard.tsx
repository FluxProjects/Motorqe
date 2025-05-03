// components/payments/SubscriptionPlanCard.tsx
import { SubscriptionPlan } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  currentPlanId?: number;
  onSelect: (planId: number) => void;
}

export function SubscriptionPlanCard({
  plan,
  currentPlanId,
  onSelect
}: SubscriptionPlanCardProps) {
  const { t } = useTranslation();
  const auth = useAuth();

  const isCurrentPlan = currentPlanId === plan.id;

  return (
    <div className={`border rounded-lg p-6 ${isCurrentPlan ? 'border-primary' : ''}`}>
      <h3 className="text-xl font-bold">{plan.name}</h3>
      <div className="my-4">
        <span className="text-3xl font-bold">{plan.price} {plan.currency}</span>
        <span className="text-muted-foreground">/{t('common.month')}</span>
      </div>
      
      <ul className="space-y-2 mb-6">
        <li className="flex items-center">
          <CheckCircle2 className="mr-2 text-green-500" size={16} />
          {plan.listingLimit || t('common.unlimited')} {t('listing.listings')}
        </li>
        {/* Add other features */}
      </ul>

      <Button
        className="w-full"
        variant={isCurrentPlan ? 'outline' : 'default'}
        onClick={() => onSelect(plan.id)}
      >
        {isCurrentPlan ? t('subscription.currentPlan') : t('subscription.selectPlan')}
      </Button>
    </div>
  );
}