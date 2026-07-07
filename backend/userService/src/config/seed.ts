import bcrypt from "bcrypt";
import { env } from "./env";
import User from "../modules/user/user.model";

export const seedAdmin = async (): Promise<void> => {
  try {
    const existingAdmin = await User.findOne({
      where: { email: "admin@quizologist.com" },
      paranoid: false,
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@123",
      env.BCRYPT_SALT_ROUNDS
    );

    await User.create({
      fname: "admin",
      lname: "admin",
      role: "admin",
      email: "admin@quizologist.com",
      mobileNumber: "0000000000",
      password: hashedPassword,
    });

    console.log("Default admin account created successfully.");
    console.log("Email: admin@quizologist.com");
    console.log("Password: Admin@123");
  } catch (error) {
    console.error("Error seeding admin account:", error);
  }
};
