"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronDown, ChevronUp, Users } from "lucide-react";
import { capitalize } from "@/lib/utils";
import type { SubjectsAttentionResponse } from "@/lib/api";

interface SubjectsAttentionTableProps {
  data: SubjectsAttentionResponse["data"] | null;
  isLoading: boolean;
}

export function SubjectsAttentionTable({ data, isLoading }: SubjectsAttentionTableProps) {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Subjects Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.subjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Subjects Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const toggleExpand = (subjectId: string) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Subjects Requiring Attention
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Avg Score</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Below Passing</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.subjects.map((subject) => (
              <>
                <TableRow key={subject.subjectId}>
                  <TableCell className="font-medium">{capitalize(subject.subjectName)}</TableCell>
                  <TableCell>{subject.courseName}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      subject.avgScore >= 70 ? "text-green-500" :
                      subject.avgScore >= 50 ? "text-yellow-500" : "text-red-500"
                    }`}>
                      {subject.avgScore.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>{subject.studentCount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      subject.belowPassingCount > 0
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : "bg-green-500/10 text-green-500 border-green-500/20"
                    }>
                      {subject.belowPassingCount}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {subject.lowPerformers.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(subject.subjectId)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        {expandedSubject === subject.subjectId ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {expandedSubject === subject.subjectId && (
                  <TableRow key={`${subject.subjectId}-expanded`}>
                    <TableCell colSpan={6} className="bg-muted/50">
                      <div className="py-2">
                        <p className="text-sm font-medium mb-2">Low-Performing Students:</p>
                        <div className="grid gap-1">
                          {subject.lowPerformers.map((student) => (
                            <div key={student.studentId} className="flex items-center justify-between text-sm">
                              <span>{capitalize(student.fname)} {capitalize(student.lname)}</span>
                              <span className={`font-medium ${
                                student.avgScore >= 50 ? "text-yellow-500" : "text-red-500"
                              }`}>
                                {student.avgScore.toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
