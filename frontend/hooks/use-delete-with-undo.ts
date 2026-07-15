"use client";

import { useEffect, useCallback } from "react";
import { toast } from "sonner";

interface PendingDeletion {
  id: string;
  type: "course" | "subject" | "topic" | "location";
  timestamp: number;
  name: string;
}

const STORAGE_KEY = "pending_deletions";
const UNDO_DELAY = 5000;

function getPendingDeletions(): PendingDeletion[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setPendingDeletions(deletions: PendingDeletion[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deletions));
}

function removePendingDeletion(id: string) {
  const deletions = getPendingDeletions().filter((d) => d.id !== id);
  setPendingDeletions(deletions);
}

interface UseDeleteWithUndoOptions {
  type: "course" | "subject" | "topic" | "location";
  onDelete: (id: string) => Promise<void>;
  onSuccess?: () => void;
}

export function useDeleteWithUndo({ type, onDelete, onSuccess }: UseDeleteWithUndoOptions) {
  const processPendingDeletions = useCallback(async () => {
    const deletions = getPendingDeletions();
    const now = Date.now();

    for (const deletion of deletions) {
      if (deletion.type === type && now - deletion.timestamp >= UNDO_DELAY) {
        try {
          await onDelete(deletion.id);
          removePendingDeletion(deletion.id);
          toast.success(`${deletion.name} deleted successfully`);
        } catch (error) {
          console.error(`Failed to delete ${type}:`, error);
        }
      }
    }
  }, [type, onDelete]);

  useEffect(() => {
    processPendingDeletions();
    const interval = setInterval(processPendingDeletions, 1000);
    return () => clearInterval(interval);
  }, [processPendingDeletions]);

  const deleteWithUndo = useCallback(
    (id: string, name: string) => {
      const deletion: PendingDeletion = {
        id,
        type,
        timestamp: Date.now(),
        name,
      };

      const deletions = getPendingDeletions();
      deletions.push(deletion);
      setPendingDeletions(deletions);

      toast.info(`${name} will be deleted`, {
        description: "Click undo to cancel deletion",
        duration: UNDO_DELAY,
        action: {
          label: "Undo",
          onClick: () => {
            removePendingDeletion(id);
            toast.success("Deletion cancelled");
          },
        },
      });

      setTimeout(() => {
        const currentDeletions = getPendingDeletions();
        const pending = currentDeletions.find((d) => d.id === id);
        if (pending) {
          onDelete(id)
            .then(() => {
              removePendingDeletion(id);
              toast.success(`${name} deleted successfully`);
              onSuccess?.();
            })
            .catch((error) => {
              console.error(`Failed to delete ${type}:`, error);
              toast.error(`Failed to delete ${name}`);
            });
        }
      }, UNDO_DELAY);
    },
    [type, onDelete, onSuccess]
  );

  return { deleteWithUndo };
}
