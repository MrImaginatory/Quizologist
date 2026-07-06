import { Response } from "express";

export class ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;

  constructor(statusCode: number, message: string, data: T | null = null) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
  }

  send(res: Response): Response {
    return res.status(this.statusCode).json(this);
  }

  static success<T>(res: Response, message: string, data: T, statusCode = 200): Response {
    return new ApiResponse(statusCode, message, data).send(res);
  }

  static error(res: Response, message: string, statusCode = 500): Response {
    return new ApiResponse(statusCode, message).send(res);
  }
}
