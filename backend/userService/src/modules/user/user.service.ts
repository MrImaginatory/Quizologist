import bcrypt from "bcrypt";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { JwtToken, JwtPayload } from "../../utils/jwtToken";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import User from "./user.model";
import {
  SignupInput,
  LoginInput,
  GetAllUsersInput,
  GetUserByRoleInput,
  GetUserByIdInput,
} from "./user.validation";

export class UserService {
  static async signup(data: SignupInput) {
    const lowercasedEmail = data.email.toLowerCase();

    // Check if a user with this email exists (including soft-deleted)
    const existingUser = await User.findOne({
      where: { email: lowercasedEmail },
      paranoid: false,
    });

    if (existingUser && existingUser.deletedAt) {
      // User was soft-deleted, restore and update
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
        attributes: { exclude: ["password", "createdAt", "updatedAt", "deletedAt"] },
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
      attributes: { exclude: ["password", "createdAt", "updatedAt", "deletedAt"] },
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
      attributes: { exclude: ["password", "createdAt", "updatedAt", "deletedAt"] },
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
      attributes: { exclude: ["password", "createdAt", "updatedAt", "deletedAt"] },
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
      attributes: { exclude: ["password", "createdAt", "updatedAt", "deletedAt"] },
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
      attributes: { exclude: ["password", "createdAt", "updatedAt", "deletedAt"] },
    });

    if (!user) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.USER_NOT_FOUND);
    }

    return user;
  }
}
