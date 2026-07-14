import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { QuestionImportService } from "./questionImport.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { bulkQuestionsSchema } from "./questionImport.validation";

export class QuestionImportController {
  static async downloadTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const buffer = await QuestionImportService.generateTemplate();

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=question_import_template.xlsx"
      );

      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  static async bulkCreate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = bulkQuestionsSchema.parse(req.body);
      const result = await QuestionImportService.bulkCreate(
        data.questions,
        req.user!.userId
      );

      return ApiResponse.success(
        res,
        `Import complete: ${result.imported} imported, ${result.failed} failed`,
        result
      );
    } catch (error) {
      next(error);
    }
  }
}
