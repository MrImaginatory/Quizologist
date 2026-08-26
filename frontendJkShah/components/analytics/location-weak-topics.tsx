"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { capitalize } from "@/lib/utils";

interface LocationWeakTopicsProps {
  data: any;
  isLoading: boolean;
  locationId?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export function LocationWeakTopics({ data, isLoading, locationId }: LocationWeakTopicsProps) {
  if (!locationId) return null;

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading weak topics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <motion.div variants={itemVariants} className="mb-6">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            Weakest Topics (&lt; 40% Accuracy)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {data.weakTopics && data.weakTopics.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic Name</TableHead>
                  <TableHead className="text-right">Accuracy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.weakTopics.map((topic: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium" title={topic.topicName}>
                      {capitalize(topic.topicName)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
                        {topic.accuracy}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="h-16 flex items-center justify-center text-sm text-muted-foreground">
              No weak topics found below 40% accuracy
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
