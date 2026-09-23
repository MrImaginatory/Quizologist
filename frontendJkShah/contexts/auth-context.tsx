"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usersApi } from "../lib/api/users";

interface User {
  id: string;
  fname: string;
  lname: string;
  role: string;
  email: string;
  mobilenumber: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MED-02: the real credential is an HttpOnly cookie that JavaScript can never
// read. `token` remains only as a session FLAG for existing call sites (SWR
// cache keys, `if (!token)` gates); it is not a JWT and apiRequest refuses to
// forward it as an Authorization header.
const SESSION_FLAG = "session";
const USER_CACHE_KEY = "user";
const SESSION_HINT_KEY = "has_session"; // non-secret marker — gates silent refresh

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // MED-02: purge any legacy JWT left in localStorage by pre-cookie sessions.
    localStorage.removeItem("token");

    const checkAuth = async () => {
      try {
        // Cookie-based session probe — no token parameter exists anymore.
        const res = await usersApi.getMe();
        if (!active) return;
        if (res.data) {
          setUser(res.data);
          setToken(SESSION_FLAG);
          localStorage.setItem(SESSION_HINT_KEY, "1");
          localStorage.setItem(USER_CACHE_KEY, JSON.stringify(res.data));
        }
      } catch (error: any) {
        if (!active) return;
        if (error.status === 401 || error.status === 404) {
          localStorage.removeItem(SESSION_HINT_KEY);
          localStorage.removeItem(USER_CACHE_KEY);
        } else {
          // Gateway unreachable — fall back to the non-secret profile cache so
          // the UI can render; API calls still authenticate via the cookie.
          try {
            const cached = localStorage.getItem(USER_CACHE_KEY);
            if (cached) {
              setUser(JSON.parse(cached));
              setToken(SESSION_FLAG);
            }
          } catch {
            /* ignore corrupt cache */
          }
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    checkAuth();
    return () => {
      active = false;
    };
  }, []);

  const login = (newUser: User) => {
    // MED-02: nothing to store but the profile — the login response already
    // set the HttpOnly access + refresh cookies.
    localStorage.setItem(SESSION_HINT_KEY, "1");
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    setToken(SESSION_FLAG);
  };

  const logout = () => {
    // MED-05: revoke server-side (blocklists this access token and deletes the
    // refresh session) — logout now actually kills the credentials.
    fetch("/api/user/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem(SESSION_HINT_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
    setToken(null);
    setUser(null);
    window.location.href = "/signin";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
