import bcrypt from "bcrypt";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { JwtToken, JwtPayload } from "../../utils/jwtToken";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import User from "./user.model";
import { SignupInput, LoginInput } from "./user.validation";

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
        mobilenumber: data.mobilenumber.toLowerCase(),
        password: hashedPassword,
      });

      const tokenPayload: JwtPayload = {
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      };
      const token = JwtToken.generate(tokenPayload);

      return {
        user: this.sanitizeUser(existingUser),
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
      mobilenumber: data.mobilenumber.toLowerCase(),
      password: hashedPassword,
    });

    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = JwtToken.generate(tokenPayload);

    return {
      user: this.sanitizeUser(user),
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

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  private static sanitizeUser(user: User) {
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }
}
