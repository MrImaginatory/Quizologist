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
    const match = findMatchingRoute(req.path, req.method);

    if (!match) {
      return ApiResponse.error(res, "Route not found", 404);
    }

    const { route, remainingPath } = match;
    const targetBase = route.target.endsWith("/")
      ? route.target.slice(0, -1)
      : route.target;
    const targetUrl = `${targetBase}${remainingPath}`;

    const headers: Record<string, string> = {};

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
      headers["Content-Type"] = "application/json";
    }

    const queryParams = new URLSearchParams(req.query as Record<string, string>);
    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    const response = await fetch(fullUrl, fetchOptions);
    const contentType = response.headers.get("content-type") || "";

    // Handle binary responses (Excel, images, etc.)
    if (contentType.includes("application/vnd.") || contentType.includes("application/octet-stream") || contentType.includes("application/pdf") || contentType.includes("image/")) {
      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", contentType);
      const disposition = response.headers.get("content-disposition");
      if (disposition) {
        res.setHeader("Content-Disposition", disposition);
      }
      return res.status(response.status).send(Buffer.from(buffer));
    }

    // Handle JSON responses
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return ApiResponse.error(res, "Service unavailable", 503);
  }
};
