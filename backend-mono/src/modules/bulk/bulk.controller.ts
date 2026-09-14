import { Request, Response, NextFunction } from "express";
import { BulkService } from "./bulk.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { bulkHierarchySchema } from "./bulk.validation";
import { ZodError } from "zod";

export class BulkController {
  static async createHierarchy(req: Request, res: Response, next: NextFunction) {
    try {
      const data = bulkHierarchySchema.parse(req.body);
      const result = await BulkService.createHierarchy(data);

      return ApiResponse.success(
        res,
        "Bulk hierarchy created successfully",
        result,
        201
      );
    } catch (error) {
      if (error instanceof ZodError) {
        const details = (error.issues as any[]).map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        return ApiResponse.error(res, `Validation failed: ${details}`, 400);
      }
      console.error("[BulkController] error:", error);
      next(error);
    }
  }
}
