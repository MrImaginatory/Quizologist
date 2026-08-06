"use client";

import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Comprehensive analytics and insights across the platform
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
