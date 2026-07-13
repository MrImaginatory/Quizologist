"use client";

import { useState, useCallback } from "react";
import { DataTable } from "@/components/data-table";
import { useFaculties } from "@/hooks/use-faculties";
import { facultiesApi, Faculty } from "@/lib/api";
import { capitalize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { AddFacultyDialog } from "@/components/dialogs/add-faculty-dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useDeleteWithUndo } from "@/hooks/use-delete-with-undo";
import { useAuth } from "@/contexts/auth-context";

export default function FacultiesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Faculty | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { faculties, total, totalPages, isLoading, error } = useFaculties({ page, limit });
  const { token } = useAuth();

  const handleDelete = useCallback(async (id: string) => {
    await facultiesApi.delete(id, token || undefined);
  }, [token]);

  const { deleteWithUndo } = useDeleteWithUndo({
    type: "faculty",
    onDelete: handleDelete,
  });

  const handleDeleteClick = (faculty: Faculty) => {
    setDeleteTarget(faculty);
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
    { key: "sno", header: "#", render: (_f: Faculty, index: number) => index + 1 },
    { key: "name", header: "Name", render: (f: Faculty) => capitalize(f.name) },
    { key: "description", header: "Description", render: (f: Faculty) => f.description || "-" },
    {
      key: "actions",
      header: "Actions",
      render: (f: Faculty) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => handleDeleteClick(f)}
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
          <h1 className="text-3xl font-bold">Faculties</h1>
          <p className="text-muted-foreground">Manage all faculties in the system</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Faculty
        </Button>
      </div>
      <DataTable
        title="Faculties"
        columns={columns}
        data={faculties}
        isLoading={isLoading}
        error={error}
        keyExtractor={(f) => f.id}
        pagination={{ page, totalPages, total, limit }}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
      <AddFacultyDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Faculty"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action can be undone within 5 seconds.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
