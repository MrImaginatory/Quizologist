"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "@/lib/utils";

interface RepeatedQuestion {
  questionId: string;
  question: string;
  subjectName: string;
  topicName: string;
  totalAttempts: number;
  incorrectAttempts: number;
}

interface RepeatedQuestionsTableProps {
  data: RepeatedQuestion[];
}

export function RepeatedQuestionsTable({ data }: RepeatedQuestionsTableProps) {
  if (data.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No repeated questions found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="max-w-[250px] sm:max-w-[450px]">Question</TableHead>
            <TableHead>Subject / Topic</TableHead>
            <TableHead className="text-center">Times Asked</TableHead>
            <TableHead className="text-center">Incorrect Answers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.questionId}>
              <TableCell className="max-w-[250px] sm:max-w-[450px]">
                <div
                  className="line-clamp-2 text-sm break-words"
                  dangerouslySetInnerHTML={{ __html: item.question }}
                  title={item.question.replace(/<[^>]*>/g, '')}
                />
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm">
                    {capitalize(item.subjectName)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {capitalize(item.topicName)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center font-medium">
                {item.totalAttempts}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className={
                    item.incorrectAttempts > 0
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-green-500/10 text-green-500 border-green-500/20"
                  }
                >
                  {item.incorrectAttempts}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
