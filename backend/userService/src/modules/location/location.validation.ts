import { z } from "zod";

export const createLocationSchema = z.object({
  address_line_1: z.string().min(1, "Address line 1 is required").max(255),
  address_line_2: z.string().max(255).optional(),
  landmark: z.string().max(255).optional(),
  city: z.string().min(1, "City is required").max(100),
  pincode: z.string().min(1, "Pincode is required").max(10),
  state: z.string().min(1, "State is required").max(100),
  country: z.string().min(1, "Country is required").max(100).default("India"),
});

export const updateLocationSchema = z.object({
  address_line_1: z.string().min(1).max(255).optional(),
  address_line_2: z.string().max(255).optional().nullable(),
  landmark: z.string().max(255).optional().nullable(),
  city: z.string().min(1).max(100).optional(),
  pincode: z.string().min(1).max(10).optional(),
  state: z.string().min(1).max(100).optional(),
  country: z.string().min(1).max(100).optional(),
});

export const locationIdParamSchema = z.object({
  id: z.string().uuid("Invalid location ID format"),
});

export const getAllLocationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type LocationIdParam = z.infer<typeof locationIdParamSchema>;
export type GetAllLocationsInput = z.infer<typeof getAllLocationsSchema>;
