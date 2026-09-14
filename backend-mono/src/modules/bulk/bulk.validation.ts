import { z } from "zod";

export const bulkHierarchySchema = z.object({
  courses: z.array(
    z.object({
      name: z.string().min(1, "Course name is required"),
      description: z.string().optional(),
      subjects: z.array(
        z.object({
          name: z.string().min(1, "Subject name is required"),
          description: z.string().optional(),
          topics: z.array(
            z.union([
              z.string().min(1, "Topic name is required"),
              z.object({
                name: z.string().min(1, "Topic name is required"),
                description: z.string().optional(),
              })
            ])
          ),
        })
      ),
    })
  ),
});

export type BulkHierarchyInput = z.infer<typeof bulkHierarchySchema>;
