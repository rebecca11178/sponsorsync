"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const KEY = "sponsorsync.user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Load persisted session on mount (per-browser convenience only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* private mode / blocked storage — stay logged out */
    }
    setReady(true);
  }, []);

  function login(account) {
    // Never persist the password.
    const safe = { ...account };
    delete safe.password;
    setUser(safe);
    try {
      localStorage.setItem(KEY, JSON.stringify(safe));
    } catch {
      /* ignore */
    }
  }

  function logout() {
    setUser(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: null, ready: false, login: () => {}, logout: () => {} };
  return ctx;
}
