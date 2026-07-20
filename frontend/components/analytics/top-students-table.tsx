"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { capitalize } from "@/lib/utils";
import type { TopStudentsByLocationResponse } from "@/lib/api";

interface TopStudentsTableProps {
  data: TopStudentsByLocationResponse["data"] | null;
  isLoading: boolean;
}

export function TopStudentsTable({ data, isLoading }: TopStudentsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Performing Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Performing Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No student data available</p>
        </CardContent>
      </Card>
    );
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400/10 text-gray-400 border-gray-400/20">2nd</Badge>;
    if (rank === 3) return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">3rd</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Performing Students
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Tests</TableHead>
              <TableHead>Avg Score</TableHead>
              <TableHead>Accuracy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{getRankBadge(student.rank)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{capitalize(student.fname)} {capitalize(student.lname)}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                </TableCell>
                <TableCell>{student.city}</TableCell>
                <TableCell>{student.total_tests}</TableCell>
                <TableCell>
                  <span className={`font-medium ${
                    student.avg_score >= 70 ? "text-green-500" :
                    student.avg_score >= 50 ? "text-yellow-500" : "text-red-500"
                  }`}>
                    {student.avg_score.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  {student.total_questions > 0
                    ? `${Math.round((student.total_correct / student.total_questions) * 100)}%`
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
