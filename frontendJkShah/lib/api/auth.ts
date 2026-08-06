import { API_ROUTES } from "../api-routes";
import { apiRequest } from "./client";
import { SignupPayload, LoginPayload, AuthResponse } from "./types";

export const authApi = {
  signup: (payload: SignupPayload) =>
    apiRequest<AuthResponse>(API_ROUTES.AUTH.SIGNUP, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiRequest<AuthResponse>(API_ROUTES.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};