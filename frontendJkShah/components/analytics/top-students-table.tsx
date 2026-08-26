"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TopStudentsByLocationResponse } from "@/lib/api";

interface TopStudentsTableProps {
  data: TopStudentsByLocationResponse["data"] | null;
  isLoading: boolean;
  performanceMode: "top" | "low";
  onPerformanceModeChange: (mode: "top" | "low") => void;
}

export function TopStudentsTable({ data, isLoading, performanceMode, onPerformanceModeChange }: TopStudentsTableProps) {
  const isTop = performanceMode === "top";
  const title = isTop ? "Top Performing Students" : "Weak Performing Students";

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <Trophy className={`h-5 w-5 ${!isTop && "text-muted-foreground opacity-50"}`} />
            {title}
          </CardTitle>
          <Tabs value={performanceMode} onValueChange={onPerformanceModeChange as any}>
            <TabsList className="grid w-[120px] grid-cols-2">
              <TabsTrigger value="top">Top</TabsTrigger>
              <TabsTrigger value="low">Low</TabsTrigger>
            </TabsList>
          </Tabs>
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
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <Trophy className={`h-5 w-5 ${!isTop && "text-muted-foreground opacity-50"}`} />
            {title}
          </CardTitle>
          <Tabs value={performanceMode} onValueChange={onPerformanceModeChange as any}>
            <TabsList className="grid w-[120px] grid-cols-2">
              <TabsTrigger value="top">Top</TabsTrigger>
              <TabsTrigger value="low">Low</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No student data available</p>
        </CardContent>
      </Card>
    );
  }

  const getRankBadge = (rank: number) => {
    if (!isTop) return <Badge variant="outline">#{rank}</Badge>;
    if (rank === 1) return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400/10 text-gray-400 border-gray-400/20">2nd</Badge>;
    if (rank === 3) return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">3rd</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Trophy className={`h-5 w-5 ${!isTop && "text-muted-foreground opacity-50"}`} />
          {title}
        </CardTitle>
        <Tabs value={performanceMode} onValueChange={onPerformanceModeChange as any}>
          <TabsList className="grid w-[120px] grid-cols-2">
            <TabsTrigger value="top">Top</TabsTrigger>
            <TabsTrigger value="low">Low</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {/* Mobile View (Cards) */}
        <div className="md:hidden space-y-4">
          {data.students.map((student) => (
            <Card key={student.id} className="p-4 bg-card border shadow-sm">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Rank</span>
                  <div className="text-sm text-right">{getRankBadge(student.rank)}</div>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Student</span>
                  <div className="text-sm text-right">
                    <p className="font-medium">{capitalize(student.fname)} {capitalize(student.lname)}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Location</span>
                  <div className="text-sm text-right break-words overflow-hidden">{student.city}</div>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Tests</span>
                  <div className="text-sm text-right">{student.total_tests}</div>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Avg Score</span>
                  <div className="text-sm text-right">
                    <span className={`font-medium ${
                      student.avg_score >= 70 ? "text-green-500" :
                      student.avg_score >= 50 ? "text-yellow-500" : "text-red-500"
                    }`}>
                      {student.avg_score.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Accuracy</span>
                  <div className="text-sm text-right">
                    {student.total_questions > 0
                      ? `${Math.round((student.total_correct / student.total_questions) * 100)}%`
                      : "-"}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
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
                <TableRow key={student.id} className="hover:bg-muted/50 transition-colors">
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
        </div>
      </CardContent>
    </Card>
  );
}
