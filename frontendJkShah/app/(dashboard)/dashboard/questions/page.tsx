"use client";

import { useState, useCallback } from "react";
import { DataTable } from "@/components/data-table";
import { useQuestions } from "@/hooks/use-questions";
import { questionsApi, Question } from "@/lib/api";
import { capitalize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { QuestionFilters } from "@/components/filters/question-filters";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { AddQuestionDialog } from "@/components/dialogs/add-question-dialog";
import { EditQuestionDialog } from "@/components/dialogs/edit-question-dialog";
import { useDeleteWithUndo } from "@/hooks/use-delete-with-undo";
import { useAuth } from "@/contexts/auth-context";

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  normal: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  mid: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  hard: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  expert: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function QuestionsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Question | null>(null);
  const [filters, setFilters] = useState({
    courseId: "",
    subjectId: "",
    topicId: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { questions, total, totalPages, isLoading, error, refetch } = useQuestions({
    page,
    limit,
    courseId: filters.courseId || undefined,
    subjectId: filters.subjectId || undefined,
    topicId: filters.topicId || undefined,
  });
  const { token } = useAuth();

  const handleDelete = useCallback(async (id: string) => {
    await questionsApi.delete(id, token || undefined);
    refetch();
  }, [token, refetch]);

  const { deleteWithUndo } = useDeleteWithUndo({
    type: "topic",
    onDelete: handleDelete,
  });

  const handleFilterChange = useCallback((newFilters: { courseId: string; subjectId: string; topicId: string }) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleEditClick = (question: Question) => {
    setEditTarget(question);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (question: Question) => {
    setDeleteTarget(question);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteWithUndo(deleteTarget.id, capitalize(deleteTarget.question.slice(0, 30)));
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: "sno", header: "#", render: (_q: Question, index: number) => index + 1 },
    { key: "type", header: "Type", render: (q: Question) => (
      <Badge variant="outline" className={q.type === "mcq" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"}>
        {q.type === "mcq" ? "MCQ" : "Descriptive"}
      </Badge>
    )},
    { key: "question", header: "Question", render: (q: Question) => (
      <span className="max-w-[300px] truncate block" title={q.question}>
        {q.question}
      </span>
    )},
    { key: "difficulty", header: "Difficulty", render: (q: Question) => (
      <Badge variant="outline" className={difficultyColors[q.difficulty] || ""}>
        {capitalize(q.difficulty)}
      </Badge>
    )},
    {
      key: "actions",
      header: "Actions",
      render: (q: Question) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(q)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => handleDeleteClick(q)}
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
          <h1 className="text-3xl font-bold">Questions</h1>
          <p className="text-muted-foreground">Manage all questions in the system</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <QuestionFilters onFilterChange={handleFilterChange} />

      <DataTable
        title="Questions"
        columns={columns}
        data={questions}
        isLoading={isLoading}
        error={error}
        keyExtractor={(q) => q.id}
        pagination={{ page, totalPages, total, limit }}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <AddQuestionDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      <EditQuestionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        question={editTarget}
        onSuccess={refetch}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Question"
        description={`Are you sure you want to delete this question? This action can be undone within 5 seconds.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}