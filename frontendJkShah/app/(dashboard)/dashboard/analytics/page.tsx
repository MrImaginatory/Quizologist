"use client";

import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <BarChart3 className="h-6 w-6" />
          </div>
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive analytics and insights across the platform
        </p>
      </motion.div>

      <AnalyticsDashboard />
    </div>
  );
}
