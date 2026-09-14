import { Request, Response, NextFunction } from "express";
import { BulkService } from "./bulk.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { bulkHierarchySchema } from "./bulk.validation";

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
      next(error);
    }
  }
}
