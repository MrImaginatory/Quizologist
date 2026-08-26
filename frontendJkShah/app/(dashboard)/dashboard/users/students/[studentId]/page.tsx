"use client";

import { useStudentDetails } from "@/hooks/use-student-details";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowLeft, Mail, Phone, BookOpen, GraduationCap, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { capitalize, getAvatarColor, getInitials } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import Link from "next/link";

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  
  const { studentData, isLoading, error } = useStudentDetails(studentId);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading student details...</div>;
  }

  if (error || !studentData) {
    return (
      <div className="p-8 text-center text-red-500">
        {error?.message || "Failed to load student details. You might not have permission."}
      </div>
    );
  }

  const { student, enrollments, teachers, testHistory, performance } = studentData;

  const testHistoryColumns = [
    { key: "test_name", header: "Test Name", render: (t: any) => capitalize(t.test_name || "Unknown") },
    { key: "completed_at", header: "Date", render: (t: any) => new Date(t.completed_at).toLocaleDateString() },
    { key: "status", header: "Status", render: (t: any) => <Badge variant={t.status === 'completed' ? 'default' : 'secondary'}>{capitalize(t.status)}</Badge> },
    { key: "score", header: "Score", render: (t: any) => `${t.score}%` },
    { key: "correct", header: "Correct", render: (t: any) => <span className="text-green-600 font-medium">{t.correct}</span> },
    { key: "incorrect", header: "Incorrect", render: (t: any) => <span className="text-red-600 font-medium">{t.incorrect}</span> },
    { key: "total_questions", header: "Total", render: (t: any) => t.total_questions },
    {
      key: "actions",
      header: "Actions",
      render: (t: any) => (
        <Link href={`/test-result?id=${t.id}&studentId=${studentId}`}>
          <Button variant="outline" size="sm" className="h-8">
            <Eye className="h-4 w-4 mr-2" />
            View Results
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Student Details</h1>
          <p className="text-muted-foreground">View detailed information and performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="col-span-1 md:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className={`text-white text-3xl font-medium ${getAvatarColor(student.fname + student.lname)}`}>
                {getInitials(student.fname, student.lname)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{capitalize(`${student.fname} ${student.lname}`)}</h2>
              <Badge variant="outline" className="mt-1">Student</Badge>
            </div>
            <div className="w-full space-y-3 text-sm text-left mt-4 border-t pt-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{student.email}</span>
              </div>
              {student.mobile_number && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{student.mobile_number}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {student.city && student.state 
                    ? `${capitalize(student.city)}, ${capitalize(student.state)}` 
                    : "Location not set"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tests</CardDescription>
              <CardTitle className="text-4xl">{performance.totalTests || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Topics Attempted</CardDescription>
              <CardTitle className="text-4xl">{performance.totalTopicsAttempted || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Overall Accuracy</CardDescription>
              <CardTitle className="text-4xl text-primary">{performance.overallAccuracy || 0}%</CardTitle>
            </CardHeader>
          </Card>

          {/* Enrollments & Teachers */}
          <Card className="col-span-1 sm:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Enrollments & Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <p className="text-muted-foreground text-sm">Not enrolled in any courses yet.</p>
              ) : (
                <div className="space-y-6">
                  {enrollments.map((course: any) => {
                    const assignedTeachers = teachers.filter((t: any) => t.course_name === course.name);
                    return (
                      <div key={course.id} className="border rounded-lg p-4 bg-muted/20">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-primary">{capitalize(course.name)}</h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {course.subjects.map((sub: any) => (
                                <Badge key={sub.id} variant="secondary" className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {capitalize(sub.name)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground font-medium block mb-1">Assigned Teachers:</span>
                            {assignedTeachers.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {assignedTeachers.map((t: any) => (
                                  <span key={t.id} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                                    {capitalize(t.name)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">None assigned</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Strong Topics</CardTitle>
            <CardDescription>Topics where accuracy is &gt;= 80%</CardDescription>
          </CardHeader>
          <CardContent>
            {performance.strong?.length > 0 ? (
              <ul className="space-y-4">
                {performance.strong.map((t: any) => (
                  <li key={t.topicId} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{capitalize(t.topicName)}</p>
                      <p className="text-xs text-muted-foreground">{capitalize(t.subjectName)}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {t.accuracy}% Acc
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No strong topics identified yet.</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Weak Topics</CardTitle>
            <CardDescription>Topics where accuracy is &lt; 50%</CardDescription>
          </CardHeader>
          <CardContent>
            {performance.weak?.length > 0 ? (
              <ul className="space-y-4">
                {performance.weak.map((t: any) => (
                  <li key={t.topicId} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{capitalize(t.topicName)}</p>
                      <p className="text-xs text-muted-foreground">{capitalize(t.subjectName)}</p>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {t.accuracy}% Acc
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No weak topics identified.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test History Table */}
      <DataTable
        title="Test History"
        description="Recent tests completed by the student"
        columns={testHistoryColumns}
        data={testHistory || []}
        keyExtractor={(t) => t.id}
      />

    </div>
  );
}
