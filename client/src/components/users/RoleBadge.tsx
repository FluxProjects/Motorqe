// components/users/RoleBadge.tsx
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface RoleBadgeProps {
  roleId: number;
}

export function RoleBadge({ roleId }: RoleBadgeProps) {
  const { t } = useTranslation();
  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => fetch('/api/roles').then(res => res.json()),
    staleTime: Infinity
  });

  const role = roles?.find((r: any) => r.id === roleId);
  if (!role) return null;

  return (
    <Badge variant="outline" className="capitalize">
      {t(`roles.${role.name.toLowerCase()}`)}
    </Badge>
  );
}