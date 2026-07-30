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
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const res = await usersApi.getMe(storedToken);
          if (res.data) {
            localStorage.setItem("user", JSON.stringify(res.data));
            setUser(res.data);
            setToken(storedToken);
          }
        } catch (error: any) {
          console.error("Session verification failed:", error);
          if (error.status === 401 || error.status === 404) {
            logout();
            return;
          }
          // On other errors (e.g. gateway offline), keep local session
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
