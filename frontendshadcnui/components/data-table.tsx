"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  columns,
  data,
  isLoading,
  error,
  keyExtractor,
  pagination,
  onPageChange,
  onLimitChange,
}: DataTableProps<T>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-4">
            {pagination && (
              <p className="text-sm text-muted-foreground">
                {pagination.total} total records
              </p>
            )}
            {pagination && onLimitChange && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Show</p>
                <Select
                  value={pagination.limit.toString()}
                  onValueChange={(value) => {
                    if (value) {
                      onLimitChange(parseInt(value));
                      onPageChange?.(1);
                    }
                  }}
                >
                  <SelectTrigger className="w-20 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col.key}>{col.header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, rowIndex) => {
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
                  })}
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
