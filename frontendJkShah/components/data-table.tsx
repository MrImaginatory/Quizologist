"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CustomSelect } from "@/components/ui/custom-select";
import { Loader2 } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface PaginationInfo {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

interface DataTableProps<T> {
  title: string;
  description?: string;
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string;
  keyExtractor: (item: T) => string;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function DataTable<T>({
  title,
  description,
  columns,
  data,
  isLoading,
  error,
  keyExtractor,
  pagination,
  onPageChange,
  onLimitChange,
}: DataTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const useVirtual = !pagination && data.length > 50;

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    enabled: useVirtual,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <div className="text-sm text-muted-foreground mt-1">{description}</div>}
          </div>
          <div className="flex items-center gap-4">
            {pagination && (
              <p className="text-sm text-muted-foreground">
                {pagination.total} total records
              </p>
            )}
            {pagination && onLimitChange && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Show</p>
                <CustomSelect
                  value={pagination.limit.toString()}
                  onChange={(value) => {
                    if (value) {
                      onLimitChange(parseInt(value));
                      onPageChange?.(1);
                    }
                  }}
                  className="w-24 h-9"
                  options={[
                    { value: "5", label: "5" },
                    { value: "10", label: "10" },
                    { value: "20", label: "20" },
                    { value: "50", label: "50" },
                    { value: "100", label: "100" },
                  ]}
                />
                <p className="text-sm text-muted-foreground">per page</p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">{error}</div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No data found.</div>
        ) : (
          <>
            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4">
              {data.map((item, rowIndex) => {
                const rowNumber = pagination
                  ? (pagination.page - 1) * pagination.limit + rowIndex + 1
                  : rowIndex + 1;
                return (
                  <Card key={keyExtractor(item)} className="p-4 bg-card border shadow-sm">
                    <div className="space-y-3">
                      {columns.map((col) => (
                        <div key={col.key} className="flex items-start justify-between gap-4">
                          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                            {col.header}
                          </span>
                          <div className="text-sm text-right break-words overflow-hidden">
                            {col.render
                              ? col.render(item, rowNumber - 1)
                              : String((item as Record<string, unknown>)[col.key] ?? "")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Desktop View (Table) */}
            <div className={`hidden md:block ${useVirtual ? "overflow-auto max-h-[500px]" : "overflow-x-auto"}`} ref={parentRef}>
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col.key}>{col.header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {useVirtual ? (
                    <>
                      {virtualizer.getVirtualItems().length > 0 && (
                        <tr>
                          <td
                            colSpan={columns.length}
                            style={{ height: virtualizer.getVirtualItems()[0]?.start ?? 0 }}
                          />
                        </tr>
                      )}
                      {virtualizer.getVirtualItems().map((virtualRow) => {
                        const item = data[virtualRow.index];
                        const rowNumber = virtualRow.index + 1;
                        return (
                          <TableRow key={keyExtractor(item)} ref={virtualizer.measureElement}>
                            {columns.map((col) => (
                              <TableCell key={col.key}>
                                {col.render
                                  ? col.render(item, rowNumber - 1)
                                  : String((item as Record<string, unknown>)[col.key] ?? "")}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                      {virtualizer.getVirtualItems().length > 0 && (
                        <tr>
                          <td
                            colSpan={columns.length}
                            style={{
                              height:
                                virtualizer.getTotalSize() -
                                (virtualizer.getVirtualItems().at(-1)?.end ?? 0),
                            }}
                          />
                        </tr>
                      )}
                    </>
                  ) : (
                    data.map((item, rowIndex) => {
                      const rowNumber = pagination
                        ? (pagination.page - 1) * pagination.limit + rowIndex + 1
                        : rowIndex + 1;
                      return (
                        <TableRow key={keyExtractor(item)}>
                          {columns.map((col) => (
                            <TableCell key={col.key}>
                              {col.render
                                ? col.render(item, rowNumber - 1)
                                : String((item as Record<string, unknown>)[col.key] ?? "")}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => onPageChange?.(pagination.page - 1)}
                        className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        const diff = Math.abs(p - pagination.page);
                        return diff <= 2 || p === 1 || p === pagination.totalPages;
                      })
                      .map((p, idx, arr) => (
                        <PaginationItem key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <PaginationLink
                            isActive={p === pagination.page}
                            onClick={() => onPageChange?.(p)}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => onPageChange?.(pagination.page + 1)}
                        className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
