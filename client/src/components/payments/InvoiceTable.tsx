// components/payments/InvoiceTable.tsx
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data/Datatable";
import { Transaction } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InvoiceTable() {
  const { t } = useTranslation();
  const auth = useAuth();

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "createdAt",
      header: t('invoice.date'),
      cell: ({ row }) => format(new Date(row.original.createdAt), 'PP'),
    },
    {
      accessorKey: "description",
      header: t('invoice.description'),
    },
    {
      accessorKey: "amount",
      header: t('invoice.amount'),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.amount} {row.original.currency}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: t('invoice.status'),
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === 'completed'
              ? 'success'
              : row.original.status === 'failed'
              ? 'destructive'
              : 'warning'
          }
        >
          {t(`payment.status.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Implement download functionality
            window.open(`/api/invoices/${row.original.id}/download`, '_blank');
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <DataTable<Transaction>
      columns={columns}
      queryKey={['invoices', auth.user?.id]}
      queryFn={() => fetch(`/api/transactions/user/${auth.user?.id}`).then(res => res.json())}
      emptyMessage={t('invoice.noInvoices')}
    />
  );
}