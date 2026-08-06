"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function TestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Test error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold">Test Error</h2>
        <p className="text-muted-foreground text-sm">{error.message}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
          <Button onClick={() => window.location.href = "/dashboard"}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
