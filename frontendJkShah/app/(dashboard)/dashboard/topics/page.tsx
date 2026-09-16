"use client";

import { useState, useCallback } from "react";
import { DataTable } from "@/components/data-table";
import { useTopics } from "@/hooks/use-topics";
import { topicsApi, Topic } from "@/lib/api";
import { capitalize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { AddTopicDialog } from "@/components/dialogs/add-topic-dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useDeleteWithUndo } from "@/hooks/use-delete-with-undo";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Search } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useSubjects } from "@/hooks/use-subjects";
import { useCourses } from "@/hooks/use-courses";

export default function TopicsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");

  const { courses } = useCourses({ limit: 1000 });
  const { subjects } = useSubjects({ 
    limit: 1000, 
    courseId: selectedCourseId === "all" ? undefined : selectedCourseId 
  });
  
  const { topics, total, totalPages, isLoading, error, refetch } = useTopics({ 
    page, 
    limit, 
    search: debouncedSearch,
    subjectId: selectedSubjectId === "all" ? undefined : selectedSubjectId,
    courseId: selectedCourseId === "all" ? undefined : selectedCourseId
  });
  const { isAuthenticated } = useAuth();

  const handleDelete = useCallback(async (id: string) => {
    await topicsApi.delete(id, undefined);
  }, []);

  const { deleteWithUndo } = useDeleteWithUndo({
    type: "topic",
    onDelete: handleDelete,
  });

  const handleEditClick = (topic: Topic) => {
    setEditTopic(topic);
    setShowAddDialog(true);
  };

  const handleDialogClose = () => {
    setShowAddDialog(false);
    setEditTopic(null);
  };

  const handleDeleteClick = (topic: Topic) => {
    setDeleteTarget(topic);
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
    { key: "sno", header: "#", render: (_t: Topic, index: number) => index + 1 },
    { key: "name", header: "Name", render: (t: Topic) => capitalize(t.name) },
    { key: "description", header: "Description", render: (t: Topic) => t.description || "-" },
    { key: "subject", header: "Subject", render: (t: Topic) => (
      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
        {capitalize(t.subject?.name || "")}
      </Badge>
    )},
    { key: "course", header: "Course", render: (t: Topic) => (
      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
        {capitalize(t.subject?.course?.name || "")}
      </Badge>
    )},
    {
      key: "actions",
      header: "Actions",
      render: (t: Topic) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(t)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => handleDeleteClick(t)}
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
          <h1 className="text-3xl font-bold">Topics</h1>
          <p className="text-muted-foreground">Manage all topics across subjects</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Topic
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-48">
          <SearchableSelect
            options={[
              { value: "all", label: "All Courses" },
              ...courses.map((c) => ({ value: c.id, label: capitalize(c.name) }))
            ]}
            value={selectedCourseId}
            onValueChange={(val) => {
              setSelectedCourseId(val || "all");
              setSelectedSubjectId("all"); // Reset subject when course changes
              setPage(1);
            }}
            placeholder="Filter by Course"
          />
        </div>
        <div className="w-48">
          <SearchableSelect
            options={[
              { value: "all", label: "All Subjects" },
              ...subjects.map((s) => ({ value: s.id, label: capitalize(s.name) }))
            ]}
            value={selectedSubjectId}
            onValueChange={(val) => {
              setSelectedSubjectId(val || "all");
              setPage(1);
            }}
            placeholder="Filter by Subject"
          />
        </div>
      </div>
      <DataTable
        title="Topics"
        columns={columns}
        data={topics}
        isLoading={isLoading}
        error={error}
        keyExtractor={(t) => t.id}
        pagination={{ page, totalPages, total, limit }}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
      <AddTopicDialog open={showAddDialog} onOpenChange={handleDialogClose} editTopic={editTopic} onSuccess={refetch} />
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Topic"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action can be undone within 5 seconds.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
