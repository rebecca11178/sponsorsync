"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ACCOUNTS } from "@/lib/accounts";

const AuthContext = createContext(null);
const KEY = "sponsorsync.user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Load persisted session on mount (per-browser convenience only).
  // Re-resolve from ACCOUNTS by id so account edits (e.g. a rename) always win
  // over the stale snapshot saved at login time.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const fresh = ACCOUNTS.find((a) => a.id === saved.id);
        if (fresh) {
          const safe = { ...fresh };
          delete safe.password;
          setUser(safe);
        } else {
          setUser(saved);
        }
      }
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
