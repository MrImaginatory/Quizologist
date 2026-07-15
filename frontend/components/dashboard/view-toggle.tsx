"use client";

import { LayoutList, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  value: "table" | "chart";
  onChange: (value: "table" | "chart") => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center gap-1 bg-muted rounded-lg p-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("table")}
        className={cn(
          "h-8 px-3 gap-1.5",
          value === "table" && "bg-background shadow-sm text-foreground"
        )}
      >
        <LayoutList className="h-4 w-4" />
        <span className="hidden sm:inline">Table</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("chart")}
        className={cn(
          "h-8 px-3 gap-1.5",
          value === "chart" && "bg-background shadow-sm text-foreground"
        )}
      >
        <BarChart3 className="h-4 w-4" />
        <span className="hidden sm:inline">Chart</span>
      </Button>
    </div>
  );
}
