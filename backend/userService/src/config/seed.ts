import bcrypt from "bcrypt";
import { env } from "./env";
import User from "../modules/user/user.model";
import Location from "../modules/location/location.model";

export const seedAdmin = async (): Promise<void> => {
  try {
    // Seed central location
    let centralLocation = await Location.findOne({
      where: { is_central: true },
      paranoid: false,
    });

    if (!centralLocation) {
      centralLocation = await Location.create({
        address_line_1: "Admin HQ",
        city: "New Delhi",
        pincode: "110001",
        state: "Delhi",
        country: "India",
        is_central: true,
      });
      console.log("Central location seeded successfully.");
    }

    // Seed admin user
    const existingAdmin = await User.findOne({
      where: { email: "admin@quizologist.com" },
      paranoid: false,
    });

    if (existingAdmin) {
      // Ensure admin has central location assigned
      if (!existingAdmin.location_id) {
        await existingAdmin.update({ location_id: centralLocation.id });
        console.log("Central location assigned to admin.");
      } else {
        console.log("Admin account already exists.");
      }
      return;
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@123",
      env.BCRYPT_SALT_ROUNDS
    );

    await User.create({
      fname: "admin",
      lname: "user",
      role: "admin",
      email: "admin@quizologist.com",
      mobileNumber: "0000000000",
      password: hashedPassword,
      location_id: centralLocation.id,
    });

    console.log("Default admin account created successfully.");
    console.log("Email: admin@quizologist.com");
    console.log("Password: Admin@123");
  } catch (error) {
    console.error("Error seeding admin account:", error);
  }
};
