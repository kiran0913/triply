"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  profilePhoto: string | null;
  bio: string | null;
  location: string | null;
  verified: boolean;
};

type AuthContextType = {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  mutate: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = (): Promise<void> => {
    setLoading(true);
    return fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            setUser(null);
            setError("Unauthorized");
          } else {
            throw new Error("Failed to fetch user");
          }
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser({
            id: data.id,
            email: data.email,
            name: data.name,
            profilePhoto: data.profilePhoto,
            bio: data.bio,
            location: data.location,
            verified: data.verified,
          });
          setError(null);
        }
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setUser(null);
      setError(null);
      await fetchUser();
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, mutate: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
