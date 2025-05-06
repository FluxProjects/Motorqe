// components/ui/status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

type StatusType = 
  | 'draft' | 'pending' | 'active' | 'sold' | 'expired' | 'rejected' // Listing status
  | 'confirmed' | 'complete' // Service Booking
  | 'completed' | 'failed' | 'refunded' // Transaction status
  | 'reviewed' | 'resolved' // Reports
  | 'sent' | 'read' | 'unread' // Messages
  | 'inactive' | 'suspended' | 'removed'; // Account status



export function StatusBadge(status: string) {
  const { t } = useTranslation();
  
  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'bg-gray-500', text: t('status.draft') },
    pending: { color: 'bg-yellow-500', text: t('status.pending') },
    active: { color: 'bg-green-500', text: t('status.active') },
    sold: { color: 'bg-purple-500', text: t('status.sold') },
    expired: { color: 'bg-gray-400', text: t('status.expired') },
    rejected: { color: 'bg-red-400', text: t('status.rejected') },
    confirmed: { color: 'bg-blue-500', text: t('status.confirmed') },
    complete: { color: 'bg-green-600', text: t('status.complete') },
    completed: { color: 'bg-green-600', text: t('status.completed') },
    failed: { color: 'bg-red-600', text: t('status.failed') },
    refunded: { color: 'bg-blue-500', text: t('status.refunded') },
    reviewed: { color: 'bg-indigo-500', text: t('status.reviewed') },
    resolved: { color: 'bg-teal-500', text: t('status.resolved') },
    sent: { color: 'bg-blue-400', text: t('status.sent') },
    read: { color: 'bg-green-400', text: t('status.read') },
    unread: { color: 'bg-gray-400', text: t('status.unread') },
    inactive: { color: 'bg-gray-500', text: t('status.inactive') },
    suspended: { color: 'bg-orange-500', text: t('status.suspended') },
    removed: { color: 'bg-red-500', text: t('status.removed') },
  };

  const badge = statusMap[status?.toLowerCase()] ?? { 
    color: 'bg-gray-500', 
    text: status 
  };

  return (
    <Badge className={`${badge.color} text-white`}>
      {badge.text}
    </Badge>
  );
}