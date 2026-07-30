import { z } from "zod";

export const bulkHierarchySchema = z.object({
  courses: z.array(
    z.object({
      name: z.string().min(1, "Course name is required"),
      subjects: z.array(
        z.object({
          name: z.string().min(1, "Subject name is required"),
          topics: z.array(z.string().min(1, "Topic name is required")),
        })
      ),
    })
  ),
});

export type BulkHierarchyInput = z.infer<typeof bulkHierarchySchema>;
