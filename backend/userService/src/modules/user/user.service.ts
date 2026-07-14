import bcrypt from "bcrypt";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { JwtToken, JwtPayload } from "../../utils/jwtToken";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import User from "./user.model";
import Location from "../location/location.model";
import {
  SignupInput,
  LoginInput,
  GetAllUsersInput,
  GetUserByRoleInput,
  GetUserByIdInput,
  AssignLocationInput,
} from "./user.validation";

const TIMESTAMP_EXCLUDE = { exclude: ["createdAt", "updatedAt", "deletedAt"] };
const LOCATION_INCLUDE = { model: Location, as: "location", attributes: ["id", "address_line_1", "address_line_2", "landmark", "city", "pincode", "state", "country"] };
const USER_EXCLUDE = { exclude: ["password", "createdAt", "updatedAt", "deletedAt"] };

export class UserService {
  static async signup(data: SignupInput) {
    const lowercasedEmail = data.email.toLowerCase();

    const existingUser = await User.findOne({
      where: { email: lowercasedEmail },
      paranoid: false,
    });

    if (existingUser && existingUser.deletedAt) {
      const hashedPassword = await bcrypt.hash(
        data.password,
        env.BCRYPT_SALT_ROUNDS
      );

      await existingUser.restore();
      await existingUser.update({
        fname: data.fname.toLowerCase(),
        lname: data.lname.toLowerCase(),
        role: data.role,
        mobileNumber: data.mobileNumber.toLowerCase(),
        password: hashedPassword,
      });

      const tokenPayload: JwtPayload = {
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      };
      const token = JwtToken.generate(tokenPayload);

      const restored = await User.findByPk(existingUser.id, {
        attributes: USER_EXCLUDE,
        include: [LOCATION_INCLUDE],
      });

      return {
        user: restored!.toJSON(),
        token,
      };
    }

    if (existingUser) {
      throw ApiError.conflict(RESPONSE_MESSAGES.ERROR.USER_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      env.BCRYPT_SALT_ROUNDS
    );

    const user = await User.create({
      fname: data.fname.toLowerCase(),
      lname: data.lname.toLowerCase(),
      role: data.role,
      email: lowercasedEmail,
      mobileNumber: data.mobileNumber.toLowerCase(),
      password: hashedPassword,
    });

    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = JwtToken.generate(tokenPayload);

    const created = await User.findByPk(user.id, {
      attributes: USER_EXCLUDE,
      include: [LOCATION_INCLUDE],
    });

    return {
      user: created!.toJSON(),
      token,
    };
  }

  static async login(data: LoginInput) {
    const lowercasedEmail = data.email.toLowerCase();

    const user = await User.findOne({
      where: { email: lowercasedEmail },
    });

    if (!user) {
      throw ApiError.unauthorized(RESPONSE_MESSAGES.ERROR.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw ApiError.unauthorized(RESPONSE_MESSAGES.ERROR.INVALID_CREDENTIALS);
    }

    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = JwtToken.generate(tokenPayload);

    const logged = await User.findByPk(user.id, {
      attributes: USER_EXCLUDE,
      include: [LOCATION_INCLUDE],
    });

    return {
      user: logged!.toJSON(),
      token,
    };
  }

  static async getAllUsers(data: GetAllUsersInput) {
    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows: users, count: total } = await User.findAndCountAll({
      attributes: USER_EXCLUDE,
      include: [LOCATION_INCLUDE],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserByRole(data: GetUserByRoleInput) {
    const { role, page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows: users, count: total } = await User.findAndCountAll({
      where: { role },
      attributes: USER_EXCLUDE,
      include: [LOCATION_INCLUDE],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(data: GetUserByIdInput) {
    const user = await User.findByPk(data.id, {
      attributes: USER_EXCLUDE,
      include: [LOCATION_INCLUDE],
    });

    if (!user) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.USER_NOT_FOUND);
    }

    return user;
  }

  static async assignLocation(userId: string, data: AssignLocationInput) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.USER_NOT_FOUND);
    }

    if (data.location_id) {
      const location = await Location.findByPk(data.location_id);

      if (!location) {
        throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.LOCATION_NOT_FOUND);
      }

      if (location.is_central) {
        throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.CANNOT_ASSIGN_CENTRAL);
      }
    }

    await user.update({ location_id: data.location_id });

    const updated = await User.findByPk(userId, {
      attributes: USER_EXCLUDE,
      include: [LOCATION_INCLUDE],
    });

    return updated!.toJSON();
  }
}
