"use client";

import { useState, useCallback } from "react";
import { DataTable } from "@/components/data-table";
import { useCourses } from "@/hooks/use-courses";
import { coursesApi, Course } from "@/lib/api";
import { capitalize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { AddCourseDialog } from "@/components/dialogs/add-course-dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useDeleteWithUndo } from "@/hooks/use-delete-with-undo";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Search } from "lucide-react";

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  
  const { courses, total, totalPages, isLoading, error, refetch } = useCourses({ 
    page, 
    limit, 
    search: debouncedSearch 
  });
  const { isAuthenticated } = useAuth();

  const handleDelete = useCallback(async (id: string) => {
    await coursesApi.delete(id, undefined);
  }, []);

  const { deleteWithUndo } = useDeleteWithUndo({
    type: "course",
    onDelete: handleDelete,
  });

  const handleEditClick = (course: Course) => {
    setEditCourse(course);
    setShowAddDialog(true);
  };

  const handleDialogClose = () => {
    setShowAddDialog(false);
    setEditCourse(null);
  };

  const handleDeleteClick = (course: Course) => {
    setDeleteTarget(course);
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
    { key: "sno", header: "#", render: (_c: Course, index: number) => index + 1 },
    { key: "name", header: "Name", render: (c: Course) => capitalize(c.name) },
    { key: "description", header: "Description", render: (c: Course) => c.description || "-" },
    {
      key: "actions",
      header: "Actions",
      render: (c: Course) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(c)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => handleDeleteClick(c)}
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
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage all courses in the system</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset page on new search
            }}
          />
        </div>
      </div>
      <DataTable
        title="Courses"
        columns={columns}
        data={courses}
        isLoading={isLoading}
        error={error}
        keyExtractor={(c) => c.id}
        pagination={{ page, totalPages, total, limit }}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
      <AddCourseDialog open={showAddDialog} onOpenChange={handleDialogClose} editCourse={editCourse} onSuccess={refetch} />
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Course"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action can be undone within 5 seconds.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
