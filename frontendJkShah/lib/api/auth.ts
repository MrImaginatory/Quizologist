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

  /** MED-05: revoke this device's tokens server-side on logout. */
  logout: () =>
    apiRequest(API_ROUTES.AUTH.LOGOUT, { method: "POST" }),

  /** MED-02: short-lived socket handshake ticket (the access cookie stays HttpOnly). */
  getSocketTicket: () =>
    apiRequest<{ statusCode: number; success: boolean; message: string; data: { ticket: string } }>(
      API_ROUTES.AUTH.SOCKET_TICKET,
      { method: "POST" }
    ),
};