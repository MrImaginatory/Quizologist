import { z } from "zod";
import zxcvbn from "zxcvbn";

const userRoleSchema = z.enum(["admin", "student", "teacher"]);

// MED-01: NIST-aligned policy — minimum length AND demonstrated strength.
// zxcvbn catches common words, names, dates, keyboard runs and dictionary
// attacks that a simple character-regex would allow through.
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(100, "Password must be at most 100 characters")
  .superRefine((value, ctx) => {
    const { score } = zxcvbn(value);
    if (score < 3) {
      ctx.addIssue({
        code: "custom",
        message:
          "Password is too easy to guess — avoid common words, names, dates and sequences. Try a passphrase of unrelated words.",
      });
    }
  });

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
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"),
  mobileNumber: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number must be at most 15 digits"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"),
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
