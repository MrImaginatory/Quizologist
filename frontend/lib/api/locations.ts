import { API_ROUTES } from "../api-routes";
import { apiRequest } from "./client";
import { LocationsResponse, LocationResponse, CreateLocationPayload } from "./types";

export const locationsApi = {
  getAll: (page = 1, limit = 10, token?: string) =>
    apiRequest<LocationsResponse>(`${API_ROUTES.LOCATIONS.BASE}?page=${page}&limit=${limit}`, { token }),
  getById: (id: string, token?: string) =>
    apiRequest<LocationResponse>(API_ROUTES.LOCATIONS.BY_ID(id), { token }),
  create: (payload: CreateLocationPayload, token?: string) =>
    apiRequest<LocationResponse>(API_ROUTES.LOCATIONS.BASE, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),
  update: (id: string, payload: Partial<CreateLocationPayload>, token?: string) =>
    apiRequest<LocationResponse>(API_ROUTES.LOCATIONS.BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    }),
  delete: (id: string, token?: string) =>
    apiRequest(API_ROUTES.LOCATIONS.BY_ID(id), { method: "DELETE", token }),
};