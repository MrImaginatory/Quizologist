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

export default function TopicsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { topics, total, totalPages, isLoading, error, refetch } = useTopics({ page, limit });
  const { token } = useAuth();

  const handleDelete = useCallback(async (id: string) => {
    await topicsApi.delete(id, token || undefined);
  }, [token]);

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
