"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { usePredefinedTests } from "@/hooks/use-predefined-tests";
import { predefinedTestsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Plus, Play, Pause } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";

export default function ManageTestsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const isTeacher = user?.role === "teacher";

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const { tests, total, totalPages, isLoading, error } = usePredefinedTests({ page, limit });

  const handleActivate = async (id: string) => {
    setActivatingId(id);
    try {
      await predefinedTestsApi.activate(id, token || undefined);
      toast.success("Test activated!");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to activate");
    } finally {
      setActivatingId(null);
    }
  };

  const handleDeactivate = async (id: string) => {
    setDeactivatingId(id);
    try {
      await predefinedTestsApi.deactivate(id, token || undefined);
      toast.success("Test deactivated!");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate");
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Manage Tests</h1>
            <p className="text-muted-foreground">
              Create and manage predefined tests
            </p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/tests/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Test
        </Button>
      </div>

      {/* Tests Table */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">#</th>
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Duration</th>
              <th className="text-left p-3 font-medium">Questions</th>
              <th className="text-left p-3 font-medium">Created</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : tests.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No tests found. Create your first test!
                </td>
              </tr>
            ) : (
              tests.map((test, index) => (
                <tr
                  key={test.id}
                  className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/tests/${test.id}`)}
                >
                  <td className="p-3">{(page - 1) * limit + index + 1}</td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{test.title}</p>
                      {test.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {test.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant="outline"
                      className={
                        test.status === "active"
                          ? "bg-green-500/10 text-green-500"
                          : test.status === "draft"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-gray-500/10 text-gray-500"
                      }
                    >
                      {capitalize(test.status)}
                    </Badge>
                  </td>
                  <td className="p-3">{test.duration_minutes} min</td>
                  <td className="p-3">{test.question_limit}</td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      {test.status === "draft" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleActivate(test.id)}
                          disabled={activatingId === test.id}
                        >
                          {activatingId === test.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {test.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(test.id)}
                          disabled={deactivatingId === test.id}
                        >
                          {deactivatingId === test.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
