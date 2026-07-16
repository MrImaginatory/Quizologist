"use client";

import { useState } from "react";
import { useTeacherEnrollments } from "@/hooks/use-teacher-enrollments";
import { TeacherCourseAssignment } from "@/hooks/use-teacher-enrollments";
import { teachersApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Loader2, BookOpen, Search } from "lucide-react";
import { TeacherEnrollDialog } from "@/components/dialogs/teacher-enroll-dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { capitalize } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function TeacherEnrollmentsPage() {
  const { token } = useAuth();
  const { assignments, isLoading, error, refetch } = useTeacherEnrollments();
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TeacherCourseAssignment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredAssignments = (assignments || []).filter((assignment) => {
    const query = searchQuery.toLowerCase();
    const courseMatch = assignment.name?.toLowerCase().includes(query);
    const subjectMatch = assignment.subjects?.some((s) =>
      s.name?.toLowerCase().includes(query)
    );
    return courseMatch || subjectMatch;
  });

  const handleDeleteClick = (assignment: TeacherCourseAssignment) => {
    setDeleteTarget(assignment);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.assignmentIds.length) return;

    setIsDeleting(true);
    try {
      for (const assignmentId of deleteTarget.assignmentIds) {
        await teachersApi.unenroll(assignmentId, token || undefined);
      }
      toast.success(`Unenrolled from ${deleteTarget.name} successfully`);
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to unenroll");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Teaching Enrollments</h1>
          <p className="text-muted-foreground">
            Manage your course and subject enrollments for teaching
          </p>
        </div>
        <Button onClick={() => setShowEnrollDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Enroll
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Enrolled Courses ({filteredAssignments.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No enrollments match your search"
                  : "No enrollments yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Click \"Enroll\" to start teaching courses and subjects"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment, index) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-purple-500/10 text-purple-500 border-purple-500/20"
                      >
                        {capitalize(assignment.name || "")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {assignment.subjects && assignment.subjects.length > 0 ? (
                          assignment.subjects.map((subject) => (
                            <Badge
                              key={subject.id}
                              variant="outline"
                              className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                            >
                              {capitalize(subject.name)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">
                            All Subjects
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(assignment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TeacherEnrollDialog
        open={showEnrollDialog}
        onOpenChange={setShowEnrollDialog}
        onSuccess={refetch}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Unenroll from Course"
        description={`Are you sure you want to unenroll from ${deleteTarget?.name || "this course"}? You will no longer be able to teach this course and its subjects.`}
        confirmText="Unenroll"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
