import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../supabase/config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setUser(u ? { ...u, uid: u.id } : null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user;
      setUser(u ? { ...u, uid: u.id } : null);
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};
