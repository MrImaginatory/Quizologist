import { Response } from "express";

export class ApiResponse {
  static success(res: Response, message: string, data: any, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, message: string, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
    });
  }
}
