"use client";

import { useState } from "react";
import { useEnrollments } from "@/hooks/use-enrollments";
import { enrollmentsApi, Enrollment } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { capitalize } from "@/lib/utils";
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
import { Plus, Trash2, Loader2, BookOpen } from "lucide-react";
import { EnrollDialog } from "@/components/dialogs/enroll-dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { toast } from "sonner";

export default function EnrollmentsPage() {
  const { token } = useAuth();
  const { enrollments, isLoading, error, refetch } = useEnrollments();
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Enrollment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (enrollment: Enrollment) => {
    setDeleteTarget(enrollment);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await enrollmentsApi.unenroll(deleteTarget.id, token || undefined);
      toast.success("Unenrolled successfully");
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
          <h1 className="text-3xl font-bold">My Enrollments</h1>
          <p className="text-muted-foreground">Manage your course enrollments</p>
        </div>
        <Button onClick={() => setShowEnrollDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Enroll
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Enrollments ({enrollments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No enrollments yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click &quot;Enroll&quot; to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment, index) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        {capitalize(enrollment.course?.name || "")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {enrollment.subject ? (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          {capitalize(enrollment.subject.name)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {enrollment.topic ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          {capitalize(enrollment.topic.name)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(enrollment)}
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

      <EnrollDialog
        open={showEnrollDialog}
        onOpenChange={setShowEnrollDialog}
        onSuccess={refetch}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Unenroll"
        description={`Are you sure you want to unenroll from ${deleteTarget?.course?.name || "this course"}?`}
        confirmText="Unenroll"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}