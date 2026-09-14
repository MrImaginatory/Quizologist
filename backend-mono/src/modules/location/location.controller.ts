import { Request, Response, NextFunction } from "express";
import { LocationService } from "./location.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import {
  createLocationSchema,
  updateLocationSchema,
  locationIdParamSchema,
  getAllLocationsSchema,
} from "./location.validation";

export class LocationController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createLocationSchema.parse(req.body);
      const result = await LocationService.create(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.LOCATION_CREATED,
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = getAllLocationsSchema.parse(req.query);
      const result = await LocationService.getAll(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.LOCATIONS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = locationIdParamSchema.parse(req.params);
      const result = await LocationService.getById(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.LOCATION_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const params = locationIdParamSchema.parse(req.params);
      const body = updateLocationSchema.parse(req.body);
      const result = await LocationService.update({ ...params, ...body });

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.LOCATION_UPDATED,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const data = locationIdParamSchema.parse(req.params);
      const result = await LocationService.delete(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.LOCATION_DELETED,
        result
      );
    } catch (error) {
      next(error);
    }
  }
}
