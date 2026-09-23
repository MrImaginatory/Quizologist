export interface ApiRequestOptions extends RequestInit {
  token?: string;
}

/**
 * MED-02: session credentials live in HttpOnly cookies and ride along
 * automatically on same-origin requests (the Next.js /api proxy makes every
 * API call same-origin). An explicit Authorization header is only forwarded
 * for real JWTs — scripts and tests — never for the auth context's
 * non-secret session flag.
 */
export function isJwtShaped(token?: string | null): boolean {
  return typeof token === "string" && token.split(".").length === 3;
}

/**
 * Non-secret marker that a session exists, so anonymous visitors don't pay
 * for a doomed refresh attempt on every 401. Set/cleared by the auth context.
 */
function hasSessionHint(): boolean {
  try {
    return localStorage.getItem("has_session") === "1";
  } catch {
    return false;
  }
}

/**
 * MED-05: the access cookie lives 15 minutes; on expiry, exchange the refresh
 * cookie for a fresh one (once) so long-lived tabs keep working silently.
 */
export async function silentRefresh(): Promise<boolean> {
  if (typeof window === "undefined" || !hasSessionHint()) return false;
  try {
    const res = await fetch("/api/user/refresh", { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (isJwtShaped(token)) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Never burn the refresh cycle on auth endpoints themselves (wrong password
  // is also a 401, and a double-fired login would eat the rate-limit budget).
  const isAuthEndpoint = /\/api\/user\/(login|signup|refresh|logout)/.test(endpoint);

  let response = await fetch(endpoint, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && !isAuthEndpoint && (await silentRefresh())) {
    response = await fetch(endpoint, {
      ...fetchOptions,
      headers,
    });
  }

  const data = await response.json();

  if (!response.ok) {
    let errorMessage = data.message || "An error occurred";
    if (errorMessage === "Validation failed" && Array.isArray(data.data)) {
       const details = data.data.map((e: any) => e.message).join(", ");
       if (details) {
         errorMessage = `Validation failed: ${details}`;
       }
    }
    const error = new Error(errorMessage) as any;
    error.status = response.status;
    error.data = data.data;
    throw error;
  }

  return data;
}
