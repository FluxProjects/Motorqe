// components/dashboard/QuickActions.tsx
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Star, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { roleMapping } from "@shared/permissions";

export function QuickActions() {
  const { t } = useTranslation();
  const auth = useAuth();

const actions = {
  seller: [
    { icon: <Plus size={16} />, label: t('actions.newListing'), href: "/sell-car" },
    { icon: <MessageSquare size={16} />, label: t('actions.messages'), href: "/messages" },
  ],
  dealer: [
    { icon: <Plus size={16} />, label: t('actions.newListing'), href: "/sell-car" },
    { icon: <Star size={16} />, label: t('actions.favorites'), href: "/favorites" },
    { icon: <MessageSquare size={16} />, label: t('actions.messages'), href: "/messages" },
  ],
  garage: [
    { icon: <Plus size={16} />, label: t('actions.newListing'), href: "/sell-service" },
    { icon: <Star size={16} />, label: t('actions.favorites'), href: "/favorites" },
    { icon: <MessageSquare size={16} />, label: t('actions.messages'), href: "/messages" },
  ],
  admin: [
    { icon: <Settings size={16} />, label: t('actions.settings'), href: "/admin/settings" },
  ],
};


 const userActions = auth.user?.roleId
  ? actions[roleMapping[auth.user.roleId].toLowerCase() as keyof typeof actions]
  : [];

  return (
    <div className="flex flex-wrap gap-2">
      {userActions?.map((action, index) => (
        <Link key={index} href={action.href}>
          <Button variant="outline" className="flex items-center gap-2">
            {action.icon}
            {action.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}