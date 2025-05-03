// components/users/UserManagementTable.tsx
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data/DataTable";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { RoleBadge } from "./RoleBadge";
import { UserActions } from "./UserActions";

export function UserManagementTable() {
  const { t } = useTranslation();
  const auth = useAuth();

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: t('user.username'),
    },
    {
      accessorKey: "email",
      header: t('user.email'),
    },
    {
      accessorKey: "roleId",
      header: t('user.role'),
      cell: ({ row }) => <RoleBadge roleId={row.original.roleId} />,
    },
    {
      id: "actions",
      cell: ({ row }) => <UserActions user={row.original} />,
    },
  ];

  return (
    <DataTable<User>
      columns={columns}
      queryKey={['users']}
      queryFn={() => fetch('/api/get-users').then(res => res.json())}
      emptyMessage={t('user.noUsersFound')}
    />
  );
}