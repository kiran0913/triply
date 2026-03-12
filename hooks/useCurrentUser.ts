"use client";

import { useEffect, useState } from "react";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  profilePhoto: string | null;
  bio: string | null;
  location: string | null;
  verified: boolean;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
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
  }, []);

  return { user, loading, error };
}
