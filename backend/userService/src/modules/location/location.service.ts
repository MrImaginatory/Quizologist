import { ApiError } from "../../utils/ApiError";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import Location from "./location.model";
import {
  CreateLocationInput,
  UpdateLocationInput,
  LocationIdParam,
  GetAllLocationsInput,
} from "./location.validation";

const TIMESTAMP_EXCLUDE = { exclude: ["createdAt", "updatedAt", "deletedAt"] };

export class LocationService {
  static async create(data: CreateLocationInput) {
    const location = await Location.create({
      address_line_1: data.address_line_1,
      address_line_2: data.address_line_2 || null,
      landmark: data.landmark || null,
      city: data.city,
      pincode: data.pincode,
      state: data.state,
      country: data.country,
    });

    return location.toJSON();
  }

  static async getAll(data: GetAllLocationsInput) {
    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Location.findAndCountAll({
      attributes: TIMESTAMP_EXCLUDE,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      locations: rows.map((l) => l.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getById(data: LocationIdParam) {
    const location = await Location.findByPk(data.id, {
      attributes: TIMESTAMP_EXCLUDE,
    });

    if (!location) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.LOCATION_NOT_FOUND);
    }

    return location.toJSON();
  }

  static async update(data: LocationIdParam & UpdateLocationInput) {
    const location = await Location.findByPk(data.id);

    if (!location) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.LOCATION_NOT_FOUND);
    }

    if (location.is_central) {
      throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.CANNOT_MODIFY_CENTRAL);
    }

    if (data.address_line_1 !== undefined) location.set("address_line_1", data.address_line_1);
    if (data.address_line_2 !== undefined) location.set("address_line_2", data.address_line_2);
    if (data.landmark !== undefined) location.set("landmark", data.landmark);
    if (data.city !== undefined) location.set("city", data.city);
    if (data.pincode !== undefined) location.set("pincode", data.pincode);
    if (data.state !== undefined) location.set("state", data.state);
    if (data.country !== undefined) location.set("country", data.country);

    await location.save();

    const updated = await Location.findByPk(data.id, {
      attributes: TIMESTAMP_EXCLUDE,
    });

    return updated!.toJSON();
  }

  static async delete(data: LocationIdParam) {
    const location = await Location.findByPk(data.id);

    if (!location) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.LOCATION_NOT_FOUND);
    }

    if (location.is_central) {
      throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.CANNOT_DELETE_CENTRAL);
    }

    await location.destroy();

    return { message: RESPONSE_MESSAGES.SUCCESS.LOCATION_DELETED };
  }
}
