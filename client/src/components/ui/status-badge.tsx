// components/ui/status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

type StatusType = 
  | 'draft' | 'pending' | 'active' | 'sold' | 'expired' | 'rejected' // Listing status
  | 'pending' | 'completed' | 'failed' | 'refunded' // Transaction status
  | 'pending' | 'reviewed' | 'resolved'; // Report status

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const statusMap = {
    draft: { color: 'bg-gray-500', text: t('status.draft') },
    pending: { color: 'bg-yellow-500', text: t('status.pending') },
    active: { color: 'bg-green-500', text: t('status.active') },
    sold: { color: 'bg-purple-500', text: t('status.sold') },
    expired: { color: 'bg-gray-400', text: t('status.expired') },
    rejected: { color: 'bg-red-400', text: t('status.rejected') },
    completed: { color: 'bg-green-600', text: t('status.completed') },
    failed: { color: 'bg-red-600', text: t('status.failed') },
    refunded: { color: 'bg-blue-500', text: t('status.refunded') },
    reviewed: { color: 'bg-indigo-500', text: t('status.reviewed') },
    resolved: { color: 'bg-teal-500', text: t('status.resolved') },
  };
  

  return (
    <Badge className={`${statusMap[status].color} text-white`}>
      {statusMap[status].text}
    </Badge>
  );
}