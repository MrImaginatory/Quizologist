import { API_ROUTES } from "../api-routes";
import { apiRequest } from "./client";
import { UsersResponse } from "./types";

export const usersApi = {
  getAll: (page = 1, limit = 10, token?: string) =>
    apiRequest<UsersResponse>(`${API_ROUTES.USERS.BASE}?page=${page}&limit=${limit}`, { token }),
  getById: (id: string, token?: string) =>
    apiRequest(API_ROUTES.USERS.BY_ID(id), { token }),
  getByRole: (role: string, page = 1, limit = 10, token?: string) =>
    apiRequest<UsersResponse>(`${API_ROUTES.USERS.BY_ROLE(role)}?page=${page}&limit=${limit}`, { token }),
  assignLocation: (userId: string, locationId: string | null, token?: string) =>
    apiRequest(API_ROUTES.USERS.ASSIGN_LOCATION(userId), {
      method: "PATCH",
      body: JSON.stringify({ location_id: locationId }),
      token,
    }),
};