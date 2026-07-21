"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DashboardPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard page error:", error);
  }, [error]);

  return (
    <Card>
      <CardContent className="p-8 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-orange-500 mx-auto" />
        <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
        <p className="text-muted-foreground text-sm">{error.message}</p>
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
