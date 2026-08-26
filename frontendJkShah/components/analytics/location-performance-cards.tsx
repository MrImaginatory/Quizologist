"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target } from "lucide-react";
import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface LocationPerformanceProps {
  data: any;
  isLoading: boolean;
  locationId?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export function LocationPerformanceCards({ data, isLoading, locationId }: LocationPerformanceProps) {
  if (!locationId) return null;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 h-[250px] flex items-center justify-center">
              <p className="text-muted-foreground animate-pulse">Loading performance data...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Data formatting for charts
  const avgScoreData = [{ name: "Score", value: parseFloat(data.averageScore || "0"), fill: "var(--primary)" }];
  const testsTakenData = [{ name: "Tests", value: data.testsTaken, fill: "#818cf8" }];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4 mb-6"
    >
      <h3 className="text-lg font-semibold px-1">Location Specific Performance</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Tests Taken - Graphical */}
        <motion.div variants={itemVariants}>
          <Card className="h-full flex flex-col relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Tests Taken
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center">
              <div className="text-3xl font-bold mb-4">{data.testsTaken}</div>
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={testsTakenData}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Score - Graphical */}
        <motion.div variants={itemVariants}>
          <Card className="h-full flex flex-col relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center relative">
              <div className="h-[160px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="70%" 
                    outerRadius="100%" 
                    barSize={15} 
                    data={avgScoreData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                      background
                      dataKey="value"
                      cornerRadius={30}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold">{data.averageScore}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
