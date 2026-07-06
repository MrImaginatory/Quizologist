import { z } from "zod";

const userRoleSchema = z.enum(["student", "teacher"]);

export const signupSchema = z.object({
  fname: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters"),
  lname: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters"),
  role: userRoleSchema,
  email: z.string().email("Invalid email format"),
  mobilenumber: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number must be at most 15 digits"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
