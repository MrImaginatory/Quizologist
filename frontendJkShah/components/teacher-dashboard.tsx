"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatisticsCard } from "@/components/statistics-card";
import { dashboardApi, teachersApi, DashboardStatsResponse } from "@/lib/api";
import { Loader2, Trophy, AlertTriangle, BookOpen } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { ViewToggle } from "@/components/dashboard/view-toggle";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const TeacherCharts = dynamic(
  () => import("./teacher-dashboard-charts"),
  {
    ssr: false,
    loading: () => <div className="h-[250px] animate-pulse bg-muted rounded-lg" />,
  }
);

interface TopStudent {
  id: string;
  fname: string;
  lname: string;
  email: string;
  totalTests: number;
  avgScore: number;
  avgCorrect: number;
  avgIncorrect: number;
}

interface WeakTopic {
  topicId: string;
  topicName: string;
  subjectName: string;
  courseName: string;
  weakStudentCount: number;
  totalStudents: number;
  avgAccuracy: number;
}

interface CoverageTopic {
  topicId: string;
  topicName: string;
  subjectName: string;
  courseName: string;
  count: number;
}

export function TeacherDashboard() {
  const { token, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStatsResponse["data"] | null>(null);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [coverageTopics, setCoverageTopics] = useState<CoverageTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [topStudentsView, setTopStudentsView] = useState<"table" | "chart">("table");
  const [weakTopicsView, setWeakTopicsView] = useState<"table" | "chart">("table");
  const [coverageView, setCoverageView] = useState<"table" | "chart">("table");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, topStudentsRes, weakRes, coverageRes] = await Promise.all([
          dashboardApi.getStats(token || undefined),
          teachersApi.getTopStudents({ limit: 10 }, token || undefined),
          teachersApi.getWeaknessSummary({}, token || undefined),
          teachersApi.getQuestionCoverage({ limit: 10 }, token || undefined),
        ]);
        setStats(statsRes.data);
        setTopStudents(topStudentsRes.data?.students || []);
        setWeakTopics(weakRes.data?.weakTopics || []);
        setCoverageTopics(coverageRes.data?.topics || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch dashboard data";
        if (message.toLowerCase().includes("invalid") && message.toLowerCase().includes("token")) {
          logout();
          return;
        }
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, logout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const teacherStats = [
    {
      title: "Questions Added",
      value: stats?.questionsAdded?.toString() || "0",
      icon: "solar:question-circle-line-duotone",
      badgeColor: "bg-teal-400/10",
      change: "Created",
      changeIcon: "solar:add-circle-line-duotone",
      period: "By You",
    },
    {
      title: "Students in Courses",
      value: stats?.studentsInCourses?.toString() || "0",
      icon: "solar:users-group-two-rounded-line-duotone",
      badgeColor: "bg-blue-400/10",
      change: "Enrolled",
      changeIcon: "solar:check-circle-line-duotone",
      period: "Your Courses",
    },
    {
      title: "Tests Submitted",
      value: stats?.testsSubmitted?.toString() || "0",
      icon: "solar:clipboard-check-line-duotone",
      badgeColor: "bg-purple-400/10",
      change: "Completed",
      changeIcon: "solar:chart-square-line-duotone",
      period: "By Students",
    },
    {
      title: "Questions in Courses",
      value: stats?.questionsInCourses?.toString() || "0",
      icon: "solar:book-open-line-duotone",
      badgeColor: "bg-orange-400/10",
      change: "Available",
      changeIcon: "solar:library-line-duotone",
      period: "Your Courses",
    },
  ];

  const topStudentsChartData = topStudents.slice(0, 5).map((s) => ({
    name: `${capitalize(s.fname)} ${capitalize(s.lname)}`,
    avgScore: s.avgScore,
  }));

  const weakTopicsChartData = weakTopics.slice(0, 6).map((t) => ({
    name: capitalize(t.topicName),
    avgAccuracy: t.avgAccuracy,
  }));

  const coverageChartData = coverageTopics.slice(0, 10).map((t) => ({
    name: capitalize(t.topicName),
    count: t.count,
  }));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariant}>
        <StatisticsCard stats={teacherStats} />
      </motion.div>

      <motion.div variants={itemVariant} className="grid gap-6 md:grid-cols-2">
        {/* Top Students */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="border-b bg-muted/10 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Students
              </CardTitle>
              <ViewToggle value={topStudentsView} onChange={setTopStudentsView} />
            </div>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? (
              <p className="text-muted-foreground">No student data available.</p>
            ) : topStudentsView === "table" ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {topStudents.map((student, index) => (
                  <div key={student.id} className="group/student flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground group-hover/student:text-primary transition-colors w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">
                          {capitalize(student.fname)} {capitalize(student.lname)}
                        </p>
                        <p className="text-xs text-muted-foreground">{student.totalTests} tests</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {student.avgScore}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <TeacherCharts
                topStudentsChartData={topStudentsChartData}
                weakTopicsChartData={weakTopicsChartData}
                coverageChartData={coverageChartData}
                activeChart="topStudents"
              />
            )}
          </CardContent>
        </Card>

        {/* Weak Topics */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="border-b bg-muted/10 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Topics Needing Attention
              </CardTitle>
              <ViewToggle value={weakTopicsView} onChange={setWeakTopicsView} />
            </div>
          </CardHeader>
          <CardContent>
            {weakTopics.length === 0 ? (
              <p className="text-muted-foreground">No weak topics identified.</p>
            ) : weakTopicsView === "table" ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {weakTopics.slice(0, 5).map((topic) => (
                  <div key={topic.topicId} className="p-3 rounded-lg hover:bg-orange-500/5 border border-transparent hover:border-orange-500/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{capitalize(topic.topicName)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {capitalize(topic.subjectName)} • {capitalize(topic.courseName)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-orange-500">
                          {topic.weakStudentCount}/{topic.totalStudents}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {topic.avgAccuracy}% avg
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <TeacherCharts
                topStudentsChartData={topStudentsChartData}
                weakTopicsChartData={weakTopicsChartData}
                coverageChartData={coverageChartData}
                activeChart="weakTopics"
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Question Coverage */}
      <motion.div variants={itemVariant}>
      <Card className="hover:shadow-sm transition-shadow">
        <CardHeader className="border-b bg-muted/10 pb-4 mb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Question Coverage by Topic
            </CardTitle>
            <ViewToggle value={coverageView} onChange={setCoverageView} />
          </div>
        </CardHeader>
        <CardContent>
          {coverageTopics.length === 0 ? (
            <p className="text-muted-foreground">No question data available.</p>
          ) : coverageView === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Topic</th>
                    <th className="text-left p-2 font-medium">Subject</th>
                    <th className="text-left p-2 font-medium">Course</th>
                    <th className="text-right p-2 font-medium">Questions</th>
                  </tr>
                </thead>
                <tbody>
                  {coverageTopics.map((topic) => (
                    <tr key={topic.topicId} className="border-b last:border-0 hover:bg-primary/5 transition-colors">
                      <td className="p-3 font-medium">{capitalize(topic.topicName)}</td>
                      <td className="p-3 text-muted-foreground">{capitalize(topic.subjectName)}</td>
                      <td className="p-3 text-muted-foreground">{capitalize(topic.courseName)}</td>
                      <td className="p-3 text-right font-bold">{topic.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <TeacherCharts
              topStudentsChartData={topStudentsChartData}
              weakTopicsChartData={weakTopicsChartData}
              coverageChartData={coverageChartData}
              activeChart="coverage"
            />
          )}
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}
