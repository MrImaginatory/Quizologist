"use client";

import { useState, useCallback } from "react";
import { DataTable } from "@/components/data-table";
import { useSubjects } from "@/hooks/use-subjects";
import { subjectsApi, Subject } from "@/lib/api";
import { capitalize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { AddSubjectDialog } from "@/components/dialogs/add-subject-dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useDeleteWithUndo } from "@/hooks/use-delete-with-undo";
import { useAuth } from "@/contexts/auth-context";

export default function SubjectsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { subjects, total, totalPages, isLoading, error, refetch } = useSubjects({ page, limit });
  const { token } = useAuth();

  const handleDelete = useCallback(async (id: string) => {
    await subjectsApi.delete(id, token || undefined);
  }, [token]);

  const { deleteWithUndo } = useDeleteWithUndo({
    type: "subject",
    onDelete: handleDelete,
  });

  const handleDeleteClick = (subject: Subject) => {
    setDeleteTarget(subject);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteWithUndo(deleteTarget.id, capitalize(deleteTarget.name));
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: "sno", header: "#", render: (_s: Subject, index: number) => index + 1 },
    { key: "name", header: "Name", render: (s: Subject) => capitalize(s.name) },
    { key: "description", header: "Description", render: (s: Subject) => s.description || "-" },
    { key: "course", header: "Course", render: (s: Subject) => (
      <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
        {capitalize(s.course?.name || "")}
      </Badge>
    )},
    {
      key: "actions",
      header: "Actions",
      render: (s: Subject) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => handleDeleteClick(s)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-muted-foreground">Manage all subjects across courses</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>
      <DataTable
        title="Subjects"
        columns={columns}
        data={subjects}
        isLoading={isLoading}
        error={error}
        keyExtractor={(s) => s.id}
        pagination={{ page, totalPages, total, limit }}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
      <AddSubjectDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={refetch} />
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Subject"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action can be undone within 5 seconds.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
