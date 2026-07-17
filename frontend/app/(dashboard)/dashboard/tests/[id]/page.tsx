"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { predefinedTestsApi, questionsApi, PredefinedTest, Question } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Play, Pause, Copy, Check, Plus, Trash2, Users } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";
import { QuestionSelectorDialog } from "@/components/dialogs/question-selector-dialog";
import { StudentSelectorDialog } from "@/components/dialogs/student-selector-dialog";

export default function PredefinedTestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const testId = params.id as string;

  const [test, setTest] = useState<PredefinedTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [questionTexts, setQuestionTexts] = useState<Map<string, string>>(new Map());
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await predefinedTestsApi.getById(testId, token || undefined);
        setTest(response.data);
        // Load existing fixed questions
        if ((response.data as any).fixedQuestions) {
          const questionIds = (response.data as any).fixedQuestions.map((fq: any) => fq.question_id);
          setSelectedQuestions(questionIds);
          // Fetch question texts
          if (questionIds.length > 0) {
            const questionsRes = await questionsApi.filter({ page: 1, limit: 1000 }, token || undefined);
            const qMap = new Map<string, string>();
            (questionsRes.data?.questions || []).forEach((q: any) => qMap.set(q.id, q.question));
            setQuestionTexts(qMap);
          }
        }
        // Load existing assigned students
        if ((response.data as any).assignedStudents) {
          setSelectedStudents((response.data as any).assignedStudents.map((s: any) => s.student_id));
        }
      } catch (err) {
        toast.error("Failed to fetch test details");
        router.push("/dashboard/tests/manage");
      } finally {
        setIsLoading(false);
      }
    };

    if (testId) fetchTest();
  }, [testId, token, router]);

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await predefinedTestsApi.activate(testId, token || undefined);
      setTest((prev) => prev ? { ...prev, status: "active" } : null);
      toast.success("Test activated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to activate");
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await predefinedTestsApi.deactivate(testId, token || undefined);
      setTest((prev) => prev ? { ...prev, status: "inactive" } : null);
      toast.success("Test deactivated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate");
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleCopyLink = () => {
    if (test?.test_link_token) {
      const slug = test.title.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      const startTime = test.start_time ? new Date(test.start_time).toISOString().slice(0, 16).replace("T", "_") : "noschedule";
      const endTime = test.end_time ? new Date(test.end_time).toISOString().slice(0, 16).replace("T", "_") : "noschedule";
      const link = `${window.location.origin}/test/join/${slug}_${startTime}_${endTime}_${test.test_link_token}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Test link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveQuestions = async (questionIds: string[]) => {
    setIsLoadingQuestions(true);
    try {
      await predefinedTestsApi.update(testId, { fixed_question_ids: questionIds }, token || undefined);
      setSelectedQuestions(questionIds);
      toast.success("Questions saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save questions");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSaveStudents = async (studentIds: string[]) => {
    setIsLoadingStudents(true);
    try {
      await predefinedTestsApi.update(testId, { student_ids: studentIds }, token || undefined);
      setSelectedStudents(studentIds);
      toast.success("Students saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save students");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!test) return null;

  const statusColors: Record<string, string> = {
    draft: "bg-yellow-500/10 text-yellow-500",
    active: "bg-green-500/10 text-green-500",
    inactive: "bg-gray-500/10 text-gray-500",
    archived: "bg-red-500/10 text-red-500",
  };

  const canActivate = (test.status === "draft" || test.status === "inactive") &&
    (!test.use_fixed_questions || selectedQuestions.length > 0);

  return (
    <div className=" mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/tests/manage")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{test.title}</h1>
          {test.description && (
            <p className="text-muted-foreground">{test.description}</p>
          )}
        </div>
        <Badge className={statusColors[test.status]}>
          {capitalize(test.status)}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{test.duration_minutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Questions</span>
              <span className="font-medium">{test.question_limit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difficulty</span>
              <span className="font-medium">{capitalize(test.difficulty)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Attempts</span>
              <span className="font-medium">{test.max_attempts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fixed Questions</span>
              <span className="font-medium">{test.use_fixed_questions ? "Yes" : "No"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scheduled</span>
              <span className="font-medium">{test.is_scheduled ? "Yes" : "No"}</span>
            </div>
            {test.is_scheduled && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Time</span>
                  <span className="font-medium">
                    {test.start_time ? new Date(test.start_time).toLocaleString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Time</span>
                  <span className="font-medium">
                    {test.end_time ? new Date(test.end_time).toLocaleString() : "N/A"}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timezone</span>
              <span className="font-medium">{test.timezone}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Questions Section */}
      {test.use_fixed_questions && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Fixed Questions</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedQuestions.length}/{test.question_limit} questions selected
              </p>
            </div>
            <Button
              onClick={() => setShowQuestionSelector(true)}
              disabled={isLoadingQuestions}
            >
              {isLoadingQuestions ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {selectedQuestions.length > 0 ? "Edit Questions" : "Add Questions"}
            </Button>
          </CardHeader>
          <CardContent>
            {selectedQuestions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No questions selected. Click "Add Questions" to select questions.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedQuestions.slice(0, 5).map((qId, index) => (
                  <div key={qId} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm truncate max-w-[500px]">
                      {questionTexts.get(qId) || `Question ${qId.slice(0, 8)}...`}
                    </span>
                  </div>
                ))}
                {selectedQuestions.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    And {selectedQuestions.length - 5} more questions...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Assignment Section */}
      {test.use_specific_students && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Assignment
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedStudents.length > 0
                  ? `${selectedStudents.length} students assigned`
                  : "All enrolled students (auto-eligible)"}
              </p>
            </div>
            <Button
              onClick={() => setShowStudentSelector(true)}
              disabled={isLoadingStudents}
            >
              {isLoadingStudents ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {selectedStudents.length > 0 ? "Edit Students" : "Assign Students"}
            </Button>
          </CardHeader>
          <CardContent>
            {selectedStudents.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No specific students assigned. All enrolled students can take this test.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedStudents.slice(0, 5).map((sId, index) => (
                  <div key={sId} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm">Student {sId.slice(0, 8)}...</span>
                  </div>
                ))}
                {selectedStudents.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    And {selectedStudents.length - 5} more students...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                {test.test_link_token
                  ? `${typeof window !== "undefined" ? window.location.origin : ""}/test/join/${test.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${test.start_time ? new Date(test.start_time).toISOString().slice(0, 16).replace("T", "_") : "noschedule"}_${test.end_time ? new Date(test.end_time).toISOString().slice(0, 16).replace("T", "_") : "noschedule"}_${test.test_link_token}`
                  : "No link generated"}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                disabled={!test.test_link_token}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link with students to allow them to join the test
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        {(test.status === "draft" || test.status === "inactive") && (
          <Button onClick={handleActivate} disabled={isActivating || !canActivate}>
            {isActivating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Activate
          </Button>
        )}
        {test.status === "active" && (
          <Button variant="destructive" onClick={handleDeactivate} disabled={isDeactivating}>
            {isDeactivating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Pause className="mr-2 h-4 w-4" />
            )}
            Deactivate
          </Button>
        )}
      </div>

      {/* Activation warning */}
      {test.use_fixed_questions && selectedQuestions.length === 0 && (test.status === "draft" || test.status === "inactive") && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-600">
            You must add questions before activating this test.
          </p>
        </div>
      )}

      {/* Question Selector Dialog */}
      <QuestionSelectorDialog
        open={showQuestionSelector}
        onOpenChange={setShowQuestionSelector}
        onSelect={handleSaveQuestions}
        selectedIds={selectedQuestions}
        questionLimit={test.question_limit}
        courseIds={test.course_ids || []}
        subjectIds={test.subject_ids || undefined}
        difficultyRatio={test.difficulty_ratio}
      />

      {/* Student Selector Dialog */}
      <StudentSelectorDialog
        open={showStudentSelector}
        onOpenChange={setShowStudentSelector}
        onSelect={handleSaveStudents}
        selectedIds={selectedStudents}
      />
    </div>
  );
}
