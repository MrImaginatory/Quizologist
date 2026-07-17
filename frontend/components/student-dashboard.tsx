"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStudentDashboard } from "@/hooks/use-student-dashboard";
import { usePendingTests } from "@/hooks/use-pending-tests";
import { capitalize } from "@/lib/utils";
import { Loader2, Target, BookOpen, CheckCircle, Play, Clock, TrendingUp } from "lucide-react";
import { ViewToggle } from "@/components/dashboard/view-toggle";
import { PerformanceTrendChart } from "@/components/charts/performance-trend-chart";
import { SubjectRadarChart } from "@/components/charts/subject-radar-chart";
import { TopicBarChart } from "@/components/charts/topic-bar-chart";

const statusColors: Record<string, string> = {
  strong: "bg-green-500/10 text-green-500 border-green-500/20",
  moderate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  weak: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function StudentDashboard() {
  const router = useRouter();
  const {
    stats,
    topicPerformance,
    subjectPerformance,
    performanceTrends,
    overallAccuracy,
    totalTopicsAttempted,
    isLoading,
    error,
  } = useStudentDashboard();

  const { tests: pendingTests, isLoading: pendingLoading } = usePendingTests();

  const [trendsView, setTrendsView] = useState<"table" | "chart">("table");
  const [subjectView, setSubjectView] = useState<"table" | "chart">("table");
  const [topicView, setTopicView] = useState<"table" | "chart">("table");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">{error}</div>
    );
  }

  const kpiCards = [
    {
      title: "Tests Completed",
      value: stats?.testsSubmitted?.toString() || "0",
      icon: CheckCircle,
      color: "text-blue-500",
    },
    {
      title: "Questions Available",
      value: stats?.questionsInEnrolledCourses?.toString() || "0",
      icon: BookOpen,
      color: "text-purple-500",
    },
    {
      title: "Overall Accuracy",
      value: `${overallAccuracy}%`,
      icon: Target,
      color: overallAccuracy >= 70 ? "text-green-500" : overallAccuracy >= 50 ? "text-yellow-500" : "text-red-500",
    },
    {
      title: "Topics Attempted",
      value: totalTopicsAttempted.toString(),
      icon: GraduationCap,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Tests */}
      {!pendingLoading && pendingTests.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Pending Tests
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/tests/pending")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {pendingTests.slice(0, 3).map((test) => (
                <div
                  key={test.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => router.push("/dashboard/tests/pending")}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-sm line-clamp-1">{test.title}</p>
                    <Badge
                      variant="outline"
                      className={
                        test.status === "upcoming"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-green-500/10 text-green-500"
                      }
                    >
                      {test.status === "upcoming" ? "Upcoming" : "Available"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {test.duration_minutes} min
                    </span>
                    <span>{test.question_limit} questions</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Trends */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trends
          </CardTitle>
          <ViewToggle value={trendsView} onChange={setTrendsView} />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="15days">
            <TabsList>
              <TabsTrigger value="15days">15 Days</TabsTrigger>
              <TabsTrigger value="30days">30 Days</TabsTrigger>
              <TabsTrigger value="60days">60 Days</TabsTrigger>
            </TabsList>
            <TabsContent value="15days">
              {trendsView === "table" ? (
                <PerformanceTable data={performanceTrends.last15Days} />
              ) : (
                <PerformanceTrendChart data={performanceTrends.last15Days} />
              )}
            </TabsContent>
            <TabsContent value="30days">
              {trendsView === "table" ? (
                <PerformanceTable data={performanceTrends.last30Days} />
              ) : (
                <PerformanceTrendChart data={performanceTrends.last30Days} />
              )}
            </TabsContent>
            <TabsContent value="60days">
              {trendsView === "table" ? (
                <PerformanceTable data={performanceTrends.last60Days} />
              ) : (
                <PerformanceTrendChart data={performanceTrends.last60Days} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Subject Performance & Topic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Subject Performance</CardTitle>
            <ViewToggle value={subjectView} onChange={setSubjectView} />
          </CardHeader>
          <CardContent>
            {subjectPerformance.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No data available</p>
            ) : subjectView === "table" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectPerformance.map((subject) => (
                    <TableRow key={subject.subjectId}>
                      <TableCell>{capitalize(subject.subjectName)}</TableCell>
                      <TableCell>{subject.accuracy}%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[subject.status]}>
                          {capitalize(subject.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <SubjectRadarChart data={subjectPerformance} />
            )}
          </CardContent>
        </Card>

        {/* Topic Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Topic Performance</CardTitle>
            <ViewToggle value={topicView} onChange={setTopicView} />
          </CardHeader>
          <CardContent>
            {topicPerformance.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No data available</p>
            ) : topicView === "table" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topicPerformance.slice(0, 5).map((topic) => (
                    <TableRow key={topic.topicId}>
                      <TableCell>{capitalize(topic.topicName)}</TableCell>
                      <TableCell className="text-muted-foreground">{capitalize(topic.subjectName)}</TableCell>
                      <TableCell>{topic.accuracy}%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[topic.status]}>
                          {capitalize(topic.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <TopicBarChart data={topicPerformance} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GraduationCap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function PerformanceTable({ data }: { data: { score: number; date: string; correct: number; totalQuestions: number }[] }) {
  if (data.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">No test data available for this period</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Correct</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((test, index) => (
          <TableRow key={index}>
            <TableCell>{new Date(test.date).toLocaleDateString()}</TableCell>
            <TableCell>
              <Badge variant="outline" className={test.score >= 70 ? "bg-green-500/10 text-green-500" : test.score >= 50 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"}>
                {test.score.toFixed(1)}%
              </Badge>
            </TableCell>
            <TableCell>{test.correct}</TableCell>
            <TableCell>{test.totalQuestions}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
