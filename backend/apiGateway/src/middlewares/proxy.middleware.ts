import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { findMatchingRoute } from "../config/routes";
import { ApiResponse } from "../utils/ApiResponse";

export const proxyRequest = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const match = findMatchingRoute(req.path);

    if (!match) {
      return ApiResponse.error(res, "Route not found", 404);
    }

    const { route, remainingPath } = match;
    const targetBase = route.target.endsWith("/")
      ? route.target.slice(0, -1)
      : route.target;
    const targetUrl = `${targetBase}${remainingPath}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (req.user) {
      headers["x-user-id"] = req.user.userId;
      headers["x-user-email"] = req.user.email;
      headers["x-user-role"] = req.user.role;
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "DELETE") {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const queryParams = new URLSearchParams(req.query as Record<string, string>);
    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    const response = await fetch(fullUrl, fetchOptions);
    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return ApiResponse.error(res, "Service unavailable", 503);
  }
};
