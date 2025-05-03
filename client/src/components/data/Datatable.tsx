// components/data/DataTable.tsx
import {
    ColumnDef,
    ColumnResizeMode,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    ColumnOrderState,
    VisibilityState,
    RowSelectionState,
    ColumnFiltersState
  } from "@tanstack/react-table";
  import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Download,
    ListFilter,
    Settings2
  } from "lucide-react";
  import { useState } from "react";
  import { useTranslation } from "react-i18next";
  import { exportToCSV, exportToExcel } from "@/lib/export-utils";
  import { Checkbox } from "@/components/ui/checkbox";
  
  interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    isLoading?: boolean;
    onSortingChange?: (sorting: SortingState) => void;
    onColumnVisibilityChange?: (visibility: VisibilityState) => void;
    onRowSelectionChange?: (selection: RowSelectionState) => void;
    onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
    pageCount?: number;
    onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
    enableServerSidePagination?: boolean;
    enableMultiSort?: boolean;
    enableColumnResizing?: boolean;
    enableRowSelection?: boolean;
    enableColumnVisibilityToggle?: boolean;
    enableExport?: boolean;
    enableFilters?: boolean;
  }
  
  export function DataTable<TData>({
    columns,
    data,
    isLoading = false,
    onSortingChange,
    onColumnVisibilityChange,
    onRowSelectionChange,
    onColumnFiltersChange,
    pageCount = -1,
    onPaginationChange,
    enableServerSidePagination = false,
    enableMultiSort = true,
    enableColumnResizing = false,
    enableRowSelection = false,
    enableColumnVisibilityToggle = true,
    enableExport = true,
    enableFilters = true,
  }: DataTableProps<TData>) {
    const { t } = useTranslation();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
      columns.map(column => column.id as string)
    );
    const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
    const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 10,
    });
  
    const table = useReactTable({
      data,
      columns,
      state: {
        sorting,
        columnVisibility,
        rowSelection,
        columnFilters,
        columnOrder,
        pagination: enableServerSidePagination ? undefined : pagination,
      },
      pageCount,
      onSortingChange: (updater) => {
        const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
        setSorting(newSorting);
        onSortingChange?.(newSorting);
      },
      onColumnVisibilityChange: (updater) => {
        const newVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
        setColumnVisibility(newVisibility);
        onColumnVisibilityChange?.(newVisibility);
      },
      onRowSelectionChange: (updater) => {
        const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
        setRowSelection(newSelection);
        onRowSelectionChange?.(newSelection);
      },
      onColumnFiltersChange: (updater) => {
        const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
        setColumnFilters(newFilters);
        onColumnFiltersChange?.(newFilters);
      },
      onPaginationChange: (updater) => {
        const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
        setPagination(newPagination);
        onPaginationChange?.(newPagination);
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: enableServerSidePagination ? undefined : getPaginationRowModel(),
      manualPagination: enableServerSidePagination,
      manualSorting: !!onSortingChange,
      manualFiltering: !!onColumnFiltersChange,
      enableMultiSort,
      enableColumnResizing,
      columnResizeMode,
      onColumnOrderChange: setColumnOrder,
      debugTable: true,
      debugHeaders: true,
      debugColumns: true,
    });
  
    // Add selection column if enabled
    if (enableRowSelection) {
      columns.unshift({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 40,
      });
    }
  
    const handleExportCSV = () => {
      const selectedRows = table.getSelectedRowModel().rows.length > 0
        ? table.getSelectedRowModel().rows.map(row => row.original)
        : table.getRowModel().rows.map(row => row.original);
      
      exportToCSV(selectedRows, 'table-export');
    };
  
    const handleExportExcel = () => {
      const selectedRows =
        table.getSelectedRowModel().rows.length > 0
          ? table.getSelectedRowModel().rows.map(row => row.original)
          : table.getRowModel().rows.map(row => row.original);
    
      exportToExcel(selectedRows, 'table-export'); // <-- fixed
    };
    
      
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {enableFilters && (
            <div className="flex items-center space-x-2">
              <Input
                placeholder={t('common.search')}
                value={(table.getColumn('globalFilter')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('globalFilter')?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
              <Button variant="outline" size="sm">
                <ListFilter className="mr-2 h-4 w-4" />
                {t('common.filters')}
              </Button>
            </div>
          )}
  
          <div className="flex items-center space-x-2">
            {enableExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto">
                    <Download className="mr-2 h-4 w-4" />
                    {t('common.export')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    onClick={handleExportCSV}
                  >
                    {t('common.exportCSV')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    onClick={handleExportExcel}
                  >
                    {t('common.exportExcel')}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
  
            {enableColumnVisibilityToggle && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto">
                    <Settings2 className="mr-2 h-4 w-4" />
                    {t('common.columns')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
  
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          width: header.getSize(),
                        }}
                        className="relative"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {header.column.getCanSort() && (
                          <button
                            className="ml-2"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? '↕'}
                          </button>
                        )}
                        {enableColumnResizing && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`absolute right-0 top-0 h-full w-1 bg-primary/50 cursor-col-resize select-none touch-none ${
                              header.column.getIsResizing() ? 'bg-primary opacity-100' : ''
                            }`}
                          />
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {t('common.noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
  
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {enableRowSelection && (
              <>
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">{t('common.rowsPerPage')}</p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="h-8 w-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }