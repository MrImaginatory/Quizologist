import { Request, Response, NextFunction } from "express";
import { TimeBasedService } from "./timeBased.service";
import { startTimeBasedSchema } from "./timeBased.validation";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";

export class TimeBasedController {
  static async start(req: Request, res: Response, next: NextFunction) {
    try {
      const data = startTimeBasedSchema.parse(req.body);
      const user = (req as any).user;
      
      if (!user || user.role !== "student") {
        throw ApiError.forbidden("Only students can take tests");
      }

      const result = await TimeBasedService.start(data, user.userId);
      
      ApiResponse.success(res, "Time-based test started successfully", result);
    } catch (error) {
      next(error);
    }
  }

  // Next question logic and submit logic are handled through sockets primarily.
  // We don't expose them in REST to be consistent with how standard tests work.
}
