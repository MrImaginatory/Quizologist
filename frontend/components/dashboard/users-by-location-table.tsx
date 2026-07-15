"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { capitalize } from "@/lib/utils";

interface LocationData {
  id: string;
  city: string;
  state: string;
  user_count: number;
}

interface UsersByLocationTableProps {
  data: LocationData[];
}

export function UsersByLocationTable({ data }: UsersByLocationTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No location data available
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.user_count - a.user_count);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>City</TableHead>
          <TableHead>State</TableHead>
          <TableHead className="text-right">Users</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((location, index) => (
          <TableRow key={location.id}>
            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
            <TableCell className="font-medium">{capitalize(location.city)}</TableCell>
            <TableCell>{capitalize(location.state)}</TableCell>
            <TableCell className="text-right font-medium">{location.user_count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
