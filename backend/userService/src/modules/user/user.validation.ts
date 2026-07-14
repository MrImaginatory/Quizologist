import { z } from "zod";

const userRoleSchema = z.enum(["admin", "student", "teacher"]);

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
  mobileNumber: z
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

export const getAllUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const getUserByRoleSchema = z.object({
  role: userRoleSchema,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const getUserByIdSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

export const assignLocationSchema = z.object({
  location_id: z.string().uuid("Invalid location ID format").nullable(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GetAllUsersInput = z.infer<typeof getAllUsersSchema>;
export type GetUserByRoleInput = z.infer<typeof getUserByRoleSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type AssignLocationInput = z.infer<typeof assignLocationSchema>;
